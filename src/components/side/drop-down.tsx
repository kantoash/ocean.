"use client";

import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useAppState } from "@/src/provider/state-provider";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import clsx from "clsx";
import { Input } from "../ui/input";
import { ActionTooltip } from "../ui/action-tooltip";
import { PlusIcon, Trash } from "lucide-react";
import { v4 } from "uuid";
import { fileType } from "@/src/lib/supabase/types";
import { useToast } from "../ui/use-toast";
import { useUser } from "@/src/provider/use-user";
import {
  createFile,
  updateFile,
  updateFolder,
} from "@/src/lib/supabase/mutation";

interface DropdownProps {
  title: string;
  id: string;
  listType: "folder" | "file";
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Dropdown = ({
  title,
  id,
  listType,
  children,
  disabled,
  ...props
}: DropdownProps) => {
  const { state, dispatch, workspaceId, folderId } = useAppState();
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { workspaces } = state;
  const isFolder = listType === "folder";
  const isFile = listType === "file";

  //folder Title synced with server data and local
  const folderTitle: string | undefined = useMemo(() => {
    if (isFolder) {
      const stateTitle = workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === id)?.title;
      if (title === stateTitle || !stateTitle) return title;
      return stateTitle;
    }
  }, [workspaceId, id, title, isFolder,workspaces]);

  //fileItitle
  const fileTitle: string | undefined = useMemo(() => {
    if (isFile) {
      const fileAndFolderId = id.split("folder");
      const stateTitle = workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === fileAndFolderId[0])
        ?.files.find((file) => file?.id === fileAndFolderId[1])?.title;
      if (title === stateTitle || !stateTitle) {
        return title;
      }
    }
  }, [workspaceId, id, title, isFile, workspaces]);

  const folderTitleChange = (e: any) => {
    if (!workspaceId) return;
    const fid = id.split("folder");
    if (fid.length === 1) {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          folder: { title: e.target.value },
          folderId: fid[0],
          workspaceId,
        },
      });
    }
  };

  const fileTitleChange = (e: any) => {
    if (!workspaceId || !folderId) return;
    const fid = id.split("folder");
    if (fid.length === 2 && fid[1]) {
      dispatch({
        type: "UPDATE_FILE",
        payload: {
          file: { title: e.target.value },
          folderId,
          workspaceId,
          fileId: fid[1],
        },
      });
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = async () => {
    if (!isEditing) return;
    setIsEditing(false);
    const fId = id.split("folder");
    if (fId?.length === 1) {
      if (!folderTitle) return;
      toast({
        variant: "default",
        description: "Folder title changed.",
      });
      await updateFolder({ title }, fId[0]);
    }

    if (fId.length === 2 && fId[1]) {
      if (!fileTitle) return;
      const { error } = await updateFile({ title: fileTitle }, fId[1]);
      if (error) {
        toast({
          variant: "destructive",
          description: "Could not update the title for this file",
        });
      } else {
        toast({
          variant: "default",
          description: "File title changed.",
        });
      }
    }
  };

  //Navigate the user to a different page
  const navigatatePage = (accordionId: string, type: string) => {
    if (type === "folder") {
      router.push(`/dashboard/${workspaceId}/${accordionId}`);
    }
    if (type === "file") {
      router.push(
        `/dashboard/${workspaceId}/${folderId}/${
          accordionId.split("folder")[1]
        }`
      );
    }
  };

  //move to trash
  const moveToTrash = async () => {
    if (!user?.email || !workspaceId) return;
    const pathId = id.split("folder");
    if (listType === "folder") {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          folder: { inTrash: `Deleted by ${user?.email}` },
          folderId: pathId[0],
          workspaceId,
        },
      });
      const { data, error } = await updateFolder(
        { inTrash: `Deleted by ${user?.email}` },
        pathId[0]
      );
      if (error) {
        toast({
          variant: "destructive",
          description: "Could not move the folder to trash",
        });
      } else {
        toast({
          variant: "default",
          description: "Moved folder to trash",
        });
      }
    }

    if (listType === "file") {
      dispatch({
        type: "UPDATE_FILE",
        payload: {
          file: { inTrash: `Deleted by ${user?.email}` },
          folderId: pathId[0],
          workspaceId,
          fileId: pathId[1],
        },
      });
      const { data, error } = await updateFile(
        { inTrash: `Deleted by ${user?.email}` },
        pathId[1]
      );
      if (error) {
        toast({
          variant: "destructive",
          description: "Could not move the file to trash",
        });
      } else {
        toast({
          variant: "default",
          description: "Moved file to trash",
        });
      }
    }
  };

  const addNewFile = async () => {
    if (!workspaceId) return;
    const fileId = v4();
    const newFile: fileType = {
      folderId: id,
      data: null,
      createdAt: new Date().toISOString(),
      inTrash: null,
      title: "Untitled",
      id: fileId,
      workspaceId,
      bannerUrl: "",
    };
    dispatch({
      type: "ADD_FILE",
      payload: { file: newFile, folderId: id, workspaceId },
    });
    const { error } = await createFile(newFile);
    if (error) {
      toast({
        variant: "destructive",
        description: "Could not create a file",
      });
    } else {
      toast({
        variant: "default",
        description: "File created.",
      });
    }
  };

  const listStyles = useMemo(
    () =>
      clsx("relative", {
        "border-none text-md": isFolder,
        "border-none ml-6 text-[16px] py-1": !isFolder,
      }),
    [isFolder]
  );

  const groupIdentifies = clsx(
    "dark:text-white whitespace-nowrap flex justify-between items-center w-full relative",
    {
      "group/folder": isFolder,
      "group/file": !isFolder,
    }
  );

  return (
    <AccordionItem
      value={id}
      className={listStyles}
      onClick={(e) => {
        e.stopPropagation();
        navigatatePage(id, listType);
      }}
    >
      <AccordionTrigger
        id={listType}
        className="hover:no-underline p-2 dark:text-white "
        disabled={isFile}
      >
        <div className={groupIdentifies}>
          <div
            className="flex 
          gap-4 
          items-center 
          justify-center 
          overflow-hidden"
          >
            <Input
              type="text"
              value={listType === "folder" ? folderTitle : fileTitle}
              className={clsx(
                "outline-none overflow-hidden w-[140px] text-Neutrals/neutrals-7",
                {
                  "bg-muted cursor-text": isEditing,
                  "bg-transparent cursor-pointer": !isEditing,
                }
              )}
              readOnly={!isEditing}
              onDoubleClick={handleDoubleClick}
              onBlur={handleBlur}
              onChange={isFolder ? folderTitleChange : fileTitleChange}
            />
          </div>
          <div className="flex items-center justify-center gap-2 ">
            <ActionTooltip label="Delete Folder">
              <Trash
                onClick={moveToTrash}
                size={18}
                className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors"
              />
            </ActionTooltip>
            {isFolder && !isEditing && (
              <ActionTooltip label="Add File">
                <PlusIcon
                  onClick={addNewFile}
                  size={18}
                  className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors"
                />
              </ActionTooltip>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {workspaces
          .find((workspace) => workspace.id === workspaceId)
          ?.folders.find((folder) => folder.id === id)
          ?.files.filter((file) => !file.inTrash)
          .map((file) => {
            const customFileId = `${id}folder${file.id}`;
            return (
              <Dropdown
                key={file.id}
                title={file.title}
                listType="file"
                id={customFileId}
              />
            );
          })}
      </AccordionContent>
    </AccordionItem>
  );
};
