"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { bootstrapAuth } from "@/store/slices/authSlice";
import { fetchHealthProfile } from "@/store/slices/healthProfileSlice";
import { fetchPrescriptions } from "@/store/slices/prescriptionsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchHealthProfile());
      dispatch(fetchPrescriptions());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="rounded-lg border bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
          Loading RxScan...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
