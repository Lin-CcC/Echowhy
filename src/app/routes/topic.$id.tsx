import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '@/app/routes/__root'
import { LearningTopicPage } from '@/pages/learning-topic/LearningTopicPage'

export const topicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/topic/$id',
  component: LearningTopicPage,
})
