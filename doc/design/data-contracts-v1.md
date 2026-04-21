# Echowhy V1 Data Contracts

## Purpose

This document defines the first practical data contracts for `Echowhy v1`.

It exists to reduce ambiguity between:

- product concepts
- UI rendering needs
- persistence needs
- AI generation and evaluation outputs

These contracts are intentionally small and stable enough for v1.

## Contract Design Principles

- keep shapes small and understandable
- prefer topic-centered contracts over fragmented object-first contracts
- make AI outputs structured enough to render consistently
- leave room for later expansion without over-modeling now

## 1. Knowledge Source Contract

Represents an imported or active source of learning material.

```ts
type KnowledgeSource = {
  id: string
  name: string
  type: 'repository' | 'folder' | 'file-set' | 'document-set' | 'external-search' | 'unknown'
  rootPath?: string
  summary?: string
  status: 'active' | 'inactive' | 'draft'
  createdAt: string
  updatedAt: string
}
```

### Notes

- `type` is intentionally broad for v1
- `rootPath` may be absent when the source is conceptual or later attached
- when no user-imported source exists, `sourceId` may point to a virtual `KnowledgeSource` with `type: 'external-search'`
- this allows topic and question contracts to stay structurally valid even in source-light flows

## 2. Learning Topic Contract

Represents the main user-facing learning unit.

```ts
type LearningTopic = {
  id: string
  sourceId?: string
  title: string
  rootQuestion: string
  goal: string
  status: 'active' | 'paused' | 'completed'
  understandingLevel: 'low' | 'emerging' | 'solid' | 'strong'
  lastStudiedAt?: string
  reviewPriority: 'low' | 'medium' | 'high'
  reviewReason?: string
  currentChainNodeId?: string
  manualPriority?: 'low' | 'medium' | 'high'
  calculatedValue?: number
}
```

### Notes

- this should be the main object shown in `Learning Library`
- it is intentionally compact
- `manualPriority` captures learner- or user-driven topic importance
- `calculatedValue` captures AI-estimated topic value for review and revisit

## 3. Explanation Block Contract

Represents a chunk of progressive explanation for a topic.

```ts
type ExplanationBlock = {
  id: string
  topicId: string
  title?: string
  content: string
  order: number
}
```

### Notes

- explanation is broken into blocks to support progressive rendering
- `title` is optional to keep v1 flexible

## 4. Learning Angle Contract

Represents a direction the learner may follow within a topic.

```ts
type LearningAngle = {
  id: string
  topicId: string
  title: string
  description: string
  isCustom: boolean
}
```

### Notes

- system-generated angles use `isCustom: false`
- learner-defined directions use `isCustom: true`

## 5. Topic Question Contract

Represents a question node within the follow-up chain.

```ts
type TopicQuestion = {
  id: string
  topicId: string
  angleId?: string
  prompt: string
  label?: string
  parentQuestionId?: string
  nodeType: 'root' | 'system' | 'learner'
  createdAt: string
  manualPriority?: 'low' | 'medium' | 'high'
  calculatedValue?: number
  visualState?: 'dim' | 'lit' | 'pulsing'
  uiMetadata?: {
    x?: number
    y?: number
    connectionStyle?: 'straight' | 'polyline' | 'curve'
  }
}
```

### Notes

- this supports both the root question and follow-up questions
- `nodeType` helps distinguish chain origins
- `manualPriority` allows explicit learner weighting for question importance
- `calculatedValue` allows AI-side weighting for chain and review logic
- `label` supports short learner-facing naming for node display
- `visualState` supports node-lighting behavior in the constellation view
- `uiMetadata` stores lightweight rendering hints such as position and line style

## 6. Source Reference Contract

Represents material attached to the current explanation or question.

```ts
type SourceReference = {
  id: string
  topicId: string
  sourceId?: string
  referencePath: string
  label: string
  snippet?: string
  startLine?: number
  endLine?: number
}
```

### Notes

- `referencePath` should be flexible enough for files, sections, or pages later
- `snippet` is optional because v1 may not always store full extracted content

