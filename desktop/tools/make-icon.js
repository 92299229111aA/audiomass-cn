'use strict';

/**
 * 生成 Windows 应用图标。
 *
 *   npx electron tools/make-icon.js
 *
 * 源图 src/icon.png 只有 144x144，低于 Windows 打包要求的 256x256，
 * 因此用 Electron 内置的 nativeImage 做多尺寸重采样，再手工组装 ICO，
 * 避免为了压缩一张图额外引入 sharp / jimp 之类的依赖。
 */

const { app, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

const SIZES = [16, 24, 32, 48, 64, 128, 256];

function buildIco(entries) {
  const count = entries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(count, 4);

  const dir = Buffer.alloc(16 * count);
  const blobs = [];
  let offset = 6 + 16 * count;

  entries.forEach((entry, i) => {
    const p = i * 16;
    const dim = entry.size >= 256 ? 0 : entry.size; // 256 在 ICO 里记作 0
    dir.writeUInt8(dim, p + 0);          // width
    dir.writeUInt8(dim, p + 1);          // height
    dir.writeUInt8(0, p + 2);            // palette count
    dir.writeUInt8(0, p + 3);            // reserved
    dir.writeUInt16LE(1, p + 4);         // color planes
    dir.writeUInt16LE(32, p + 6);        // bits per pixel
    dir.writeUInt32LE(entry.png.length, p + 8);
    dir.writeUInt32LE(offset, p + 12);
    offset += entry.png.length;
    blobs.push(entry.png);
  });

  return Buffer.concat([header, dir].concat(blobs));
}

app.whenReady().then(() => {
  const sourceFile = path.join(__dirname, '..', '..', 'src', 'icon.png');
  const outputDir = path.join(__dirname, '..', 'build');

  if (!fs.existsSync(sourceFile)) {
    console.error('找不到源图标：' + sourceFile);
    app.exit(1);
    return;
  }

  const base = nativeImage.createFromPath(sourceFile);
  const sourceSize = base.getSize();
  console.log('源图标尺寸：' + sourceSize.width + 'x' + sourceSize.height);

  if (!sourceSize.width) {
    console.error('源图标无法解析为图像。');
    app.exit(1);
    return;
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const entries = SIZES.map((size) => {
    const resized = base.resize({ width: size, height: size, quality: 'best' });
    return { size, png: resized.toPNG() };
  });

  const ico = buildIco(entries);
  const icoPath = path.join(outputDir, 'icon.ico');
  fs.writeFileSync(icoPath, ico);

  const png256 = entries.find((e) => e.size === 256).png;
  const pngPath = path.join(outputDir, 'icon.png');
  fs.writeFileSync(pngPath, png256);

  console.log('已生成 ' + icoPath + '（' + SIZES.join('/') + '，共 ' + (ico.length / 1024).toFixed(1) + ' KB）');
  console.log('已生成 ' + pngPath + '（256x256）');

  app.exit(0);
}).catch((err) => {
  console.error(err);
  app.exit(1);
});
