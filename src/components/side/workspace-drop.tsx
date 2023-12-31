"use client";

import { Button } from "@/src/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/src/components/ui/command";
import { cn } from "@/src/lib/utils";
import { Check } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SelectedWorkspace } from "./selected-workspace";
import { workspaceType } from "@/src/lib/supabase/types";
import { useAppState } from "@/src/provider/state-provider";
import { useSidebar } from "@/src/lib/hooks/use-sidebar";
import { CreateWorkspace } from "../modal/create-workspace";

interface WorkspaceDropProps {
  privateWorkspaces: workspaceType[] | [];
  sharedWorkspaces: workspaceType[] | [];
  collaboratingWorkspaces: workspaceType[] | [];
  currentWorkspace: workspaceType;
}

export const WorkspaceDrop = ({
  privateWorkspaces,
  sharedWorkspaces,
  collaboratingWorkspaces,
  currentWorkspace,
}: WorkspaceDropProps) => {
  const { dispatch, state } = useAppState();
  const [selectedWorkspace, setSelectedWorkspace] = useState(currentWorkspace);
  const [open, setOpen] = useState(false);
  const { collapsed } = useSidebar();
  const router = useRouter();

  const onSelect = (workspaceId: string) => {
    setOpen(false);
    router.push(`/dashboard/${workspaceId}`);
  };

  useEffect(() => {
    if (!state.workspaces.length) {
      dispatch({
        type: "SET_WORKSPACES",
        payload: {
          workspaces: [
            ...privateWorkspaces,
            ...sharedWorkspaces,
            ...collaboratingWorkspaces,
          ].map((workspace) => ({ ...workspace, folders: [] })),
        },
      });
    }
  }, [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces, dispatch, state.workspaces]);

  useEffect(() => {
    const findSelectedWorkspace = state.workspaces.find(
      (workspace) => workspace.id === currentWorkspace?.id
    );
    if (findSelectedWorkspace) setSelectedWorkspace(findSelectedWorkspace);
  }, [state, currentWorkspace, state.workspaces]);

  if (!collapsed) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className="h-20 p-0"
          >
            <SelectedWorkspace workspace={selectedWorkspace} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 mt-1 ">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search workspace..." />
              <CommandEmpty>No workspace found</CommandEmpty>
              <CommandGroup heading="private">
                {privateWorkspaces.map((workspace) => (
                  <CommandItem
                    key={workspace.id}
                    onSelect={() => onSelect(workspace.id)}
                    className="text-sm"
                  >
                    {workspace.title}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        workspace.id === currentWorkspace?.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="shared">
                {sharedWorkspaces.map((workspace) => (
                  <CommandItem
                    key={workspace.id}
                    onSelect={() => onSelect(workspace.id)}
                    className="text-sm"
                  >
                    {workspace.title}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        workspace.id === currentWorkspace?.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="collaborator">
                {collaboratingWorkspaces.map((workspace) => (
                  <CommandItem
                    key={workspace.id}
                    onSelect={() => onSelect(workspace.id)}
                    className="text-sm"
                  >
                    {workspace.title}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        workspace.id === currentWorkspace?.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <CommandItem >
                  <CreateWorkspace />
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
};