## 7. Answer Attempt Contract

Represents one learner answer to one question.

```ts
type AnswerAttempt = {
  id: string
  topicId: string
  questionId: string
  answer: string
  createdAt: string
}
```

## 8. AI Feedback Contract

Represents structured feedback for one answer attempt.

```ts
type AIFeedback = {
  id: string
  answerAttemptId: string
  score: number
  level: 'weak' | 'partial' | 'good' | 'strong'
  correctPoints: string[]
  vaguePoints: string[]
  missingPoints: string[]
  nextSuggestion: string
}
```

### Notes

- score can remain simple in v1, for example `0-100`
- lists should stay short and high-signal

## 9. Review State Contract

Represents the review status of a topic.

```ts
type ReviewState = {
  topicId: string
  lastReviewedAt?: string
  nextReviewAt?: string
  reviewCount: number
  priority: 'low' | 'medium' | 'high'
  priorityReason: string
}
```

### Notes

- v1 does not need advanced scheduling math
- `priorityReason` keeps review suggestions explainable

## 10. Follow-up Chain View Contract

Represents the lightweight graph or chain structure shown to the user.

```ts
type FollowUpChainView = {
  topicId: string
  nodes: {
    id: string
    label: string
    nodeType: 'root' | 'system' | 'learner'
    isCurrent?: boolean
    visualState?: 'dim' | 'lit' | 'pulsing'
    uiMetadata?: {
      x?: number
      y?: number
    }
  }[]
  edges: {
    from: string
    to: string
    connectionStyle?: 'straight' | 'polyline' | 'curve'
  }[]
}
```

### Notes

- keep the view contract separate from persistence details
- v1 visualization should stay topic-local and simple
- constellation rendering may use the stored node metadata as hints rather than strict layout locks

## AI Output Contracts

These are especially important because UI stability depends on them.

## 11. Topic Generation Result

Used when the system creates a learning topic from a question, source, or both.

```ts
type TopicGenerationResult = {
  topic: LearningTopic
  explanationBlocks: ExplanationBlock[]
  learningAngles: LearningAngle[]
  questions: TopicQuestion[]
  references: SourceReference[]
}
```

### Requirements

- must always return exactly one `topic`
- should return at least one explanation block
- should return at least one question node
- should return a manageable number of learning angles

Recommended v1 limits:

- `explanationBlocks`: 1 to 4
- `learningAngles`: 2 to 5
- `questions`: at least the root question

## 12. Answer Evaluation Result

Used when evaluating a learner's answer.

```ts
type AnswerEvaluationResult = {
  feedback: AIFeedback
  suggestedFollowUps?: TopicQuestion[]
}
```

### Requirements

- must always include structured feedback
- follow-up questions are optional but encouraged
- follow-ups should remain limited and high-signal

Recommended v1 limit:

- `suggestedFollowUps`: 0 to 3

## 13. Chain Extension Result

Used when the learner or system extends the follow-up chain.

```ts
type ChainExtensionResult = {
  newQuestion: TopicQuestion
  relatedAngleId?: string
}
```

## Suggested Rendering Rules

These rules help keep the UI calm.

### Learning Unit

Should primarily require:

- one `LearningTopic`
- `ExplanationBlock[]`
- `LearningAngle[]`
- current `TopicQuestion`
- relevant `SourceReference[]`
- latest `AIFeedback` if present

### Learning Library

Should primarily require:

- `LearningTopic[]` for learned topics
- `LearningTopic[]` for review topics

Detailed answer and feedback objects should not be dumped directly into the main list view.

### Review

Should primarily require:

- current review `LearningTopic`
- selected `TopicQuestion`
- latest or previous `AIFeedback`
- `ReviewState`

## V1 Constraints

To keep contracts simple:

- avoid global graph contracts
- avoid source-type-specific branching in every object
- avoid too many derived status fields
- avoid coupling UI layout preferences into domain objects

## Recommended Next Step

After these contracts, the next useful step is one of:

- create the actual app scaffold
- define mock data examples for these contracts
- define API/service boundaries for topic generation and answer evaluation
