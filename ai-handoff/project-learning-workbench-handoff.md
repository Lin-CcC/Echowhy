# Echowhy Handoff

## Purpose

This document is a handoff record for continuing the `Echowhy` idea that emerged while studying the RBAC repository.

It is written so that:

- the current conversation can be resumed by another AI if context is lost
- the user's learning needs remain explicit
- product direction does not drift into a generic note app or generic chatbot
- implementation can continue incrementally from a stable starting point

## Repository Context

Current repository:

- `web`: React frontend
- `server`: Spring Boot backend
- `docs`: planning notes

Current project state relevant to learning:

- backend login flow is implemented
- frontend login page is still mostly static
- this repository is being used as a learning target for understanding:
  - frontend-backend collaboration
  - request flow
  - data flow
  - authentication flow
  - module-by-module project reading

## User's Learning Style And Needs

The user wants an AI to teach from the current project itself, not from detached textbook explanations.

Important preferences:

- explain from front to back, gradually, in plain language
- ask guiding questions during explanations
- evaluate the user's answers
- point out what is correct, what is imprecise, and what is missing
- support jumping from explanation to exact code file or code segment
- generate learning material that can be saved and reviewed later
- scale this approach from small projects to large projects

The user is not only trying to learn this RBAC repo. The broader goal is to design a software product that helps learners study real codebases interactively.

## Product Name

Current accepted name:

- `Echowhy`

Older names such as "Echo of Why" or "Project Learning Workbench" should be treated as historical drafts, not the current product name.

## Confirmed Core Definitions

These definitions were explicitly discussed and accepted, and should be treated as current product truth unless the user revises them later.

### Learning-method definition

`Echowhy` implements a learning method driven by curiosity, powered by repeatedly asking "why", and validated through self-expression.

Meaning:

- the learner should not stop at memorizing conclusions
- understanding is deepened by asking and refining questions
- understanding is checked by trying to explain in one's own words
- unclear areas should trigger revisit, comparison, and deeper follow-up
- the learning process itself should become a reusable asset

### Product definition

`Echowhy` is an interactive learning system that turns the "keep asking why" learning method into a usable experience. It works around an imported knowledge source, generates progressive explanations and questions, guides the learner to answer, evaluates whether understanding is actually in place, and preserves the learning process as something reviewable and reusable later.

### Short product definition

`Echowhy` is an interactive learning system that makes question-driven learning concrete.

## Confirmed Product-Structure Direction

These points were discussed after the core definitions and should now be treated as active design guidance.

### Dual-entry model

`Echowhy` should not assume that learning always starts from an imported knowledge source.

It should support two valid starting points:

- question-driven entry
- knowledge-source-driven entry

### Question-driven entry

The learner begins by asking a question.

Important principle:

- even a small question should be treated as a meaningful learning trigger
- a single question can unfold into a wider learning path
- asking one's own question is itself part of practicing the Echowhy learning method

### Knowledge-source-driven entry

The learner begins from an imported knowledge source and then selects or receives a suggested learning entry point.

### Converged learning loop

After either entry point, the core learning loop should converge into the same structure:

- organize relevant learning material
- generate progressive explanation
- ask or refine questions
- let the learner answer in their own words
- evaluate understanding
- preserve the session for review and revisit

### Important clarification about knowledge sources

Knowledge sources do not always need to be explicitly provided by the learner.

The system should be allowed to:

- use user-provided knowledge sources when available
- select or organize suitable supporting sources when the learner starts only with a question

This means:

- the question may come first
- the supporting source may be attached later by the system

This is important because the product should not collapse into generic chat. A question should become a learning entry, and the system should anchor that learning in relevant referable material whenever possible.

## Confirmed V1 Product Carrier

`Echowhy v1` should first be built as a locally run web application.

Why this was chosen:

- the current priority is validating the learning loop, not desktop packaging
- web iteration is lighter and faster during the product-shaping phase
- this keeps technical complexity lower for the first milestone
- the project can still be wrapped into a desktop shell later if that becomes useful

## Confirmed V1 Frontend Stack Direction

The current confirmed frontend direction for `Echowhy v1` is:

- TypeScript
- React 19
- Vite
- TanStack Router
- TanStack Query
- Zod
- React Hook Form
- Zod Resolver
- Tailwind CSS 4
- shadcn/ui

Important clarification:

- `TanStack Query` is now considered a core dependency rather than a later optional addition
- `React Hook Form + Zod Resolver` is the preferred form and validation pairing for learner inputs and question flows

## Confirmed V1 Backend Strategy

