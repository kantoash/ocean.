"use client";

import { Progress } from "@/src/components/ui/progress";
import { subscriptionType } from "@/src/lib/supabase/types";
import { useAppState } from "@/src/provider/state-provider";
import { useEffect, useState } from "react";
import { MAX_FOLDERS_FREE_PLAN } from "@/src/lib/constants";
import { useSidebar } from "@/src/lib/hooks/use-sidebar";

interface PlanUsageProps {
  foldersLength: number;
  subscription: subscriptionType | null;
}

export const PlanUsage = ({ foldersLength, subscription }: PlanUsageProps) => {
  const [usagePercentage, setUsagePercentage] = useState(
    (foldersLength / MAX_FOLDERS_FREE_PLAN) * 100
  );
  const { state, workspaceId } = useAppState();
  const { collapsed } = useSidebar();

  useEffect(() => {
    const stateFoldersLength = state.workspaces.find(
      (workspace) => workspace.id === workspaceId
    )?.folders.length;
    if (stateFoldersLength === undefined) return;
    setUsagePercentage((stateFoldersLength / MAX_FOLDERS_FREE_PLAN) * 100);
  }, [state, workspaceId]);

  if (!collapsed) {
    return (
      <>
        {subscription?.status !== "active" && (
          <div className="mt-3 border p-1 rounded-lg">
            <div
              className="flex 
          gap-2
          text
          mb-2
          text-muted-foreground
          items-center
        "
            >
              <div
                className="flex 
        justify-between 
        w-full 
        items-center
        "
              >
                <div>Free Plan</div>
                <small>{usagePercentage.toFixed(0)}% / 100%</small>
              </div>
            </div>

            <Progress value={usagePercentage} className="h-1" />
          </div>
        )}
      </>
    );
  }
};
