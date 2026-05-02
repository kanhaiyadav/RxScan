"use client";

import Link from "next/link";
import { AlertTriangle, Bell, Camera, CheckCircle2, ChevronRight, FileText, Pill, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppSelector } from "@/store/hooks";

export default function DashboardPage() {
  const prescriptions = useAppSelector((state) => state.prescriptions.items);
  const profile = useAppSelector((state) => state.healthProfile.profile);
  const reminders = useAppSelector((state) => state.reminders.items);

  const activePrescriptions = prescriptions.filter((item) => item.status === "active");
  const meds = activePrescriptions.flatMap((item) => item.ocrResult?.medications || []);
  const uncertain = meds.filter((item) => item.uncertain).length;

  const stats = [
    { label: "Prescriptions", value: prescriptions.length, icon: FileText, tone: "bg-cyan-100 text-cyan-700" },
    { label: "Active Meds", value: meds.length, icon: Pill, tone: "bg-emerald-100 text-emerald-700" },
    { label: "Warnings", value: uncertain, icon: AlertTriangle, tone: "bg-amber-100 text-amber-700" },
    { label: "Reminders", value: reminders.length, icon: Bell, tone: "bg-rose-100 text-rose-700" },
  ];

  const quickActions = [
    { title: "Scan Prescription", text: "Upload an image and extract details", href: "/dashboard/scan", icon: Camera },
    { title: "View Prescriptions", text: "Review saved prescription history", href: "/dashboard/prescriptions", icon: FileText },
    { title: "Medicine Reminders", text: "Track upcoming medicine times", href: "/dashboard/reminders", icon: Bell },
    { title: "Health Profile", text: "Update allergies and conditions", href: "/dashboard/profile", icon: UserRound },
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Good health starts with clarity</p>
          <h1 className="mt-2 font-heading text-4xl text-slate-950">Prescription Command Center</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Scan prescriptions, store them in your Google Drive, and keep medication context connected to your health profile.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/scan">
            <Camera /> Scan Now
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-lg p-3 ${stat.tone}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-950">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-950">Active Prescriptions</h2>
              <Button asChild variant="ghost">
                <Link href="/dashboard/prescriptions">All <ChevronRight /></Link>
              </Button>
            </div>
            {activePrescriptions.length === 0 ? (
              <EmptyState title="No active prescriptions" text="Upload your first prescription to see it here." href="/dashboard/scan" />
            ) : (
              <div className="space-y-3">
                {activePrescriptions.slice(0, 3).map((item) => (
                  <Link key={item.$id} href={`/dashboard/prescriptions/${item.$id}`} className="flex items-center gap-4 rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50">
                    <div className="grid h-14 w-14 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                      <FileText />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">{item.ocrResult?.doctor?.name || item.ocrResult?.doctor?.clinic_name || "Prescription"}</p>
                      <p className="text-sm text-slate-500">{item.ocrResult?.medications?.length || 0} medicines • {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recently added"}</p>
                    </div>
                    <ChevronRight className="text-slate-400" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-2xl font-semibold text-slate-950">Quick Actions</h2>
              <div className="grid gap-3">
                {quickActions.map((action) => (
                  <Button key={action.href} asChild variant="outline" className="h-auto justify-start p-4">
                    <Link href={action.href}>
                      <action.icon />
                      <span className="text-left">
                        <span className="block font-semibold">{action.title}</span>
                        <span className="block text-xs text-slate-500">{action.text}</span>
                      </span>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-2xl font-semibold text-slate-950">Readiness</h2>
              <StatusRow ok={!!profile} label="Health profile configured" />
              <StatusRow ok={prescriptions.length > 0} label="Prescription history available" />
              <StatusRow ok={reminders.length > 0} label="Medication reminders created" />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function StatusRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
      {ok ? <CheckCircle2 className="text-emerald-600" /> : <ShieldCheck className="text-slate-400" />}
      <span className="text-sm text-slate-700">{label}</span>
    </div>
  );
}

function EmptyState({ title, text, href }: { title: string; text: string; href: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
      <Button asChild className="mt-4">
        <Link href={href}>Get Started</Link>
      </Button>
    </div>
  );
}
