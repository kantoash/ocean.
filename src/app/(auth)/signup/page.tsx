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
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Logo from "@/public/cypresslogo.svg";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { AuthFormSchema } from "@/src/lib/utils";
import { actionSignUpUser } from "@/src/lib/auth-actions";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { Loader, MailCheck } from "lucide-react";

const SignUpFormSchema = z
  .object({
    email: z.string().describe("Email").email({ message: "Invalid Email" }),
    password: z
      .string()
      .describe("Password")
      .min(6, "Password must be minimum 6 characters"),
    confirmPassword: z
      .string()
      .describe("Confirm Password")
      .min(6, "Password must be minimum 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

const SignUpPage = () => {
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState(false);

  const codeExchangeError = useMemo(() => {
    if (!searchParams) return "";
    return searchParams.get("error_description");
  }, [searchParams]);

  const confirmationAndErrorStyles = useMemo(
    () =>
      clsx("bg-primary", {
        "bg-red-500/10": codeExchangeError,
        "border-red-500/50": codeExchangeError,
        "text-red-700": codeExchangeError,
      }),
    [codeExchangeError]
  );
  const form = useForm<z.infer<typeof SignUpFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isLoading = form.formState.isLoading;
  const reset = form.reset;
  // to  do  sign up not creating user 
  const onSubmit = async ({
    email,
    password,
  }: z.infer<typeof AuthFormSchema>) => {
    const { error } = await actionSignUpUser({ email, password });
    if (error) {
      setSubmitError(error.message);
      reset();
      return;
    }
    setConfirmation(true);
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
        {!confirmation && !codeExchangeError && (
          <>
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
            <FormField
              disabled={isLoading}
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="ConfirmPassword"
                      {...field}
                    />
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
              {!isLoading ? "sign up" : <Loader className="animate-spin"/>}
            </Button>

            <div className="mt-6 flex items-center gap-2">
              have an account?{" "}
              <Link href="/login" className="text-primary">
                login
              </Link>
            </div>
          </>
        )}
        {submitError && <FormMessage>{submitError}</FormMessage>}

        {(confirmation || codeExchangeError) && (
          <>
            <Alert className={confirmationAndErrorStyles}>
              {!codeExchangeError && <MailCheck />}
              <AlertTitle>
                {codeExchangeError ? "Invalid Link" : "Check your email."}
              </AlertTitle>
              <AlertDescription>
                {codeExchangeError || "An email confirmation has been sent."}
              </AlertDescription>
            </Alert>
          </>
        )}
      </form>
    </Form>
  );
};

export default SignUpPage;