import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { UserAvatar } from "./user-avatar";
import { Button } from "@/src/components/ui/button";
import { cookies } from "next/headers";
import Link from "next/link";
import LogoutButton from "./logout";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { getUserById } from "@/src/lib/supabase/queries";



export const UserButton = async () => {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    const { data: response } = await getUserById(user?.id!);
    let avatarPath;

    if (!response?.image) avatarPath = "";
    else {
      avatarPath = supabase.storage
        .from("avatars")
        .getPublicUrl(response.image)?.data.publicUrl;
    }
    const profile = {
      ...response,
      avatarUrl: avatarPath,
    };
  
  if (!user || !response) {
    return (
      <Link href={"/login"}>
        <Button variant="outline" className=" p-1 hidden sm:block">
       login
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
    <DropdownMenuTrigger>
      <UserAvatar image={profile.avatarUrl} />
    </DropdownMenuTrigger>
    <DropdownMenuContent className="flex items-center gap-1">
      <DropdownMenuLabel className=" text-sm">{profile.email}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <LogoutButton/>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  );
};

