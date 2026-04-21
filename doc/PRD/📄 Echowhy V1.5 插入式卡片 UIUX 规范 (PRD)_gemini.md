# 📄 Echowhy V1.5 插入式卡片 UI/UX 规范 (PRD)

## 一、 设计目标与核心原则

- **目标：** 解决 Source（源码）、Feedback（评估）、My Question（问答）三种插入卡片视觉高度同质化导致的认知疲劳。
- **原则（The "Do Nots"）：** 不新增复杂组件，不改变基础卡片 DOM 结构，不使用主色板以外的杂色，全局保持极简。
- **核心解法：** 左侧状态指示条 (Accent Bar) + Z轴透明度梯度 (Opacity Depth) + 内部排版微调 (Typography Tweaks)。

## 二、 视觉差异化规范 (Visual Specs)

所有卡片共享相同的基础 CSS 类（如相同的边框颜色、圆角大小 `rounded-md`、内边距 `p-4`）。差异仅通过追加的 Modifier Class 实现。

### 1. My Question 用户卡片 (核心输入层 - 最前端)

- **定位：** 用户的当前操作焦点。
- **指示条：** `border-l-2 border-blue-500` (亮色主题用 `blue-600`)。
- **背景透明度：** 最实。黑夜 `bg-black/50`，白天 `bg-white/80`。
- **内部排版强化：**
  - 左上角 Label：`MY QUESTION`（蓝色极小号大写，加粗）。
  - 输入框提示词：`Type your thought...` 颜色需加深一档，确保输入引导明确。

### 2. Feedback 评估卡片 (系统引导层 - 中间层)

- **定位：** AI 给予的结构化反馈，起引导作用。
- **指示条：** `border-l-2 border-amber-500` (亮色主题用 `amber-600`)。
- **背景透明度：** 中等。黑夜 `bg-black/40`，白天 `bg-white/70`。
- **内部排版强化（重点）：**
  - 左上角 Label：`FEEDBACK INSERT`（琥珀色）。
  - 核心分数：将 `Weak · 18` 中的数字 **18** 字号放大，字重加粗（Font-weight: 600/700），形成视觉锚点。
  - 小标题强化：`What landed well:` 等小标题的颜色比正文深一档，增强报告的结构感。

### 3. Source 源码卡片 (客观参考层 - 最底层)

- **定位：** 作为证据存在的纯背景材料。
- **指示条：** `border-l-2 border-cyan-500` (亮色主题用 `cyan-600`)。
- **背景透明度：** 最透。黑夜 `bg-black/30`，白天 `bg-white/60`。
- **内部排版强化：**
  - 左上角 Label：`SOURCE INSERT`（青色）。
  - 代码字体：正文**必须**强制使用等宽字体（Monospace, 如 Fira Code, JetBrains Mono），字号比普通正文小 1px。
  - 代码微底色：代码包裹块（非整个卡片）增加极其微弱的底色（黑夜 `bg-cyan-900/10`），使其与外层卡片稍微剥离。

## 三、 交互状态规范 (Interaction Specs)

### 1. 拖拽交互 (Drag & Drop)

- **拖拽中 (Dragging)：** 卡片整体缩小至 `scale: 0.85`。
- **放置提示线 (Drop Indicator)：** 提示线的颜色**必须**与正在拖拽的卡片指示条颜色一致（拖代码显青线，拖反馈显琥珀线），给用户强烈的预期心理暗示。

### 2. 折叠状态 (Collapsed State)

不再单纯显示文字，折叠后必须保留身份特征，采用 `[Icon] + [关键信息]` 格式：

- **Source 折叠：** 显示青色左边框。文本：`[ { } ] AuthService.java : 18-22`
- **Feedback 折叠：** 显示琥珀色左边框。文本：`[ ⚡ ] Weak · 18/100`
- **Question 折叠：** 显示蓝色左边框。文本：`[ ? ] Why is the controller thin?`