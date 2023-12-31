"use client";

import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";
import { z } from "zod";
import { Label } from "@/src/components/ui/label";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { AuthUser } from "@supabase/supabase-js";
import { Loader } from "lucide-react";
import { workspaceType } from "@/src/lib/supabase/types";
import { createWorkspace } from "@/src/lib/supabase/mutation";
import { useToast } from "@/src/components/ui/use-toast";
import { useAppState } from "@/src/provider/state-provider";

interface DashboardSetupProps {
  user: AuthUser;
}

const formSchema = z.object({
  logo: z.any(),
  workspaceName: z
    .string()
    .describe("workspaceName")
    .min(1, "workspace title must be min of 1 character"),
});
export const DashboardSetup = ({ user }: DashboardSetupProps) => {
  const { dispatch } = useAppState()
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();
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
    const file = values.logo?.[0];
    let filePath = null;
    const workspaceUUID = v4();

    if (file) {
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
            description: "Error! Could not upload your workspace logo"
        })
      }
    }

    try {
      const newWorkspace: workspaceType = {
        id: workspaceUUID,
        title: values.workspaceName,
        workspaceOwner: user.id,
        data: null,
        inTrash: null,
        logo: filePath!,
        bannerUrl: "",
        createdAt: new Date().toISOString(),
      };
      const { error } = await createWorkspace(newWorkspace);

      if (error) {
        throw new Error();
      }

      dispatch({
        type: 'ADD_WORKSPACE',
        payload: { ...newWorkspace, folders: [] },
      });

      toast({
        variant: "default",
        description: `${newWorkspace.title} has been created successfully.`
      })

      router.push(`/dashboard/${newWorkspace.id}`);
    } catch (error) {
      console.log(error, "workspace create error");
    } finally {
      reset();
    }
  };

  return (
    <Card
      className="w-[700px]
      h-screen
      sm:h-auto
     flex flex-col justify-center
  "
    >
      <CardHeader>
        <CardTitle>Create A Workspace</CardTitle>
        <CardDescription>
          Lets create a private workspace to get you started.You can add
          collaborators later from the workspace settings tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
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
              placeholder="Workspace Name"
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
              {!isLoading ? "Create Workspace" : <Loader className="animate-spin" />}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
