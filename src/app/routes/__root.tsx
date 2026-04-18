import { createRootRoute } from '@tanstack/react-router'
import { PageShell } from '@/features/navigation/components/page-shell'

export const rootRoute = createRootRoute({
  component: PageShell,
})
