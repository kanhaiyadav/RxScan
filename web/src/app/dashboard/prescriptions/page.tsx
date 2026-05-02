"use client";

import Link from "next/link";
import { FileText, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deletePrescription, updatePrescriptionStatus } from "@/store/slices/prescriptionsSlice";
import type { PrescriptionStatus } from "@/types/domain";

export default function PrescriptionsPage() {
  const dispatch = useAppDispatch();
  const prescriptions = useAppSelector((state) => state.prescriptions.items);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const search = query.toLowerCase();
    return prescriptions.filter((item) => {
      const blob = JSON.stringify(item.ocrResult).toLowerCase();
      return blob.includes(search) || item.status.includes(search);
    });
  }, [prescriptions, query]);

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Prescription history</p>
          <h1 className="mt-2 font-heading text-4xl text-slate-950">Saved Prescriptions</h1>
          <p className="mt-2 text-slate-600">Search, inspect, and update prescription treatment status.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/scan">Scan New</Link>
        </Button>
      </div>

      <div className="max-w-xl">
        <Input label="Search prescriptions" icon={<Search size={18} />} value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-slate-400" />
            <p className="font-semibold text-slate-900">No prescriptions found</p>
            <p className="mt-1 text-sm text-slate-500">Scan a prescription or adjust your search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((item) => (
            <Card key={item.$id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                    <FileText />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/dashboard/prescriptions/${item.$id}`} className="block truncate text-lg font-semibold text-slate-950 hover:text-primary">
                      {item.ocrResult?.doctor?.name || item.ocrResult?.doctor?.clinic_name || "Prescription"}
                    </Link>
                    <p className="text-sm text-slate-500">
                      {item.ocrResult?.medications?.length || 0} medicines • {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recently added"}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">{item.status}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.ocrResult?.medications?.slice(0, 4).map((medicine, index) => (
                    <span key={`${medicine.name}-${index}`} className="rounded-full bg-cyan-50 px-3 py-1 text-xs text-cyan-700">
                      {medicine.name}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["active", "completed", "abandoned"] as PrescriptionStatus[]).map((status) => (
                    <Button key={status} size="sm" variant={item.status === status ? "default" : "outline"} onClick={() => dispatch(updatePrescriptionStatus({ id: item.$id, status }))}>
                      {status}
                    </Button>
                  ))}
                  <Button size="sm" variant="ghost" onClick={() => dispatch(deletePrescription(item.$id))}>
                    <Trash2 /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
