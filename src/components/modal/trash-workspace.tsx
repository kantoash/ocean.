"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { useAppState, appFolderType } from "@/src/provider/state-provider";
import { FileIcon, FolderIcon } from "lucide-react";
import Link from "next/link";
import { fileType } from "@/src/lib/supabase/types";

export const TrashWorkspace = () => {
  const { state, dispatch, workspaceId } = useAppState();
  const { modal } = state;
  const isModalOpen = modal.isOpen && modal.type === "trashWorkspace";
  const [folders, setFolders] = useState<appFolderType[] | []>([]);
  const [files, setFiles] = useState<fileType[] | []>([]);

  useEffect(() => {
    const stateFolders =
      state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.filter((folder) => folder.inTrash) || [];
    setFolders(stateFolders);

    let stateFiles: fileType[] = [];
    state.workspaces
      .find((workspace) => workspace.id === workspaceId)
      ?.folders.forEach((folder) => {
        folder.files.forEach((file) => {
          if (file.inTrash) {
            stateFiles.push(file);
          }
        });
      });
    setFiles(stateFiles);
  }, [state, workspaceId]);

  const onCloseModal = () => {
    dispatch({
      type: "SET_MODAL",
      payload: {
        type: null,
        isOpen: false,
      },
    });
  };
  return (
    <Dialog open={isModalOpen} onOpenChange={onCloseModal}>
      <DialogContent className="rounded-md w-[350px] max-h-[400px] sm:w-full overflow-y-auto ">
        <DialogHeader className="pt-2 mb-12 ">
          <DialogTitle className="text-2xl font-medium">
            Trash Workspace
          </DialogTitle>
        </DialogHeader>
        <section>
          {!!folders.length && (
            <div>
              <h3>Folders</h3>
              {folders.map((folder) => (
                <Link
                  className="mt-1 hover:bg-muted
                    rounded-md
                    p-2
                    flex
                    item-center
                    justify-between"
                  href={`/dashboard/${folder.workspaceId}/${folder.id}`}
                  key={folder.id}
                >
                  <article>
                    <aside className="flex items-center gap-2">
                      <FolderIcon />
                      {folder.title}
                    </aside>
                  </article>
                </Link>
              ))}
            </div>
          )}
          {!!files.length && (
            <div className="mt-2">
              <h3>Files</h3>
              {files.map((file) => (
                <Link
                  key={file.id}
                  className="mt-1 hover:bg-muted rounded-md p-2 flex items-center justify-between"
                  href={`/dashboard/${file.workspaceId}/${file.folderId}/${file.id}`}
                >
                  <article>
                    <aside className="flex items-center gap-2">
                      <FileIcon />
                      {file.title}
                    </aside>
                  </article>
                </Link>
              ))}
            </div>
          )}
          {!files.length && !folders.length && (
            <div
              className="
          text-muted-foreground
          absolute
          top-[50%]
          left-[50%]
          transform
          -translate-x-1/2
          -translate-y-1/2

      "
            >
              No Items in trash
            </div>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
};
