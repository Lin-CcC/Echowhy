# Locator And Topic Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 打通 Topic 左侧扫描、Question Locator、中缝定位轨与 `Review(filtered)` 的闭环，并开始拆出 Topic 页的定位/导航层职责。

**Architecture:** 复用现有 `ReviewQueue` 语义作为扫描与过滤的唯一状态来源，在 Topic 侧新增轻量 locator view-model 与中缝 gutter 组件。与此同时，把 Topic 页中与“左栏扫描 / Locator / 派生节点定位”有关的逻辑抽离成独立文件，减少页面文件继续膨胀。

**Tech Stack:** React 19, TanStack Router, TypeScript, Vitest, Tailwind

---

## 文件结构

- 新建 `src/features/question-locator/types.ts`
  - 定义 locator filter、locator item、locator summary 结构
- 新建 `src/features/question-locator/utils.ts`
  - 负责从 Topic 当前题链与 Review 语义生成定位点模型
- 新建 `src/features/question-locator/utils.test.ts`
  - 覆盖 locator 点位生成与过滤行为
- 新建 `src/features/question-locator/components/question-locator-gutter.tsx`
  - 中缝定位轨 UI
- 新建 `src/features/question-locator/components/topic-scan-controls.tsx`
  - 左侧扫描入口
- 新建 `src/features/question-locator/index.ts`
  - 对外导出
- 新建 `src/features/topic-session/topic-state.ts`
  - 承载 Topic 页当前散落的状态初始化/归一化辅助函数
- 修改 `src/features/topic-session/index.ts`
  - 导出新的 topic-state 辅助能力
- 修改 `src/features/review/types.ts`
  - 增加 filtered review 视图所需的 search / scope 类型
- 修改 `src/features/review/utils.ts`
  - 增加 review scope 过滤与 filtered-result 上下文工具
- 新建 `src/features/review/utils.filtered.test.ts`
  - 覆盖 `Review(filtered)` 的过滤范围
- 修改 `src/app/routes/review.tsx`
  - 为 filtered review 增加 search schema
- 修改 `src/pages/review/ReviewPage.tsx`
  - 支持常规 queue 视图与 filtered result 视图
- 修改 `src/features/constellation-view/components/constellation-view.tsx`
  - 接入 scan 状态或最小导航高亮支持
- 修改 `src/pages/learning-topic/LearningTopicPage.tsx`
  - 接入 scan state、locator gutter、抽离 topic-state helpers

## 任务拆解

### Task 1: 为 Locator 建立可测试的数据模型

- [ ] 新增 failing tests，定义 locator 过滤与相对位置计算
- [ ] 跑单测确认失败原因正确
- [ ] 实现最小 locator utils
- [ ] 跑单测确认通过

### Task 2: 为 `Review(filtered)` 建立范围过滤

- [ ] 新增 failing tests，定义 `filter + topic scope` 结果
- [ ] 跑单测确认失败原因正确
- [ ] 实现 review filtered helpers
- [ ] 跑单测确认通过

### Task 3: 抽离 Topic 状态辅助层

- [ ] 把 Topic 页里的初始化/归一化 helper 移入 `topic-state.ts`
- [ ] 保持行为不变，仅修正 import 与调用边界
- [ ] 跑测试和构建确认重构未破坏现有行为

### Task 4: 接入左侧扫描与中缝 Locator

- [ ] 在 Topic 左栏加入低干扰 scan controls
- [ ] 在 Topic 中缝加入 locator gutter，仅在扫描激活时显示
- [ ] 支持点状跳转、hover title、清除 scan
- [ ] 支持从 locator 进入 `Review(filtered)`

### Task 5: 扩展 Review 页面支持 filtered result

- [ ] 为 `/review` 增加 search schema
- [ ] 在 filtered 模式下显示来源说明与返回常规 review 入口
- [ ] 保持常规 review queue 结构不被破坏

### Task 6: 全量验证

- [ ] 跑 `pnpm test`
- [ ] 跑 `pnpm build`
- [ ] 自审 chunk 体积与 Topic 文件收缩情况
