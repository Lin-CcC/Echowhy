import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "@/app/routes/__root";
import { GuidedLadderPage } from "@/pages/guided-ladder/GuidedLadderPage";

export const ladderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ladder/$sourceId",
  component: GuidedLadderPage,
});