`Echowhy v1` should begin without a separate standalone backend.

Current direction:

- build the first milestone as a frontend-first local prototype
- use mocked and local flows first
- defer a dedicated backend until the learning loop is proven

Why this was chosen:

- the current goal is validating product flow, not infrastructure
- this keeps implementation lighter and faster
- it reduces early system complexity while preserving future expansion

## Confirmed Library And Review Direction

### Learning Library should be topic-first

The `Learning Library` should not expose raw internal record types as the primary user-facing structure.

Do not present it first as:

- questions
- answer records
- AI feedback items
- summaries
- sessions

Instead, present it primarily as:

- learned topics
- review topics

This is important because users should be able to answer:

- what have I already learned
- what should I review next

without being overwhelmed by fragmented stored objects.

### Internal detail can stay granular

Internally, the system may still store:

- questions
- answers
- feedback
- notes
- references
- sessions

But the interface should group these under a higher-level learning topic.

### Follow-up chain must be preserved

The follow-up or deeper-question chain is an important part of the Echowhy learning method and should be preserved as a first-class concept.

Reason:

- a learner often deepens understanding through successive questions
- follow-up questions help capture how understanding unfolded
- future review should be able to reopen that thread of inquiry

### Follow-up chain should be generated automatically

The learner should not be required to manually maintain the follow-up chain.

Preferred behavior:

- the system automatically records question-to-question relationships during learning
- the learner can open the chain at any time through a lightweight UI entry
- the chain should help both current understanding and later review

### V1 visualization should stay simple and intuitive

For v1, the follow-up chain visualization should be:

- visually direct
- lightweight
- easy to understand at a glance

It may take inspiration from an Obsidian-style relationship graph, but should remain smaller and simpler than a full knowledge graph.

Good enough for v1:

- nodes for questions or topics
- visible links showing follow-up relationships
- click a node to jump back into that point of learning

Avoid in v1:

- heavy graph complexity
- dense network visualizations
- advanced graph editing

## Confirmed Layout Direction

### Long-term direction: workspace-like layout flexibility

The product may later evolve toward a workspace style where learners can adjust how panels are arranged, similar in spirit to professional tools with draggable panels and resizable working areas.

Potential long-term behaviors:

- rearrange visible panels
- resize work areas
- move panels between regions
- preserve personal layout preferences

This direction is considered valuable and aligned with the product's "learning workbench" character.

### V1 boundary: do not build a full custom layout system yet

For v1, avoid:

- fully free panel docking
- advanced drag-and-drop workspace composition
- complex layout persistence systems

### V1 preferred compromise

Use a default working layout, but allow lightweight flexibility such as:

- resizing split areas
- collapsing or expanding panels
- switching between a few panel views

This preserves product character without letting layout complexity dominate the first milestone.

## Confirmed Start-Page Direction

### Desired character

The `Start` page should feel lightweight, minimal, and inspiration-friendly rather than dashboard-heavy.

It should act like a quiet entry space for learning, not a dense control panel.

### Core interaction priority

The main visible action should still be asking a question and starting a learning path from it.

### Floating memory layer

The product may later include a light dynamic background layer made from:

- previously asked questions
- previously explored directions
- key learning themes

Desired feeling:

- like drifting thought-objects in a space
- something the learner can "pick up" again and continue from
- emotionally satisfying, similar to a gentle progress artifact rather than a static list

### V1 boundary

For v1:

- keep the page visually simple
- do not build a heavy interactive dynamic-wallpaper system
- if used at all, keep floating elements minimal and low-complexity

The idea is considered worth preserving, but should not distract from the first working learning loop.

## Confirmed UI Design Philosophy

The user repeatedly emphasized that the product should aim for low visual burden and strong approachability.

### Core UI principles

- keep interfaces light and easy to enter
- avoid dense dashboards and overloaded detail pages
- prefer one strong primary action over many competing actions
- let important information appear progressively rather than all at once
- reduce cognitive load and visual pressure wherever possible
- keep the product easy to pick up even when the underlying system is rich

### Implications

- detail views should not dump every stored object on screen
- topic detail should center on the follow-up chain rather than a heavy information summary
- supporting information should be accessible on demand
- page structure should feel calm and learnable, not like an enterprise control panel

## Confirmed Frontend File-Organization Principle

The frontend should be organized feature-first.

Important rule:

- use `features/` as the main organizational boundary
- split features according to functional areas or page regions
- do not default to organizing everything by technical type alone

### Feature-first interpretation

The main question should be:

- what functional area does this code belong to

not:

- what kind of code is this in isolation

