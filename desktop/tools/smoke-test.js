'use strict';

/**
 * 自动化冒烟测试：无界面启动一次完整应用，逐项验证打包后最容易出问题的环节。
 *
 *   npx electron tools/smoke-test.js
 *
 * 重点是验证「必须跑在 127.0.0.1 而不是 file://」这个前提是否真的成立：
 * Web Worker、importScripts、WASM 同源 fetch、AudioWorklet、音频解码。
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const { createStaticServer } = require('../lib/static-server');

// 隔离数据目录，避免与本机其它 Electron 应用共用缓存
app.setPath('userData', path.join(app.getPath('appData'), 'AudioMass-SmokeTest'));

// 该环境 GPU 进程不稳定，冒烟测试强制软件渲染以保证结论可靠
app.disableHardwareAcceleration();

const results = [];
function record(name, ok, detail) {
  results.push({ name, ok });
  console.log((ok ? '  [通过] ' : '  [失败] ') + name + (detail ? '   — ' + detail : ''));
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const webRoot = path.join(__dirname, '..', '..', 'src');
  const sampleMp3 = path.join(webRoot, 'test.mp3');

  const server = createStaticServer({
    root: webRoot,
    host: '127.0.0.1',
    fallbacks: { '/about.html': path.join(__dirname, '..', 'assets', 'about.html') }
  });
  await server.listen();
  console.log('\n本地服务：' + server.origin + '\n');

  const win = new BrowserWindow({
    show: false,
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false
    }
  });

  const rendererErrors = [];
  win.webContents.on('console-message', (...args) => {
    const d = args.length === 1 && typeof args[0] === 'object' ? args[0] : null;
    const level = d ? d.level : args[1];
    const message = d ? d.message : args[2];
    if (String(level).toLowerCase() === 'error' || level === 3) rendererErrors.push(String(message));
  });

  let loadFailed = null;
  win.webContents.on('did-fail-load', (e, code, desc, url, isMainFrame) => {
    loadFailed = code + ' ' + desc + (isMainFrame ? ' [主框架]' : '');
  });
  win.webContents.on('preload-error', (event, preloadPath, error) => {
    console.error('[预加载脚本报错] ' + preloadPath + '\n' + (error && error.stack));
  });
  win.webContents.on('render-process-gone', (event, details) => {
    console.error('[渲染进程退出] ' + JSON.stringify(details));
  });
  win.webContents.on('unresponsive', () => console.error('[渲染进程无响应]'));

  const js = (code) => win.webContents.executeJavaScript(code);

  console.log('一、基础加载');
  const url = server.origin + '/index.html?_t=' + encodeURIComponent(server.token) + '&skipintro=1';
  try {
    await win.loadURL(url);
  } catch (err) {
    console.error('loadURL 失败：' + err.message);
    await sleep(500);
  }
  await sleep(2800);

  record('页面加载无错误', !loadFailed, loadFailed || 'ok');

  const boot = await js(
    '(function(){var a=window.PKAudioEditor;' +
    'return {ready:!!(a&&a.engine&&a.ui&&a.state),' +
    'children:(document.getElementById("app")||{children:[]}).children.length,' +
    'i18n:!!(window.PKAE_I18N||document.documentElement.lang==="zh-CN")};})()'
  );
  record('应用完成初始化', boot.ready, 'DOM 子节点 ' + boot.children + ' 个');
  record('中文语言环境生效', boot.i18n, 'lang=' + (await js('document.documentElement.lang')));

  console.log('\n二、file:// 下会失败的各项能力（关键验证）');

  const worker = await js(
    'new Promise(function(res){try{var w=new Worker("lame.js");' +
    'var done=false;w.onerror=function(e){if(!done){done=true;res({ok:false,err:String(e.message||e)});}};' +
    'setTimeout(function(){if(!done){done=true;res({ok:true});w.terminate();}},1500);' +
    '}catch(e){res({ok:false,err:String(e&&e.message)});}})'
  );
  record('Web Worker 可创建（MP3 导出依赖）', worker.ok, worker.err || 'lame.js worker 正常');

  const wasm = await js(
    'fetch("lz4-block-codec.wasm",{mode:"same-origin"}).then(function(r){return r.arrayBuffer();})' +
    '.then(function(b){return {ok:b.byteLength>0,bytes:b.byteLength};})' +
    '.catch(function(e){return {ok:false,err:String(e)};})'
  );
  record('WASM 同源 fetch 成功（会话压缩依赖）', wasm.ok, wasm.err || wasm.bytes + ' 字节');

  const worklet = await js(
    'new Promise(function(res){try{var c=new AudioContext();' +
    'c.audioWorklet.addModule("recorder-worklet.js").then(function(){res({ok:true});},' +
    'function(e){res({ok:false,err:String((e&&e.message)||e)});});' +
    '}catch(e){res({ok:false,err:String((e&&e.message)||e)});}})'
  );
  record('AudioWorklet 可加载（录音依赖）', worklet.ok, worklet.err || 'recorder-worklet.js 就绪');

  const secure = await js('({secure:window.isSecureContext, origin:location.origin})');
  record('处于安全上下文（getUserMedia 前提）', secure.secure === true, secure.origin);

  console.log('\n三、原生文件注入链路');

  if (!fs.existsSync(sampleMp3)) {
    record('音频解码', false, '缺少测试文件 ' + sampleMp3);
  } else {
    const buffer = fs.readFileSync(sampleMp3);
    win.webContents.send('audio:open-file', {
      name: 'test.mp3',
      data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    });

    let decoded = null;
    for (let i = 0; i < 30; i++) {
      decoded = await js(
        '(function(){var e=window.PKAudioEditor&&window.PKAudioEditor.engine;' +
        'var b=e&&e.wavesurfer&&e.wavesurfer.backend&&e.wavesurfer.backend.buffer;' +
        'return b?{dur:b.duration,ch:b.numberOfChannels,sr:b.sampleRate}:null;})()'
      );
      if (decoded) break;
      await sleep(400);
    }
    record(
      '原生「打开文件」→ 音频解码成功',
      !!decoded,
      decoded ? decoded.dur.toFixed(2) + ' 秒 / ' + decoded.ch + ' 声道 / ' + decoded.sr + ' Hz' : '12 秒内未完成解码'
    );
  }

  console.log('\n四、资源完整性');
  for (const asset of ['main.css', 'i18n.js', 'engine.js', 'multitrack.js', 'fx-pg-eq.js', 'libflac.wasm', 'rnn_denoise.wasm', 'fonts/icomoon.woff']) {
    const code = await js(
      'fetch(' + JSON.stringify('/' + asset) + ').then(function(r){return r.status;}).catch(function(){return 0;})'
    );
    record('资源可访问：' + asset, code === 200, 'HTTP ' + code);
  }

  console.log('\n五、兜底「关于」页');
  const about = await js(
    'fetch("/about.html").then(function(r){return r.text();})' +
    '.then(function(t){return {ok:t.indexOf("AudioMass")>=0,len:t.length};})' +
    '.catch(function(e){return {ok:false,err:String(e)};})'
  );
  record('about.html 兜底页可用', about.ok, about.ok ? about.len + ' 字节' : about.err);

  console.log('\n六、渲染进程错误');
  const realErrors = rendererErrors.filter((m) => !/favicon|manifest|net::ERR_FILE/i.test(m));
  record('无渲染进程报错', realErrors.length === 0, realErrors.length ? realErrors.slice(0, 3).join(' | ') : 'ok');

  const failed = results.filter((r) => !r.ok);
  console.log('\n========================================');
  console.log('结果：' + (results.length - failed.length) + '/' + results.length + ' 项通过');
  if (failed.length) {
    console.log('失败项：');
    failed.forEach((f) => console.log('  - ' + f.name));
  }
  console.log('========================================\n');

  await server.close();
  app.exit(failed.length ? 1 : 0);
}

app.whenReady().then(() =>
  run().catch((err) => {
    console.error('冒烟测试异常：', err);
    app.exit(1);
  })
);
