"use client";

import { ExternalLink, HardDrive, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, API_URL } from "@/lib/api";

export default function SettingsPage() {
  const [driveConnected, setDriveConnected] = useState<boolean | null>(null);

  useEffect(() => {
    api.googleDriveStatus().then((status) => setDriveConnected(status.connected)).catch(() => setDriveConnected(false));
  }, []);

  const connectDrive = async () => {
    const response = await api.googleDriveAuthUrl();
    window.open(response.authorization_url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Configuration</p>
        <h1 className="mt-2 font-heading text-4xl text-slate-950">Settings</h1>
        <p className="mt-2 text-slate-600">Manage backend connection and user-owned storage.</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700"><HardDrive /></div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-950">Google Drive Storage</h2>
              <p className="mt-1 text-sm text-slate-500">Prescriptions are uploaded to the connected user's own Google Drive account.</p>
              <p className="mt-3 text-sm font-medium text-slate-700">Status: {driveConnected === null ? "Checking..." : driveConnected ? "Connected" : "Not connected"}</p>
            </div>
            <Button onClick={connectDrive}><ExternalLink /> Connect</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-cyan-700" />
            <h2 className="text-xl font-semibold text-slate-950">Backend API</h2>
          </div>
          <p className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">{API_URL}</p>
        </CardContent>
      </Card>
    </main>
  );
}
