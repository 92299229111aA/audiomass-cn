# AudioMass 桌面版（Electron 打包工程）

把 `../src`（纯网页版 AudioMass）包装成 Windows 桌面应用。**`src/` 目录零改动**，网页版仍可独立运行。

---

## 一、核心设计：为什么必须跑在 127.0.0.1 上

不能直接双击 `index.html` 用 `file://` 打开。原因是两条浏览器硬性限制：

| 限制 | 涉及代码 | 后果 |
|---|---|---|
| `file://` 是 opaque origin，Worker 与同源 fetch 被拦截 | `actions.js:928-934` 相对路径 `new Worker(...)`；`flac.js` / `tempo-worker.js` 的 `importScripts`；`lz4-block-codec-wasm.js:140` 的 `fetch(wasm, {mode:'same-origin'})` | MP3/FLAC/WAV 导出、降噪、BPM 检测、会话压缩全部失效 |
| `getUserMedia` 需要安全上下文 | `recorder.js:158`、`recorder.js:132` | 麦克风录音被直接拒绝 |

因此主进程启动时会拉起一个**只绑定 `127.0.0.1`、端口由系统随机分配**的静态服务器，窗口加载 `http://127.0.0.1:<port>/index.html`。这个地址同时满足「同源」和「安全上下文」，所有能力与浏览器中完全一致。

服务器带一次性 token：首次导航带 `?_t=<token>`，服务端下发 `HttpOnly` 会话 Cookie，之后所有同源子资源请求自动携带；未授权请求返回 403。

---

## 二、目录结构

```
desktop/
├── main.js                  Electron 主进程：本地服务、窗口、菜单、权限、下载、文件关联
├── preload.js               预加载脚本：原生文件注入 + 通知提示
├── lib/static-server.js     本地静态服务器（MIME、Range、路径穿越防护、token 鉴权）
├── assets/about.html        精简版中文「关于」页（兜底被裁剪的原版宣传页）
├── build/icon.ico           图标（由 tools/make-icon.js 生成，不入库）
├── tools/make-icon.js       由 src/icon.png 生成多尺寸 ICO
├── tools/serve-only.js      纯 Node 静态服务，便于用 curl 调试
├── tools/smoke-test.js      自动化冒烟测试（18 项）
└── electron-builder.yml     打包与签名配置
```

---

## 三、开发与调试

```bash
cd desktop
npm install                 # 首次；若 Electron 二进制未下载成功见「故障排查」

npm start                   # 启动桌面应用
npm run serve               # 只起静态服务器，打印带 token 的入口 URL
npx electron tools/smoke-test.js   # 自动化冒烟测试
```

---

## 四、打包

```bash
npm run dist              # 安装包 + 便携版
npm run dist:nsis         # 只出 NSIS 安装包
npm run dist:portable     # 只出免安装便携版
```

产物在 `desktop/dist/`：

| 产物 | 说明 |
|---|---|
| `AudioMass-Setup-<版本>.exe` | NSIS 安装包，中文向导，可选安装路径，创建桌面/开始菜单快捷方式 |
| `AudioMass-Portable-<版本>.exe` | 免安装便携版，适合 U 盘 |

打包会**自动排除**以下演示/宣传资源（约 13 MB）：`about/`、`about.html`、`mp3/`、`*.mp3`、`sw.js`、`*.appcache`、`index-*.html`。

> 排除上述文件后，应用内这三个入口会失效：帮助菜单的「关于（原版宣传页）」、「加载示例文件」、「加载多轨示例」。
> 「关于」已由内置的精简中文页面兜底，不会白屏。
> **如需恢复**：删掉 `electron-builder.yml` 中 `extraResources` 里那 6 行 `!` 开头的排除规则即可。

---

## 五、代码签名（重要）

未签名的安装包会让用户看到 **SmartScreen「Windows 已保护你的电脑」** 警告，需要手动点「更多信息 → 仍要运行」。

证书**不写入仓库**，通过环境变量提供：

```bash
export CSC_LINK="file:///D:/certs/audiomass.pfx"   # 或 base64 字符串
export CSC_KEY_PASSWORD="证书密码"
npm run dist
```

未提供证书时，electron-builder 会自动跳过签名，构建仍能成功。

### 证书选型提示

自 2023 年 6 月起，CA/B Forum 要求**代码签名证书私钥必须存放在硬件令牌或云 HSM 中**，不再签发可导出的 `.pfx` 文件。可选方案：

