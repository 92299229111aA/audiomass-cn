'use strict';

const {
  app, BrowserWindow, Menu, dialog, shell, session, ipcMain, nativeImage
} = require('electron');
const path = require('path');
const fs = require('fs');

const { createStaticServer } = require('./lib/static-server');

const APP_TITLE = 'AudioMass 音频编辑器';
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'flac', 'ogg', 'oga', 'm4a', 'aac', 'webm', 'amss'];

// 使用独立的数据目录：默认值 AppData/Roaming/Electron 会与本机其它 Electron 应用
// 争抢同一份 GPU 缓存与 LocalStorage，轻则缓存报错，重则 GPU 进程崩溃。
// 固定目录名也能保证后续升级不丢用户会话（IndexedDB 就存在这里）。
app.setPath('userData', path.join(app.getPath('appData'), 'AudioMass'));

// 仅在命令行显式要求时关闭硬件加速（驱动异常的机器可用 AudioMass.exe --disable-gpu 启动）
if (process.argv.includes('--disable-gpu')) {
  app.disableHardwareAcceleration();
}

let mainWindow = null;
let webServer = null;
let appOrigin = '';
let pendingOpenPath = null;

/* ------------------------------------------------------------------ *
 * 路径解析
 * ------------------------------------------------------------------ */

function resolveWebRoot() {
  const candidates = [
    path.join(process.resourcesPath || '', 'web'), // 打包后：extraResources 输出到 resources/web
    path.join(__dirname, '..', 'src')              // 开发时：直接指向仓库里的 src
  ];
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(path.join(candidate, 'index.html'))) return candidate;
  }
  throw new Error('找不到前端资源目录（index.html）。请确认 src/ 或 resources/web 存在。');
}

function resolveIcon() {
  const candidates = [
    path.join(__dirname, 'build', 'icon.ico'),
    path.join(__dirname, 'build', 'icon.png')
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

/* ------------------------------------------------------------------ *
 * 打开文件
 * ------------------------------------------------------------------ */

function readAudioFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, buffer) => {
      if (err) return reject(err);
      // 转成独立的 ArrayBuffer，便于跨进程结构化克隆
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
      resolve({ name: path.basename(filePath), data: arrayBuffer });
    });
  });
}

async function deliverFile(filePath) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    pendingOpenPath = filePath;
    return;
  }

  try {
    const payload = await readAudioFile(filePath);
    mainWindow.webContents.send('audio:open-file', payload);
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  } catch (err) {
    notify('error', '无法读取文件：' + path.basename(filePath) + '（' + (err.code || err.message) + '）');
  }
}

function notify(type, message) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('audio:notify', { type, message });
}

/** 从命令行参数里挑出音频文件路径（用于「打开方式」和文件关联） */
function extractFileFromArgv(argv) {
  const args = argv.slice(1); // 跳过可执行文件本身
  for (const arg of args) {
    if (!arg || arg.startsWith('-')) continue;
    const ext = path.extname(arg).replace('.', '').toLowerCase();
    if (!ext) continue;
    if (AUDIO_EXTENSIONS.includes(ext) && fs.existsSync(arg)) return arg;
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * 窗口
 * ------------------------------------------------------------------ */

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 940,
    minHeight: 600,
    title: APP_TITLE,
    backgroundColor: '#1b1b1b',
    show: false,
    autoHideMenuBar: false,
    icon: resolveIcon(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      backgroundThrottling: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (pendingOpenPath) {
      const target = pendingOpenPath;
      pendingOpenPath = null;
      setTimeout(() => deliverFile(target), 900); // 等应用初始化完成
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 首屏带一次性 token，服务器会写入会话 cookie，后续同源请求自动带上
  const startUrl = appOrigin + '/index.html?_t=' + encodeURIComponent(webServer.token);
  mainWindow.loadURL(startUrl);

  mainWindow.webContents.on('did-fail-load', (event, code, description, url) => {
    if (code === -3) return; // 用户主动中断
    console.error('[AudioMass] 页面加载失败', code, description, url);
  });

  // 应用内所有外链交给系统默认浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(appOrigin)) return { action: 'allow' };
    if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  // 阻止主窗口被导航到外部站点
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith(appOrigin)) return;
    event.preventDefault();
    if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) shell.openExternal(url);
  });

  return mainWindow;
}

