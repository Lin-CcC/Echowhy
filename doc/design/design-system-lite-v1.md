# Echowhy V1 Design System Lite

## Purpose

This document defines a lightweight visual system for `Echowhy v1`.

It exists to keep the prototype:

- calm
- coherent
- easy to extend
- aligned with the agreed low-burden UI philosophy

This is intentionally not a heavy design system. It is a small set of rules that should help early implementation stay visually stable.

## Core Visual Principle

The interface should feel like a quiet curiosity sky.

It should not feel like:

- a busy enterprise dashboard
- a gamified task app
- a neon futuristic control panel

It should feel:

- spacious
- thoughtful
- softly cosmic
- breathable
- precise without being harsh

## High-Level Style Direction

### Desired qualities

- light visual weight
- strong readability
- clear hierarchy
- gentle motion
- quiet confidence
- subtle sense of exploration when appropriate

### Avoid

- overly saturated colors
- heavy borders everywhere
- too many simultaneous accent colors
- excessively dark or glossy UI
- decorative complexity that competes with learning

## Color Direction

Use a restrained deep-space palette with one primary luminous accent and soft neutrals.

### Suggested palette roles

- `background`: deep blue to ink-indigo gradient
- `surface`: translucent midnight surface
- `text-primary`: deep gray, not pure black
- `text-secondary`: muted gray
- `accent-primary`: cool sky-blue with subtle indigo support
- `accent-soft`: pale version of accent for highlights and selected states
- `success`: muted green
- `warning`: muted amber
- `critical`: restrained red

For constellation-oriented views, an alternate view-mode palette may be used:

- `background-deep`: black to deep-blue gradient
- `star-dim`: muted gray-blue
- `star-lit`: soft white or pale blue-white
- `star-active`: brighter accent with gentle pulse
- `line-constellation`: restrained desaturated blue-gray

### Color behavior

- primary accent should guide action, not dominate the page
- red should be used sparingly for review urgency or critical reminders
- chain and topic states should rely on subtle differentiation, not loud color coding
- purple should stay as a low-volume support tone, not the main identity color

## Typography Direction

Typography should support thoughtfulness and ease.

### Suggested hierarchy

- page title
- section title
- body text
- meta text

### Rules

- avoid oversized hero typography for working pages
- keep line lengths moderate
- prefer strong readability over stylistic flourish
- use contrast and spacing more than heavy font-weight stacking

## Spacing Principle

Spacing should do much of the UI work.

### Rules

- let sections breathe
- separate primary action from supporting content
- do not cram many cards into the first viewport
- use whitespace to lower cognitive pressure

### Practical direction

- page-level padding should feel generous
- internal card spacing should be consistent
- small supporting labels should not crowd main text

## Surface and Container Direction

### Surfaces should feel layered lightly

Use:

- soft elevation
- subtle border
- translucent layering
- gentle glow when interaction deserves attention

Avoid:

- thick outlines
- sharp high-contrast framing everywhere
- deeply nested boxes within boxes

### Recommended container types

- page shell
- section shell
- topic card
- feedback card
- chain node
- state chip

## Component Direction

## 1. Buttons

### Primary button

Use for:

- start learning
- check my understanding
- start review

Behavior:

- visually clear
- not oversized
- accent-led but calm
- should feel like a light source, not a solid block

### Secondary button

Use for:

- switch source
- open topic
- ask follow-up
- view chain

Behavior:

- lower emphasis than primary
- easy to scan

## 2. Inputs

### Question input

Should feel:

- inviting
- spacious
- low-friction
- like the center of an idea field rather than a form field

Avoid:

- tiny dense text areas
- intimidating form structures

### Answer input

Should feel:

- supportive
- open enough for real explanation
- clearly separate from passive reading content

## 3. Cards

### Topic cards

Should communicate:

- what the topic is
- how recently it was studied
- whether it is worth revisiting

Do not overload cards with too much metadata.

### Review cards

Should communicate:

- why the topic matters now
- what action to take next

## 4. Feedback cards

Should feel:

- diagnostic
- kind
- actionable

Visual balance:

- score/level visible
- explanation readable
- weak points clear but not punishing

## 5. Chain nodes

Should feel:

- lightweight
- clickable
- distinct enough to scan quickly

V1 node behavior:

- label first
- color/shape variation secondary
- current node clearly indicated
- node light-state should communicate learning status

Suggested light-state behavior:

- `dim`: low-emphasis star
- `pulsing`: active star with calm breathing effect
- `lit`: validated star that remains clearly on

## Motion Direction

Motion should be meaningful and soft.

### Good uses

- panel entrance
- chain node hover response
- subtle state change transitions
- calm loading transitions
- restrained background movement for chain or review atmosphere
- breathing aura around the primary question focus
- gentle floating drift for guided-question bubbles

### Avoid

- excessive bounce
- attention-seeking micro-interactions everywhere
- animation that delays comprehension

## Visual Hierarchy Rules By Page

## Start

Hierarchy:

1. question input
2. start action
3. source context
4. continue/review shortcuts

The page should feel mostly empty in a good way.

Preferred visual metaphor:

- a central inspiration ring
- surrounding floating question bubbles
- soft atmospheric light rather than boxed sections

## Learning Unit

Hierarchy:

1. current learning anchor
2. explanation
3. current action area
4. feedback
5. references and chain access

This page may hold the most information, so spacing and progressive disclosure matter most here.

## Learning Library

Hierarchy:

1. learned topics / worth revisiting
2. topic title
3. brief state
4. open action

Do not let metadata dominate the card body.

## Review

Hierarchy:

1. what is worth revisiting now
2. current review question
3. answer action
4. feedback

Keep review task-focused, not report-focused.

## Ambient Experience Direction

The product may lightly explore:

- starfield-like backgrounds
- "reclaiming color" or color-return motifs during review and chain exploration

Start-page-specific direction:

- deep blue to ink-indigo gradient background
- faint ambient glow fields
- guided questions as floating inspiration bubbles
- primary input framed as a breathing light-ring

These should be treated as atmosphere, not information structure.

Important rule:

- delight is welcome
- visual burden must stay low
- ambient visuals should never compete with the current learning action

## Status Representation

Statuses should be informative without becoming noisy.

### Examples of status categories

- understanding level
- review priority
- source active/inactive
- current node in chain

### Rules

- use small chips or labels
- prefer subtle background tint over strong badge styling
- keep wording concise

## Empty State Direction

Empty states should feel:

- calm
- welcoming
- suggestive of next action

They should not feel:

- alarming
- overly apologetic
- mechanically transactional

## Loading State Direction

Loading should feel purposeful.

### Suggested qualities

- lightweight skeletons or soft placeholders
- short status text where useful
- no flashy loading theatrics

Example:

- `Building your learning path...`

## Accessibility Direction

Even in v1, preserve these basics:

- strong enough color contrast
- readable text sizes
- visible focus states
- keyboard-friendly primary actions
- motion should not be required for comprehension

## V1 Non-Goals

Do not try to create:

- a complete design token platform
- complex themed skins
- animation-heavy identity systems
- elaborate component taxonomies

## Recommended Next Step

After this design-system-lite note, the next useful move is:

- define the first real project directory and bootstrap the prototype

or:

- create a minimal style token file aligned with these rules
