export const dynamic = "force-dynamic";

import { QuillEditor } from "@/src/components/quill/editor";
import { getWorkspaceDetails } from "@/src/lib/supabase/queries";
import { redirect } from "next/navigation";
import React from "react";

const WorkspaceIdPage = async ({
  params,
}: {
  params: { workspaceId: string };
}) => {
  const { data, error } = await getWorkspaceDetails(params.workspaceId);
  if (error || !data.length) redirect("/dashboard");
  return (
    <div className="relative">
      <QuillEditor
        dirType="workspace"
        fileId={params.workspaceId}
        dirDetails={data[0] || {}}
      />
    </div>
  );
};

export default WorkspaceIdPage;
