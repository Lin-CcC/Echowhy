import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '@/app/routes/__root'
import { LearningLibraryPage } from '@/pages/library/LearningLibraryPage'

export const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/library',
  component: LearningLibraryPage,
})
