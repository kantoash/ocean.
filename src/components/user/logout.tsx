"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/src/components/ui/button";
import { LogOut } from "lucide-react";
import { useAppState } from "@/src/provider/state-provider";

const LogoutButton = () => {
  const { dispatch } = useAppState();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const logout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    dispatch({
      type: "SET_WORKSPACES",
      payload: {
        workspaces: [],
      },
    });
  };
  return (
    <Button variant="ghost" size="icon" className="p-0" onClick={logout}>
      <LogOut className="h-6 w-6" />
    </Button>
  );
};

export default LogoutButton;
