# Echowhy V1 Mock Data Examples

## Purpose

This document provides sample v1 data shaped according to the current contracts.

It helps with:

- early UI development
- page wiring
- validating whether contracts feel practical
- making future implementation less abstract

The examples here use the RBAC login/authentication topic as the pilot case.

## 1. Knowledge Source Example

```ts
const knowledgeSource = {
  id: 'source-rbac',
  name: 'RBAC Learning Project',
  type: 'repository',
  rootPath: 'F:/code/rbac',
  summary: 'A learning-focused RBAC repository with React frontend and Spring Boot backend.',
  status: 'active',
  createdAt: '2026-04-18T00:00:00.000Z',
  updatedAt: '2026-04-18T00:00:00.000Z',
}
```

## 1b. Virtual Source Example

```ts
const virtualSource = {
  id: 'source-external-search',
  name: 'External Search',
  type: 'external-search',
  summary: 'A virtual source context used when no user-imported files are attached yet.',
  status: 'active',
  createdAt: '2026-04-18T00:00:00.000Z',
  updatedAt: '2026-04-18T00:00:00.000Z',
}
```

## 2. Learning Topic Example

```ts
const learningTopic = {
  id: 'topic-login-jwt',
  sourceId: 'source-rbac',
  title: 'Why login does not rely on JWT verification',
  rootQuestion: 'Why is identity verified by username and password at login time instead of by JWT?',
  goal: 'Understand how login verification, JWT generation, and later authenticated requests differ in role.',
  status: 'active',
  understandingLevel: 'emerging',
  lastStudiedAt: '2026-04-18T01:20:00.000Z',
  reviewPriority: 'high',
  reviewReason: 'This topic is central to authentication flow and includes a deep follow-up chain.',
  currentChainNodeId: 'q-auth-service-check',
  manualPriority: 'high',
  calculatedValue: 88,
}
```

## 3. Explanation Blocks Example

```ts
const explanationBlocks = [
  {
    id: 'exp-1',
    topicId: 'topic-login-jwt',
    title: 'What the login step is really doing',
    content:
      'At login time, the backend has not issued a token yet. So it cannot use JWT to confirm identity. It must first verify raw credentials against stored user data.',
    order: 1,
  },
  {
    id: 'exp-2',
    topicId: 'topic-login-jwt',
    title: 'When JWT appears in the flow',
    content:
      'JWT appears only after the backend has decided the user is valid. It is a result of successful login, not the original proof used to gain access.',
    order: 2,
  },
  {
    id: 'exp-3',
    topicId: 'topic-login-jwt',
    title: 'Why later requests are different',
    content:
      'Once login succeeds, later protected requests can rely on JWT because the backend already issued and signed the token as proof of a past successful authentication.',
    order: 3,
  },
]
```

## 4. Learning Angles Example

```ts
const learningAngles = [
  {
    id: 'angle-request-flow',
    topicId: 'topic-login-jwt',
    title: 'Request flow',
    description: 'Trace the login request from controller to service to database to JWT generation.',
    isCustom: false,
  },
  {
    id: 'angle-role-separation',
    topicId: 'topic-login-jwt',
    title: 'Responsibility split',
    description: 'Understand why Controller, Service, Mapper, and JwtService each do different jobs.',
    isCustom: false,
  },
  {
    id: 'angle-jwt-timing',
    topicId: 'topic-login-jwt',
    title: 'JWT timing',
    description: 'Focus on why JWT is generated after verification instead of before it.',
    isCustom: false,
  },
  {
    id: 'angle-custom-followup',
    topicId: 'topic-login-jwt',
    title: 'My own question',
    description: 'Continue with a follow-up question from your own curiosity.',
    isCustom: true,
  },
]
```

## 5. Topic Questions Example

