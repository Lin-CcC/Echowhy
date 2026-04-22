import { createRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { rootRoute } from '@/app/routes/__root'
import { ReviewPage } from '@/pages/review/ReviewPage'

export const reviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/review',
  validateSearch: z.object({
    filter: z
      .enum(['weak', 'unanswered', 'pending', 'bookmarked'])
      .optional(),
    topicId: z.string().optional(),
    angleId: z.string().optional(),
    source: z.enum(['locator']).optional(),
  }),
  component: ReviewPage,
})