function openAboutWindow() {
  const about = new BrowserWindow({
    width: 980,
    height: 760,
    title: '关于 AudioMass',
    backgroundColor: '#fefefe',
    parent: mainWindow || undefined,
    icon: resolveIcon(),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  about.loadURL(appOrigin + '/about.html');
  about.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
}

/* ------------------------------------------------------------------ *
 * 会话：权限、下载、UA
 * ------------------------------------------------------------------ */

function configureSession() {
  const defaultSession = session.defaultSession;

  // 放行麦克风（录音功能）；其余权限一律拒绝
  defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') return callback(true);
    if (permission === 'clipboard-read' || permission === 'clipboard-sanitized-write') {
      return callback(true);
    }
    callback(false);
  });

  defaultSession.setPermissionCheckHandler((webContents, permission) => {
    return permission === 'media' ||
      permission === 'clipboard-read' ||
      permission === 'clipboard-sanitized-write';
  });

  // 把网页端的 a.download 导出改造成原生「另存为」对话框
  defaultSession.on('will-download', (event, item) => {
    const suggested = item.getFilename() || 'audiomass-output';
    const ext = path.extname(suggested).replace('.', '').toLowerCase();

    const filters = [
      { name: '音频文件', extensions: AUDIO_EXTENSIONS.filter((e) => e !== 'amss') },
      { name: 'AudioMass 工程', extensions: ['amss'] },
      { name: '全部文件', extensions: ['*'] }
    ];
    if (ext) filters.unshift({ name: ext.toUpperCase() + ' 文件', extensions: [ext] });

    const options = {
      title: '导出音频',
      defaultPath: path.join(app.getPath('music'), suggested),
      filters,
      properties: ['createDirectory', 'showOverwriteConfirmation']
    };

    const parent = mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;
    const { canceled, filePath } = parent
      ? dialog.showSaveDialogSync(parent, options)
      : dialog.showSaveDialogSync(options);

    if (canceled || !filePath) {
      item.cancel();
      return;
    }

    item.setSavePath(filePath);
    item.once('done', (e, state) => {
      if (state === 'completed') notify('ok', '已导出到：' + filePath);
      else if (state === 'interrupted') notify('error', '导出失败，目标文件可能被占用。');
    });
  });
}

/* ------------------------------------------------------------------ *
 * 菜单
 * ------------------------------------------------------------------ */

function buildMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '打开音频…',
          accelerator: 'CmdOrCtrl+O',
          click: () => openAudioDialog()
        },
        { type: 'separator' },
        { label: '重新加载界面', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { type: 'separator' },
        { label: '退出', accelerator: 'Alt+F4', role: 'quit' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' },
        { label: '开发者工具', accelerator: 'F12', role: 'toggleDevTools' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        { label: '使用提示', click: () => showUsageTips() },
        { label: '关于 AudioMass', click: () => openAboutWindow() },
        { type: 'separator' },
        {
          label: '项目主页（GitHub）',
          click: () => shell.openExternal('https://github.com/pkalogiros/audiomass')
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function openAudioDialog() {
  if (!mainWindow) return;
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: '打开音频文件',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: '音频文件', extensions: AUDIO_EXTENSIONS.filter((e) => e !== 'amss') },
      { name: 'AudioMass 工程', extensions: ['amss'] },
      { name: '全部文件', extensions: ['*'] }
    ]
  });
  if (canceled || !filePaths.length) return;
  for (const filePath of filePaths) {
    // 顺序投递，preload 会排队逐个注入
    await deliverFile(filePath);
  }
}

function showUsageTips() {
  if (!mainWindow) return;
  const detail = [
    '大多数快捷键使用 Shift + 按键 组合：',
    '',
    '　Shift + Z　撤销',
    '　Shift + C　复制选区',
    '　Shift + X　剪切选区',
    '',
    '麦克风录音需要在 Windows「设置 → 隐私和安全性 → 麦克风」中',
    '允许桌面应用访问麦克风。'
  ].join('\n');

  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '使用提示',
    message: 'AudioMass 使用提示',
    detail,
    buttons: ['知道了'],
    noLink: true
  });
}

/* ------------------------------------------------------------------ *
 * 启动
 * ------------------------------------------------------------------ */

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, argv, workingDirectory) => {
    const filePath = extractFileFromArgv(argv);
    if (filePath) {
      deliverFile(filePath);
    } else if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.setAppUserModelId('co.audiomass.desktop');

  app.whenReady().then(async () => {
    try {
      webServer = createStaticServer({
        root: resolveWebRoot(),
        host: '127.0.0.1',
        fallbacks: {
          // 打包时裁剪掉的宣传页，用内置的精简「关于」页兜底
          '/about.html': path.join(__dirname, 'assets', 'about.html')
        }
      });
      await webServer.listen();
      appOrigin = webServer.origin;
      console.log('[AudioMass] 本地服务已启动：' + appOrigin);
    } catch (err) {
      dialog.showErrorBox('启动失败', '无法启动本地服务：\n' + (err && err.message));
      app.quit();
      return;
    }

    configureSession();
    buildMenu();

    pendingOpenPath = extractFileFromArgv(process.argv);
    createMainWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
  });

  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('will-quit', async (event) => {
    if (webServer) {
      event.preventDefault();
      const server = webServer;
      webServer = null;
      await server.close().catch(() => {});
      app.exit(0);
    }
  });
}
