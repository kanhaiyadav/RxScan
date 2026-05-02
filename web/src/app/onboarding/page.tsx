"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, HeartPulse } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HealthProfileForm } from "@/components/health-profile-form";
import { AuthGuard } from "@/components/auth-guard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { saveHealthProfile } from "@/store/slices/healthProfileSlice";
import type { HealthProfile } from "@/types/domain";

export default function OnboardingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.healthProfile.profile);

  const submit = async (values: HealthProfile) => {
    await dispatch(saveHealthProfile(values)).unwrap();
    router.replace("/dashboard");
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700">
                <HeartPulse className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Health profile setup</p>
                <h1 className="mt-2 font-heading text-4xl text-slate-950">Personalize Safety Checks</h1>
                <p className="mt-2 max-w-2xl text-slate-600">
                  Add allergies, medical conditions, current medicines, and dietary restrictions so RxScan can keep prescription context useful.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {["Allergies", "Conditions", "Medications", "Diet"].map((step) => (
                <div key={step} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {step}
                </div>
              ))}
            </div>
          </section>

          <Card>
            <CardContent className="p-6">
              <HealthProfileForm profile={profile} submitLabel="Complete Setup" onSubmit={submit} />
            </CardContent>
          </Card>
        </div>
      </main>
    </AuthGuard>
  );
}
