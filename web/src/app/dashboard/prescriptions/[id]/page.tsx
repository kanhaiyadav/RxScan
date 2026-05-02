"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, ExternalLink, FileText, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppSelector } from "@/store/hooks";

export default function PrescriptionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const prescription = useAppSelector((state) => state.prescriptions.items.find((item) => item.$id === id));

  if (!prescription) {
    return (
      <main className="mx-auto max-w-4xl">
        <Button asChild variant="ghost">
          <Link href="/dashboard/prescriptions"><ArrowLeft /> Back</Link>
        </Button>
        <Card className="mt-6">
          <CardContent className="p-10 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-slate-400" />
            <p className="font-semibold text-slate-900">Prescription not found</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const data = prescription.ocrResult;

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <Button asChild variant="ghost">
        <Link href="/dashboard/prescriptions"><ArrowLeft /> Back to prescriptions</Link>
      </Button>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Prescription Details</p>
                <h1 className="mt-2 font-heading text-4xl text-slate-950">{data.doctor?.name || data.doctor?.clinic_name || "Prescription"}</h1>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="h-4 w-4" /> {data.patient?.prescription_date || prescription.createdAt || "No date found"}
                </p>
              </div>
              <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium capitalize text-emerald-700">{prescription.status}</span>
            </div>

            <InfoSection title="Doctor" rows={[
              ["Name", data.doctor?.name],
              ["Clinic", data.doctor?.clinic_name],
              ["Qualification", data.doctor?.qualifications],
              ["Registration", data.doctor?.registration_number],
              ["Phone", data.doctor?.phone],
              ["Address", data.doctor?.address],
            ]} />

            <InfoSection title="Patient" rows={[
              ["Name", data.patient?.name],
              ["Age", data.patient?.age],
              ["Gender", data.patient?.gender],
              ["Address", data.patient?.address],
            ]} />

            <div>
              <h2 className="mb-3 text-xl font-semibold text-slate-950">Medicines</h2>
              <div className="space-y-3">
                {(data.medications || []).map((medicine, index) => (
                  <div key={`${medicine.name}-${index}`} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-cyan-50 p-2 text-cyan-700"><Pill className="h-5 w-5" /></div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-950">{medicine.name}</p>
                        <p className="mt-1 text-sm text-slate-600">{medicine.dosage || "No dosage"} • {medicine.frequency || "No frequency"} • {medicine.duration || "No duration"}</p>
                        <p className="mt-2 text-sm text-slate-500">{medicine.instructions || "No instructions recorded"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <aside className="space-y-6">
          <Card>
            <CardContent className="space-y-3 p-5">
              <h2 className="text-xl font-semibold text-slate-950">Stored Image</h2>
              <p className="text-sm text-slate-500">This file lives in the user-connected Google Drive account.</p>
              <Button asChild variant="outline" className="w-full">
                <a href={prescription.image} target="_blank" rel="noreferrer">
                  <ExternalLink /> Open in Drive
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5">
              <h2 className="text-xl font-semibold text-slate-950">Notes</h2>
              <p className="text-sm text-slate-600">{data.additional_notes?.special_instructions || data.extraction_notes || "No additional notes found."}</p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}

function InfoSection({ title, rows }: { title: string; rows: Array<[string, string | null | undefined]> }) {
  return (
    <div>
      <h2 className="mb-3 text-xl font-semibold text-slate-950">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{value || "Not found"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
