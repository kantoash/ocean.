"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { subscriptionType, userType } from "@/src/lib/supabase/types";
import { CreditCard, Settings, UserIcon } from "lucide-react";
import { UserAvatar } from "@/src/components/user/user-avatar";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { v4 } from "uuid";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { updateUser } from "@/src/lib/supabase/mutation";
import { useSubscriptionModal } from "@/src/provider/subscription-modal-provider";
import { postData } from "@/src/lib/utils";

interface SettingProfileProps {
  user: userType;
  subscription: subscriptionType | null;
}
export const SettingProfile = ({ user, subscription }: SettingProfileProps) => {
  const { setOpen } = useSubscriptionModal();
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  //WIP PAYMENT PORTAL

  const redirectToCustomerPortal = async () => {
    setLoadingPortal(true);
    try {
      const { url, error } = await postData({
        url: "/api/create-portal-link",
      });
      console.log(error)
      window.location.assign(url);
    } catch (error) {
      console.log(error);

    }
    setLoadingPortal(false);
  };

  const onChangeProfilePicture = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!user || !user.id) {
      return;
    }
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const uuid = v4();
    setUploadingProfilePic(true);

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(`avatar-${uuid}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (!error) {
      await updateUser({ image: data.path }, user.id);
      router.refresh();
    }

    setUploadingProfilePic(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-8">
          <Settings />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-md w-[350px] sm:w-full ">
        <DialogHeader className="pt-2 mb-12 ">
          <DialogTitle className="text-2xl font-medium flex items-center gap-2">
            <span>
              <UserIcon />
            </span>
            Profile
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-start gap-6 ">
          <div className="flex items-center gap-3 ">
            <UserAvatar image={user.image} />
            <small className="text-muted-foreground cursor-not-allowed text-xl">
              {user ? user.email : ""}
            </small>
          </div>
          <div className="flex flex-col ">
            <Label
              htmlFor="profilePicture"
              className="text-sm text-muted-foreground"
            >
              Profile Picture
            </Label>
            <Input
              name="profilePicture"
              type="file"
              accept="image/*"
              placeholder="Profile Picture"
              disabled={uploadingProfilePic}
              onChange={onChangeProfilePicture}
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <p className="flex items-center gap-2 ">
              <CreditCard size={20} /> <span>Billing & Plan</span>
            </p>

            <p className="text-muted-foreground">
              You are currently on a{" "}
              {subscription?.status === "active" ? "Pro" : "Free"} Plan
            </p>

            {subscription?.status === "active" ? (
              <div>
                <Button
                  type="button"
                  className="w-full text-center"
                  size="lg"
                  variant={"outline"}
                  onClick={redirectToCustomerPortal}
                >
                  Manage Subscription
                </Button>
              </div>
            ) : (
              <div>
                <Button
                  type="button"
                  className="w-full text-center"
                  size="lg"
                  variant={"outline"}
                  disabled={loadingPortal}
                  onClick={() => setOpen(true)}
                >
                  Start Plan
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
