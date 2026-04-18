# Echowhy V1 Product Structure

## Why This Document Exists

This document turns earlier discussion into a stable v1 product structure.

Its job is to answer:

- what `Echowhy v1` is
- what core user flow it supports
- what pages it needs
- what should be in scope now
- what should wait until later

This is not the final implementation spec. It is the product skeleton that later design and development should follow.

## Product Definition

### Learning-method definition

`Echowhy` implements a learning method driven by curiosity, powered by repeatedly asking "why", and validated through self-expression.

### Product definition

`Echowhy` is an interactive learning system that turns the "keep asking why" learning method into a usable experience. It works around an imported knowledge source, generates progressive explanations and questions, guides the learner to answer, evaluates whether understanding is actually in place, and preserves the learning process as something reviewable and reusable later.

### V1 positioning

Although the long-term product should support many kinds of knowledge sources, `v1` should focus on code repositories as the first supported source type.

Confirmed carrier for v1:

- a locally run web application

Confirmed frontend direction for v1:

- TypeScript
- React 19
- Vite
- TanStack Router
- TanStack Query
- Zod
- React Hook Form + Zod Resolver
- Tailwind CSS 4
- shadcn/ui

Confirmed backend direction for v1:

- no separate standalone backend in the first milestone
- frontend-first local prototype first

Pilot target:

- the RBAC repository
- login/authentication as the first teaching module

## Core Product Principle

`Echowhy` should guide, not over-control.

This means:

- the learner can start from a question
- the learner can also start from a knowledge source
- the system should open learning paths, not force only one
- the learner must always be able to continue with their own follow-up question

## Core UX Principle

The interface should stay light, calm, and easy to enter.

Important UI rules:

- reduce visual burden
- keep one strong primary action visible
- avoid dashboard heaviness
- show secondary information progressively
- let supporting detail open on demand

## V1 Entry Model

`Echowhy v1` should support two main entry modes and one combined mode.

### Mode A: Question-driven entry

The learner starts by asking a question.

Example:

- "Why isn't JWT used to verify identity at login time?"

Question-first entry without imported files should still be valid.

In this mode:

- the system may use a conceptual or temporary source context
- AI search-backed material can act as a temporary knowledge source
- the first question may appear as a solitary root node before joining a larger cluster later

### Mode B: Knowledge-source-driven entry

The learner starts from an imported source and enters through a chosen or suggested topic.

Example:

- import the RBAC repository
- choose the login/authentication topic

Special v1 case:

- if no explicit source is imported, the system may still operate against a virtual source context such as `external-search`
- this allows guided learning to begin without breaking the topic structure

### Mode C: Question + knowledge source

The learner asks a question while also anchoring it to a current source.

Example:

- "Using this RBAC project, explain why login does not rely on JWT verification."

## Shared Learning Loop

After entry, all learning paths should converge into the same core loop.

1. Anchor the current topic or question.
2. If a source is present, generate a lightweight project overview first.
3. Offer 3 guided questions or learning directions as an initial ladder into the material.
4. Generate progressive explanation.
5. Attach relevant source material.
6. Offer multiple learning angles.
7. Let the learner pick an angle or define their own.
8. Ask a concrete question in that angle.
9. Let the learner answer in their own words.
10. Evaluate the answer with score/level plus narrative feedback.
11. Allow deeper follow-up or temporary closure.
12. Preserve the learning result for later review.

Cold-start ladder behavior should be treated as a first-class part of the v1 flow, not a later enhancement.

## Core Entities

These are product-level entities, not final database tables.

### Knowledge Source

A source of learnable material.

Examples:

- repository
- folder
- file set
- document collection

### Learning Topic

A user-facing learning unit organized around a question, theme, or chain of inquiry.

This should be the main user-facing unit in the library and review system.

Value signals should eventually include:

- learner-defined importance
- AI-estimated topic value

### Follow-up Chain

A generated chain of questions and deeper directions that records how understanding unfolded.

This is a first-class concept in the product.

In v1, the chain should also function as a visual constellation of learning progress:

- unanswered or unvalidated nodes may stay dim
- the current active node may pulse
- validated understanding may light a node

### Review Topic

A learning topic that the system recommends revisiting.

Its priority should eventually be influenced by:

- time since last study
- answer quality
- confusion level
- chain depth or learning value

## Core Pages

`Echowhy v1` should start with four core pages.

### 1. Start

