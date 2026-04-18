import { createRouter } from '@tanstack/react-router'
import { rootRoute } from '@/app/routes/__root'
import { indexRoute } from '@/app/routes'
import { topicRoute } from '@/app/routes/topic.$id'
import { libraryRoute } from '@/app/routes/library'
import { reviewRoute } from '@/app/routes/review'

const routeTree = rootRoute.addChildren([
  indexRoute,
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
