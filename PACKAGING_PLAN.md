# AudioMass 桌面化打包方案

> 目标：把当前这个纯网页版 AudioMass 打包成 Windows 上可安装的桌面软件（.exe 安装包 / 免安装便携版）。
> 调研时间：2026-09-30 ｜ 调研对象：`D:/音频淡出工具`

---

## 一、项目现状调研结论

### 1.1 基础事实

| 项目 | 结论 |
|---|---|
| 技术类型 | 纯静态前端（HTML + CSS + 原生 JS），**无框架、无构建步骤、无 npm 依赖** |
| 入口文件 | `src/index.html`（另有 `eq.html` 频率分析、`mix.html` 多轨混音、`sp.html` 频谱、`about.html` 关于） |
| 启动方式 | 任意静态服务器托管 `src/` 目录，官方约定端口 5055 |
| 后端依赖 | **无**。`audiomass-server.py` / `.go` 只是静态文件服务器 |
| 网络依赖 | **无 CDN**。代码里出现的 `audiomass.co` / `developer.mozilla.org` 等网址全是注释、文档链接和 og 元信息，运行时不会请求 |
| 本地化 | 已完成中文本地化（`lang="zh-CN"`、`i18n.js` 26KB） |
| 仓库体积 | 34 MB（含 `.git` 与演示音频） |

### 1.2 体积构成（用于决定打包时该带什么）

| 内容 | 体积 | 是否必需 |
|---|---|---|
| `src/` 核心代码（js/css/wasm） | ~4 MB | ✅ 必需 |
| `src/dist/`（wavesurfer + regions 插件） | 216 KB | ✅ 必需 |
| `src/fonts/`（icomoon 图标字体 4 种格式） | 20 KB | ✅ 必需 |
| `src/about/`（宣传图 + `dock_ui.mp4`） | 5.4 MB | ❌ 仅 `about.html` 用，可裁 |
| `src/mp3/`（演示音频） | 3.9 MB | ❌ 演示用，可裁 |
| `src/test.mp3` + `src/piano-sample.mp3` | 4.2 MB | ❌ 演示用，可裁 |
| `.git/` | ~18 MB | ❌ 必须排除 |

> **可裁剪约 13 MB**，核心运行资源仅 4 MB 左右。

---

## 二、必须解决的技术问题（这是重点，不能跳过）

直接双击 `index.html` 用 `file://` 打开是**跑不起来**的。原因有两条硬性限制：

### 问题 1：file:// 下 Worker 与 WASM 会失败

代码里有这些相对路径的加载（全部依赖同源）：

| 位置 | 代码 | 后果 |
|---|---|---|
| `actions.js:928-934` | `new Worker('lame.js')` / `('flac.js')` / `('wav.js')` | 经典 Worker 在 file:// 下被同源策略拦截 |
| `flac.js:3` | `importScripts('libflac.js')` | Worker 内脚本加载失败 |
| `tempo-worker.js:4` | `importScripts('tempo-estimator.js?v=mt2')` | 同上 |
| `lz4-block-codec-wasm.js:140` | `fetch(wd + 'lz4-block-codec.wasm', {mode:'same-origin'})` | file:// 是 opaque origin，**必然失败** |
| `rnn_denoise.js:1568` | `var wasmBinaryFile = 'rnn_denoise.wasm'` | 相对路径加载 |

影响范围：MP3/FLAC/WAV 编码导出、BPM 检测、降噪、会话本地保存（IndexedDB 压缩）全部失效。

### 问题 2：录音功能需要 Secure Context

| 位置 | 代码 |
|---|---|
| `recorder.js:158` | `navigator.mediaDevices.getUserMedia({...})` |
| `recorder.js:132` | `audioContext.audioWorklet.addModule('recorder-worklet.js')` |

`getUserMedia` 只在**安全上下文**下可用。`file://` 属于 opaque origin，浏览器会直接拒绝授权。`http://127.0.0.1` 被视为可信来源（trustworthy），可用。

### 结论

**必须让应用运行在一个 `http://127.0.0.1:<port>` 的本地源上**，而不是 `file://`，也不是 `app://` 自定义协议。

这是整个方案的技术核心。

### 问题 3：其它需要处理的点

