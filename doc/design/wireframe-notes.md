# Echowhy V1 Wireframe Notes

## Purpose

This document turns the v1 product structure into low-fidelity page notes.

It is not a visual mockup. It is a page-by-page structural guide for:

- what each page should show
- what each page's primary action is
- what should stay visually light
- what should remain secondary or on-demand

## Global UI Principles

- keep visual burden low
- always keep the primary action clear
- avoid dashboard-like overload
- reveal secondary information progressively
- make the system feel calm, not busy

## 1. Start

### Page intent

Help the learner begin quickly from a question, while lightly surfacing source context and continuation paths.

### Visual character

- minimal
- spacious
- centered
- invitation to think, not pressure to manage

### Main visible regions

#### A. Center question entry

This is the primary focal area.

Contains:

- question input
- start-learning button
- very short guiding text

Example intent:

- "What are you trying to understand?"

#### B. Light source-context area

This should stay quiet and compact.

Contains:

- whether a source is active
- source name
- import / switch source action

Should not compete visually with the main question entry.

#### C. Continue / review shortcuts

Compact continuation area.

Contains:

- continue last topic
- today's review topics
- recently active topic

This should feel like a gentle shortcut area, not a management dashboard.

#### D. Cold-start project overview ladder

This appears after a source is imported and before a topic is chosen.

Contains:

- short AI-generated project overview
- 3 guided questions or directions
- option to ignore suggestions and ask freely
- each guided direction may appear as a first clickable question bubble

Purpose:

- help learners who have a source but do not yet know where to begin
- provide a first ladder into the project without overwhelming them

#### E. Optional future atmosphere layer

Not required for v1 core.

Possible future treatment:

- lightly drifting previous questions or themes
- soft interactive memory layer

V1 should not depend on this effect.

### Primary action

- ask a question and begin learning

### Secondary actions

- import source
- switch source
- continue previous learning
- enter review

## 2. Learning Unit

### Page intent

Host the actual learning loop:

- explanation
- source anchoring
- angle selection
- answering
- evaluation
- follow-up

### Visual character

- focused
- structured
- rich but not cluttered
- supports depth without pressure

### Main visible regions

#### A. Current learning anchor

Small but always clear.

Contains:

- current topic or question title
- current learning goal
- current source context

This region keeps the learner oriented.

#### B. Progressive explanation

Main instructional area.

Contains:

- staged explanation
- concept breakdown
- current reasoning layer

This should read like guided understanding, not a wall of text.

#### C. Source reference area

Supporting evidence or material area.

Contains:

- code snippet
- document snippet
- source location

This should feel clearly attached to the current explanation, not like a separate browser.

#### D. Learning-angle chooser

Choice area that prevents over-control.

Contains:

- several learning angles
- one-line description for each
- continue-with-my-own-question option

Example angle types:

- request flow
- responsibility split
- data involvement
- exception path
- design reason

#### E. Answer area

Learner expression area.

Contains:

- current concrete question
- answer input
- submit action
- ask follow-up action

This is where understanding is tested through self-expression.

#### F. AI feedback area

Evaluation area.

Contains:

- score or level
- what is correct
- what is vague
- what is missing
- improvement suggestion

This area should feel supportive and diagnostic, not punitive.

#### G. Follow-up chain entry

Compact entry, not a dominant full-time panel.

Contains:

- open chain action
- light indication of current position in the chain

V1 should keep this simple and easy to reopen.

### Primary action

- choose an angle and answer

### Secondary actions

- inspect source material
- ask a follow-up question
- open chain
- switch angle

## 3. Learning Library

### Page intent

Provide a light, topic-based archive of what the learner has explored and what is worth returning to.

### Visual character

- calm
- light
- easy to scan
- not file-manager-like

### Main visible regions

#### A. Learned topics

Primary topic list.

Contains:

- topic title
- last studied time
- understanding level
- chain-active indication

This should answer:

- "What have I already learned?"

#### B. Review topics

Priority revisit list.

Contains:

- topics worth revisiting
- lightweight reason they are being surfaced
- quick review entry

This should answer:

- "What should I pick up again?"

#### C. Topic entry behavior

Important behavior note:

- opening a topic should prefer the follow-up chain as the primary detail view
- detailed summaries, answers, and feedback should stay secondary and on-demand
- the first impression of topic detail should be the chain itself, not a stacked information page

### Primary action

- reopen a topic

### Secondary actions

- enter review
- inspect chain
- continue questioning

## 4. Review

### Page intent

Help the learner re-enter meaningful topics and strengthen understanding through re-answering and re-evaluation.

### Visual character

- focused
- not task-heavy
- feels like re-entering a thought thread

### Main visible regions

#### A. Today's review priorities

Main entry area.

Contains:

- topics suggested for review now
- lightweight reason each is surfaced
- start-review action

This area should stay compact and high-signal.

#### B. Current review topic

Context region for the selected review topic.

Contains:

- topic title
- core question
- short context reminder
- optional chain access

#### C. Re-answer area

Main interaction area.

Contains:

- current review question
- answer input
- submit action
- optional "show chain/material first" action

#### D. Re-evaluation area

Feedback region.

Contains:

- current score or level
- change from previous answer
- remaining weakness
- suggested next revisit timing
- continue-follow-up option

### Primary action

- answer a review question

### Secondary actions

- reopen source context
- inspect chain
- continue learning from review

## Follow-up Chain View

This may appear as an overlay, side panel, or dedicated lightweight view.

### Purpose

Show how questions evolved across a topic.

### V1 requirements

- constellation-like form rendered through Canvas or SVG
- low visual density
- clickable nodes
- easy return to learning point
- chain-first topic detail view
- node click should jump into the relevant conversation or learning detail
- progressive node lighting
- polyline-style connections are acceptable and preferred over decorative curves when clarity is higher

### Visual direction

- minimal
- deep black or deep blue gradient background
- starfield-like atmosphere
- lightweight constellation logic
- should remain calm and readable
- visual delight must not raise cognitive burden

### Lighting logic

- `dim`: initial or not-yet-validated state
- `pulsing`: current active node
- `lit`: node has passed answer validation and remains visibly on

The chain should feel like knowledge being gradually lit rather than merely traversed.

Important implementation note:

- when React components are built, the `dim -> lit` transition should be treated as a core interaction feedback moment
- this is not only a color swap
- it should feel like a small ritual of understanding being earned

### V1 non-goals

- dense full knowledge graph
- advanced editing
- complex map-like navigation as the default

## Knowledge Source Context

This should remain visible but light across relevant pages.

### It should help answer

- Am I learning from a source right now?
- Which source is active?
- Is this explanation source-specific or general?

### It should never dominate the page

- keep it compact
- keep it informative
- keep it secondary to learning actions

## Layout Notes

The layout should not be considered fully fixed.

V1 may use a default structure with light flexibility:

- resizable areas
- collapsible sections
- simple view switching

Do not build a full custom workspace system in v1.

## What To Validate In Future Design Passes

- whether Start feels light enough
- whether Learning Unit feels guided but not controlling
- whether Library is simple enough to scan
- whether Review feels meaningful rather than mechanical
- whether chain visualization stays clear and low-burden
