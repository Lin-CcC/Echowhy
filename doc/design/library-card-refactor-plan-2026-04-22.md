# Learning Library 卡片重构实施计划

**Goal:** 在保留双主题、现有网格布局与现有模块存储结构的前提下，完成 Learning Library 卡片的信息层级、交互闭环和管理能力重构。

**Architecture:** 采用 feature-first 拆分方式，把 Library 页面中的卡片渲染、数据映射、搜索排序、菜单与确认弹层收敛到 `features/learning-library` 下。页面本身只保留页面级状态与路由导航编排。

**Tech Stack:** React 19、TypeScript、TanStack Router、Tailwind CSS 4、本地存储模块 `module-storage`

---

## 文件边界

### 新增

- `src/features/learning-library/index.ts`
- `src/features/learning-library/types.ts`
- `src/features/learning-library/utils.ts`
- `src/features/learning-library/components/library-toolbar.tsx`
- `src/features/learning-library/components/library-card.tsx`
- `src/features/learning-library/components/library-card-menu.tsx`
- `src/features/learning-library/components/delete-module-dialog.tsx`
- `src/features/learning-library/components/library-empty-state.tsx`

### 修改

- `src/pages/library/LearningLibraryPage.tsx`
- `src/features/topic-session/module-storage.ts`
- `package.json` 仅在需要新增验证脚本时修改

## 任务拆分

### 任务 1：抽离数据模型与工具

- 建立 Library 卡片视图模型
- 统一进度、状态、相对时间、搜索和排序规则
- 页面不再直接拼装卡片文案

### 任务 2：重构卡片组件

- 标题、源码 pill、相对时间、右上角数字进度
- 卡片 hover 效果与底边进度条
- 整卡 `Open` 主行为
- `Ask New` 次动作

### 任务 3：补齐管理能力

- 卡片轻量菜单
- 重命名
- 删除确认
- 空状态跳转 Start

### 任务 4：验证

- 构建通过
- Library 页面导航闭环正常
- 主题切换下样式可用
