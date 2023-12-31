export const dynamic = "force-dynamic";

import { QuillEditor } from "@/src/components/quill/editor";
import { getFileDetails } from "@/src/lib/supabase/queries";
import { redirect } from "next/navigation";
import React from "react";

interface FilePageProps {
  params: {
    fileId: string;
    folderId: string;
    workspaceId: string;
  };
}

const FileIdPage = async ({ params }: FilePageProps) => {
  const { data, error } = await getFileDetails(params.fileId);
  if (error) redirect(`/dashboard/${params.workspaceId}/${params.folderId}`);

  return (
    <div className="relative ">
      <QuillEditor
        dirType="file"
        fileId={params.fileId}
        dirDetails={data[0] || []}
      />
      file page
    </div>
  );
};

export default FileIdPage;
