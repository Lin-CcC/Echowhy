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

- [ ] 用共享过滤语义打通 Topic scan / Locator / Review(filtered)
- [ ] 为 locator 点位模型补测试并先看失败
- [ ] 为 Review(filtered) 作用域过滤补测试并先看失败
- [ ] 抽离 Topic 页状态 helper 到独立文件
- [ ] 新增左侧 scan controls 与中缝 locator gutter
- [ ] 让 locator 可以跳转问题并进入 Review(filtered)
- [ ] 跑 `pnpm test` 与 `pnpm build`
