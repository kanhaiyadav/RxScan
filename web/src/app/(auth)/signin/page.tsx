"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signin } from "@/store/slices/authSlice";

const signinSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type SigninValues = z.infer<typeof signinSchema>;

export default function SignInPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const form = useForm<SigninValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SigninValues) => {
    const result = await dispatch(signin(values));
    if (signin.fulfilled.match(result)) {
      const params = new URLSearchParams(window.location.search);
      router.replace(params.get("next") || "/dashboard");
    }
  };

  return (
    <div className="flex w-full items-center justify-center bg-white p-6 lg:w-1/2">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Welcome back</p>
          <h1 className="font-heading text-4xl text-slate-950">Sign in to RxScan</h1>
          <p className="mt-3 text-sm text-slate-600">Access your prescriptions, reminders, and health profile.</p>
        </div>

        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <Input label="Email" type="email" icon={<Mail size={18} />} {...form.register("email")} />
            {form.formState.errors.email && <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>}
          </div>
          <div>
            <Input label="Password" type="password" icon={<Lock size={18} />} {...form.register("password")} />
            {form.formState.errors.password && <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>}
          </div>

          {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          New to RxScan?{" "}
          <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
