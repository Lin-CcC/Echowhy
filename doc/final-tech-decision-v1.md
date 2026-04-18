# Echowhy V1 Final Tech Decision

## Purpose

This document records the current confirmed technical decisions for `Echowhy v1`.

It exists so that future implementation does not have to infer the final direction from multiple planning documents.

## Confirmed Product Carrier

`Echowhy v1` will first be built as a locally run web application.

Why:

- the immediate goal is to validate the learning loop
- web iteration is the lightest path during product shaping
- desktop packaging can still be added later if needed

## Confirmed Frontend Stack

The confirmed frontend stack for `Echowhy v1` is:

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

## Confirmed Backend Direction

`Echowhy v1` will not start with a separate standalone backend.

The first milestone should be:

- frontend-first
- local-first
- focused on validating the learning loop before infrastructure expansion

## Why This Stack Was Chosen

### TypeScript

Chosen for:

- safer contracts
- clearer AI-output handling
- easier long-term refactoring

### React 19

Chosen for:

- component-driven UI
- strong interactive surface support
- modern React direction for the product

### Vite

Chosen for:

- fast iteration
- low setup friction
- strong fit for a local-first prototype

### TanStack Router

Chosen for:

- type-safe routing
- clean handling of topic, review, and source-aware page flows
- better fit for structured app navigation than a looser routing setup

### TanStack Query

Chosen as a core dependency because the product will need strong async request handling for:

- AI topic generation
- answer evaluation
- review refresh
- topic loading
- later source-aware data loading

It should not be treated as optional in the current direction.

### Zod

Chosen for:

- contract validation
- AI output validation
- local persistence validation
- route/input validation

### React Hook Form + Zod Resolver

Chosen for:

- stable learner input handling
- clean validation wiring
- more maintainable question/answer flows

This should be treated as the default form stack for learner-facing input.

### Tailwind CSS 4

Chosen for:

- rapid UI iteration
- flexible visual tuning
- strong fit for a custom but lightweight interface

### shadcn/ui

Chosen for:

- reusable open-code components
- strong fit for custom design refinement
- faster assembly of calm, clean UI building blocks

## Important Usage Notes

### TanStack Query

Although it is now core, it should still be used with discipline.

Use it for:

- async service state
- loading / error / success flows
- refresh behavior
- cache-aware topic and review requests

Do not use it for:

- purely local UI toggles
- simple presentational state

### React Hook Form

Use it for:

- start-page question input
- answer submission
- follow-up question input
- review answer input

### Zod

Use it to validate:

- generated learning topics
- answer evaluation outputs
- follow-up chain outputs
- locally stored learning records where useful

## What Is Not Confirmed Yet

These areas still require later decisions:

- backend strategy for post-v1 or later phases
- exact local persistence implementation
- exact AI service integration approach
- deployment/distribution strategy

## Current Principle

The stack should support a calm, topic-first, low-visual-burden learning product.

The stack should not pressure the product into becoming:

- dashboard-heavy
- backend-first too early
- infrastructure-heavy before the learning loop is proven
