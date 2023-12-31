"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { useAppState } from "@/src/provider/state-provider";
import { Label } from "@/src/components/ui/label";
import { userType, workspaceType } from "@/src/lib/supabase/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Lock, Plus, Share } from "lucide-react";
import {
  updateWorkspace,
  addCollaborators,
  deleteWorkspace,
  removeCollaborators,
} from "@/src/lib/supabase/mutation";
import { getCollaborators } from "@/src/lib/supabase/queries";
import { useRouter } from "next/navigation";
import { CollaboratorSearch } from "../side/collaborator-search";
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Input } from "@/src/components/ui/input";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { v4 } from "uuid";
import { useUser } from "@/src/provider/use-user";
import { useToast } from "../ui/use-toast";
import { MAX_COLLABORATOR_FREE_PLAN } from "@/src/lib/constants";
import { useSubscriptionModal } from "@/src/provider/subscription-modal-provider";

export const SettingWorkspace = () => {
  const router = useRouter();
  const { setOpen } = useSubscriptionModal();
  const { state, dispatch, workspaceId } = useAppState();
  const { toast } = useToast();
  const { subscription } = useUser();
  const { modal } = state;
  const isModalOpen = modal.isOpen && modal.type === "settingWorkspace";
  const supabase = createClientComponentClient();
  const [openAlertMessage, setOpenAlertMessage] = useState(false);
  const [collaborators, setCollaborators] = useState<userType[]>([]);
  const [permissions, setPermissions] = useState("private");
  const titleTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [workspaceDetails, setWorkspaceDetails] = useState<workspaceType>();

  const workspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !e.target.value) return;
    dispatch({
      type: "UPDATE_WORKSPACE",
      payload: { workspace: { title: e.target.value }, workspaceId },
    });
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(async () => {
      await updateWorkspace({ title: e.target.value }, workspaceId);
    }, 500);
  };

  const onChangeWorkspaceLogo = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!workspaceId) return;
    const file = e.target.files?.[0];
    const uuid = v4();
    if (!file) return;

    setUploadingLogo(true);
    const { data, error } = await supabase.storage
      .from("workspace-logos")
      .update(`workspaceLogo-${uuid}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (!error) {
      dispatch({
        type: "UPDATE_WORKSPACE",
        payload: { workspace: { logo: data.path }, workspaceId },
      });
      await updateWorkspace({ logo: data.path }, workspaceId);
      setUploadingLogo(false);
    }
  };

  const addCollaborator = async (profile: userType) => {
    if (!workspaceId) return;

    if (
      subscription?.status !== "active" &&
      collaborators.length >= MAX_COLLABORATOR_FREE_PLAN
    ) {
      setOpen(true);
      return;
    }
    await addCollaborators([profile], workspaceId);
    setCollaborators([...collaborators, profile]);
  };

  const onClose = () => {
    dispatch({
      type: "SET_MODAL",
      payload: {
        type: null,
        isOpen: false,
      },
    });
  };

  const removeCollaborator = async (user: userType) => {
    if (!workspaceId) return;
    if (collaborators.length === 1) {
      setPermissions("private");
    }
    await removeCollaborators([user], workspaceId);
    setCollaborators(
      collaborators.filter((collaborator) => collaborator.id !== user.id)
    );
    router.refresh();
  };

  const workspaceDelete = async () => {
    if (!workspaceId) return;
    try {
      await deleteWorkspace(workspaceId);
      toast({
        variant: "default",
        description: "Successfully deleted your workspae",
      });
      dispatch({ type: "DELETE_WORKSPACE", payload: workspaceId });

      router.push("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Could not delete the workspace",
      });
    } finally {
      onClose();
    }
  };
  const onClickAlertConfirm = async () => {
    if (!workspaceId) return;
    if (collaborators.length > 0) {
      await removeCollaborators(collaborators, workspaceId);
    }
    setPermissions("private");
    setOpenAlertMessage(false);
  };

  const onPermissionsChange = (val: string) => {
    if (val === "private") {
      setOpenAlertMessage(true);
    } else setPermissions(val);
  };

  useEffect(() => {
    const showingWorkspace = state.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );
    if (showingWorkspace) setWorkspaceDetails(showingWorkspace);
  }, [workspaceId, state]);

  useEffect(() => {
    if (!workspaceId) return;
    const fetchCollaborators = async () => {
      const response = await getCollaborators(workspaceId);
      if (response.length) {
        setPermissions("shared");
        setCollaborators(response);
      }
    };
    fetchCollaborators();
  }, [workspaceId]);

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-md w-[350px] sm:w-full ">
        <DialogHeader className="pt-2 mb-12 ">
          <DialogTitle className="text-2xl font-medium">
            Setting Workspace
          </DialogTitle>
        </DialogHeader>
        {/* update here */}
        <div className="flex flex-col gap-3">
          <div>
            <Label
              htmlFor="workspaceLogo"
              className="text-sm text-muted-foreground"
            >
              Workspace logo
            </Label>
            <Input
              id="workspaceLogo"
              type="file"
              placeholder="Workspace logo"
              accept="image/*"
              onChange={onChangeWorkspaceLogo}
              disabled={uploadingLogo}
            />
          </div>
          <div>
            <Input
              id="workspaceName"
              type="text"
              placeholder="Workspace Name"
              value={workspaceDetails?.title ? workspaceDetails.title : ""}
              onChange={workspaceNameChange}
            />
          </div>
        </div>
        <div>
          <div className="flex gap-4 flex-col">
            <Label
              htmlFor="permissions"
              className="text-sm
        text-muted-foreground"
            >
              Permission
            </Label>
            <Select onValueChange={onPermissionsChange} value={permissions}>
              <SelectTrigger className="w-full h-26 -mt-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="private">
                    <div
                      className="p-2
                flex
                gap-4
                justify-center
                items-center
              "
                    >
                      <Lock />
                      <article className="text-left flex flex-col">
                        <span>Private</span>
                        <p>
                          Your workspace is private to you. You can choose to
                          share it later.
                        </p>
                      </article>
                    </div>
                  </SelectItem>
                  <SelectItem value="shared">
                    <div className="p-2 flex gap-4 justify-center items-center">
                      <Share />
                      <article className="text-left flex flex-col">
                        <span>Shared</span>
                        <span>You can invite collaborators.</span>
                      </article>
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {/* // to do change avatar image */}
          {permissions === "shared" && (
            <div>
              <CollaboratorSearch
                existingCollaborators={collaborators}
                getCollaborator={(user) => {
                  addCollaborator(user);
                }}
              >
                <Button type="button" className="text-sm mt-4">
                  <Plus />
                  Add Collaborators
                </Button>
              </CollaboratorSearch>
              <div className="mt-4">
                <span className="text-sm text-muted-foreground">
                  Collaborators {collaborators.length || ""}
                </span>
                <ScrollArea
                  className="
          h-[180px]
          overflow-y-scroll
          w-full
          rounded-md
          border
          border-muted-foreground/20"
                >
                  {collaborators.length ? (
                    collaborators.map((c) => (
                      <div
                        className="p-4 flex
                    justify-between
                    items-center
              "
                        key={c.id}
                      >
                        <div className="flex gap-4 items-center">
                          <Avatar
                            className=" 
                    bg-background 
                    border-2 
                    flex 
                    items-center 
                    justify-center 
                    border-white 
                    h-8 
                    w-8 
                    rounded-full"
                          >
                            <AvatarImage src={c.image || "/placeholder.jpg"} />
                            <AvatarFallback>
                              {c.email.substring(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className="text-sm 
                        gap-2
                        text-muted-foreground
                        overflow-hidden
                        overflow-ellipsis
                        sm:w-[300px]
                        w-[140px]
                      "
                          >
                            {c.email}
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => removeCollaborator(c)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div
                      className="absolute
                right-0 left-0
                top-0
                bottom-0
                flex
                justify-center
                items-center
              "
                    >
                      <span className="text-muted-foreground text-sm">
                        You have no collaborators
                      </span>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
        <Alert>
          <AlertDescription>
            Warning! deleting you workspace will permanantly delete all data
            related to this workspace.
          </AlertDescription>
          <Button
            type="submit"
            size={"sm"}
            variant={"destructive"}
            className="mt-4 
            text-sm
            bg-destructive/40 
            border-2 
            border-destructive"
            onClick={workspaceDelete}
          >
            Delete Workspace
          </Button>
        </Alert>
        <AlertDialog open={openAlertMessage}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Changing a Shared workspace to a Private workspace will remove
                all collaborators permanantly.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOpenAlertMessage(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={onClickAlertConfirm}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};
