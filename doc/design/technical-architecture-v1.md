# Echowhy V1 Technical Architecture

## Purpose

This document translates the current product direction into a practical v1 implementation shape.

It should help answer:

- what kind of app `Echowhy v1` should be
- what major technical parts it needs
- what data should exist first
- what can stay simple in v1

This is not a final engineering spec. It is a stability document for early implementation decisions.

## Recommended V1 Shape

`Echowhy v1` should be built as a small local-first web application.

Why this shape is a good fit:

- the UI needs to feel interactive and panel-based
- the product benefits from local persistence early
- iteration speed matters more than production-hardening right now
- a web app keeps the first prototype easy to inspect and evolve
- SVG or Canvas rendering is practical here for a lightweight constellation view

Backend direction for the first milestone:

- no separate standalone backend
- frontend-first local prototype

## Recommended Technical Stack Direction

These are directional recommendations, not irreversible commitments.

### Frontend

Recommended:

- React
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- React Hook Form
- Zod Resolver

Why:

- fast iteration
- flexible enough for panel-based learning surfaces
- good fit for future graph, chain, and review UIs

### Styling

Recommended:

- plain CSS modules, Tailwind, or another lightweight system

Important rule:

- avoid over-designed UI systems early
- optimize for calm, readable, low-burden screens

### State

Recommended v1 approach:

- local component state for page-local behavior
- a small shared store for global app state
- TanStack Query for async server-like state and request lifecycle

Possible options:

- Zustand
- React context plus reducer

Do not start with heavy state architecture unless complexity proves necessary.

### Persistence

Recommended v1 progression:

1. local JSON-like app state persisted through browser storage or file-backed storage
2. later upgrade to SQLite or a more structured local store if needed

Why:

- fast to prototype
- enough for a single-user learning tool
- keeps the first milestone small

### AI integration

The product will need an orchestration layer for:

- generating learning topics
- generating learning angles
- evaluating answers
- generating follow-up chain links

In v1, this can remain thin and centralized.

For the first milestone, AI integration does not require a dedicated backend service layer. It may remain local, mocked, or directly integrated from the frontend prototype stage as long as contracts stay structured.

Important frontend interaction note:

- learner-facing input flows should use `React Hook Form + Zod Resolver`
- AI-backed and async learning flows should use `TanStack Query`

## Recommended App Layers

### 1. UI layer

Responsibility:

- render pages
- collect learner input
- show learning topics, review topics, and feedback
- render constellation-state chain views

### 2. Application layer

Responsibility:

- coordinate flows between UI and data
- manage current source, current topic, and current session
- route AI requests through stable app contracts

### 3. Domain layer

Responsibility:

- define core shapes:
  - knowledge source
  - learning topic
  - learning angle
  - answer attempt
  - feedback
  - follow-up chain
  - review state

This layer should remain conceptually clean.

### 4. Persistence layer

Responsibility:

- save and load sources, topics, answers, feedback, chains, and review state

### 5. AI service layer

Responsibility:

- produce structured topic data
- evaluate learner responses
- expand chains

Important rule:

- the AI layer should return structured outputs, not only free text

## Core V1 Data Shapes

These are recommended implementation shapes, not necessarily final schemas.

### KnowledgeSource

Suggested fields:

- `id`
- `name`
- `type`
- `rootPath`
- `summary`
- `status`
- `createdAt`
- `updatedAt`

Note:

- support a virtual source such as `external-search` for source-light question-first flows

### LearningTopic

Suggested fields:

- `id`
- `sourceId`
- `title`
- `rootQuestion`
- `goal`
- `status`
- `lastStudiedAt`
- `understandingLevel`
- `reviewPriority`
- `manualPriority`
- `calculatedValue`
- `chainId`

### ExplanationBlock

Suggested fields:

- `id`
- `topicId`
- `title`
- `content`
- `order`

### LearningAngle

Suggested fields:

- `id`
- `topicId`
- `title`
- `description`
- `isCustom`

### TopicQuestion

Suggested fields:

- `id`
- `topicId`
- `angleId`
- `prompt`
- `label`
- `parentQuestionId`
- `nodeType`
- `manualPriority`
- `calculatedValue`
- `visualState`
- `uiMetadata`

This shape should help support the follow-up chain.

### SourceReference

Suggested fields:

- `id`
- `topicId`
- `sourceId`
- `referencePath`
- `label`
- `snippet`
- `startLine`
- `endLine`

### AnswerAttempt

Suggested fields:

- `id`
- `topicId`
- `questionId`
- `answer`
- `createdAt`

### AIFeedback

