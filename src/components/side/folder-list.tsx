"use client";

import { folderType } from "@/src/lib/supabase/types";
import { PlusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ActionTooltip } from "@/src/components/ui/action-tooltip";
import { v4 } from "uuid";
import { createFolder } from "@/src/lib/supabase/mutation";
import { useAppState } from "@/src/provider/state-provider";
import { MAX_FOLDERS_FREE_PLAN } from "@/src/lib/constants";
import { useUser } from "@/src/provider/use-user";
import { useToast } from "../ui/use-toast";
import { Accordion } from "../ui/accordion";
import { Dropdown } from "./drop-down";
import useSupabaseRealtime from "@/src/lib/hooks/useSupabaseRealtime";
import { useSidebar } from "@/src/lib/hooks/use-sidebar";
import { useSubscriptionModal } from "@/src/provider/subscription-modal-provider";

interface FoldersListProps {
  workspaceFolders: folderType[];
  workspaceId: string;
}

export const FolderList = ({
  workspaceFolders,
  workspaceId,
}: FoldersListProps) => {
  useSupabaseRealtime()
  const { toast } = useToast();
  const { setOpen } = useSubscriptionModal();
  const { state, dispatch, folderId } = useAppState();
  const [folders, setFolders] = useState(workspaceFolders);
  const { subscription } = useUser();
  const { collapsed } = useSidebar()
  const { workspaces } = state;

  useEffect(() => {
    if (folders?.length > 0 && workspaceId) {
      dispatch({
        type: "SET_FOLDERS",
        payload: {
          workspaceId,
          folders: folders.map((folder) => ({
            ...folder,
            files:
              workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.folders.find((f) => f.id === folder.id)?.files || [],
          })),
        },
      });
    }
  }, [workspaceFolders, workspaceId]);

  useEffect(() => {
    setFolders(
      workspaces.find((workspace) => workspace.id === workspaceId)?.folders ||
        []
    );
  }, [state]);

  const addFolderHandler = async () => {
    if (!workspaceId) {
      return;
    }
    if (
      folders?.length! >= MAX_FOLDERS_FREE_PLAN &&
      subscription?.status !== "active"
    ) {
      setOpen(true);
      return;
    }
    const folderId = v4();

    const newFolder: folderType = {
      data: null,
      id: folderId,
      createdAt: new Date().toISOString(),
      title: "Untitled",
      inTrash: null,
      workspaceId,
      bannerUrl: "",
    };
    dispatch({
      type: "ADD_FOLDER",
      payload: { workspaceId, folder: { ...newFolder, files: [] } },
    });
    const { error } = await createFolder(newFolder);

    if (error) {
      toast({
        variant: "destructive",
        description: "Could not create the folder",
      });
    } else {
      toast({
        variant: "default",
        description: "Created folder.",
      });
    }
  };

 if(!collapsed){
  return (
    <>
      <div
        className="flex
    sticky 
    z-20 
    top-0 
    bg-background 
    w-full  
    h-10 
    group/title 
    justify-between 
    items-center 
    pr-4 
    text-Neutrals/neutrals-8
"
      >
        <span
          className="text-Neutrals-8 
    font-bold 
    text-xs"
        >
          FOLDERS
        </span>
        <ActionTooltip label="Create Folder">
          <PlusIcon
            onClick={addFolderHandler}
            size={20}
            className="group-hover/title:inline-block
        hidden 
        cursor-pointer
        hover:dark:text-white
      "
          />
        </ActionTooltip>
      </div>
      <Accordion
        type="multiple"
        defaultValue={[folderId || ""]}
        className="pb-20"
      >
        {folders
          .filter((folder) => !folder.inTrash)
          .map((folder) => (
            <Dropdown
              key={folder.id}
              title={folder.title}
              listType="folder"
              id={folder.id}
            />
          ))}
      </Accordion>
    </>
  );
 }
};
