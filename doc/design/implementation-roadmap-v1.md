# Echowhy V1 Implementation Roadmap

## Purpose

This roadmap connects the current planning documents into a practical implementation sequence.

It is meant to answer:

- what should happen first
- what can stay mocked early
- when AI integration becomes necessary
- when richer interaction or visual work should begin

This is a sequencing document, not just a task list.

## Guiding Principle

Build confidence in layers.

The right order for `Echowhy v1` is:

1. prove the learning loop
2. prove persistence and revisit
3. prove follow-up-chain usefulness
4. improve review quality
5. improve comfort and visual expression

Do not reverse this order.

## Reference Documents

This roadmap assumes and depends on:

- `product-spec-v1.md`
- `wireframe-notes.md`
- `task-breakdown-v1.md`
- `technical-architecture-v1.md`
- `data-contracts-v1.md`
- `mock-data-v1.md`
- `app-scaffold-plan-v1.md`

## Stage 0: Planning Stability

### Objective

Freeze the v1 product skeleton enough that implementation can begin without constant redefinition.

### Current status

Largely completed.

Completed outputs:

- product framing
- page structure
- task breakdown
- architecture direction
- data contracts
- mock data
- scaffold plan

### Exit condition

- the team can begin implementation without needing to rediscover the core product shape

## Stage 1: Frontend-Only Mocked Prototype

### Objective

Create the first clickable, believable Echowhy prototype using mocked data and mocked services, with chain display working end-to-end.

### Why this stage matters

This stage proves:

- whether the pages feel coherent
- whether the flow feels like learning instead of chat
- whether the UI stays light enough
- whether chain-first topic detail can carry the product experience

### What should still be mocked

- topic generation
- answer evaluation
- review prioritization
- follow-up chain expansion

### What should be real

- app structure
- page routing
- page rendering
- page-to-page navigation
- source context display
- topic persistence shape

### Primary deliverables

- Start page
- Learning Unit page
- Learning Library page
- Review page
- constellation-style follow-up chain view rendered through Canvas or SVG

### Success criteria

- a user can go from Start to Learning Unit
- a mocked topic renders cleanly
- a mocked answer produces a mocked feedback result
- the topic appears in Library
- the topic can be reopened in Review
- the chain is visible as the primary topic-detail surface
- the constellation view feels readable and low-burden

### Do not spend time yet on

- dynamic wallpaper effects
- advanced graph visuals
- custom workspace layout

## Stage 2: AI-Guided Conversation Prototype

### Objective

Add AI-guided "ladder building" interaction on top of the frontend prototype.

### Why this stage matters

This stage proves that Echowhy can do more than statically render a topic.

This stage proves:

- source import can lead into an AI-generated overview
- guided questions can help learners begin
- active learning can feel guided without becoming controlling

### Focus areas

- AI-generated project overview
- 3 guided starting questions
- AI-guided topic generation
- AI-guided answer evaluation
- lightweight chain growth from live interaction
- answer validation linked to node visual state changes

### What can remain simple

- persistence details
- source analysis depth
- review scheduling sophistication

### Success criteria

- a learner can import a source and receive a usable overview ladder
- a learner can start from one guided question and continue into the learning loop
- AI guidance feels helpful rather than over-controlling
- validated answers can drive node transitions such as dim -> pulsing -> lit

## Stage 3: Persistence And Backend Expansion

### Objective

Turn the prototype into a more durable system and add backend integration only if the earlier stages justify it.

### Why this stage matters

This stage proves the product can persist learning and evolve beyond a purely local shell.

### Focus areas

- local topic storage
- local answer storage
- local feedback storage
- local review-state storage
- local follow-up-chain storage
- optional backend integration when needed

### What can remain simple

- advanced scheduling math
- large-scale source ingestion
- broad deployment concerns

### Important rule

Do not introduce backend complexity just because the app can.

Always keep contracts stable:

- persistence should still respect the agreed topic-centered contracts
- AI integration should still return structured results

### Success criteria

- persisted topics survive page changes and restarts
- review and library use durable local state
- backend addition, if introduced, supports the loop instead of distracting from it

## Stage 4: Source-Aware Learning Improvement

### Objective

Make the system better at tying learning to actual source material.

### Why this stage matters

This is what prevents Echowhy from collapsing into generic AI chat.

### Focus areas

- better reference extraction
- better source-context presentation
- stronger repository-topic linkage
- clearer current-source awareness in the UI

### Success criteria

- generated topics feel clearly anchored to source material
- reference snippets feel relevant
- learners can tell what is source-based and what is general explanation

## Stage 5: Review Quality Upgrade

### Objective

Make review smarter and more meaningful.

### Why this stage matters

Review is central to the product promise, not just an add-on.

### Focus areas

- better review-priority logic
- simple forgetting-curve behavior
- value-aware topic prioritization
- answer-quality-aware revisit scheduling

### Success criteria

- review suggestions feel justified
- high-value topics reappear appropriately
- low-value topics do not create clutter

## Stage 6: Experience and Visual Identity Upgrade

### Objective

Strengthen the emotional and visual distinctiveness of Echowhy after the core loop is proven.

### Focus areas

- lighter ambient start-page expression
- richer follow-up-chain presentation
- more refined topic cards
- better motion and interface atmosphere

### Important caution

Do not let visual ambition outrun learning clarity.

### Things that belong here, not earlier

- dynamic drifting thought-objects
- richer graph aesthetics
- stronger visual personality

## Stage 7: Optional Advanced Modes

### Possible future directions

- workspace-like layout customization
- map-like learning view
- broader source-type support
- stronger chain/value analytics

These should only be pursued after the earlier stages feel solid.

## Milestone Summary

### Milestone A

Mocked prototype that demonstrates the full page flow.

### Milestone B

Persistent local learning prototype.

### Milestone C

Real AI-assisted learning loop.

### Milestone D

Source-aware, chain-aware, review-capable system.

### Milestone E

Distinctive visual and experiential Echowhy identity.

## What To Resist At Every Stage

### Resist overbuilding the shell

Do not prioritize advanced layout or visual systems over the learning loop.

### Resist object fragmentation

Keep user-facing structure topic-first, not raw-data-first.

### Resist turning review into homework

Review should feel like returning to a meaningful thread, not checking boxes.

### Resist over-controlling the learner

Always preserve user-defined direction and follow-up questioning.

## Recommended Immediate Next Move

The next practical move after this roadmap is:

1. create a real project scaffold in code

or, if implementation should still stay document-first:

2. write `ui-copy-and-states-v1.md` to define page copy, empty states, and interaction states
