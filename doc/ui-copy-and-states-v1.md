# Echowhy V1 UI Copy And States

## Purpose

This document defines first-pass UI copy direction and important page states for `Echowhy v1`.

It helps with:

- making the prototype feel coherent
- reducing placeholder ambiguity during implementation
- keeping the tone aligned with the product philosophy

This is not final copywriting. It is a stable starting point.

## Tone Direction

The product voice should feel:

- calm
- curious
- encouraging
- intelligent without being cold

Avoid:

- corporate dashboard language
- exam-like harshness
- overly gamified hype
- robotic instructional wording

## Global Copy Principles

- use plain language
- prefer short prompts over long explanations
- keep learner-facing text light
- make next actions obvious
- when giving feedback, sound diagnostic rather than judgmental

## 1. Start Page

## Primary prompt ideas

Candidate primary lines:

- `What are you trying to understand?`
- `Start from a question.`
- `Begin with a why.`

Recommended v1 choice:

- `What are you trying to understand?`

## Question input placeholder ideas

- `Ask a question, follow a curiosity, or begin with a why...`
- `What are you trying to figure out?`
- `Why does this work the way it does?`

Recommended v1 choice:

- `Ask a question, follow a curiosity, or begin with a why...`

## Start action

Options:

- `Start Learning`
- `Begin`
- `Explore`

Recommended v1 choice:

- `Start Learning`

## Source context copy

When no source is active:

- `No source attached`
- `No source attached yet — start from a question.`

When a source is active:

- `Using source: RBAC Learning Project`

## Continue/review shortcuts

Candidate labels:

- `Continue where you left off`
- `Pick up a recent topic`
- `Review today`

Recommended:

- `Continue where you left off`
- `Review today`

## Guided project-overview ladder copy

When a source is imported and cold-start guidance is needed:

- `Here’s a quick way into this project.`
- `A few good places to begin:`

Guided-question examples:

- `How does the main request flow move through this project?`
- `Which module carries the core logic here?`
- `What part of this project is easiest to understand first?`

Conceptual-source helper copy:

- `No files yet? Start from a question and let the system gather a temporary source.`

## Empty state

When no history exists:

- `Your learning topics will appear here once you begin.`

## 2. Learning Unit

## Topic anchor

Candidate labels:

- `Current topic`
- `What you're learning`

Recommended:

- `What you're learning`

## Learning goal

Candidate label:

- `Goal`

Recommended:

- `Goal`

## Learning-angle prompt

Candidate lines:

- `Choose a direction to go deeper.`
- `Where would you like to go next?`
- `Pick a way into the question.`

Recommended v1 choice:

- `Choose a direction to go deeper.`

## Custom direction action

Options:

- `Continue with my own question`
- `Ask my own follow-up`

Recommended:

- `Ask my own follow-up`

## Answer area label

Options:

- `Your answer`
- `Put it in your own words`

Recommended:

- `Put it in your own words`

## Answer submit action

Options:

- `Check my understanding`
- `Submit answer`
- `See feedback`

Recommended:

- `Check my understanding`

## Follow-up action

Options:

- `Ask a follow-up`
- `Keep digging`

Recommended:

- `Ask a follow-up`

## Feedback labels

Overall score:

- `Understanding score`

Correct points:

- `What landed well`

Vague points:

- `What feels unclear`

Missing points:

- `What’s still missing`

Next suggestion:

- `A good next step`

## Feedback empty state

Before submission:

- `Your feedback will appear here after you answer.`

## Reference area label

Options:

- `Source context`
- `Related material`
- `What this is grounded in`

Recommended:

- `Related material`

## Chain entry label

Options:

- `Open follow-up chain`
- `View question chain`

Recommended:

- `View question chain`

## 3. Learning Library

## Section labels

Recommended:

- `Learned topics`
- `Worth revisiting`

## Topic card metadata labels

Recommended:

- `Last studied`
- `Understanding`

## Topic actions

Recommended:

- `Open topic`
- `Continue learning`
- `Enter review`

## Library empty states

When no learned topics:

- `You haven’t built any learning topics yet. Start from a question to begin.`

When no review topics:

- `Nothing is waiting for review right now.`

## 4. Review

## Main section labels

Recommended:

- `Review today`
- `Current review topic`

## Review reason examples

- `This topic is important to your authentication flow understanding.`
- `You were partly clear here last time.`
- `This question chain is worth revisiting.`

## Review action labels

Recommended:

- `Start review`
- `Answer again`
- `Compare my understanding`

## Re-evaluation labels

Recommended:

- `Current score`
- `What improved`
- `What still feels weak`
- `What to revisit next`

## Review empty state

When nothing is available:

- `There’s nothing urgent to revisit right now.`

## 5. Follow-up Chain View

## Title ideas

- `Question chain`
- `Follow-up chain`
- `How this topic unfolded`

Recommended:

- `Follow-up chain`

## Chain-first detail note

When a topic is opened from Library or Review, the first detail view should be the chain itself rather than a dense summary page.

Possible support line:

- `Follow the path this topic took.`

## Empty state

When only one question exists:

- `This topic hasn’t branched yet. Ask a follow-up to deepen it.`

## Node interaction hint

- `Select a node to return to that point.`

## Visual direction note

The chain view may gently lean toward:

- starfield-like calm
- lightweight exploratory map feeling

But it should remain easy to read and low in visual burden.

Node-state hints:

- `Dim` nodes are not yet fully earned.
- `Pulsing` marks the current point of inquiry.
- `Lit` means this point has been understood well enough to stay on.

## Important Interaction States

## Start page states

### State A: empty first-use

Show:

- central question input
- minimal empty-state hint
- no heavy history sections

### State B: active source attached

Show:

- source context label
- source switch action
- same question-first structure

### State C: source imported, cold-start ladder ready

Show:

- source context label
- short AI-generated project overview
- 3 guided questions or directions
- clear option to ask a custom question instead

Suggested copy:

- `Here’s a quick way into this project.`
- `Or ask about what stands out.`

### State D: conceptual-source question start

Show:

- question-first entry
- temporary-source hint
- one emerging root-node concept

Suggested copy:

- `Starting from a question.`
- `A temporary source will be gathered as needed.`

### State E: returning learner

Show:

- continue shortcut
- review shortcut
- calm but visible history hint

## Learning Unit states

### State A: loading topic

Show:

- lightweight loading state
- avoid heavy spinner theatrics

Suggested copy:

- `Building your learning path...`

### State B: topic ready, no answer yet

Show:

- explanation
- angles
- answer area
- feedback placeholder

### State C: answer submitted

Show:

- feedback
- score
- follow-up options
- node state transition toward lit or remain dim

### State D: custom follow-up path

Show:

- custom question active
- chain context still accessible

### State E: active pulsing node

Show:

- current node visually emphasized
- surrounding nodes still readable but less active

### State F: validated lit node

Show:

- current node transitions from pulsing to lit
- learner can visually see progress in the chain

Implementation note:

- this transition should be treated as a primary emotional feedback moment
- it should feel like understanding has been earned, not like a generic status color update

## Learning Library states

### State A: no topics yet

Show:

- one clean empty state
- return-to-start action

### State B: topics available

Show:

- learned topics
- review topics

### State C: topic opened

Show:

- chain-first topic detail view
- constellation view as the first surface

## Review states

### State A: no review needed

Show:

- calm empty state

### State B: review queue available

Show:

- review candidates
- reason for surfacing

### State C: active review in progress

Show:

- selected topic
- answer area
- current evaluation region

## Recommended Next Step

After this document, the next useful step is:

- create a concrete design-system-lite note

or:

- begin actual code scaffolding
