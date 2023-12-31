"use client";

import React from "react";
import { UserAvatar } from "./user-avatar";
import { subscriptionType, userType } from "@/src/lib/supabase/types";
import { SettingProfile } from "../modal/profile-setting";
import LogoutButton from "./logout";
import { ModeToggle } from "../mode-toggle";
import { useSidebar } from "@/src/lib/hooks/use-sidebar";
import { Skeleton } from "../ui/skeleton";

interface UserCardProps {
  profile: userType;
  subscription: subscriptionType | null;
}

export const UserCard = ({ subscription, profile }: UserCardProps) => {
  const { collapsed } = useSidebar();

  if (collapsed) {
    return (
      <div className="flex items-center justify-center mb-3">
        <UserAvatar image={profile.image} />
      </div>
    );
  }
  return (
    <article
      className="
  flex 
  justify-between 
  items-center 
  px-2 
  py-1 
  dark:bg-Neutrals/neutrals-11
  rounded-md
"
    >
      <aside className="flex justify-center items-center gap-2">
        <UserAvatar image={profile.image} />
        <div className="flex flex-col">
          <span className="text-muted-foreground">
            {subscription?.status === "active" ? "Pro Plan" : "Free Plan"}
          </span>
          <small
            className="w-[80px] 
      overflow-hidden 
      overflow-ellipsis
      "
          >
            {profile?.email}
          </small>
        </div>
      </aside>
      <div className="flex items-center  justify-center">
        <LogoutButton />
        <ModeToggle />
        <SettingProfile user={profile} subscription={subscription} />
      </div>
    </article>
  );
};

export const UserSkeleton = () => {
  return (
    <div className="mb-2 p-3 pl-6  flex items-center justify-between  ">
      <Skeleton className="h-12 w-12 rounded-full" />
    </div>
  );
};
