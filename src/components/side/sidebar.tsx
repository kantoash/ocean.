import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  getUserSubscriptionStatus,
  getFolders,
  getPrivateWorkspaces,
  getCollaboratingWorkspaces,
  getSharedWorkspaces,
  getUserById,
} from "@/src/lib/supabase/queries";
import { redirect } from "next/navigation";
import { WorkspaceDrop } from "./workspace-drop";
import { UserCard } from "../user/user-card";
import { PlanUsage } from "./plan-usage";
import { NativeNavigation, NavtiveSkeleton } from "./native-navigation";
import { ScrollArea } from "../ui/scroll-area";
import { FolderList } from "./folder-list";
import { Toggle, ToggleSkeleton } from "./toggle";
import { Wrapper } from "./wrapper";
import { UserSkeleton } from "../user/user-card";

interface SidebarProps {
  workspaceId: string;
}

export const Sidebar = async ({ workspaceId }: SidebarProps) => {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { data: subscription, error: subscriptionError } =
    await getUserSubscriptionStatus(user.id);

  const { data: workspaceFolderData, error: foldersError } = await getFolders(
    workspaceId
  );

  if (subscriptionError || foldersError) redirect("/dashboard");

  const { data: userProfile } = await getUserById(user.id);
  let avatarPath = "";
  if (userProfile?.image) {
    avatarPath = supabase.storage
      .from("avatars")
      .getPublicUrl(userProfile?.image)?.data.publicUrl;
    userProfile.image = avatarPath;
  }

  const [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces] =
    await Promise.all([
      getPrivateWorkspaces(user.id),
      getCollaboratingWorkspaces(user.id),
      getSharedWorkspaces(user.id),
    ]);

  return (
    <Wrapper>
      <div className="flex flex-col justify-center mb-auto">
        <WorkspaceDrop
          privateWorkspaces={privateWorkspaces}
          collaboratingWorkspaces={collaboratingWorkspaces}
          sharedWorkspaces={sharedWorkspaces}
          currentWorkspace={
            [
              ...privateWorkspaces,
              ...collaboratingWorkspaces,
              ...sharedWorkspaces,
            ].find((workspace) => workspace.id === workspaceId)!
          }
        />

        <PlanUsage
          foldersLength={workspaceFolderData?.length!}
          subscription={subscription}
        />

        <Toggle />
        <NativeNavigation workspaceId={workspaceId} />
        <ScrollArea
          className="
          mt-8
          overflow-y-auto
          relative
          h-[450px]
        "
        >
          <div
            className="pointer-events-none 
          absolute 
          w-full
          bottom-0 
          h-20 
          bg-gradient-to-t 
          from-background 
          to-transparent 
          z-40"
          />
          <FolderList
            workspaceFolders={workspaceFolderData || []}
            workspaceId={workspaceId}
          />
        </ScrollArea>
      </div>
      <UserCard profile={userProfile!} subscription={subscription} />
    </Wrapper>
  );
};

export const SidebarSkeleton = () => {
  return (
    <aside className="fixed left-0 flex flex-col w-[70px] lg:w-[280px] h-full bg-background border-r border-[#2D2E35] z-50">
      <div className="flex flex-col justify-center mb-auto">
        <ToggleSkeleton />
        <NavtiveSkeleton />
      </div>
      <UserSkeleton />
    </aside>
  );
};
