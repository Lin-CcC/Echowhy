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
### PRD 第一批补齐：Continue Ladder 正式推进路径

- [x] 为 Topic 主线补上 `Continue Ladder` 动作，和 `Check` / `Skip for now` 分离
- [x] 新增 `continued` 轻状态，让继续搭梯子的节点在正文里折叠保留，而不是直接消失
- [x] 让 Review 将 `continued` 归入 `Unanswered`，不误算成 `Skipped`
- [x] 为 `applyContinueLadderProgress` 与 Review 语义补失败测试，再落实现
- [x] 重新运行 `pnpm test` 与 `pnpm build`

### PRD 第一批补齐：旧题回流作答

- [x] 新增“当前聚焦题”语义，允许把已 `continued / skipped` 的旧题重新设为当前作答对象
- [x] 保持 `unlockedStepCount` 不回退，避免主线学习链倒退
- [x] 在 Topic 历史题卡中补上 `Resume here` 入口，仅对 `continued / skipped` 开放
- [x] 作答通过后自动回到最新主线；未通过则继续停留在该旧题重试
- [x] 接住 `Review -> Topic` 的 `question` 深链，进入页面后消费一次并切换为可继续处理状态
- [x] 让左侧星图点击与中间定位轨点击复用同一套恢复语义：主线可恢复题切成当前题，否则仅定位
- [x] 为聚焦步索引解析补失败测试，再落实现
- [x] 重新运行 `pnpm test` 与 `pnpm build`

### PRD 第一批补齐：Continue Ladder 生成主链节点

- [x] 为 `buildDiscussionSteps` 增加生成步骤插槽，让 `Continue Ladder` 新节点按“挂在当前问题后面”的顺序插回主链
- [x] 新增 `TopicGeneratedDiscussionStep` 持久化结构，保存生成节点的父问题、正文块、问题节点与引用落点
- [x] 为生成节点插入顺序补失败测试，覆盖“主问题后生成一步，再从生成步继续生成下一步”的链式场景
- [x] 让 Topic 页在 `Continue Ladder` 后自动聚焦到新生成的问题，而不是仅清空当前聚焦
- [x] 让 Review 队列基于同一份生成后主链构建，确保新生成节点进入 `Unanswered / Pending / Favorites` 等后续流程
- [x] 提交自定义 follow-up 时清空旧的生成链，避免历史生成节点污染新的 learner-led 分支
- [x] 重新运行 `pnpm test` 与 `pnpm build`

### PRD 第一批补齐：章节收束判断与下一步引导

- [x] 新增 `chapter-closure` 状态 helper，正式区分 `grounded / provisional / unsettled`
- [x] 将“可继续下一章”的判定从“必须全部 passed”放宽为“当前可见主链均已处理”
- [x] 让 `Continue Ladder / Skip / Pending / Weak` 这些状态参与章节收束判断，而不是只看答对与否
- [x] 让 Topic 页尾部 completion card 改为“章节收束建议”，不再使用绝对化的 `Topic Mastered`
- [x] 为 `provisional` 状态补上“回到 flagged question”入口，允许从章节尾部直接跳回较弱节点
- [x] 让 `Explore next angle` 基于章节可收束而不是严格满分通过来解锁
- [x] 让 Library 进度判断与 Topic 章节推进语义对齐，支持 `continued / skipped` 作为可推进状态
- [x] 为章节收束状态与 Library 可推进语义补失败测试，再落实现
- [x] 重新运行 `pnpm test` 与 `pnpm build`

### PRD 第一批补齐：Chapter Summary State 持久化

- [x] 新增 `chapter-summary` helper，把 `chapter-closure` 转成可持久化的 `Chapter Summary State`
- [x] 为每个 `angle` 增加 `chapterSummaryState` 结构，记录 `status / reason / recommendedAction / firstReachedAt / lastUpdatedAt / reviewQuestionId`
- [x] 约束 summary 更新时间：仅在语义变化时刷新 `lastUpdatedAt`，并在状态变化时重置 `firstReachedAt`
- [x] 在 `mergePersistedAngleProgress` 中恢复并校验持久化 summary，避免脏 localStorage 破坏会话
- [x] 在 Topic session 中自动同步每个 angle 的最新 summary 到 `angleState`
- [x] 让 Topic 页尾 completion card 改为读取持久化后的 summary state，再映射成展示文案
- [x] 为 summary state 的时间戳演进、presentation 映射、merge 恢复补失败测试，再落实现
- [x] 重新运行 `pnpm test` 与 `pnpm build`

