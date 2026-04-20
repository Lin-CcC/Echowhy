import { createRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { rootRoute } from '@/app/routes/__root'
import { LearningTopicPage } from '@/pages/learning-topic/LearningTopicPage'

export const topicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/topic/$id',
  validateSearch: z.object({
    angle: z.string().optional(),
    customQuestion: z.string().optional(),
  }),
  component: LearningTopicPage,
})
