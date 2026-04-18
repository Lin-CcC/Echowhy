import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '@/app/routes/__root'
import { ReviewPage } from '@/pages/review/ReviewPage'

export const reviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/review',
  component: ReviewPage,
})
