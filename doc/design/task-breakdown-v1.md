# Echowhy V1 Task Breakdown

## Purpose

This document breaks the current `Echowhy v1` plan into concrete execution tasks.

It is designed to help:

- keep scope under control
- preserve the agreed priorities
- show what should be done first
- make handoff to another AI or future self easier

## Execution Principle

Build the smallest end-to-end learning loop first.

That means:

- do not start with customization systems
- do not start with heavy gamification
- do not start with generalized multi-source complexity

Instead, first prove that a learner can:

1. enter with a question or source
2. get a learning topic
3. read progressive explanation
4. answer from their own understanding
5. receive AI evaluation
6. revisit the topic later

## Phase Overview

### Phase 1

Build the first working learning loop.

### Phase 2

Strengthen topic persistence, review, and chain visibility.

### Phase 3

Improve comfort, flexibility, and richer review logic.

## Phase 1: First Working Loop

### Goal

Create a usable prototype that can teach one repository topic end-to-end.

### Scope anchor

- source type: code repository
- pilot repository: RBAC
- pilot topic: login/authentication

### Task 1: Project setup skeleton

Goal:

- create the initial project structure for the `Echowhy` app

Output:

- app scaffold
- initial folders
- base routing or page shell

Why first:

- later work needs a stable place to live

### Task 2: Core page shells

Goal:

- create minimal page shells for:
  - `Start`
  - `Learning Unit`
  - `Learning Library`
  - `Review`

Output:

- basic navigation between pages
- placeholder regions matching the wireframe notes

Why second:

- lets us place features into real surfaces early
- prevents feature work from drifting without page structure

### Task 3: Knowledge source context model

Goal:

- define how the app represents an active knowledge source

Output:

- source state shape
- active-source indicator logic
- placeholder source selection flow

Why now:

- both question entry and source entry depend on this context

### Task 4: Start page core flow

Goal:

- implement the main question-entry path

Output:

- question input
- start-learning action
- lightweight source-context display
- cold-start ladder state
- placeholder continue/review shortcuts

Why now:

- this is the main entry into the system

### Task 5: Learning-topic generation contract

Goal:

- define the shape of a generated learning topic

Suggested shape:

- topic title
- source context
- learning goal
- explanation blocks
- learning angles
- current question
- references
- follow-up chain seed

Why now:

- `Learning Unit`, `Library`, and `Review` all depend on the same core topic shape

### Task 6: Learning Unit core rendering

Goal:

- render a single learning topic in the `Learning Unit` page

Output:

- learning anchor area
- explanation area
- reference area
- angle chooser
- answer area
- feedback area placeholder
- constellation-ready chain region

Why now:

- this is where the core value of the product happens

### Task 7: Answer submission and AI feedback loop

Goal:

- allow a learner answer to be submitted and evaluated

Output:

- answer input handling
- feedback response handling
- node validation result handling
- feedback view with:
  - score or level
  - correct points
  - vague points
  - missing points
  - next-step suggestion

Why now:

- without this, the system is not yet an interactive learning tool

### Task 8: Learning-angle branching

Goal:

- support multiple learning angles instead of one forced next question

Output:

- angle selector UI
- current-angle switching
- support for custom follow-up question entry

Why now:

- this protects the product from becoming too controlling
- it expresses the Echowhy philosophy directly

### Task 9: Topic persistence

Goal:

- save learning topics and learner interaction history

V1-friendly storage options:

- JSON-backed local storage
- file-backed storage
- lightweight local database later if needed

Output:

- stored topics
- stored answers
- stored feedback
- stored chain relationships

Why now:

- learning should not disappear like chat

### Task 10: Learning Library first version

Goal:

- surface saved topics as:
  - learned topics
  - review topics

Output:

- topic list UI
- topic state indicators
- topic reopening flow

Why now:

- persistence must become visible to the learner

### Task 11: Follow-up chain first version

Goal:

- generate and render a lightweight constellation-style follow-up chain

Output:

- chain relationship model
- chain entry button
- simple Canvas/SVG-based constellation view
- dim / pulsing / lit node states
- click node to return to that point

Why now:

- the chain is a core differentiator and should be present early
- the visual identity now depends on this view earlier than before

### Task 12: Review first version

Goal:

- let the learner revisit a previously studied topic and answer again

Output:

- review topic list
- review question entry
- renewed answer submission
- renewed feedback view

Why now:

- this closes the first real learning loop

## Phase 2: Strengthen the Learning Asset System

### Goal

Turn the first loop into a more coherent long-term learning system.

### Task directions

- add AI-guided project overview ladder
- add guided starting questions
- connect answer validation to node state transitions
- improve learned-topic and review-topic states
- add simple review-priority logic
- compare current answer against previous answer
- improve source anchoring

## Phase 3: Smarter Guidance And Better Experience

### Goal

Make the system more intelligent and more personally useful without breaking the light UX.

### Task directions

- improve review prioritization with value + time logic
- add spaced-review behavior
- improve start-page atmosphere
- add light layout flexibility
- consider richer map or graph views

## V1 Non-Goals

Do not treat these as first-milestone requirements:

- fully free layout system
- heavy graph editor
- RPG map experience as the default interface
- large-scale external-source orchestration
- broad support for every source type
- polished gamification systems

## Suggested Implementation Order

If work begins immediately, a practical order would be:

1. app scaffold
2. page shells
3. start page question entry
4. learning-topic contract
5. learning unit rendering
6. answer + AI feedback
7. persistence
8. library
9. follow-up chain
10. review

## Key Validation Questions

These should be checked during implementation:

- can a learner begin quickly without feeling overwhelmed
- does the learning unit feel guided but not controlling
- does feedback feel useful rather than judgmental
- does the library feel topic-centered rather than fragmented
- does review feel like re-entry into understanding rather than homework
- does the chain actually help the learner continue thinking

## Recommended Next Artifact After This

After this task breakdown, the next useful artifact would be either:

- a concrete technical architecture note
- a first implementation scaffold in code
