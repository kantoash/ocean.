"use client";

import React, { ElementRef, useRef } from "react";
import { z } from "zod";
import { useAppState } from "@/src/provider/state-provider";
import { useRouter } from "next/navigation";
import {
  updateWorkspace,
  updateFile,
  updateFolder,
} from "@/src/lib/supabase/mutation";
import { workspaceType, folderType, fileType } from "@/src/lib/supabase/types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useForm } from "react-hook-form";
import { Input } from "@/src/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { v4 } from "uuid";
import { Loader } from "lucide-react";
import { useToast } from "../ui/use-toast";

interface BannerUploadProps {
  details: workspaceType | folderType | fileType;
  id: string;
  dirType: "workspace" | "folder" | "file";
}

const formSchema = z.object({
  Bannerurl: z.any(),
});

export const BannerUploadModal = ({
  id,
  dirType,
  details,
}: BannerUploadProps) => {
  const supabase = createClientComponentClient();
  const { dispatch, workspaceId, folderId } = useAppState();
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isUploading, errors },
  } = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    defaultValues: {
      Bannerurl: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const file = values.Bannerurl?.[0];
      if (!file) return;
      const uuid = v4();

      let filePath = null;

      const uploadBanner = async () => {
        const { data, error } = await supabase.storage
          .from("file-banners")
          .upload(`banner-${uuid}`, file, { cacheControl: "5", upsert: true });
        if (error) throw new Error();
        filePath = data.path;
      };

      if (dirType === "file") {
        if (!workspaceId || !folderId) return;
        await uploadBanner();
        dispatch({
          type: "UPDATE_FILE",
          payload: {
            file: { bannerUrl: filePath },
            fileId: id,
            folderId,
            workspaceId,
          },
        });

        await updateFile({ bannerUrl: filePath }, id);
      } else if (dirType === "folder") {
        if (!workspaceId || !folderId) return;

        await uploadBanner();

        dispatch({
          type: "UPDATE_FOLDER",
          payload: {
            folderId: id,
            folder: { bannerUrl: filePath },
            workspaceId,
          },
        });
        await updateFolder({ bannerUrl: filePath }, id);
      } else if (dirType === "workspace") {
        if (!workspaceId) return;
        await uploadBanner();
        dispatch({
          type: "UPDATE_WORKSPACE",
          payload: {
            workspace: { bannerUrl: filePath },
            workspaceId,
          },
        });

        await updateWorkspace({ bannerUrl: filePath }, id);
      }

      if (details?.bannerUrl) {
        toast({
          variant: "default",
          description: "Banner Updated",
        });
      } else {
        toast({
          variant: "default",
          description: "Banner Added",
        });
      }

      router.refresh();
    } catch (error) {
      if (details?.bannerUrl) {
        toast({
          variant: "destructive",
          description: "Banner Updated Error",
        });
      } else {
        toast({
          variant: "default",
          description: "Banner Added Error",
        });
      }
    } finally {
      reset();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="text-muted-foreground" variant={"ghost"}>
          {details.bannerUrl ? "Update Banner" : "Add Banner"}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-md w-[350px] sm:w-full ">
        <DialogHeader className="pt-2 mb-12 ">
          <DialogTitle className="text-2xl font-medium">Banner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
          <Label
            className="text-sm text-muted-foreground"
            htmlFor="bannerImage"
          >
            Banner Image
          </Label>
          <Input
            id="bannerImage"
            type="file"
            accept="image/*"
            disabled={isUploading}
            {...register("Bannerurl", { required: "Banner Image is required" })}
          />
          <small className="text-red-600">
            {errors.Bannerurl?.message?.toString()}
          </small>
          <Button disabled={isUploading} type="submit">
            {!isUploading ? (
              "Upload Banner"
            ) : (
              <Loader className="animate-spin" />
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
