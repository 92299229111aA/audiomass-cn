/* AudioMass zh-CN display text. No event names, audio parameters or stored data are changed. */
(function () {
    'use strict';
    var entries = `
AudioMass - Audio Editor|AudioMass - 音频编辑器
AudioMass - About|AudioMass - 关于
File|文件
Edit|编辑
Effects|效果
View|视图
Help|帮助
Open|打开
Close|关闭
Cancel|取消
CANCEL|取消
OK|确定
Apply|应用
Preview|预览
Save|保存
Delete|删除
Reset|重置
Default|默认
Presets|预设
Export|导出
Download|下载
Export / Download|导出 / 下载
Load from Computer|从电脑打开
Load Sample File|加载示例音频
Load From URL|从 URL 加载
Load audio from remote url|从远程 URL 加载音频
Load Asset|加载资源
New Recording|新建录音
Save Draft Locally|在本地保存草稿
Open Local Drafts|打开本地草稿
OPEN IN NEW WINDOW|在新窗口中打开
OPEN IN NEW|在新窗口打开
OPEN|打开
Undo|撤销
Redo|重做
Play|播放
Stop|停止
Pause|暂停
Record|录音
Recording|录音中
Select All|全选
Deselect All|取消全选
Seamless Loop|无缝循环
Zero Cross Selection|过零点选择
Gain|增益
Fade In|淡入
Fade Out|淡出
Noise Reduction (Voice)|降噪（人声）
Compressor|压缩器
Distortion|失真
Reverb|混响
Audio Repair|音频修复
Follow Cursor|跟随光标
Peak Separators|峰值分隔线
Timeline|时间轴
Frequency Analyser|频率分析仪
Spectrum Analyser|频谱分析仪
Multitrack Mixer|多轨混音器
Tempo Tools|节奏工具
ID3 Tags|ID3 标签
Center to Cursor|居中到光标
Reset Zoom|重置缩放
Update Offline Version|更新离线版本
File Name|文件名
Filename|文件名
Format|格式
Quality|质量
Bitrate|比特率
Sample Rate|采样率
Channels|声道
Channel|声道
Mono|单声道
Stereo|立体声
Title|标题
Artist|艺术家
Album|专辑
Year|年份
Genre|流派
Comment|备注
Gain percentage|增益百分比
Apply Gain to selected range|对所选区域应用增益
Apply Gain|应用增益
Change Speed|更改速度
Apply Rate|应用速率
Playback Rate|播放速率
Pitch / Speed Profile|音高 / 速度曲线
Apply Profile|应用曲线
Channel Info|声道信息
Apply Changes|应用更改
Insert Silence|插入静音
Threshold|阈值
Ratio|压缩比
Attack|启动时间
Release|释放时间
Knee|拐点
Frequency|频率
Feedback|反馈
Amount|强度
Wet|湿声
Dry|干声
Decay|衰减
Room Size|房间大小
Normalize|标准化
Mode|模式
Graphic EQ|图示均衡器
Paragraphic EQ|参数均衡器
Apply EQ|应用均衡器
Hard Limiting|硬限幅
Delay Time|延迟时间
Time|时间
Preview Loop|预览循环
Open in New Editor|在新编辑器中打开
ID3 Tag Editor|ID3 标签编辑器
DOWNLOAD COPY|下载副本
Preset Name|预设名称
Save As New|另存为新预设
Save or Modify preset|保存或修改预设
My Preset|我的预设
Reading metadata...|正在读取元数据…
Unsupported audio file.|不支持的音频文件。
Measuring...|正在测量…
Could not analyze audio.|无法分析音频。
Tempo & Rhythm Tools|节奏与律动工具
Estimate|估算
Working...|处理中…
Loading tempo detector...|正在加载节奏检测器…
Preparing audio for background analysis...|正在准备后台分析音频…
Analyzing audio. This can take a while on long files.|正在分析音频。长文件可能需要一些时间。
START RECORDING|开始录音
FINISH RECORDING|结束录音
PAUSE|暂停
UN-PAUSE|继续
no microphone permissions found!|没有麦克风使用权限！
Are you sure? This will discard the current recording.|确定吗？这将丢弃当前录音。
Stop Track|停止音轨
Play Track|播放音轨
ON|开
OFF|关
DELETE|删除
AUTOMATE|自动化
MultiTrack|多轨
Beta|测试版
Track|音轨
Add Track|添加音轨
Remove Track|移除音轨
Mute|静音
Solo|独奏
Arm|预备录音
Mixdown|混音导出
Crossfade|交叉淡化
Clip|片段
Pan|声像
Volume|音量
Rename|重命名
Move|移动
Snap|吸附
Turn Crossfade Off|关闭交叉淡化
Turn Crossfade On|开启交叉淡化
Audio|音频
OPEN MULTITRACK|打开多轨
UNDOCK|取消停靠
New version ready|新版本已就绪
Reload|重新加载
Drag n drop Files!|拖放文件！
Please Wait...|请稍候…
No drafts found...|没有找到草稿…
Open in new window?|在新窗口中打开？
Please choose source...|请选择来源…
Please insert url|请输入 URL
Insert url|输入 URL
mp3 filename|MP3 文件名
(optional) filename|文件名（可选）
Copy Selection|复制选区
Paste Selection|粘贴选区
Cut Selection|剪切选区
Clear Selection|清除选区
Stop Playback|停止播放
Toggle Loop|切换循环
Seek Start|跳至开头
Seek End|跳至结尾
Seek|跳转
Zoom In Horiz|水平放大
Zoom Out Horiz|水平缩小
Zoom In Vertically|垂直放大
Zoom Out Vertically|垂直缩小
Start|开始
End|结束
Go|跳转
Silence|静音
A lot slower|大幅减速
Slightly slower|稍慢
Slightly faster|稍快
Blazing Fast|大幅加速
Doppler Pass|多普勒掠过
Accelerate|加速
Engine Rev|引擎轰鸣
Car Approaching|汽车驶近
Car Driving Away|汽车驶远
Bass Boost|低音增强
Treble Boost|高音增强
Vocal Clarity|人声清晰
Podcast|播客
Warm|温暖
Bright|明亮
V-Shape|V 形
Loudness|响度
Hip Hop|嘻哈
Acoustic|原声
Rumble Cut|低频噪声滤除
Telephone|电话音效
Old Radio|老式收音机
Lo Fi|低保真
De-Hiss|去嘶声
Air|空气感
Classic|经典
Spacey|空间感
Small Room|小房间
Medium Room|中型房间
Large Hall|大厅
Cathedral|教堂
Plate|板式混响
Vocal Booth|人声录音室
Drum Chamber|鼓房
Ambient Wash|环境氛围
Tight Slap|紧凑回声
Cave|洞穴
Vocal — Lead|主唱
Vocal — Broadcast|播音人声
Drum Bus Glue|鼓组总线融合
Snare Punch|军鼓冲击
Kick Tighten|底鼓收紧
Bass Even-Out|贝斯均衡
Acoustic Smooth|原声柔化
Master Glue|母带融合
Heavy Crush|强力压缩
Brickwall Limit|砖墙限幅
Light Touch|轻度压缩
Dashed Distortion|强烈失真
Old Telephone|老式电话
AM Radio|调幅收音机
Megaphone|扩音器
Underwater|水下
Lo-Fi / Vintage|低保真 / 复古
Vocal Presence|人声突出
Loudness (Smile)|响度（微笑曲线）
Air / Brilliance|空气感 / 明亮度
De-Rumble|去低频隆隆声
Podcast Voice|播客人声
De-Esser|齿音消除
Drum Punch|鼓声冲击
Acoustic Sparkle|原声亮泽
Welcome to AudioMass|欢迎使用 AudioMass
AudioMass is a free, open source, web-based Audio and Waveform Editor.|AudioMass 是一款免费开源的网页音频与波形编辑器。
It runs entirely in the browser with no backend and no plugins required!|它完全在浏览器中运行，无需后端或插件！
Tips:|提示：
Please keep in mind that most key shortcuts rely on the  Shift +  key  combo. (eg Shift+Z for undo, Shift+C copy, Shift+X cut... etc )|请注意，大多数快捷键使用 Shift 组合键，例如 Shift+Z 撤销、Shift+C 复制、Shift+X 剪切。
You can load any type of audio your browser supports and perform operations such as fade in, cut, trim, change the volume, and apply a plethora of audio effects.|可以加载浏览器支持的音频，并进行淡入、剪切、裁剪、调整音量及应用各种音频效果。
Check out the codebase on|在此查看源代码：
I hope you enjoy the little music pieces. I wrote them a long time ago :)|希望你喜欢这些音乐片段，它们是我很久以前创作的。:)
Selection:|选区：
Start:|开始：
End:|结束：
Duration:|时长：
clear selection|清除选区
Drag n drop an Audio File in this window, or click|将音频文件拖放到此窗口，或点击
here to use a sample|此处加载示例
cancel|取消
Open Audio|打开音频
Open or append|打开或追加
OPEN NEW|新建打开
ADD IN EXISTING|追加到现有音轨
Append file to existing track?|将文件追加到现有音轨？
Could not load this draft - it may be corrupted or too long for this browser.|无法加载此草稿，可能已损坏或超出浏览器可处理的长度。
Unsupported audio file type|不支持的音频文件类型
Nothing to export|没有可导出的内容
Canceled Loading|已取消加载
Loaded Successfully|加载成功
Copied range|已复制选区
Inserted Silence|已插入静音
Recorded Audio|已录制音频
Selection too short|选区太短
Could not download noise Reduction script|无法下载降噪脚本
Could not open local storage|无法打开本地存储
Stretch ratio must be positive|拉伸比例必须为正数
Could not apply Speed|无法应用速度效果
Rendering failed:|渲染失败：
No recording device found|未找到录音设备
Could not resample recording|无法重采样录音
Audio is too short to estimate tempo.|音频太短，无法估算节奏。
Could not find a reliable tempo.|无法找到可靠的节奏。
Could not estimate tempo.|无法估算节奏。
Could not load tempo detector.|无法加载节奏检测器。
Could not prepare audio for tempo analysis.|无法准备节奏分析所需的音频。
Could not start tempo analysis.|无法启动节奏分析。
Worker unavailable; analyzing here...|后台工作线程不可用，正在当前页面分析…
Analyzing audio in the background. This can take a while.|正在后台分析音频，可能需要一些时间。
Nothing to estimate|没有可估算的内容
Make a selection first|请先选择一个区域
Load audio first|请先加载音频
Selected Clip|选中的片段
Whole track|整条音轨
Whole Track|整条音轨
Region Only|仅所选区域
Selection Only|仅选区
Beats|拍数
Confidence|置信度
Tempo|节奏
Tempo Estimation|节奏估算
Tempo Tap|敲击测拍
Metronome|节拍器
Play Both|同时播放
Accentuate metronome click|突出节拍器的重拍音
Average BPM|平均 BPM
Nearest BPM|最接近的 BPM
Timing Taps|敲击节拍
CLEARED...|已清除…
STAND BY...|待命…
Tap in this area, or hit [SPACE] rhythmically, to measure BPM.|在此区域按节奏敲击，或有节奏地按 [Space] 测量 BPM。
First Beat|第一拍
Devices:|设备：
APPEND TO EXISTING|追加到现有音轨
Open Recording|打开录音
type|类型
gain|增益
freq|频率
peaking|峰值滤波
lowpass|低通
highpass|高通
Toggle Bypass|切换旁路
----custom-----|----自定义----
Add Marker|添加标记
Add Marker Here|在此处添加标记
Load Markers|加载标记
Clear Markers|清除标记
Delete Marker|删除标记
Rename Marker|重命名标记
Play From Here|从此处播放
Move Marker|移动标记
Marker Name|标记名称
Name is too short...|名称太短…
Nothing to save|没有可保存的内容
Could not save session|无法保存会话
Saved session|会话已保存
Loaded session|会话已加载
Could not load session|无法加载会话
Drag and Drop Audio Files in this window, or click|将音频文件拖放到此窗口，或点击
Add Channel|添加声道
Clear Mute|清除静音
Clear Solo|清除独奏
BEAT|节拍
Toggle Beat Markers|切换节拍标记
SNAP|吸附
Snap to Beat Markers|吸附到节拍标记
Time Signature|拍号
Rename Channel|重命名声道
Rec Trigger|录音预备开关
Delete Channel|删除声道
Mute Channel|声道静音
Solo Channel|声道独奏
Pan L/R|左右声像
Arm Channel|预备录制声道
Remove Channel|移除声道
Volume Channel|声道音量
Pan Channel|声道声像
Master Volume|主音量
Master|主控
compressor|压缩器
reverb|混响
delay|延迟
distortion|失真
normalize|标准化
graphic_eq|图示均衡器
paragraphic_eq|参数均衡器
hard_limit|硬限幅
Resize Channel|调整声道高度
Reorder Channel|重新排列声道
Move Channel Up|上移声道
Move Channel Down|下移声道
No overlap on this channel|此声道没有重叠片段
Remove Crossfade|移除交叉淡化
Crossfade Clip|片段交叉淡化
Removed Crossfade|已移除交叉淡化
Open in Editor|在编辑器中打开
Rename Clip|重命名片段
Duplicate Clip|复制片段
Copy Clip|复制片段
Split Here|在此处分割
Delete Clip|删除片段
Select Visible View|选择可见范围
Add New Channel Here|在此处添加新声道
Add Silence|添加静音
Fade Clip|片段淡化
Trim Clip|裁剪片段
Move Clip|移动片段
Add Tracks|添加音轨
Add Clip|添加片段
Channel removed|已移除声道
Could not decode audio|无法解码音频
Copied clip|已复制片段
Duplicated clip|已生成片段副本
Select a waveform box first|请先选择一个波形片段
Hard Limit|硬限幅
Parametric EQ|参数均衡器
RMS Normalize|RMS 标准化
LUFS Normalize|LUFS 标准化
Reverse|反转
Invert|反相
Rate|速率
Speed|速度
Paste Clip|粘贴片段
Pasted clip|已粘贴片段
Could not load audio|无法加载音频
Could not load all samples|无法加载所有示例
Load Multitrack Sample|加载多轨示例
Here!|这里！
Open Clip|打开片段
Loaded clip in editor|已在编辑器中加载片段
Arm a channel to record|请先将一个声道设为预备录音
Record Clip|录制片段
Recorded clip|已录制片段
Move marker inside selected clip|将标记移入选中的片段
Split Clip|分割片段
Sample File|示例文件
Open this clip in the editor for that effect|请在编辑器中打开此片段以使用该效果
Open this clip in the editor for channel info|请在编辑器中打开此片段以查看声道信息
Make Mono|转换为单声道
Left Channel|左声道
Right Channel|右声道
Flip Channels|交换声道
Make Stereo|转换为立体声
Insert silence at beginning|在开头插入静音
Insert silence at current cursor (|在当前光标处插入静音（
Silence in seconds|静音时长（秒）
Apply Compression to selected range|对所选区域应用压缩
Classic 3:1|经典 3:1
Makeup|补偿增益
Reduction|衰减量
Peak|峰值
Normalize L/R Equally|左右声道等量标准化
Normalize to|标准化至
Target|目标
Streaming|流媒体
Broadcast / Voice|广播 / 人声
Other|其他
Custom|自定义
Custom LUFS|自定义 LUFS
Peak ceiling|峰值上限
Analysis|分析
Select LUFS to measure integrated loudness.|选择 LUFS 目标以测量综合响度。
Source:|原始：
After:|处理后：
target is ceiling-limited.|目标受峰值上限限制。
Limit to|限制至
Ratio between lows and highs|低频与高频的比例
Look Ahead (ms)|预读（ms）
Apply Delay to selected range|对所选区域应用延迟
Apply Distortion to selected range|对所选区域应用失真
Apply Reverb to selected range|对所选区域应用混响
Audio Repair is not available in multitrack|多轨模式暂不支持音频修复
Hum Reduction|工频嗡声消除
Edit Repair|剪辑接点修复
Sensitivity|灵敏度
Low|低
Medium|中
High|高
Mains frequency|电源频率
Repeat loop|重复循环
Trim edge silence|裁除边缘静音
Snap to zero crossing|吸附到过零点
Cover|封面
Change Cover|更换封面
Remove Image|移除图片
Lyrics|歌词
Only MP3 files can be edited here. These tags are view-only.|此处仅可编辑 MP3 文件。其他格式的标签只读。
Choose an MP3 file inside this window first|请先在此窗口选择 MP3 文件
Choose an MP3 file to view/edit audio tags.|选择 MP3 文件以查看或编辑音频标签。
Successfully deleted preset!|预设已删除！
Successfully updated preset!|预设已更新！
Successfully saved preset!|预设已保存！
Currently unsupported on mobile|移动设备暂不支持
Frequency Analysis|频率分析
Spectrum Analysis|频谱分析
Please allow pop-ups for AudioMass!|请允许 AudioMass 打开弹出窗口！
Oops! Something is not right|抱歉，发生了错误
session file (.amss)|会话文件（.amss）
Flac: Compression Level|FLAC：压缩级别
32-bit float|32 位浮点
TPDF dither|TPDF 抖动
Export whole file|导出整个文件
Export Selection Only|仅导出选区
Invalid URL entered|输入的 URL 无效
Save Local Draft of...|保存本地草稿…
"Copy" clipboard/buffer|“复制”剪贴板 / 缓冲区
Draft Name|草稿名称
Succesfully Stored|保存成功
Local Drafts|本地草稿
Open in Existing?|在当前窗口打开？
Open in new window, or in the current one?|在新窗口还是当前窗口中打开？
Append to Current Track|追加到当前音轨
Del|删除
Channel Info/Flip|声道信息 / 交换
Graphic EQ (20 bands)|图示均衡器（20 频段）
Hard Limiter|硬限幅器
Speed Up / Slow Down (pitch)|加速 / 减速（改变音高）
Speed / Playback Rate|速度 / 播放速率
Remove Silence|移除静音
Store Offline Version|保存离线版本
Would you like to refresh the page to load the newer version?|是否刷新页面以加载新版本？
Downloading newer version|正在下载新版本
This will open a new window that will try to store a local version in your browser|将打开新窗口，尝试在浏览器中保存本地版本
Open Offline Version?|打开离线版本？
About|关于
See Welcome Message|查看欢迎信息
SourceCode on Github|GitHub 源代码
Set Volume/Gain|设置音量 / 增益
Seamless Loop...|无缝循环…
Peak at|峰值位于
Cut|剪切
Copy|复制
Paste|粘贴
Trim|裁剪
Delete|删除
Loop|循环
Recording failed|录音失败
Error|错误
Warning|警告
Failed|失败
Unsupported|不支持
No audio loaded|未加载音频
Nothing selected|未选择内容
Could not load session|无法加载会话
Applied Gain (fx)|已应用增益效果
Applied Fade In (fx)|已应用淡入效果
Applied Fade Out (fx)|已应用淡出效果
Applied Delay (fx)|已应用延迟效果
Applied Reverb (fx)|已应用混响效果
Applied Compressor (fx)|已应用压缩效果
Applied Distortion (fx)|已应用失真效果
Applied Hard Limit (fx)|已应用硬限幅效果
Applied Parametric EQ (fx)|已应用参数均衡效果
Applied Normalize|已完成标准化
Applied RMS Normalize|已完成 RMS 标准化
Applied LUFS Normalize|已完成 LUFS 标准化
Applied LUFS Normalize (ceiling limited)|已完成 LUFS 标准化（受峰值上限限制）
Applied Invert|已完成反相
Applied Reverse|已完成反转
Applied :: Remove Silence|已移除静音
De-Click: nothing detected|去点击声：未检测到杂音
Edit Repair: nothing detected|剪辑接点修复：未检测到问题
Zero Cross Selection Off|过零点选择已关闭
Toggle Loop|切换循环
Loaded Successfully|加载成功
db error|数据库错误
error storing data|存储数据时出错
error fetching data|读取数据时出错
File API not supported|不支持 File API
File not found.|找不到文件。
File coulnot be opened|无法打开文件
File couldnot be uploaded|无法上传文件
Couldnot read File|无法读取文件
File too large|文件太大
Output|输出
Processing...|处理中…
Encoding...|正在编码…
Exporting...|正在导出…
Cut ::|剪切：
Delete ::|删除：
Paste to|粘贴至
Record Audio|录制音频
Apply Gain (fx)|应用增益效果
Apply Fade In (fx)|应用淡入效果
Apply Fade Out (fx)|应用淡出效果
Apply Delay (fx)|应用延迟效果
Apply Reverb (fx)|应用混响效果
Apply Compressor (fx)|应用压缩效果
Apply Distortion (fx)|应用失真效果
Apply Hard Limit (fx)|应用硬限幅效果
Apply Parametric EQ (fx)|应用参数均衡效果
Apply Noise RNN (fx)|应用神经网络降噪效果
Applied Noise RNN (fx)|已应用神经网络降噪效果
Normalize RMS|RMS 标准化
Normalize LUFS|LUFS 标准化
Remove Silence|移除静音
Flip Channels|交换声道
Make Stereo|转换为立体声
Make Mono|转换为单声道
Hum Notch|嗡声陷波
De-Click|去点击声
Edit Repair|剪辑接点修复
Apply Rate (fx)|应用速率效果
Applied Rate (fx)|已应用速率效果
Apply Speed (fx)|应用速度效果
Applied Speed (fx)|已应用速度效果
Open Seamless Loop|打开无缝循环
Inserted Silence|已插入静音
Applied Channel Change:|已更改声道：
Notched|已陷波处理
Hz hum|Hz 嗡声
De-Click: removed|去点击声：已移除
click|处杂音
Edit Repair: smoothed|剪辑接点修复：已平滑
splice|处接点
DOCK|停靠
FREQUENCY ANALYSER|频率分析仪
SPECTRUM ANALYSER|频谱分析仪
MULTITRACK MIXER|多轨混音器
AudioMass - Frequency Analysis|AudioMass - 频率分析
AudioMass - Spectrum Analyzer|AudioMass - 频谱分析
AudioMass - Multitrack Mixer|AudioMass - 多轨混音器
level|电平
pan|声像
No drafts found...|没有找到草稿…
Update|更新
PLAY|播放
name:|名称：
id:|ID：
chan:|声道：
chn:|声道：
date:|日期：
durr:|时长：
Seek (left arrow)|向左跳转（左方向键）
Seek (right arrow)|向右跳转（右方向键）
Seek Start (Shift + left arrow)|跳至开头（Shift + 左方向键）
Seek End (Shift + right arrow)|跳至结尾（Shift + 右方向键）
Spotify Loud (-11 LUFS)|Spotify 高响度（-11 LUFS）
Podcast (-16 LUFS)|播客（-16 LUFS）
Broadcast EBU R128 (-23 LUFS)|广播 EBU R128（-23 LUFS）
Broadcast ATSC A/85 (-24 LUFS)|广播 ATSC A/85（-24 LUFS）
Club / DJ Master (-8 LUFS)|俱乐部 / DJ 母带（-8 LUFS）
Source:|原始：
After:|处理后：
est. TP|估计真峰值
Gain |增益 
 dB for | dB，目标：
`.trim().split('\n');
    var translations = Object.create(null);
    entries.forEach(function (line) {
        var at = line.indexOf('|');
        if (at > 0) translations[line.slice(0, at)] = line.slice(at + 1);
    });
    var patterns = [
        [/^Channel (\d+)$/, '声道 $1'],
        [/^Track (\d+)$/, '音轨 $1'],
        [/^Marker (\d+)$/, '标记 $1'],
        [/^Loop ([\d.]+)s$/, '循环 $1 秒'],
        [/^Estimated (\d+) beats over ([\d.]+)s\.$/, '在 $2 秒内估算出 $1 拍。'],
        [/^Apply: Match ([-\d.]+) LUFS$/, '应用：匹配 $1 LUFS'],
        [/^Ratio (\d+%)$/, '压缩比 $1']
        ,[/^Peak at ([\d.]+)$/, '峰值位于 $1']
        ,[/^Added (\d+) tracks?$/, '已添加 $1 条音轨']
        ,[/^Added (\d+) clips?$/, '已添加 $1 个片段']
        ,[/^Added (\d+) sample tracks$/, '已添加 $1 条示例音轨']
        ,[/^Recording ([\d.]+)s?$/, '录音中 $1 秒']
        ,[/^(\d+) seconds? ago$/, '$1 秒前']
        ,[/^(\d+) minutes? ago$/, '$1 分钟前']
        ,[/^(\d+) hours? ago$/, '$1 小时前']
        ,[/^(\d+) days? ago$/, '$1 天前']
        ,[/^(\d+) months? ago$/, '$1 个月前']
    ];
    var inline = [
        [/\bUndo\b/g, '撤销'], [/\bRedo\b/g, '重做'],
        [/\bPlay\b/g, '播放'], [/\bStop\b/g, '停止'],
        [/\bRecord\b/g, '录音'], [/\bPause\b/g, '暂停'],
        [/\bCopy Selection\b/g, '复制选区'], [/\bPaste Selection\b/g, '粘贴选区'],
        [/\bCut Selection\b/g, '剪切选区'], [/\bInsert Silence\b/g, '插入静音'],
        [/\bClear Selection\b/g, '清除选区'],
        [/\bToggle Loop\b/g, '切换循环'],
        [/\bReset Zoom\b/g, '重置缩放'],
        [/\bFollow Cursor\b/g, '跟随光标'],
        [/\bPeak Separators\b/g, '峰值分隔线'],
        [/\bTimeline\b/g, '时间轴'],
        [/\bSelect All\b/g, '全选'],
        [/\bDeselect All\b/g, '取消全选'],
        [/\bCenter to Cursor\b/g, '居中到光标'],
        [/\bPeak at\b/g, '峰值位于'],
        [/^Source:/, '原始：'], [/^After:/, '处理后：'],
        [/est\. TP/g, '估计真峰值'],
        [/^Gain (?=[-+\d])/, '增益 '],
        [/ dB for /g, ' dB，目标：'],
        [/; target is ceiling-limited\./g, '；目标受峰值上限限制。'],
        [/^Seek Start\b/g, '跳至开头'], [/^Seek End\b/g, '跳至结尾'],
        [/^Seek\b/g, '跳转'],
        [/\bZoom In Horiz\b/g, '水平放大'], [/\bZoom Out Horiz\b/g, '水平缩小'],
        [/\bZoom In Vertically\b/g, '垂直放大'], [/\bZoom Out Vertically\b/g, '垂直缩小']
    ];
    function translate(value) {
        if (!value || !/[A-Za-z]/.test(value)) return value;
        var match = /^(\s*)([\s\S]*?)(\s*)$/.exec(value);
        var body = match[2];
        var result = translations[body];
        if (!result) {
            for (var i = 0; i < patterns.length; i++) {
                if (patterns[i][0].test(body)) { result = body.replace(patterns[i][0], patterns[i][1]); break; }
            }
        }
        if (!result) {
            result = body;
            for (var j = 0; j < inline.length; j++) result = result.replace(inline[j][0], inline[j][1]);
        }
        return match[1] + result + match[3];
    }
    function visit(root) {
        if (!root || root.nodeType === 3 && !root.parentNode) return;
        if (root.nodeType === 3) {
            var parent = root.parentNode;
            if (parent && !/^(SCRIPT|STYLE|CODE|PRE|TEXTAREA)$/i.test(parent.nodeName)) {
                var translated = translate(root.nodeValue);
                if (translated !== root.nodeValue) root.nodeValue = translated;
            }
            return;
        }
        if (root.nodeType !== 1) return;
        if (/^(SCRIPT|STYLE|CODE|PRE|TEXTAREA)$/i.test(root.nodeName)) return;
        ['title', 'placeholder', 'aria-label'].forEach(function (attribute) {
            if (root.hasAttribute(attribute)) {
                var original = root.getAttribute(attribute), translated = translate(original);
                if (translated !== original) root.setAttribute(attribute, translated);
            }
        });
        if (root.nodeName === 'OPTGROUP' && root.hasAttribute('label')) {
            var label = root.getAttribute('label'), translatedLabel = translate(label);
            if (translatedLabel !== label) root.setAttribute('label', translatedLabel);
        }
        for (var child = root.firstChild; child; child = child.nextSibling) visit(child);
    }
    function start() {
        visit(document.documentElement);
        new MutationObserver(function (records) {
            records.forEach(function (record) {
                if (record.type === 'characterData') visit(record.target);
                else if (record.type === 'attributes') visit(record.target);
                else record.addedNodes.forEach(visit);
            });
        }).observe(document.documentElement, {subtree:true, childList:true, characterData:true,
            attributes:true, attributeFilter:['title','placeholder','aria-label','label']});
    }
    window.PK_I18N = {t:translate};
    var nativeAlert = window.alert, nativeConfirm = window.confirm, nativePrompt = window.prompt;
    window.alert = function (message) { return nativeAlert.call(window, translate(String(message))); };
    window.confirm = function (message) { return nativeConfirm.call(window, translate(String(message))); };
    window.prompt = function (message, value) { return nativePrompt.call(window, translate(String(message)), value); };
    start();
})();
