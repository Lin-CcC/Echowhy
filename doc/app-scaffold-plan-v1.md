# Echowhy V1 App Scaffold Plan

## Purpose

This document defines the first practical scaffold plan for building the `Echowhy v1` prototype.

It answers:

- what should be created first
- what files or folders should exist early
- what implementation order keeps risk low

This is the bridge between planning documents and actual code work.

## Recommended Prototype Shape

Build `Echowhy v1` as a small frontend-first prototype.

For the first milestone, it is acceptable to:

- use mocked data
- simulate topic generation
- simulate answer evaluation

This is recommended because:

- the core UI and learning loop still need validation
- it is faster to refine product structure before deeper backend complexity

## First Technical Milestone

The first technical milestone should prove one complete loop:

1. enter through `Start`
2. open one `Learning Unit`
3. submit one answer
4. receive one feedback result
5. see the topic in `Learning Library`
6. reopen it in `Review`

Do not expand beyond this until it feels coherent.

## Recommended Initial Stack

- Vite
- React
- TypeScript

Optional but reasonable:

- Zustand for small shared state
- React Router for page navigation

## Recommended Initial Folder Structure

```text
Echowhy/
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
      mappers/
    mock/
      data/
      services/
    components/
      layout/
      common/
    styles/
  docs/
```

## Suggested First File Set

### App shell

- `src/main.tsx`
- `src/App.tsx`
- `src/app/routes/index.tsx`

### Pages

- `src/pages/start/StartPage.tsx`
- `src/pages/learning-unit/LearningUnitPage.tsx`
- `src/pages/learning-library/LearningLibraryPage.tsx`
- `src/pages/review/ReviewPage.tsx`

### Shared state

- `src/app/store/app-store.ts`

### Mock data

- `src/mock/data/knowledge-source.ts`
- `src/mock/data/learning-topic.ts`
- `src/mock/data/explanation-blocks.ts`
- `src/mock/data/learning-angles.ts`
- `src/mock/data/topic-questions.ts`
- `src/mock/data/source-references.ts`
- `src/mock/data/answer-feedback.ts`
- `src/mock/data/review-state.ts`
- `src/mock/data/follow-up-chain.ts`

### Mock services

- `src/mock/services/generate-topic.ts`
- `src/mock/services/evaluate-answer.ts`
- `src/mock/services/load-library.ts`

### Domain models

- `src/domain/models/knowledge-source.ts`
- `src/domain/models/learning-topic.ts`
- `src/domain/models/explanation-block.ts`
- `src/domain/models/learning-angle.ts`
- `src/domain/models/topic-question.ts`
- `src/domain/models/source-reference.ts`
- `src/domain/models/answer-attempt.ts`
- `src/domain/models/ai-feedback.ts`
- `src/domain/models/review-state.ts`

## Scaffold Phases

## Phase A: Empty page skeleton

Goal:

- get all core pages routing correctly

Tasks:

- create app shell
- create page routes
- create placeholder page titles
- create minimal navigation

Success state:

- moving between pages works

## Phase B: Mocked Start + Learning Unit

Goal:

- prove entry into one topic

Tasks:

- build `StartPage`
- add main question input
- add source-context stub
- add "start learning" action
- wire into one mocked topic

Success state:

- entering a question opens the `Learning Unit`

## Phase C: Learning Unit interaction

Goal:

- render the core learning flow

Tasks:

- show topic anchor
- show explanation blocks
- show source references
- show learning angles
- show answer input
- submit to mocked evaluation
- render AI feedback

Success state:

- the page feels like a first real learning surface

## Phase D: Library and Review connection

Goal:

- prove persistence-shaped navigation

Tasks:

- render learned topics
- render review topics
- reopen topic from library
- reopen topic from review

Success state:

- the learner can leave and return to the same topic flow

## Phase E: Follow-up chain first version

Goal:

- make the product feel more distinctly like Echowhy

Tasks:

- add chain entry button
- render simple chain view
- allow returning to question nodes

Success state:

- the learner can see and revisit how questioning unfolded

## Recommended Shared Store Shape

The global store can stay small in v1.

Suggested contents:

- active source
- current topic id
- current question id
- learned topics
- review topics

Avoid:

- putting all UI presentation details into the store
- overengineering derived selectors too early

## Recommended Component Types

Keep component responsibilities clear.

### Page components

Own:

- page-level layout
- page-specific actions

### Feature components

Own:

- question input
- learning-angle list
- answer form
- feedback card
- topic card
- chain view

### Common components

Own:

- buttons
- section shells
- lightweight headers
- status chips

## Suggested UI Implementation Rule

Whenever a page starts feeling too busy:

- remove visual weight before removing capability
- prefer progressive disclosure
- keep the primary action obvious

This rule directly supports the agreed UI philosophy.

## Recommended Next Implementation Step

If development begins after this scaffold plan, the best next move is:

1. initialize the Vite + React + TypeScript app
2. create page shells and routing
3. add mock data files
4. wire the Start -> Learning Unit loop first