| 方案 | 说明 |
|---|---|
| OV 证书 + 硬件 USB Token | 传统方案，年费较低；CI 打包不便（需插着 token） |
| **Azure Trusted Signing** | 微软云端签名服务，月费制，CI 友好，目前性价比最高 |
| EV 证书 + 云 HSM | 价格最高，但能即时建立 SmartScreen 信誉 |

使用 Azure Trusted Signing 时，把 `electron-builder.yml` 里的 `signtoolOptions` 换成 `azureSignOptions`：

```yaml
win:
  azureSignOptions:
    endpoint: https://xxx.codesigning.azure.net
    codeSigningAccountName: <账户名>
    certificateProfileName: <配置文件名称>
```

---

## 六、运行时数据目录

应用数据固定在：

```
%APPDATA%\AudioMass\
```

（而不是 Electron 默认的 `%APPDATA%\Electron\` —— 后者会与本机其它 Electron 应用争抢同一份 GPU 缓存和 LocalStorage，实测会导致 GPU 进程崩溃。）

用户的 IndexedDB 会话就存在这里。**升级时保持该目录名不变即可保留数据**；卸载时默认不删除。

---

## 七、故障排查

| 现象 | 原因与处理 |
|---|---|
| `npm install` 后 `npx electron` 报 `Electron failed to install correctly` | Electron 二进制未下载。执行：`ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ node node_modules/electron/install.js` |
| 启动时报 `spawn EBUSY` / 执行 `electron.exe` 提示 `Device or resource busy` | 二进制刚解压完被杀软占用，等几秒重试 |
| Electron 报的版本号和 `package.json` 不一致 | 环境变量 `ELECTRON_RUN_AS_NODE=1` 导致 Electron 以 Node 模式运行（会报 `bad option`）。执行前 `unset ELECTRON_RUN_AS_NODE` |
| 窗口一闪而过 / 渲染进程 `crashed` | 显卡驱动异常，用 `AudioMass.exe --disable-gpu` 启动 |
| 页面显示 403 | 本地服务的 token 校验生效。正常使用应从应用窗口进入，不要直接浏览器访问 |
| 麦克风录音不可用 | 检查 Windows「设置 → 隐私和安全性 → 麦克风」是否允许桌面应用访问 |
| 导出时没有弹出保存框 | 导出走 `a.download`，由主进程拦截后弹出原生保存框；若被拦请检查杀软是否拦截了写盘 |

### 打包被杀毒软件打断（实测踩坑）

打包过程中可能出现：

```
WARNING: ...\dxcompiler.dll : 另一个程序正在使用此文件，进程无法访问
• output file is locked for writing (maybe by virus scanner) => waiting for unlock...
makensis.exe process failed
File: failed opening file "...AudioMass-Setup-1.0.0.__uninstaller.exe"
```

**原因**：安全软件会实时扫描新写入的可执行文件，在扫描窗口内独占这些文件。electron-builder 压缩 Electron 运行时（约 338 MB，含 `dxcompiler.dll`、`ffmpeg.dll`、`vk_swiftshader.dll`、`vulkan-1.dll` 等）以及 makensis 回读刚生成的卸载程序时，正好撞上这个窗口。文件本身没问题——同样的文件过一两分钟后可以正常读取。

**处理办法（按推荐顺序）**：

1. **重跑一次 `npm run dist`**。第一次构建已经把应用载荷 `audiomass-desktop-1.0.0-x64.nsis.7z` 写好，第二次会显示 `skipped archiving (Archive file is up to date)` 直接进入安装包组装，成功率明显更高。
2. **给构建目录加杀软白名单**：
   ```powershell
   Add-MpPreference -ExclusionPath "D:\音频淡出工具\desktop"
   ```
3. **分两步构建**（最稳，本项目实测成功路径）：
   ```bash
   # 第一步：只打包应用目录，不做压缩
   npx electron-builder --win dir
   # 此时得到 dist/win-unpacked，等一两分钟让杀软扫完
   # 第二步：从已打包目录直接出安装包
   npx electron-builder --win --prepackaged dist/win-unpacked --config.directories.output=dist
   ```
4. 项目路径含中文时，NSIS 日志里的路径会显示为乱码。实测不影响构建结果，但若遇到莫名其妙的路径错误，可把项目复制到纯 ASCII 路径下再打包。

---

## 八、已知限制

- 仅配置了 Windows x64 目标。如需 ARM64，在 `electron-builder.yml` 的 `win.target[].arch` 中加入 `arm64`。
- 未接入自动更新。如需，可加 `electron-updater` + 发布源。
- 大文件（数百 MB 音频）仍受 Chromium 内存限制，与网页版行为一致。
