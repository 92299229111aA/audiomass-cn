'use strict';

/**
 * 预加载脚本 —— 连接主进程与页面。
 *
 * 关于 contextIsolation：
 *  隔离世界与主世界共享同一份 DOM，但不共享 JS 全局。因此本脚本不直接触碰页面变量，
 *  而是通过 contextBridge 暴露一个取值接口，再用 webFrame.executeJavaScript 在
 *  主世界中执行注入脚本，这样 new File() / DataTransfer 都诞生于主世界，
 *  避免跨 realm 传递 Blob 的兼容性问题。
 */

const { contextBridge, ipcRenderer, webFrame, webUtils } = require('electron');

let pendingFiles = [];
let pumping = false;
let pumpTimer = null;

contextBridge.exposeInMainWorld('amDesktop', {
  platform: process.platform,
  takePendingFile: function () {
    return pendingFiles.length ? pendingFiles.shift() : null;
  },
  pendingCount: function () {
    return pendingFiles.length;
  },
  /** 把拖进来的 File 还原成真实磁盘路径（Electron 32+ 已移除 File.path） */
  pathForFile: function (file) {
    try {
      return webUtils.getPathForFile(file);
    } catch (e) {
      return '';
    }
  },
  isDesktop: true
});

/** 在主世界中调用 window.amDesktop.takePendingFile()，合成 drop 事件交给应用自带的加载逻辑 */
const INJECT_SOURCE = `(function () {
  try {
    if (!window.amDesktop || !window.amDesktop.takePendingFile) return 'no-bridge';
    var app = window.PKAudioEditor;
    var host = document.getElementById('app') || document.body;
    if (!app || !app.engine || !app.ui || !host) return 'not-ready';

    var payload = window.amDesktop.takePendingFile();
    if (!payload) return 'empty';

    var file = new File([payload.data], payload.name || 'audio');
    var dt = new DataTransfer();
    dt.items.add(file);
    host.dispatchEvent(new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      dataTransfer: dt
    }));
    return 'ok';
  } catch (err) {
    return 'error:' + (err && err.message ? err.message : String(err));
  }
})();`;

function pump() {
  if (pumping || !pendingFiles.length) return;
  pumping = true;
  webFrame.executeJavaScript(INJECT_SOURCE).then(
    (result) => {
      pumping = false;
      if (result === 'ok' || result === 'empty') {
        stopPumpLoop();
        if (pendingFiles.length) schedulePump(150); // 连续打开多个文件
        return;
      }
      // 应用还没初始化完，稍后重试
      schedulePump(400);
    },
    () => {
      pumping = false;
      schedulePump(400);
    }
  );
}

function schedulePump(delay) {
  if (pumpTimer) return;
  pumpTimer = setTimeout(() => {
    pumpTimer = null;
    pump();
  }, delay);
}

function stopPumpLoop() {
  if (pumpTimer) {
    clearTimeout(pumpTimer);
    pumpTimer = null;
  }
}

ipcRenderer.on('audio:open-file', (event, payload) => {
  // payload: { name: string, data: ArrayBuffer }
  pendingFiles.push(payload);
  stopPumpLoop();
  schedulePump(0);
});

ipcRenderer.on('audio:notify', (event, payload) => {
  window.addEventListener('DOMContentLoaded', () => {
    const ok = payload && payload.type === 'ok';
    const box = document.createElement('div');
    box.setAttribute('style',
      'position:fixed;left:50%;top:24px;transform:translateX(-50%);z-index:2147483647;' +
      'background:' + (ok ? '#1f5f43' : '#7a1f1f') + ';color:#fff;padding:10px 16px;border-radius:8px;' +
      'font:13px/1.6 system-ui,-apple-system,"Segoe UI","Microsoft YaHei",sans-serif;' +
      'max-width:80vw;word-break:break-all;box-shadow:0 4px 16px rgba(0,0,0,.3)');
    box.textContent = (payload && payload.message) || '发生未知错误';
    document.body.appendChild(box);
    setTimeout(() => box.remove(), ok ? 4000 : 6000);
  }, { once: true });
});