| 事项 | 现状 | 桌面端需要做的事 |
|---|---|---|
| 导出保存 | `a.download = ...`（`actions.js:1106`、`ui-fx.js:2404`、`amss-format.js:176`） | 拦截下载事件，弹原生保存框并预填文件名 |
| 数据持久化 | IndexedDB 库名 `audiomass`（`local.js:72`）、localStorage | 固定 userData 目录，保证升级不丢会话 |
| 外链 | `about.html:104`、`welcome.js:37` 有 `target="_blank"` | 拦截后用系统浏览器打开，而非弹应用内新窗 |
| 子页面 | `eq.html` / `mix.html` / `sp.html` / `about.html` | 一并打包，保证同源可跳转 |
| Service Worker | `sw.js` 存在，但 `index.html:68` 注册代码**已注释** | 无需处理 |
| `.appcache` | 遗留 HTML5 AppCache，现代浏览器已废弃 | 可直接删除 |

---

## 三、方案选型对比

| 维度 | **A. Electron + 内置本地服务器**（推荐） | B. Electron + 自定义协议 | C. Tauri v2 | D. PWA |
|---|---|---|---|---|
| 安装包体积 | 75–95 MB | 75–95 MB | **6–10 MB** | 无安装包 |
| 对现有代码改动 | **零改动** | 需验证 Worker/WASM 兼容 | 零改动（同样跑本地服务） | 几乎零改动 |
| Worker/WASM/AudioWorklet | ✅ 与浏览器完全一致 | ⚠️ 自定义协议下易踩坑 | ✅ | ✅ |
| 录音（getUserMedia） | ✅ 127.0.0.1 是安全上下文 | ⚠️ 需注册 secure 协议 | ✅ | ✅ |
| 需额外工具链 | 无（已有 Node 22 + npm 10） | 无 | **需安装 Rust（~2 GB）** | 无 |
| 跨平台 | Win / macOS / Linux | 同 A | 同 A | 取决于浏览器 |
| 原生菜单 / 文件关联 / 自动更新 | ✅ 成熟 | ✅ | ✅ | ❌ |
| 落地难度 | **低** | 中 | 中高 | 最低 |

### 推荐：方案 A（Electron + 内置本地 HTTP 服务器）

**理由**：
1. 项目是纯 Web，Electron 等于"真空打包"，**不需要动 `src/` 里任何一行代码**——Web 版可以继续独立运行。
2. 内置一个只绑 `127.0.0.1` 的静态服务器，应用就走 `http://127.0.0.1:port`。上面列出的 **Worker / WASM / AudioWorklet / getUserMedia 全部天然正常**，零适配成本，风险最低。
3. 环境已具备（Node 22.22.2 + npm 10.9.7 已就绪，npm 源已指向 npmmirror）。
4. 原生菜单、文件关联、自动更新、代码签名在 Electron 生态里最成熟。

**代价**：安装包偏大（Electron 固有，约 75–95 MB）。若体积是硬指标，再走方案 C（Tauri），届时需要先装 Rust 工具链。

**补充说明**：为什么不用 B（自定义协议）？虽然 `app://` 看起来更"原生"，但 Chromium 对自定义协议下的 Worker、`importScripts`、WASM 流式编译支持存在大量边界情况，本项目恰好把这几个点全用满了。本地 HTTP 服务器方案虽然"土"，但行为与线上完全一致，是最稳的。

---

## 四、实施计划

### 阶段 0 · 工程准备

- 新建 `desktop/` 目录承载 Electron 代码，**与 `src/` 物理隔离**，保证 Web 版不受影响。
- 初始化 `desktop/package.json`，安装 `electron` + `electron-builder`（`electron-builder` 打 Windows 目标无需 Wine）。
- 配置国内镜像，避免 Electron 二进制下载卡住：
  ```
  ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
  ```
- 产出：本地能 `npm start` 拉起一个 Electron 窗口。

### 阶段 1 · 最小可运行版（MVP）

主进程核心逻辑：

1. 用 Node 内置 `http` 模块起静态服务，根目录指向打包后的 `src/`。
2. **只绑定 `127.0.0.1`**，端口用 `0` 让系统分配空闲端口（避免 5055 冲突）。
3. 生成一次性随机 token，请求需带 token，防止本机其它程序探测读取。
4. `BrowserWindow` 加载 `http://127.0.0.1:<port>/index.html`。

**验收标准**（逐项实测，缺一不可）：

