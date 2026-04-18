import type { GuidedQuestion } from '@/features/guided-ladder/components/guided-question-bubbles'

export const guidedQuestions: GuidedQuestion[] = [
  {
    id: 'guided-request-flow',
    label: 'How does the main request flow move through this project?',
    topicId: 'topic-login-jwt',
  },
  {
    id: 'guided-core-logic',
    label: 'Which module carries the core logic here?',
    topicId: 'topic-login-jwt',
  },
  {
    id: 'guided-easiest-start',
    label: 'What part of this project is easiest to understand first?',
    topicId: 'topic-login-jwt',
  },
]
