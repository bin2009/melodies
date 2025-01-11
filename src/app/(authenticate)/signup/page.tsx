"use client";
import React from "react";
import { fetchApiData } from "@/app/api/appService";

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
  GetOtpBody,
  GetOtpBodyType
} from "../../../../schemaValidations/auth.schema";

import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

import { EnvelopeClosedIcon } from "@radix-ui/react-icons";
import { PersonIcon } from "@radix-ui/react-icons";
import { LockClosedIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function Page() {
  const [isChecked, setIsChecked] = useState(false);
  const { toast } = useToast()
  const router = useRouter();

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  const form = useForm<GetOtpBodyType>({
    resolver: zodResolver(GetOtpBody),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: GetOtpBodyType) {
    if (!isChecked) {
      alert("Please accept the terms and privacy policies to sign up.");
      return;
    }
  
    console.log(values);

    const result = await fetchApiData(
      "/api/user/otp",
      "POST",
      JSON.stringify(values)
    );

    if (result.success) {
      localStorage.setItem('email', values.email);
      localStorage.setItem('username', values.username);
      localStorage.setItem('password', values.password);
      router.push("/otp?action=signup");
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: result.error || "Unexpected error occurred.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  }  

  return (
    <div className="flex gap-5 justify-center items-center flex-col">
      <p className="text-h2 text-primaryColorPink border-b-2 border-primaryColorPink">
        Sign Up
      </p>
      <p className="text-textMedium">
        Let&apos;s get you all st up so you can access your personal account
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-2">
            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <PersonIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                      <Input
                        placeholder="Enter your username"
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

            {/* Email */}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <EnvelopeClosedIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                      <Input
                        placeholder="Enter your email"
                        type="email"
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
          </div>
          <div className="flex gap-2">
            {/* Password */}

            <FormField
              control={form.control}
              name="password"
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

            {/* Repassword */}

            <FormField
              control={form.control}
              name="confirmPassword"
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
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              checked={isChecked}
              onChange={handleCheckboxChange}
              className="mr-2 bg-transparent h-4 w-4 border-2 border-black"
              maxLength={150}
            />
            <label htmlFor="terms" className="text-textMedium">
              I agree to all the Terms and Privacy Policies
            </label>
          </div>

          <Button
            type="submit"
            className="bg-primaryColorPink w-full p-4  hover:bg-darkPinkHover"
          // disabled={!isChecked}
          >
            Sign Up
          </Button>

          <div className="flex items-center justify-center">
            <p className="text-textMedium">
              Already have an account?
              <span>
                <Link href="/login" className="text-primaryColorPink underline">
                  {" "}
                  Login
                </Link>
              </span>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default Page;
