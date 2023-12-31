"use client";

import { workspaceType } from "@/src/lib/supabase/types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Logo from "@/public/cypresslogo.svg";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface SelectedWorkspaceProps {
  workspace: workspaceType;
}

export const SelectedWorkspace = ({ workspace }: SelectedWorkspaceProps) => {
  const supabase = createClientComponentClient();
  const [workspaceLogo, setWorkspaceLogo] = useState(Logo);

  useEffect(() => {
    if (workspace.logo) {
      const path = supabase.storage
        .from("workspace-logos")
        .getPublicUrl(workspace.logo)?.data.publicUrl;

      setWorkspaceLogo(path);
    }
  }, [workspace, workspace.logo, supabase]);

  return (
    <div className="h-full w-full flex rounded-md relative py-3  gap-4 justify-center items-center cursor-pointer transition-all group overflow-hidden ">
      <Image
        src={workspaceLogo}
        alt="workspace logo"
        fill
        className="rounded-md object-cover group-hover:blur-[2px] "
      />
      <p className=" overflow-hidden whitespace-nowrap z-50 text-lg group-hover:blur-0 ">
        {workspace.title}
      </p>
    </div>
  );
};
