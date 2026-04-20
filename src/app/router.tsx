import { createRouter } from '@tanstack/react-router'
import { rootRoute } from '@/app/routes/__root'
import { indexRoute } from '@/app/routes'
import { topicRoute } from '@/app/routes/topic.$id'
import { libraryRoute } from '@/app/routes/library'
import { reviewRoute } from '@/app/routes/review'
import { ladderRoute } from '@/app/routes/ladder.$sourceId'

const routeTree = rootRoute.addChildren([
  indexRoute,
  ladderRoute,
  topicRoute,
  libraryRoute,
  reviewRoute,
])

export const router = createRouter({
  routeTree,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