### PRD 第一批补齐：Review 章节聚合入口

- [x] 为 `ReviewQueue` 增加 `chapters` 聚合模型，按 `topicId + angleId` 汇总章节级上下文
- [x] 每个 chapter 聚合 `all / weak / unanswered / pending / skipped / bookmarked` 计数，并记录最新活动时间
- [x] 直接复用持久化后的 `chapterSummaryState`，让 Review 与 Topic 共用同一套章节收束语义
- [x] 新增 `getScopedReviewChapterSummary`，让 `Review` 的 `topicId + angleId` 作用域可以拿到章节摘要
- [x] 新增轻量 `ReviewChapterStrip`，保持页面 question-first，同时提供章节级入口
- [x] 让 `ReviewScopeBanner` 在章节作用域下展示 `grounded / provisional / unsettled` 摘要，并支持直达 flagged question
- [x] 为脏持久化数据中的 `undefined angleState` 补失败测试并收掉运行时/类型风险
- [x] 重新运行 `pnpm test` 与 `pnpm build`

### PRD 第一批补齐：Review 尾差与 Analyze Preview

- [x] 新增回答分析维度基础结构 `TopicAnswerAnalysisDimension`，覆盖 `Target Fit / Conceptual Accuracy / Causal Link / Grounding / Calibration`
- [x] 在 `evaluateTopicAnswer` 中写入轻量 `analysisDimensions`，并为旧数据在 `ReviewQueue` 构建时做 fallback 推断
- [x] 让 `ReviewScope` 支持 `analysisDimension`，打通 `Analyze -> Review(filtered)` 的维度过滤链路
- [x] 补齐 `Review Queue` 卡片的 `attempts` 次数与一句极短摘要，避免列表层信息不足
- [x] 在 `Question Detail` 中新增 `Series Analyze` 次级入口，默认跳到该问题所在 chapter 的 Analyze 视图
- [x] 新增 `Analyze Preview` 聚合模型，覆盖 `Global Patterns / Chapter Patterns / Learning Behavior`
- [x] 新增 `/analyze` 页面与顶部导航入口，首页默认落在 `Global Patterns`
- [x] 在 `Analyze` 中支持点击弱维度、积压状态、需要回补的知识块，进入 `Review(filtered)` 独立结果视图
- [x] 为 `Analyze Preview` 聚合、分析维度推断、Review 维度过滤补失败测试，再落实现
- [x] 重新运行 `pnpm test` 与 `pnpm build`

### PRD 第一批补齐：Library 收藏轻提示

- [x] 新增 `getBookmarkedQuestionCount`，按 topic 去重统计模块内收藏问题数量
- [x] `LibraryCardModel` 增加 `bookmarkedQuestionCount`
- [x] Library 卡片只显示轻量 `saved questions` 提示，不把 Library 改造成问题收藏列表
- [x] 为收藏数量统计与卡片模型补失败测试，再落实现
- [x] 重新运行 `pnpm test` 与 `pnpm build`

### PRD 第一批补齐：悬浮辅助窗轻面板

- [x] 新增 `buildLearningFloatingAssistantState`，统一决策悬浮窗当前应呈现 `My Question / Draft / Feedback / Chapter Note`
- [x] 让章节收束提示优先于当前反馈，避免章节完成时悬浮窗仍只像普通插入按钮
- [x] 在反馈状态中展示轻量 `Response analysis` 维度，连接本轮新增的回答分析基础结构
- [x] 在 hover 轻面板里暴露当前最自然的主动作：`Continue Ladder` / `Review flagged` / `Explore next`
- [x] 保留原本拖拽插入正文疑问的能力，不把悬浮窗改造成厚重常驻面板
- [x] 为悬浮窗状态优先级补失败测试，再落实现
- [x] 运行 `pnpm test src/features/learning-panel/components/learning-floating-assistant.test.ts` 与 `pnpm build`

