import { createRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { rootRoute } from '@/app/routes/__root'
import { ReviewPage } from '@/pages/review/ReviewPage'

export const reviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/review',
  validateSearch: z.object({
    filter: z
      .enum(['weak', 'unanswered', 'pending', 'bookmarked', 'skipped'])
      .optional(),
    analysisDimension: z
      .enum([
        'target-fit',
        'conceptual-accuracy',
        'causal-link',
        'grounding',
        'calibration',
      ])
      .optional(),
    topicId: z.string().optional(),
    angleId: z.string().optional(),
    source: z.enum(['locator', 'analyze']).optional(),
    sourceLabel: z.string().optional(),
    sourceDetail: z.string().optional(),
  }),
  component: ReviewPage,
})
