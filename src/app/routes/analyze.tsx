import { createRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { rootRoute } from '@/app/routes/__root'
import { AnalyzePage } from '@/pages/analyze/AnalyzePage'

const analysisDimensionSchema = z.enum([
  'target-fit',
  'conceptual-accuracy',
  'causal-link',
  'grounding',
  'calibration',
])

export const analyzeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analyze',
  validateSearch: z.object({
    tab: z.enum(['global', 'chapters', 'behavior']).optional(),
    topicId: z.string().optional(),
    angleId: z.string().optional(),
    analysisDimension: analysisDimensionSchema.optional(),
  }),
  component: AnalyzePage,
})
