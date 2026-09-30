'use strict';

/**
 * 纯 Node 冒烟测试服务器：不启动 Electron，只把静态服务跑起来，
 * 方便用 curl 验证 MIME、鉴权、Range、路径穿越防护等行为。
 *
 *   node tools/serve-only.js [webRoot]
 */

const path = require('path');
const { createStaticServer } = require('../lib/static-server');

(async () => {
  const root = process.argv[2] || path.join(__dirname, '..', '..', 'src');

  const server = createStaticServer({
    root,
    host: '127.0.0.1',
    fallbacks: {
      '/about.html': path.join(__dirname, '..', 'assets', 'about.html')
    }
  });

  await server.listen();

  console.log('WEB_ROOT=' + root);
  console.log('ORIGIN=' + server.origin);
  console.log('TOKEN=' + server.token);
  console.log('ENTRY=' + server.origin + '/index.html?_t=' + server.token);

  const shutdown = async () => {
    await server.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