Purpose:

- begin a new learning path
- continue a previous one
- lightly surface current context

Key content:

- main question input
- project-overview ladder state
- start-learning action
- lightweight knowledge-source status
- continue learning entry
- today-review entry

Cold-start ladder behavior:

- after import, AI summarizes the source at a project-overview level
- 3 guided question bubbles are shown
- the learner may select one or ask freely
- the first chosen question becomes the initial root star

Design direction:

- minimal
- calm
- inspiration-friendly
- not dashboard-heavy

### 2. Learning Unit

Purpose:

- host the active learning interaction

Key sections:

- current learning anchor
- progressive explanation
- related source reference
- learning-angle chooser
- answer area
- AI feedback
- follow-up chain entry

Important behavior:

- the system should not force only one next question
- it should offer several meaningful angles
- the learner may also define their own direction

AI feedback should include:

- score or level
- what is correct
- what is vague
- what is missing
- what to improve next

### 3. Learning Library

Purpose:

- act as the user's topic-based learning archive

Primary user-facing groups:

- learned topics
- review topics

Important rule:

- do not expose raw object types as the main structure

Topic detail direction:

- the default topic-detail view should center on the follow-up chain
- the chain should act as the first-class detail surface, not just a supporting widget
- supporting summaries and records should remain secondary and on-demand

Topic detail visual direction:

- minimal
- chain-first
- starfield-like or lightweight RPG-like in feel
- still low-burden and easy to read

### 4. Review

Purpose:

- reactivate important topics for reinforcement

Key content:

- topics worth revisiting today
- reason each topic is being surfaced
- re-answer flow
- renewed AI evaluation
- optional jump back to chain or source context

Important principle:

- review should feel like re-entering a meaningful thread, not mechanically doing tasks

## Knowledge Source Context

This does not need to be a separate page, but should exist across the product.

The learner should be able to tell:

- whether current learning is source-anchored
- which source is active
- whether the explanation is generic or source-specific

## V1 Priorities

### Must-have

- question entry
- knowledge-source entry
- learning topic generation
- progressive explanation
- source reference attachment
- multiple learning angles
- answer submission
- AI feedback with score/level
- learned topics
- review topics
- follow-up chain entry

### Should-have, but lightweight

- basic source switching
- simple continue-learning entry
- simple review prioritization
- basic chain visualization

### Later, not v1 core

- fully customizable workspace layout
- rich graph or knowledge-map systems
- heavy dynamic wallpaper start page
- RPG map experience
- sophisticated spaced-repetition algorithm
- complex external-source orchestration

## Follow-up Chain Direction

The follow-up chain should:

- be generated automatically during learning
- remain visible on demand through a lightweight entry
- serve both current learning and later review

V1 visualization direction:

- constellation-like
- intuitive
- graph-like but visually star-based
- click node to re-enter that point

Node-lighting direction:

- `dim`: initial or not yet validated
- `pulsing`: currently active node
- `lit`: validated through answer acceptance

## Review Priority Direction

Review priority should not rely only on elapsed time.

Over time it should incorporate:

- forgetting curve / spaced rhythm
- answer quality
- conceptual value
- confusion depth
- importance of the chain

V1 can start simpler, but this direction should be preserved.

## Start Page Experience Direction

The `Start` page should remain minimal and question-centered.

When a source is imported, it should support a cold-start ladder state:

- source imported
- AI-generated project overview appears
- 3 guided questions or learning directions are suggested
- the learner may click one or ask their own question instead

When no source is imported:

- question-first learning should still work
- AI search or temporary knowledge gathering may act as a conceptual source
- the resulting first node may begin as a solitary star before later attachment to a broader cluster

Possible future layer:

- light drifting questions or thought-objects in the background

But v1 should not depend on this effect.

## Layout Direction

V1 should not build a full custom workspace-layout system.

However, it may support lightweight flexibility such as:

- resizing split areas
- collapsing or expanding certain sections
- switching between a few views

The product may later evolve toward richer workspace-like customization.

## Open Design Questions

These are still open and should be discussed before implementation gets too deep.

- what exact source types should v1 import first
- how much source processing should happen automatically
- how should learning topics be generated from a repository in v1
- where should source selection live in the UI
- what visual form should the follow-up chain take first

## Immediate Next Step

The next artifact should translate this structure into:

- page-by-page wireframe notes
- action flows
- initial data model
- v1 task breakdown
