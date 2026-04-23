import { createRoute } from "@tanstack/react-router";
import { z } from "zod";
import { rootRoute } from "@/app/routes/__root";
import { GuidedLadderPage } from "@/pages/guided-ladder/GuidedLadderPage";

export const ladderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ladder/$sourceId",
  validateSearch: z.object({
    moduleId: z.string().optional(),
    sourceLabel: z.string().optional(),
    customQuestion: z.string().optional(),
    targetTopicId: z.string().optional(),
  }),
  component: GuidedLadderPage,
});