### PRD 第一批补齐：Analyze Preview 空状态

- [x] 新增 `hasAnalyzePreviewData`，统一判断 Analyze 是否已经有足够学习信号
- [x] 当还没有回答、搭梯子、待处理、收藏等学习痕迹时，Analyze 不再渲染空 section
- [x] 新增轻量空状态，提示页面正在等待真实学习轨迹，并提供 `Start learning` / `Open Review` 两个自然出口
- [x] 修正 `Keep digging vs Defer` 的行为信号方向，避免把 `Pending / Skip` 错计到继续深挖一侧
- [x] 为 Analyze 空数据判断补失败测试，再落实现
- [x] 运行 `pnpm test src/features/analyze/utils.test.ts` 与 `pnpm build`

### UI 文案收口：反馈分数分隔符

- [x] 新增 `formatTopicFeedbackScoreLabel`，统一反馈分数标签的展示格式
- [x] 清理反馈卡片、正文 inline feedback、拖拽 payload 中残留的乱码分隔符
- [x] 使用克制的 ASCII `|` 分隔，避免破坏页面的干净感
- [x] 为 formatter 补失败测试，再替换调用点
- [x] 运行 `pnpm test src/features/topic-session/feedback-labels.test.ts`

### PRD 第一批补齐：Start Source-only 冷启动承接

- [x] 新增 `guided-ladder` source resolver，将静态 mock source 与本地 `LearningModuleRecord` 统一映射为冷启动梯子模型
- [x] 新增 `createGuidedLadderSourceHandoff`，让 Start 的空问题 source 提交可以明确复用已有模块或创建新的 source-backed 模块
- [x] `/ladder/$sourceId` 增加 `moduleId / sourceLabel` search 参数，支持本地导入 source 与 Library module 的承接
- [x] `GuidedLadderPage` 不再只依赖 mock source，找不到静态 source 时会回退到本地学习库模块
- [x] `StartPage` 在用户已绑定 source 且未输入问题时进入 Guided Ladder，而不是直接裸跳 Topic
- [x] 修正 Guided Ladder 自定义问题输入的乱码 placeholder，并补上 source 不可用时的轻量返回状态
- [x] 运行 `pnpm test src/features/guided-ladder/utils.test.ts` 与 `pnpm build`

### PRD 第一批补齐：Source Workbench 卡片密度收口

- [x] 新增 `buildSourceWorkbenchCardLayouts`，统一决定右侧 source ref 的展开 / 压缩状态
- [x] 默认保留当前 preview、full file、手动展开卡与最近引用展开，旧 pinned source 自动压缩为轻量条目
- [x] 压缩卡支持整卡点击展开，同时保留拖拽排序与单卡关闭能力
- [x] 避免 preview 与 pinned source 重复显示，保持右侧是 source-first workbench 而不是卡片墙
- [x] 为卡片密度策略补失败测试，再接入 UI
- [x] 运行 `pnpm test src/features/source-reference/utils.test.ts` 与 `pnpm build`

### PRD 第一批补齐：Start 绑定 source 后提问的轻量承接

- [x] 新增 `createGuidedLadderQuestionHandoff`，把 source-bound question 标准化为轻量承接 payload
- [x] `/ladder/$sourceId` 增加 `customQuestion / targetTopicId` search 参数，用于承接“已有 source + 用户问题”的进入方式
- [x] `GuidedLadderPage` 增加 `Source-aligned question` 卡片，先提醒 source 绑定与问题意图，再进入正式 Topic 学习链
- [x] `StartPage` 在用户已绑定 source 且输入问题时，不再裸跳 Topic，而是创建/复用模块后进入轻量冷启动承接
- [x] `source-only` 与 `source-bound question` 两条 Start 流现在在同一 Guided Ladder 页面中分层承接
- [x] 为 question handoff 补失败测试，再接入路由与页面
- [x] 运行 `pnpm test src/features/guided-ladder/utils.test.ts` 与 `pnpm build`
