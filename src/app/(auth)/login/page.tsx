"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/src/components/ui/form";
import Image from "next/image";
import * as z from "zod";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Logo from "@/public/cypresslogo.svg";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { AuthFormSchema } from "@/src/lib/utils";
import { actionLoginUser } from "@/src/lib/auth-actions";
import { Loader } from "lucide-react";

const LoginPage = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const form = useForm<z.infer<typeof AuthFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(AuthFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isLoading = form.formState.isLoading;
  const reset = form.reset;

  const onSubmit = async (values: z.infer<typeof AuthFormSchema>) => {
    const { error } = await actionLoginUser(values);
    if (error) {
      setSubmitError(error.message);
      reset();
      return;
    }

    router.push("/dashboard");
  };

  return (
    <Form {...form}>
      <form
        onChange={() => {
          if (submitError) setSubmitError("");
        }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
      >
        <Link
          href="/"
          className="
        w-full
        flex
        justify-left
        items-center"
        >
          <Image src={Logo} alt="Ocean Logo" width={50} height={50} />
          <span
            className="font-semibold
        dark:text-white text-4xl first-letter:ml-2"
          >
            Ocean.
          </span>
        </Link>
        <FormDescription
          className="
      text-foreground/60"
        >
          An all-In-One Collaboration and Productivity Platform
        </FormDescription>

        <FormField
          disabled={isLoading}
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          disabled={isLoading}
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full p-6"
          size="lg"
          variant="default"
          disabled={isLoading}
        >
          {!isLoading ? "login" : <Loader className="animate-spin" />}
        </Button>

        {submitError && <FormMessage>{submitError}</FormMessage>}
        <div className="mt-6 flex items-center gap-2">
          Dont have an account?{" "}
          <Link href="/signup" className="text-primary">
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default LoginPage;
