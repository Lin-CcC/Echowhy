# 当前进行中

## 主流程重构第一批

### 本轮目标

- 按 `doc/PRD/Echowhy 主流程重构 PRD v2（草案）.md` 的第一批范围推进可交付实现
- 优先补齐 `Review MVP` 与 Topic 主循环之间缺失的数据闭环
- 在不破坏当前 Start 背景基调的前提下，继续保持四主题能力兼容
- 先做可验证的数据层、状态层和页面骨架，再收束 Topic 交互入口

### 本轮拆解

- [x] 梳理 Topic / Review / Library 共享的数据语义
- [x] 设计并落地问题级复盘状态结构
- [x] 为复盘状态聚合编写测试，先看失败再实现
- [x] 实现 Review 队列聚合与筛选模型
- [x] 实现 Review MVP 页面骨架
- [x] 在 Topic 页面接入最小可用的收藏 / 待处理 / 回答不佳标记入口
- [x] 让 Review 可以返回对应 Topic / angle / question
- [x] 为 Analyze 后续版本预埋最小行为信号与聚合字段
- [x] 跑通 `pnpm test` 与 `pnpm build`

### 本轮约束

- 不主动改 Start 页背景设计
- 不破坏现有 Library 已完成的轻量化视觉方向
- 新增代码尽量拆分，避免继续堆大文件
- 默认中文沟通与记录

## 当前续做

### Locator + Topic 拆层

- [x] 用共享过滤语义打通 Topic scan / Locator / Review(filtered)
- [x] 为 locator 点位模型补测试并先看失败
- [x] 为 Review(filtered) 作用域过滤补测试并先看失败
- [x] 抽离 Topic 页状态 helper 到独立文件
- [x] 新增左侧 scan controls 与中缝 locator gutter
- [x] 让 locator 可以跳转问题并进入 Review(filtered)
- [x] 跑 `pnpm test` 与 `pnpm build`

### Panel 拆层第二刀

- [x] 抽离 learning-panel 的 block 内容渲染与通用小组件
- [x] 抽离 source-reference-panel 的 tone 工具与卡片展示层
- [x] 保持 Topic / Review / Workbench 现有行为不变
- [x] 跑 `pnpm test` 与 `pnpm build`
### Panel 拆层第三刀

- [x] 外提 `insert flow` 为独立 hook
- [x] 外提 `learning-panel-body` 正文序列组件
- [x] 外提 `learning-insert-visuals` 视觉 helper
- [x] `learning-panel.tsx` 从 555 行继续压到 480 行
- [x] 重新运行 `pnpm test` 与 `pnpm build`

### Panel 拆层第四刀

- [x] 删除 `learning-panel.tsx` 顶部遗留的 legacy 注释块
- [x] 新增 `learning-panel-insert-stack` 统一承接 insert slot / question / workbench block 递归渲染
- [x] `learning-panel.tsx` 进一步压到 298 行
- [x] 重新运行 `pnpm test` 与 `pnpm build`

### Topic 页拆层第一刀

- [x] 新增 `use-learning-topic-session`，外提 topic 恢复 / 持久化 / 当前 angle 派生状态
- [x] 新增 `use-learning-topic-structure`，外提 constellation / locator 结构派生
- [x] `LearningTopicPage.tsx` 从 1150 行压到 833 行
- [x] 重新运行 `pnpm test` 与 `pnpm build`

### Topic 页拆层第二刀

- [x] 新增 `use-learning-topic-question-actions`，外提问题流 / 插入问题 / review flag / 章节推进动作
- [x] 新增 `use-learning-topic-workbench-actions`，外提 source preview/pin 与 feedback/workbench 动作
- [x] 新增 `use-learning-topic-interactions` 作为薄组合层
- [x] `LearningTopicPage.tsx` 进一步压到 365 行
- [x] 保持新增 hook 文件长度回到可控范围
- [x] 重新运行 `pnpm test` 与 `pnpm build`
