import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '@/app/routes/__root'
import { StartPage } from '@/pages/start/StartPage'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: StartPage,
})
