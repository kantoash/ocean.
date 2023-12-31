"use client";

import { useAppState } from "@/src/provider/state-provider";
import { HomeIcon, Settings, Trash } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import { useSidebar } from "@/src/lib/hooks/use-sidebar";
import { Button } from "../ui/button";

interface NativeNavigationProps {
  workspaceId: string;
}

export const NativeNavigation = ({ workspaceId }: NativeNavigationProps) => {
  const { dispatch } = useAppState();
  const { collapsed } = useSidebar();

  const onOpenSettingModal = () => {
    dispatch({
      type: "SET_MODAL",
      payload: {
        type: "settingWorkspace",
        isOpen: true,
      },
    });
  };

  const onOpenTrashModal = () => {
    dispatch({
      type: "SET_MODAL",
      payload: {
        type: "trashWorkspace",
        isOpen: true,
      },
    });
  };

  if (collapsed) {
    return (
      <div className="mt-3">
        <ul className="flex flex-col items-center gap-2">
          <li>
            <Link href={`/dashboard/${workspaceId}`}>
              <Button variant={"ghost"}>
                <HomeIcon />
              </Button>
            </Link>
          </li>
          <li onClick={onOpenSettingModal}>
            <Button variant={"ghost"}>
              <Settings />
            </Button>
          </li>
          <li onClick={onOpenTrashModal}>
            <Button variant={"ghost"}>
              <Trash />
            </Button>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <ul className="flex flex-col  gap-2">
        <li>
          <Link href={`/dashboard/${workspaceId}`}>
            <Button
              className="
          flex justify-start items-center
          gap-2 w-full
        
        "
              variant={"ghost"}
            >
              <HomeIcon />
              <span>My Workspace</span>
            </Button>
          </Link>
        </li>

        <li>
          <Button
            className="
            flex justify-start items-center
            gap-2 w-full"
            variant={"ghost"}
            onClick={onOpenSettingModal}
          >
            <Settings />
            <span>Settings</span>
          </Button>
        </li>
        <li>
          <Button
            className="
            flex justify-start items-center
            gap-2 w-full
              "
            variant={"ghost"}
            onClick={onOpenTrashModal}
          >
            <Trash />
            <span>Trash</span>
          </Button>
        </li>
      </ul>
    </div>
  );
};

export const NavtiveSkeleton = () => {
  return (
    <ul>
      {[...Array(3)].map((_, i) => (
        <li key={i} className="flex items-center gap-x-4 px-3 py-2">
          <Skeleton className="min-h-[48px] min-w-[48px] rounded-md" />
          <div className="flex-1 hidden lg:block">
            <Skeleton className="h-6" />
          </div>
        </li>
      ))}
    </ul>
  );
};