```ts
const topicQuestions = [
  {
    id: 'q-root-login-jwt',
    topicId: 'topic-login-jwt',
    prompt: 'Why is identity checked by username and password during login instead of by JWT?',
    nodeType: 'root',
    createdAt: '2026-04-18T01:00:00.000Z',
    manualPriority: 'high',
    calculatedValue: 90,
  },
  {
    id: 'q-controller-role',
    topicId: 'topic-login-jwt',
    angleId: 'angle-role-separation',
    prompt: 'Why does the login request first enter the Controller instead of the Service directly?',
    parentQuestionId: 'q-root-login-jwt',
    nodeType: 'system',
    createdAt: '2026-04-18T01:03:00.000Z',
  },
  {
    id: 'q-auth-service-check',
    topicId: 'topic-login-jwt',
    angleId: 'angle-role-separation',
    prompt: 'Why is credential checking placed in AuthService rather than inside the Controller?',
    parentQuestionId: 'q-controller-role',
    nodeType: 'system',
    createdAt: '2026-04-18T01:05:00.000Z',
    calculatedValue: 82,
  },
  {
    id: 'q-why-jwt-later',
    topicId: 'topic-login-jwt',
    angleId: 'angle-jwt-timing',
    prompt: 'What changes after login that makes JWT usable for later requests?',
    parentQuestionId: 'q-root-login-jwt',
    nodeType: 'system',
    createdAt: '2026-04-18T01:06:00.000Z',
    calculatedValue: 80,
  },
  {
    id: 'q-password-hash-followup',
    topicId: 'topic-login-jwt',
    angleId: 'angle-custom-followup',
    prompt: 'If passwords were stored as hashes, how would the verification step change?',
    parentQuestionId: 'q-auth-service-check',
    nodeType: 'learner',
    createdAt: '2026-04-18T01:12:00.000Z',
    manualPriority: 'medium',
    calculatedValue: 76,
  },
]
```

## 6. Source References Example

```ts
const sourceReferences = [
  {
    id: 'ref-auth-controller',
    topicId: 'topic-login-jwt',
    sourceId: 'source-rbac',
    referencePath: 'server/src/main/java/com/example/rbac/auth/AuthController.java',
    label: 'AuthController login endpoint',
    snippet:
      '@PostMapping("/login") public LoginResponse login(@Valid @RequestBody LoginRequest request) { ... }',
    startLine: 19,
    endLine: 22,
  },
  {
    id: 'ref-auth-service',
    topicId: 'topic-login-jwt',
    sourceId: 'source-rbac',
    referencePath: 'server/src/main/java/com/example/rbac/auth/AuthService.java',
    label: 'AuthService credential verification',
    snippet:
      'if (user == null || !user.isEnabled() || !user.getPassword().equals(password)) { throw new InvalidCredentialsException(...); }',
    startLine: 19,
    endLine: 25,
  },
  {
    id: 'ref-jwt-service',
    topicId: 'topic-login-jwt',
    sourceId: 'source-rbac',
    referencePath: 'server/src/main/java/com/example/rbac/auth/JwtService.java',
    label: 'JwtService token generation',
    snippet:
      'return Jwts.builder().subject(user.getUsername()).claim("userId", user.getId())...',
    startLine: 29,
    endLine: 38,
  },
]
```

## 7. Answer Attempt Example

```ts
const answerAttempt = {
  id: 'answer-1',
  topicId: 'topic-login-jwt',
  questionId: 'q-root-login-jwt',
  answer:
    'Because JWT has not been created yet during login. The backend must first compare username and password with stored user data. Only after that can it generate a JWT for later requests.',
  createdAt: '2026-04-18T01:10:00.000Z',
}
```

## 8. AI Feedback Example