Examples of feature-style grouping:

- source context
- guided ladder
- constellation view
- answer feedback
- topic library
- review queue
- navigation

### Shared UI rule

If a component:

- has no concrete business logic
- defines no feature-specific state
- does not directly operate on feature state

then it should go into shared UI rather than a feature folder.

This is the intended place for:

- primitive buttons
- basic cards
- section shells
- lightweight status chips

### Page rule

`pages/` should mainly compose features together.

Avoid putting heavy feature logic directly into page files.

### Public feature boundaries

Cross-feature usage should prefer explicit public entry points such as `index.ts` files rather than deep imports into another feature's internal folders.

## Future Experience Direction: Map View

The product may later offer a map-like learning view, especially for learning history and review.

### Core idea

Previously learned topics can be represented spatially as points, regions, or nodes in a larger learning world.

Possible experience goals:

- make review feel more exploratory and satisfying
- represent learning topics as places that can be revisited
- show topics needing review through dynamic markers or unrest-like signals
- make returning to unfinished thought threads feel emotionally engaging

### Design caution

This should not replace the v1 core structure.

For now, treat it as:

- a later visual mode
- a thematic experience layer
- possibly a future Library or Review view

Avoid in v1:

- making the whole product depend on a heavy RPG-map metaphor
- letting the metaphor obscure clarity
- turning core learning actions into game mechanics too early

### Review should eventually be forgetting-curve-aware

The `review topics` area should eventually support reminders shaped by a forgetting-curve or spaced-repetition style review rhythm.

Desired behavior:

- the system updates what should be reviewed today
- review priority changes over time based on previous study and review outcomes

This should be treated as an important future review capability, even if v1 starts with a simpler version.

### Review priority should consider learning value, not time alone

Review scheduling should not depend only on elapsed time.

The system may also estimate the value of a topic or follow-up chain when deciding:

- whether it should be reviewed
- how urgent the review is
- how much attention it deserves

Possible contributors to value:

- depth of the question chain
- conceptual importance
- difficulty or confusion level
- answer quality history
- relevance to broader understanding

This should be treated as a meaningful product direction for review prioritization.

### Library should minimize visual burden

The interface direction for `Learning Library` should stay intentionally light and easy to scan.

Important principle:

- do not overload the learner with too many parallel panels or dense summaries
- keep the page easy to enter and easy to continue from

### Topic detail should prefer the follow-up chain as the main view

Instead of a heavy topic-detail page with many sections visible at once, the topic-detail experience should preferably center on the generated follow-up chain.

Why:

- the chain is a more natural representation of how understanding evolved
- it reduces visual overload
- it better matches the Echowhy learning method

Supporting information such as summaries, answers, and feedback can remain accessible, but should not dominate the initial detail view.

## Confirmed Learning-Unit Interaction Direction

### AI feedback should include a score or level

The AI feedback area should not provide only narrative commentary.

It should also include a quantitative or semi-quantitative judgment, such as:

- a score
- a level
- a mastery indication

Why:

- helps learners quickly gauge answer quality
- helps track progress over time
- helps estimate how well a concept is understood
- can later support review prioritization

Preferred structure:

- overall score or level
- what is correct
- what is vague
- what is missing
- what to improve next

### Learning should branch through angles, not a single forced question

The system should not always push the learner through one single next question.

Instead, after anchoring the current topic and giving some explanation, it should provide multiple meaningful learning angles or directions that the learner can choose from.

Examples of learning angles:

- request flow
- responsibility split
- data involvement
- design reason
- exception path

Each angle may then contain one or more concrete questions.

### User-defined direction must remain possible

The learner should not be constrained to only system-provided angles.

The system should also support:

- continuing from the learner's own question
- asking a new follow-up question
- defining a custom direction of inquiry

Important principle:

Echowhy should guide, not over-control. It should open paths rather than force a single route.

## Core Product Idea

Working concept for v1:

"An AI learning workbench for studying code projects."

Longer-term concept:

"An AI learning system for studying any knowledge source through guided explanation, questioning, evaluation, and review."

This should not be framed narrowly as:

- just a note app
- just a static HTML generator
- just a chatbot

It should combine:

- code-aware explanations
- structured learning units
- guided questioning
- answer evaluation
- review and revisit support
- code navigation

## Positioning Update

The product should no longer be positioned only around code repositories at the vision level.

### Long-term product positioning

`Echowhy` should be thought of as:

"A guided learning system built around an imported knowledge source."

Possible knowledge sources in the future:

- code repositories
- single files
- folders of files
- PDFs
- course notes
- documentation sets
- other structured or semi-structured learning materials

