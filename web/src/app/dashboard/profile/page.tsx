"use client";

import { HeartPulse } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HealthProfileForm } from "@/components/health-profile-form";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { saveHealthProfile } from "@/store/slices/healthProfileSlice";
import type { HealthProfile } from "@/types/domain";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.healthProfile.profile);

  const submit = async (values: HealthProfile) => {
    await dispatch(saveHealthProfile(values)).unwrap();
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Personal context</p>
        <h1 className="mt-2 font-heading text-4xl text-slate-950">Health Profile</h1>
        <p className="mt-2 text-slate-600">Maintain the medical context used while reviewing prescriptions.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-emerald-50 p-4 text-emerald-900">
            <HeartPulse className="h-6 w-6" />
            <p className="text-sm">Keep this updated whenever medicines, allergies, or medical conditions change.</p>
          </div>
          <HealthProfileForm profile={profile} onSubmit={submit} />
        </CardContent>
      </Card>
    </main>
  );
}
