"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signup } from "@/store/slices/authSlice";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof signupSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async ({ confirmPassword: _confirmPassword, ...values }: SignupValues) => {
    const result = await dispatch(signup(values));
    if (signup.fulfilled.match(result)) {
      router.replace("/onboarding");
    }
  };

  return (
    <div className="flex w-full items-center justify-center bg-white p-6 lg:w-1/2">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Start safely</p>
          <h1 className="font-heading text-4xl text-slate-950">Create your account</h1>
          <p className="mt-3 text-sm text-slate-600">Store prescriptions in your own Drive and keep medical context close.</p>
        </div>

        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <Input label="Full Name" icon={<User size={18} />} {...form.register("name")} />
            {form.formState.errors.name && <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <Input label="Email" type="email" icon={<Mail size={18} />} {...form.register("email")} />
            {form.formState.errors.email && <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>}
          </div>
          <div>
            <Input label="Password" type="password" icon={<Lock size={18} />} {...form.register("password")} />
            {form.formState.errors.password && <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>}
          </div>
          <div>
            <Input label="Confirm Password" type="password" icon={<Lock size={18} />} {...form.register("confirmPassword")} />
            {form.formState.errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>}
          </div>

          {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