### V1 product positioning

`Echowhy v1` should still focus on:

- code repositories as the first supported knowledge source

Reason:

- code repositories are the current concrete use case
- the user's learning needs are already validated there
- this gives a narrow surface for proving the learning loop

This distinction is important:

- long-term vision: general knowledge-source learning
- first implementation: repository learning

## Important Product Judgment

### What seems right

The promising differentiator is:

"The system teaches from the current repository context and organizes learning around the codebase."

That is stronger than a generic AI Q&A experience.

### What seems risky

The original idea contained many ambitions at once:

- project analysis
- dynamic page generation
- code linking
- notes
- question generation
- scoring
- review system
- large-project support
- knowledge linking

Risk:

If built as a large all-in-one platform from the beginning, it will likely become too broad and unfocused.

### Recommended framing

Instead of "a universal learning platform", the better framing is:

"A knowledge-source-aware AI learning system, starting with repositories."

This preserves a broader future while keeping v1 anchored to real code projects.

## What The Product Should Not Optimize For First

Do not start by generating lots of standalone HTML files.

Why:

- content duplication
- version confusion
- hard to maintain
- hard to update after the project changes

Better model:

- learning content should be stored as structured learning units
- pages are a rendering layer, not the primary artifact

## Core Conceptual Model

The product should support two parallel views of the same imported knowledge source.

### 1. Source View

Organized by:

- source-specific units such as:
- files
- classes
- functions
- code ranges
- pages
- sections
- headings
- blocks

### 2. Learning View

Organized by:

- feature modules
- technical modules
- request flows
- data flows
- core concepts
- review questions

The ability to move between these two views is essential.

In v1, the source view can remain repository/code-centric.

## Proposed System Layers

### Layer 1: Source Understanding Layer

Responsibility:

- scan the imported source
- detect source type
- extract structure
- identify modules or themes
- identify important flows or conceptual paths
- build a reference index

Output:

- a source knowledge map

Examples of nodes:

- login module
- JWT module
- user module
- role module
- exception handling module
- frontend form module

### Layer 2: Learning Orchestration Layer

Responsibility:

- generate learning paths
- explain progressively
- ask guiding questions
- evaluate user answers
- identify misunderstandings
- connect related concepts
- generate review questions

This is the actual "teaching engine".

### Layer 3: Interaction And Presentation Layer

Responsibility:

- render learning pages
- show code-linked explanations
- capture answers
- show AI feedback
- store notes and learning history
- support review sessions

## Strong MVP Recommendation

Build a narrow but complete loop first.

### MVP Goal

Given a knowledge source and a selected module, the system should:

1. generate a structured learning page
2. link explanations to real code files
3. ask a few guided questions
4. evaluate the learner's answers
5. save the session for later review

### MVP Features

#### 1. Knowledge-source import / scan

- read source structure
- detect likely modules
- identify key references

#### 2. Learning unit generation

Each learning unit should contain:

- title
- learning objective
- explanation
- key code references
- guiding questions
- hints or misconceptions

#### 3. Code navigation

- click concept -> open relevant file or location
- click file -> view associated explanation

#### 4. Answer and feedback loop

- learner submits answer
- AI judges:
  - what is correct
  - what is vague
  - what is wrong
  - whether the answer drifts from the question

#### 5. Persistence

Save:

- generated explanation
- selected code references
- questions asked
- learner answers
- AI feedback
- review state

## Suggested Data Model

This is conceptual, not final.

### KnowledgeSource

- `id`
- `name`
- `sourceType`
- `rootPath`
- `detectedStack`
- `createdAt`
- `updatedAt`

### Module

- `id`
- `knowledgeSourceId`
- `name`
- `type`
- `summary`
- `importance`

### Reference

- `id`
- `knowledgeSourceId`
- `referencePath`
- `symbolName`
- `startLine`
- `endLine`
- `referenceType`

### LearningUnit

- `id`
- `knowledgeSourceId`
- `moduleId`
- `title`
- `goal`
- `explanation`
- `difficulty`
- `status`

### LearningUnitReference

- `id`
- `learningUnitId`
- `referenceId`
- `reason`

### Question

- `id`
- `learningUnitId`
- `prompt`
- `type`
- `expectedDepth`

### AnswerAttempt

- `id`
- `questionId`
- `userAnswer`
- `aiEvaluation`
- `score`
- `understandingLevel`
- `createdAt`

### Note

- `id`
- `knowledgeSourceId`
- `learningUnitId`
- `content`
- `sourceType`

### ReviewItem

