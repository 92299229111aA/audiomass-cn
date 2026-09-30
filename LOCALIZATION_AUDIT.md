# AudioMass 简体中文本地化审计

审计基线：官方 `pkalogiros/AudioMass` 的 `production` 分支。当前工作目录原先为空。扫描范围为 `src/` 下全部 JS/HTML 文件，并检查动态 DOM 文本、菜单对象、弹窗配置、HTML 模板和静态页面。`src/dist/`、压缩文件和第三方编码器/降噪库不修改。下表先于代码修改建立；“是否已修改”记录最终实际改动，显示层覆盖另作说明。

| 文件 | 原始英文 | 用途 | 建议中文 | 是否已修改 | 备注 |
|---|---|---|---|---|---|
| `src/index.html` | AudioMass - Audio Editor | 页面标题 | AudioMass - 音频编辑器 | 是 | 同步修改缓存入口 |
| `src/ui.js` | File / Edit / Effects / View / Help | 主菜单 | 文件 / 编辑 / 效果 / 视图 / 帮助 | 否 | 由 `src/i18n.js` 显示层覆盖 |
| `src/ui.js` | Export / Download | 文件菜单 | 导出 / 下载 | 否 | 弹窗也使用 |
| `src/ui.js` | Load from Computer / Load Sample File / Load From URL | 打开音频 | 从电脑打开 / 加载示例音频 / 从 URL 加载 | 否 | URL 保留 |
| `src/ui.js` | Undo / Redo / Select All / Deselect All | 编辑菜单 | 撤销 / 重做 / 全选 / 取消全选 | 否 | 快捷键原样保留 |
| `src/ui.js` | Gain / Fade In / Fade Out / Compressor / Reverb | 效果菜单 | 增益 / 淡入 / 淡出 / 压缩器 / 混响 | 否 | 仅显示名称 |
| `src/ui.js` | Drag n drop an Audio File | 欢迎提示 | 拖入音频文件 | 否 | 动态 HTML |
| `src/ui-fx.js` | Threshold / Ratio / Attack / Release | 压缩器参数 | 阈值 / 压缩比 / 启动时间 / 释放时间 | 是 | 其余可见标签由显示层覆盖；保留单位和数值 |
| `src/ui-fx.js` | Graphic EQ / Normalize / Hard Limiting | 效果弹窗 | 图示均衡器 / 标准化 / 硬限幅 | 否 | 预设名称另查 |
| `src/multitrack.js` | Channel / Recording / Crossfade | 多轨界面 | 声道 / 录音中 / 交叉淡化 | 是 | 默认声道名称直接改，其他标签显示层覆盖 |
| `src/fx-pg-eq.js` | Paragraphic EQ / Tempo & Rhythm Tools / New Recording | 弹窗标题 | 参数均衡器 / 节奏与律动工具 / 新建录音 | 是 | 增加滤波器显式值；标题显示层覆盖 |
| `src/modal.js` | CANCEL / Presets / Save or Modify preset | 弹窗控件 | 取消 / 预设 / 保存或修改预设 | 否 | `Preview` 还用于内部比较，需谨慎 |
| `src/welcome.js` | Welcome to AudioMass | 欢迎弹窗 | 欢迎使用 AudioMass | 是 | 项目名保留 |
| `src/recorder.js` | Recording | 录音状态 | 录音中 | 是 | 麦克风错误直接处理；API 名称不翻译 |
| `src/id3.js` | Title / Artist / Album / Year / Genre / Comment | 元数据字段 | 标题 / 艺术家 / 专辑 / 年份 / 流派 / 备注 | 否 | ID3 标识保留 |
| `src/about.html` | AudioMass - About | 关于页面 | AudioMass - 关于 | 是 | 许可证原文保留 |
| `src/mix.html`, `src/eq.html`, `src/sp.html` | UNDOCK | 独立工具窗口 | 取消停靠 | 是 | 子页面分别修改 |
| `src/index-cache.html`, `src/index-final.html` | New version ready / Reload | 更新提示 | 新版本已就绪 / 重新加载 | 是 | 不修改构建产物；改为现有源文件入口 |
| `src/drag.js` | Drag n drop Files! | 拖拽提示 | 拖放文件！ | 否 | 动态 DOM |

保留英文类别：`Request*`/`Did*` 事件、JS 标识符、DOM ID/CSS class、Web Audio API、文件路径/URL/MIME、格式名 MP3/WAV/OGG/FLAC、快捷键键名、专业单位 Hz/kHz/dB/LUFS/RMS/BPM/ms/%/Q/L/R。第三方 `src/dist/`、`*.min.js`、`lame.js`、`libflac.js`、`rnn_denoise.js` 内部文本暂不改动；若其英文直接进入 AudioMass UI，将通过项目自身的界面层覆盖。

## 完成后的实现记录

- `src/i18n.js`（新增）：集中维护可见文本对照；只遍历 DOM 文本节点和 `title`、`placeholder`、`aria-label`、`optgroup` 标签，并覆盖原生 alert/confirm/prompt 的消息。动态文本由 MutationObserver 处理；保留空白、数字、文件名和单位。
- `src/index.html`、`src/index-cache.html`、`src/index-final.html`：加载汉化层，设置 `zh-CN` 和中文标题、更新提示。后两入口改为引用仓库中实际存在的源文件，替代缺失的打包产物。
- `src/about.html`：说明、功能、开发故事、快捷键说明与小标题直接汉化；AudioMass 名称、URL、代码、事件和许可证法律内容保留。
- `src/mix.html`、`src/eq.html`、`src/sp.html`：独立工具窗口的静态标题和按钮直接汉化。
- `src/welcome.js`：欢迎说明直接汉化。`src/multitrack.js`：默认声道名称直接汉化。`src/recorder.js`：用户可见的麦克风错误按浏览器错误类型转为中文，原错误对象仍交给回调。
- `src/ui-fx.js`：ID3 曲目编号和自定义预设提示直接汉化；其他效果标签由显示层覆盖。`src/fx-pg-eq.js`：滤波器选项增加原有英文类型作为显式 `value`，确保中文标签不改变处理参数。
- `src/main.css`：补充中文字体回退，汉化 CSS 伪元素文本。`src/manifest.json`：中文应用名称。`src/sw.js` 和 `src/audiomass.appcache`：更新缓存资源清单，包含汉化层。
- `src/ui.js`、`src/modal.js`、`src/id3.js`、`src/drag.js` 等源文件本身未修改，其用户可见文本由 `src/i18n.js` 在显示时覆盖。事件、快捷键、对象键和音频算法保持原样。

## 第二轮英文残留分类

- A 用户界面：静态页面、动态 DOM、菜单、弹窗、状态和多轨标签已通过直接修改或 `i18n.js` 显示层处理。对仅在特定浏览器权限、编码错误或特定音频操作下出现的罕见动态文本，仍需人工走查；详见 QA 报告。
- B 技术英文：AudioMass、API、事件名、键名、效果滤波器 `value`、ID3 等协议字段保留。
- C 第三方：`src/dist/`、压缩脚本和编码/降噪库未修改。
- D 开发文本：注释、变量、函数及源码内作为映射输入的英文保留；它们不是最终显示文本。
- E 路径与单位：URL、文件名、MIME、MP3/WAV/OGG/FLAC、Hz/kHz/dB/LUFS/RMS/BPM/ms/%/Q/L/R 保留。
