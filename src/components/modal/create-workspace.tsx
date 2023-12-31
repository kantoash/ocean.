"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { useAppState } from "@/src/provider/state-provider";
import { Label } from "@/src/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { v4 } from "uuid";
import { workspaceType } from "@/src/lib/supabase/types";
import { createWorkspace } from "@/src/lib/supabase/mutation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader, PlusCircle } from "lucide-react";
import { useUser } from "@/src/provider/use-user";
import { useToast } from "../ui/use-toast";

const formSchema = z.object({
  logo: z.string().describe("workspacelogo").min(1, "workspace logo required"),
  workspaceName: z
    .string()
    .describe("workspaceName")
    .min(1, "workspace title must be min of 1 character"),
});

export const CreateWorkspace = () => {
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();
  const { dispatch } = useAppState();
  const { user } = useUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isLoading, errors },
  } = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    defaultValues: {
      logo: "",
      workspaceName: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) {
      return;
    }

    const file = values.logo?.[0];
    let filePath = null;
    console.log("file", file);
    const workspaceUUID = v4();

    if (file) {
      // to do upload error
      try {
        const { data, error } = await supabase.storage
          .from("workspace-logos")
          .upload(`workspaceLogo-${workspaceUUID}`, file, {
            cacheControl: "3600",
            upsert: true,
          });
        if (error) throw new Error("");
        filePath = data.path;
      } catch (error) {
        console.log("Error", error);
        toast({
          variant: "destructive",
          description: "Error! Could not upload your workspace logo",
        });
      }
    }
    if (!filePath) {
      toast({
        variant: "destructive",
        description: "logo is required",
      });
      return;
    }
    try {
      const newWorkspace: workspaceType = {
        id: workspaceUUID,
        title: values.workspaceName,
        workspaceOwner: user.id,
        data: null,
        inTrash: null,
        logo: filePath,
        bannerUrl: "",
        createdAt: new Date().toISOString(),
      };
      const { error } = await createWorkspace(newWorkspace);

      if (error) {
        throw new Error();
      }

      dispatch({
        type: "ADD_WORKSPACE",
        payload: { ...newWorkspace, folders: [] },
      });
      toast({
        variant: "default",
        description: `${newWorkspace.title} has been created successfully.`,
      });
      router.push(`/dashboard/${newWorkspace.id}`);
    } catch (error) {
      console.log(error, "workspace create error");
    } finally {
      reset();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"} className="p-0 ">
          <PlusCircle className="mr-2 h-5 w-5" />
          <span>
          Create Workspace
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-md w-[350px] sm:w-full ">
        <DialogHeader className="pt-2 mb-12">
          <DialogTitle className="text-2xl font-medium">
            Create A Workspace
          </DialogTitle>
          <DialogDescription className="text-sm">
            Workspaces give you the power to collaborate with others. You can
            change your workspace privacy settings after creating the workspace
            too.
          </DialogDescription>
        </DialogHeader>
        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-8"
          >
            <div className="flex items-center gap-4">
              <Label
                htmlFor="logo"
                className="text-sm
                text-muted-foreground
                whitespace-nowrap
              "
              >
                Workspace logo
              </Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                placeholder="Workspace logo"
                disabled={isLoading}
                {...register("logo", {
                  required: "Workspace logo is required",
                })}
              />
              <small className="text-red-600">
                {errors?.logo?.message?.toString()}
              </small>
            </div>
            <div>
              <Input
                id="workspaceName"
                type="text"
                placeholder="Workspace Name"
                disabled={isLoading}
                {...register("workspaceName", {
                  required: "Workspace name is required",
                })}
              />
              <small className="text-red-600">
                {errors?.workspaceName?.message?.toString()}
              </small>
            </div>
            <div className="mt-6  flex justify-end w-full">
              <Button disabled={isLoading} type="submit" variant="default">
                {!isLoading ? (
                  "Create Workspace"
                ) : (
                  <Loader className="animate-spin" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