- `id`
- `knowledgeSourceId`
- `learningUnitId`
- `questionId`
- `nextReviewAt`
- `reviewCount`
- `lastOutcome`

## Recommended UI Surfaces

### 1. Source Overview Page

Shows:

- source modules
- current learning progress
- suggested starting points

### 2. Learning Unit Page

Shows:

- explanation
- code references
- guided questions
- answer input
- AI feedback

Possible layout:

- left: teaching content
- right: linked code

### 3. Review Page

Shows:

- generated questions
- previous weak areas
- answer evaluation
- revisit links

### 4. Notes / Knowledge Page

Shows:

- saved summaries
- linked modules
- related code references

## Guidance For Large Projects

Large repositories should not be taught file-by-file first.

Preferred entry points:

- feature flow
- request flow
- data flow
- technical subsystem
- role/permission flow
- deployment/runtime flow

Examples:

- login flow
- order creation flow
- payment flow
- authorization flow
- frontend state flow

The system should eventually let the learner switch between:

- feature-centered learning
- technical-topic learning
- code-centered inspection

## Key Product Principle

The product should preserve a distinction between:

- "reading code"
- "learning from code"

The second one needs pedagogy, sequencing, and feedback, not just search and navigation.

## Suggested Build Phases

### Phase 1: Learning Reader

Build:

- repo scan
- module extraction
- generated learning pages
- code linking
- session saving

### Phase 2: Interactive Tutor

Build:

- guided questioning
- answer judging
- misconception correction
- progressive explanation

### Phase 3: Review Engine

Build:

- question generation
- weak-point review
- revisit scheduling
- learning history

### Phase 4: Large-Project Support

Build:

- richer module graph
- flow visualization
- dependency-based exploration
- multi-entry learning paths

## Architecture Direction

Tentative and adjustable.

### Frontend

Likely suitable:

- React app
- split-panel UI for explanation and code
- markdown or structured rich-text rendering for learning units

### Backend / orchestration

Likely suitable:

- service to scan the imported source
- service to maintain learning-unit storage
- LLM integration for explanation, questioning, evaluation

### Storage

Possible progression:

1. start with JSON or markdown-backed local storage
2. move to SQLite or another structured store later

This supports "save and review later" without overengineering too early.

## Good First Deliverable

The first deliverable should not be a full product.

It should be:

"A working prototype that teaches one module of one knowledge source end-to-end."

Ideal pilot target:

- the RBAC repository
- start with the login/authentication module

Why this is a good pilot:

- small enough
- clear backend flow
- clear future frontend integration
- suitable for demonstrating code references and guided questioning

## Immediate Next Product Spec To Write

The next planning artifact should define:

- product structure
- page structure
- key user flows
- minimal data schema
- MVP feature list
- what is explicitly out of scope

## Handoff Notes For A Future AI

If you are a future AI continuing this work:

### First priority

Do not jump into implementation immediately.

First:

- preserve the narrow v1 framing
- avoid turning this into a generic note-taking tool
- avoid turning it into a generic chat wrapper

### Second priority

Use the RBAC login/auth module as the pilot teaching case.

### Third priority

When proposing implementation, keep the first milestone small:

- one project
- one module
- one generated learning page
- one answer-evaluation loop
- one persistence path

### Fourth priority

Treat "code reference jump" as a core feature, not a nice-to-have.

### Fifth priority

When discussing design with the user, be willing to push back if scope expands too quickly.

## Suggested Prompt For A Future AI

Use or adapt this:

"We are continuing work on Echowhy. The long-term goal is a guided learning system for any imported knowledge source, but v1 should stay focused on code repositories. The product should help a learner study a real codebase through structured learning units, code-linked explanations, guided questions, answer evaluation, and review. Start with the RBAC repository and use the login/authentication module as the pilot. Please propose a concrete MVP spec covering pages, user flow, data model, storage choice, and implementation phases, while keeping the scope intentionally small."

## Open Questions

These were not resolved yet and should be discussed before implementation goes too far:

- should the first version live inside this repo or as a separate repo
- should persistence begin with markdown files, JSON files, or SQLite
- should code viewing be embedded directly in the product UI or delegated to external editor links
- should learning units be regenerated on demand or cached and versioned
- how much of the system should be repository-agnostic in v1

## Final Direction Summary

The strongest path forward is:

- build a knowledge-source-aware learning system
- start with one repository and one module
- model learning as structured units, not loose pages
- keep code navigation tightly integrated
- include answer evaluation and review from the start or very early
- defer platform-scale ambitions until the learning loop is proven
