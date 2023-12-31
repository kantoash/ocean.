export const dynamic = 'force-dynamic';

import { QuillEditor } from '@/src/components/quill/editor';
import { getFolderDetails } from '@/src/lib/supabase/queries';
import { redirect } from 'next/navigation';
import React from 'react'


interface FolderPageProps {
    params: {
      folderId: string;
      workspaceId: string
    }
  }

const FolderIdPage = async ({ params }: FolderPageProps) => {
    const { data, error } = await getFolderDetails(params.folderId);
    if (error || !data.length) redirect(`/dashboard/${params.workspaceId}`);
  
    return (
      <div className="relative ">
        <QuillEditor
          dirType="folder"
          fileId={params.folderId}
          dirDetails={data[0] || []}
        />
      </div>
    );
}

export default FolderIdPage