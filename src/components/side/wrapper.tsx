"use client";

import { cn } from "@/src/lib/utils";
import { useSidebar } from "@/src/lib/hooks/use-sidebar";

import { ToggleSkeleton } from "./toggle";
import { useEffect, useState } from "react";
import { NavtiveSkeleton } from "./native-navigation";
import { UserSkeleton } from "../user/user-card";

interface WrapperProps {
  children: React.ReactNode;
}

export const Wrapper = ({ children }: WrapperProps) => {
  const { collapsed } = useSidebar((state) => state);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <aside className="fixed left-0 p-1 flex flex-col w-[70px] lg:w-[280px] h-full bg-background border-r border-[#2D2E35] z-50">
        <div className="flex flex-col justify-center mb-auto">
          <ToggleSkeleton />
          <NavtiveSkeleton />
        </div>
        <UserSkeleton />
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "fixed left-0 flex flex-col p-1  w-[280px] h-full bg-background border-r  border-[#2D2E35] z-50",
        collapsed && "w-[70px]"
      )}
    >
      {children}
    </aside>
  );
};
