'use strict';

/**
 * 仅绑定 127.0.0.1 的本地静态文件服务器。
 *
 * 为什么要它：
 *  - AudioMass 用相对路径创建 Web Worker（new Worker('lame.js')）、用 importScripts、
 *    并用 fetch(url, {mode:'same-origin'}) 加载 wasm。这些在 file:// （opaque origin）下全部失败。
 *  - 录音依赖 navigator.mediaDevices.getUserMedia + audioWorklet.addModule，
 *    需要安全上下文（Secure Context）。http://127.0.0.1 被 Chromium 视为可信来源。
 *  因此应用必须以 http://127.0.0.1:<port> 的形式被加载。
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const COOKIE_NAME = 'am_sess';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.flac': 'audio/flac',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8'
};

function mimeFor(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return out;
}

/**
 * @param {object} options
 * @param {string} options.root       静态资源根目录
 * @param {string} options.host       绑定地址，固定 127.0.0.1
 * @param {object} [options.fallbacks] 包内缺失文件时的兜底：{ '/about.html': '/abs/path.html' }
 */
function createStaticServer(options) {
  const root = path.resolve(options.root);
  const host = options.host || '127.0.0.1';
  const fallbacks = options.fallbacks || {};
  const token = crypto.randomBytes(24).toString('hex');

  function isAuthorized(req, parsed) {
    // 1) 会话 cookie（首次导航带 _t 参数后写入，后续同源请求自动携带）
    const cookies = parseCookies(req.headers.cookie);
    if (cookies[COOKIE_NAME] === token) return true;

    // 2) 首次导航携带的一次性 token
    if (parsed.searchParams.get('_t') === token) return true;

    // 3) 同源子资源请求的兜底（Worker / importScripts / fetch 等场景）
    const site = req.headers['sec-fetch-site'];
    if (site === 'same-origin' || site === 'none') return true;

    return false;
  }

  function resolveWithinRoot(urlPath) {
    let rel = decodeURIComponent(urlPath);
    if (rel.includes('\0')) return null;
    rel = rel.replace(/^\/+/, '');
    const abs = path.resolve(root, rel);
    const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
    if (abs !== root && !abs.startsWith(rootWithSep)) return null; // 目录穿越防护
    return abs;
  }

  function sendBuffer(req, res, body, contentType, extraHeaders) {
    const headers = Object.assign({
      'Content-Type': contentType,
      'Content-Length': Buffer.byteLength(body),
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store'
    }, extraHeaders);
    res.writeHead(200, headers);
    if (req.method === 'HEAD') return res.end();
    res.end(body);
  }

  function sendFile(req, res, filePath, stat, extraHeaders) {
    const headers = Object.assign({
      'Content-Type': mimeFor(filePath),
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache',
      'Accept-Ranges': 'bytes'
    }, extraHeaders);

    const range = req.headers.range;
    const size = stat.size;

    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(String(range).trim());
      if (m) {
        let start = m[1] === '' ? null : parseInt(m[1], 10);
        let end = m[2] === '' ? null : parseInt(m[2], 10);

        if (start === null && end !== null) {
          start = Math.max(size - end, 0);
          end = size - 1;
        } else if (start !== null && end === null) {
          end = size - 1;
        }

        if (start === null || end === null || start > end || start >= size) {
          res.writeHead(416, { 'Content-Range': 'bytes */' + size });
          return res.end();
        }

        end = Math.min(end, size - 1);
        headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' + size;
        headers['Content-Length'] = end - start + 1;
        res.writeHead(206, headers);
        if (req.method === 'HEAD') return res.end();
        return fs.createReadStream(filePath, { start, end }).pipe(res);
      }
    }

    headers['Content-Length'] = size;
    res.writeHead(200, headers);
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  }

  const server = http.createServer((req, res) => {
    let parsed;
    try {
      parsed = new URL(req.url, 'http://' + host);
    } catch (e) {
      res.writeHead(400);
      return res.end('Bad Request');
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      return res.end('Method Not Allowed');
    }

    if (!isAuthorized(req, parsed)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('403 未授权访问。请从应用窗口内使用本服务。');
    }

    // 首次导航带 ?_t=token 时下发会话 cookie，之后所有同源子资源请求自动携带
    const cookies = parseCookies(req.headers.cookie);
    const extraHeaders = {};
    if (parsed.searchParams.get('_t') === token && cookies[COOKIE_NAME] !== token) {
      extraHeaders['Set-Cookie'] =
        COOKIE_NAME + '=' + token + '; Path=/; HttpOnly; SameSite=Strict';
    }

    let pathname = parsed.pathname;
    if (pathname === '/' || pathname === '') pathname = '/index.html';

    let filePath = resolveWithinRoot(pathname);
    if (!filePath) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('403 非法路径');
    }

    let stat = null;
    try {
      stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
        stat = fs.statSync(filePath);
      }
    } catch (e) {
      stat = null;
    }

    if (!stat) {
      // 包内被裁剪掉、但有内置兜底页面的资源（例如 about.html）
      const fb = fallbacks[pathname];
      if (fb && fs.existsSync(fb)) {
        return sendFile(req, res, fb, fs.statSync(fb), extraHeaders);
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found: ' + pathname);
    }

    sendFile(req, res, filePath, stat, extraHeaders);
  });

  server.on('clientError', (err, socket) => {
    if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });

  return {
    token,
    get port() {
      const addr = server.address();
      return addr && typeof addr === 'object' ? addr.port : null;
    },
    get origin() {
      return 'http://' + host + ':' + this.port;
    },
    cookieName: COOKIE_NAME,
    listen() {
      return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, host, () => {
          server.removeListener('error', reject);
          resolve(this.port);
        });
      });
    },
    close() {
      return new Promise((resolve) => server.close(() => resolve()));
    },
    _server: server
  };
}

module.exports = { createStaticServer, MIME, COOKIE_NAME };