- [ ] 导入 MP3 / WAV / FLAC，波形正常渲染
- [ ] 导出 MP3 / WAV / FLAC 成功（验证 Worker 链路）
- [ ] 麦克风录音可用（验证 Secure Context + AudioWorklet）
- [ ] 降噪、BPM 检测可用（验证 WASM）
- [ ] 多轨模式拖拽、混音、bounce 可用
- [ ] 会话保存到 IndexedDB 后重启应用仍能恢复
- [ ] EQ（`fx-pg-eq.js`，80 KB）面板打开正常

### 阶段 2 · 原生体验增强

| 项 | 做法 |
|---|---|
| 麦克风权限 | `session.setPermissionRequestHandler` 放行 `media`；处理 Windows 隐私设置被拒的情况 |
| 打开文件 | 菜单「打开音频…」→ `dialog.showOpenDialog` → 读盘后复用现有 `drag.js` 的加载入口 |
| 保存文件 | `session.on('will-download')` 拦截 `a.download`，改用原生保存框 + 默认文件名。**这一步几乎零侵入就能拿到原生保存体验** |
| 外链 | `setWindowOpenHandler` → `shell.openExternal`，把 `about.html` / `welcome.js` 的外链交给系统浏览器 |
| 菜单与快捷键 | 移除默认英文菜单，替换为中文菜单（文件 / 编辑 / 视图 / 帮助） |
| 应用图标 | 由 `src/icon.png`(144×144) 生成多尺寸 `.ico`，需重绘到 256×256 以保证高分屏清晰 |
| 子页面可访问 | 确认 `eq.html` / `mix.html` / `sp.html` / `about.html` 路由正常 |

### 阶段 3 · 生成安装包

用 `electron-builder` 产出两个目标：

| 产物 | 说明 |
|---|---|
| `AudioMass-Setup-<版本>.exe` | NSIS 安装包，中文安装向导，可选安装路径，生成开始菜单/桌面快捷方式 |
| `AudioMass-Portable-<版本>.exe` | 免安装便携版，适合 U 盘/临时使用 |

打包时通过 `files` 白名单**排除** `.git/`、`src/about/`、`src/mp3/`、`src/*.mp3`、`*.appcache`，可回收约 13 MB。

可选增强：
- 文件关联：双击 `.mp3` / `.wav` / `.flac` 用本应用打开（需处理单实例锁 + 启动参数传路径）
- 卸载时询问是否保留用户数据（IndexedDB 会话）

### 阶段 4 · 可选进阶

- **自动更新**：`electron-updater` + GitHub Releases，或自建更新源
- **代码签名**：向 CA 申请 Windows 代码签名证书，消除 SmartScreen「未知发布者」警告
- **macOS / Linux 打包**：macOS 需 Apple 开发者账号才能免 Gatekeeper 拦截

---

## 五、风险与应对

| 风险 | 影响 | 应对 |
|---|---|---|
| 安装包体积大 | 75–95 MB | Electron 固有。若不可接受则改走 Tauri（6–10 MB），代价是需装 Rust 工具链 |
| SmartScreen 警告 | 用户首次运行需点「更多信息 → 仍要运行」 | 购买代码签名证书；无证书时在安装说明中提前告知 |
| 本地端口被探测/占用 | 安全与冲突风险（低） | 绑 `127.0.0.1` + 系统随机端口 + 一次性 token 校验 |
| 升级后 IndexedDB 丢失 | 用户会话丢失 | 固定 `productName` 与 userData 目录，升级路径保持不变 |
| 大文件处理内存占用 | 数百 MB 音频可能崩溃 | 与浏览器版限制一致，属既有行为，后续按需优化 |
| 麦克风被系统禁用 | 录音不可用 | 启动时检测并给出中文引导，指向 Windows「隐私和安全性 → 麦克风」 |

---

## 六、需要你决策的点

1. **选哪个方案**：A（Electron，推荐）/ C（Tauri，体积小但需装 Rust）/ D（PWA，最省事但不是安装包）
2. **目标平台**：只做 Windows，还是同时要 macOS / Linux
3. **是否需要代码签名证书**：有证书才能消除 SmartScreen 警告
4. **是否要文件关联**：双击音频文件直接用它打开
5. **是否保留演示资源**：`about/` 宣传页和演示音频要不要一起打包

确认后即可从阶段 0 开始落地。
