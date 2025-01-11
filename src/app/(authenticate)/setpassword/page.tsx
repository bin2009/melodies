"use client";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  RegisterBody,
  RegisterBodyType,
} from "../../../../schemaValidations/auth.schema";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

function Page() {
  const router = useRouter();
  const handleSetPasswordClick = () => {
    router.push("/login");
  };
  const form = useForm<RegisterBodyType>({
    resolver: zodResolver(RegisterBody),
    defaultValues: {
      otp: "",
    },
  });

  function onSubmit(values: RegisterBodyType) {
    console.log(values);
  }
  return (
    <div className="flex flex-col justify-center gap-5 p-4">
      <Link href="/login" className="flex items-center">
        <ChevronLeftIcon className="w-5 h-5" />
        <p>Back to login</p>
      </Link>
      <h2 className="text-h1 text-primaryColorPink">Set new password</h2>
      <p className="text-textMedium">
        Your previous password has been reseted. Please set a new password for
        your account.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 w-full"
        >
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                    <Input
                      placeholder="Enter your password"
                      type="password"
                      {...field}
                      className="pl-8"
                      maxLength={150}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                    <Input
                      placeholder="Re-enter your password"
                      type="password"
                      {...field}
                      className="pl-9"
                      maxLength={150}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="bg-primaryColorPink w-full p-4 hover:bg-darkPinkHover"
            onClick={handleSetPasswordClick}
          >
            Set password
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default Page;