```ts
const aiFeedback = {
  id: 'feedback-1',
  answerAttemptId: 'answer-1',
  score: 84,
  level: 'good',
  correctPoints: [
    'You correctly identified that JWT does not exist yet at the moment of login.',
    'You correctly separated credential verification from later token-based access.',
  ],
  vaguePoints: [
    'You did not clearly explain why later requests can trust the JWT once it has been issued.',
  ],
  missingPoints: [
    'You did not mention that the backend itself signs the token after successful authentication.',
  ],
  nextSuggestion:
    'Try explaining the difference between “raw login proof” and “server-issued proof of past authentication.”',
}
```

## 9. Review State Example

```ts
const reviewState = {
  topicId: 'topic-login-jwt',
  lastReviewedAt: '2026-04-18T01:30:00.000Z',
  nextReviewAt: '2026-04-19T09:00:00.000Z',
  reviewCount: 1,
  priority: 'high',
  priorityReason: 'High-value authentication topic with active follow-up chain and partial understanding.',
}
```

## 10. Follow-up Chain View Example

```ts
const followUpChainView = {
  topicId: 'topic-login-jwt',
  nodes: [
    {
      id: 'q-root-login-jwt',
      label: 'Why isn’t JWT used at login?',
      nodeType: 'root',
    },
    {
      id: 'q-controller-role',
      label: 'Why Controller first?',
      nodeType: 'system',
    },
    {
      id: 'q-auth-service-check',
      label: 'Why check in AuthService?',
      nodeType: 'system',
      isCurrent: true,
    },
    {
      id: 'q-why-jwt-later',
      label: 'Why is JWT usable later?',
      nodeType: 'system',
    },
    {
      id: 'q-password-hash-followup',
      label: 'What if passwords were hashed?',
      nodeType: 'learner',
    },
  ],
  edges: [
    {
      from: 'q-root-login-jwt',
      to: 'q-controller-role',
    },
    {
      from: 'q-controller-role',
      to: 'q-auth-service-check',
    },
    {
      from: 'q-root-login-jwt',
      to: 'q-why-jwt-later',
    },
    {
      from: 'q-auth-service-check',
      to: 'q-password-hash-followup',
    },
  ],
}
```

## 11. Topic Generation Result Example

```ts
const topicGenerationResult = {
  topic: learningTopic,
  explanationBlocks,
  learningAngles,
  questions: topicQuestions,
  references: sourceReferences,
}
```

## 12. Answer Evaluation Result Example

```ts
const answerEvaluationResult = {
  feedback: aiFeedback,
  suggestedFollowUps: [
    {
      id: 'q-followup-proof-types',
      topicId: 'topic-login-jwt',
      angleId: 'angle-jwt-timing',
      prompt: 'How would you explain the difference between a login credential and a JWT in one sentence each?',
      parentQuestionId: 'q-root-login-jwt',
      nodeType: 'system',
      createdAt: '2026-04-18T01:11:00.000Z',
    },
  ],
}
```

## 13. Chain Extension Result Example

```ts
const chainExtensionResult = {
  newQuestion: {
    id: 'q-followup-proof-types',
    topicId: 'topic-login-jwt',
    angleId: 'angle-jwt-timing',
    prompt: 'How would you explain the difference between a login credential and a JWT in one sentence each?',
    parentQuestionId: 'q-root-login-jwt',
    nodeType: 'system',
    createdAt: '2026-04-18T01:11:00.000Z',
  },
  relatedAngleId: 'angle-jwt-timing',
}
```

## Suggested Usage Order During UI Development

Use mock data in this order:

1. render `Start` with active source and continuation shortcuts
2. render `Learning Unit` using:
   - `learningTopic`
   - `explanationBlocks`
   - `learningAngles`
   - `topicQuestions`
   - `sourceReferences`
3. render feedback using:
   - `answerAttempt`
   - `aiFeedback`
4. render `Learning Library` using:
   - `learningTopic`
   - `reviewState`
5. render the follow-up chain using:
   - `followUpChainView`

## Recommended Next Step

After these mock examples, the next practical step is:

- define the app scaffold plan

or:

- begin implementing the actual prototype structure