Suggested fields:

- `id`
- `answerAttemptId`
- `score`
- `level`
- `correctPoints`
- `vaguePoints`
- `missingPoints`
- `nextSuggestion`

### ReviewState

Suggested fields:

- `topicId`
- `lastReviewedAt`
- `nextReviewAt`
- `reviewCount`
- `priorityReason`

## Suggested First Folder Structure

This is one practical v1 direction.

```text
src/
  app/
    routes/
    store/
  pages/
    start/
    learning-unit/
    learning-library/
    review/
  features/
    knowledge-source/
    learning-topic/
    learning-angle/
    answer-feedback/
    follow-up-chain/
    review-priority/
  domain/
    models/
    services/
  persistence/
    storage/
    repositories/
  ai/
    contracts/
    services/
  components/
    layout/
    ui/
```

## Frontend Organization Rule

The frontend should be organized feature-first.

### Main principle

Most application code should live inside `features/`.

Feature boundaries should be based on:

- functional areas
- page regions
- product capabilities

not primarily on technical code categories alone.

### Practical interpretation

Prefer folders such as:

- `features/source-context`
- `features/guided-ladder`
- `features/constellation-view`
- `features/learning-angle`
- `features/answer-feedback`
- `features/topic-library`
- `features/review-queue`

instead of building the whole project around flat global folders for every code type.

### Shared UI rule

Place code in shared `ui` only when it:

- has no feature-specific business logic
- does not define meaningful feature-specific state
- does not directly manipulate feature state

This is appropriate for:

- primitive controls
- shell components
- generic presentational elements

### Page rule

`pages/` should mainly compose features together.

Avoid placing heavy feature logic directly inside page components.

### Feature API rule

When one feature needs to expose something to another part of the app, prefer explicit public exports such as `index.ts` instead of deep-importing internal implementation files.

## Page-to-Feature Mapping

### Start

Depends on:

- knowledge-source feature
- continue-learning feature
- review-priority feature

### Learning Unit

Depends on:

- learning-topic feature
- learning-angle feature
- answer-feedback feature
- follow-up-chain feature
- source reference rendering
- constellation state rendering

### Learning Library

Depends on:

- learning-topic feature
- review-priority feature
- follow-up-chain status

### Review

Depends on:

- review-priority feature
- answer-feedback feature
- follow-up-chain feature
- constellation state rendering

## AI Contract Recommendation

Do not let page components directly depend on raw AI text blobs.

Instead define structured response contracts.

### Topic-generation result

Should return something like:

- topic title
- goal
- explanation blocks
- learning angles
- starting question
- source references

### Answer-evaluation result

Should return something like:

- score
- level
- correct points
- vague points
- missing points
- next suggestion
- optional follow-up questions

### Chain-extension result

Should return something like:

- parent question
- new question node
- relation type
- optional angle association

## V1 Simplifications

These simplifications are recommended on purpose.

### Keep source import simple

V1 can start with:

- mock or manually defined source context
- limited repository metadata

It does not need a powerful universal ingestion system first.

### Keep graph logic simple

The follow-up chain can start as:

- a lightweight node-link structure
- topic-local rather than global

### Keep review logic simple

Start with:

- basic priority rules
- recent study time
- answer quality signals

Do not start with advanced spaced-repetition tuning.

## Constellation View Direction

V1 should treat the chain view as a first-class render target.

Recommended rendering direction:

- SVG- or Canvas-based
- topic-local
- low-density
- supports node positions and simple polyline edges

Important node states:

- `dim`
- `pulsing`
- `lit`

Important behavior:

- answer validation may change node state
- active node emphasis should stay visually calm

## Risks To Watch

### Risk 1: UI overgrowth

If too many panels are added early, the calm UI principle will be lost.

### Risk 2: AI output instability

If AI contracts are too loose, the product will become hard to render consistently.

### Risk 3: Over-modeling too early

If every possible future source type is deeply modeled now, progress will slow dramatically.

### Risk 4: Visualization before value

If graph, map, or layout systems are prioritized before the first learning loop is solid, the product may look interesting but feel empty.

## Recommended First Technical Milestone

The first meaningful technical milestone should prove:

- one question can create one learning topic
- one topic can render in the Learning Unit page
- one answer can be evaluated and stored
- the topic can reappear in the Learning Library
- the topic can be reopened in Review

If this milestone works, the core loop is real.

## Recommended Next Step After This

After this architecture note, the next useful move is:

- create the actual repository/app scaffold

or, if discussion should continue first:

- write a concrete data-contract note for topic generation and answer evaluation
