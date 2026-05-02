"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, CheckCircle2, FileImage, Loader2, Save, UploadCloud } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { createPrescription } from "@/store/slices/prescriptionsSlice";
import type { PrescriptionData } from "@/types/domain";

const scanSchema = z.object({
  file: z.instanceof(File, { message: "Choose a prescription image" }).refine((file) => file.type.startsWith("image/"), "Only image files are supported"),
});

type ScanValues = z.infer<typeof scanSchema>;

export default function ScanPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<PrescriptionData | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const form = useForm<ScanValues>({ resolver: zodResolver(scanSchema) });
  const selectedFile = form.watch("file");
  const medicines = useMemo(() => result?.medications || [], [result]);

  const onFileChange = (file?: File) => {
    if (!file) return;
    form.setValue("file", file, { shouldValidate: true });
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setMessage(null);
  };

  const extract = async ({ file }: ScanValues) => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await api.extractPrescription(file);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Could not extract prescription");
      }
      setResult(response.data);
      setMessage("Prescription details extracted. Review the result and save it.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Extraction failed");
    } finally {
      setBusy(false);
    }
  };

  const connectDrive = async () => {
    const response = await api.googleDriveAuthUrl();
    window.open(response.authorization_url, "_blank", "noopener,noreferrer");
  };

  const save = async () => {
    if (!selectedFile || !result) return;
    setBusy(true);
    setMessage(null);
    try {
      const upload = await api.uploadPrescription(selectedFile);
      await dispatch(createPrescription({
        ocrResult: result,
        searchResult: {},
        image: upload.data.fileUrl,
        object_key: upload.data.key,
      })).unwrap();
      router.push("/dashboard/prescriptions");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Could not save prescription";
      if (text.toLowerCase().includes("google drive")) {
        setMessage("Connect Google Drive before saving prescriptions.");
      } else {
        setMessage(text);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">AI prescription scan</p>
          <h1 className="mt-2 font-heading text-4xl text-slate-950">Upload a Prescription</h1>
          <p className="mt-2 text-slate-600">Extract doctor, patient, medicine, dosage, and instruction details with Gemini.</p>
        </div>

        <Card>
          <CardContent className="space-y-5 p-6">
            <form onSubmit={form.handleSubmit(extract)} className="space-y-5">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-1 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-primary hover:bg-emerald-50">
                <UploadCloud className="mb-3 h-10 w-10 text-primary" />
                <span className="font-semibold text-slate-900">Choose prescription image</span>
                <span className="mt-1 text-sm text-slate-500">PNG, JPG, JPEG, WEBP, TIFF</span>
                <input className="hidden" type="file" accept="image/*" onChange={(event) => onFileChange(event.target.files?.[0])} />
              </label>
              {form.formState.errors.file && <p className="text-sm text-red-600">{form.formState.errors.file.message}</p>}
              {selectedFile && <p className="flex items-center gap-2 text-sm text-slate-600"><FileImage className="h-4 w-4" />{selectedFile.name}</p>}
              <div className="grid gap-3 sm:grid-cols-2">
                <Button type="submit" disabled={busy || !selectedFile}>
                  {busy ? <Loader2 className="animate-spin" /> : <Camera />} Extract
                </Button>
                <Button type="button" variant="outline" onClick={connectDrive}>
                  Connect Google Drive
                </Button>
              </div>
            </form>
            {message && <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</div>}
          </CardContent>
        </Card>

        {preview && (
          <Card>
            <CardContent className="p-4">
              <img src={preview} alt="Prescription preview" className="max-h-[520px] w-full rounded-lg object-contain" />
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-6">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Extraction Result</h2>
                <p className="text-sm text-slate-500">Review before saving to your prescription history.</p>
              </div>
              {result && <CheckCircle2 className="text-emerald-600" />}
            </div>

            {!result ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
                Extracted prescription details will appear here.
              </div>
            ) : (
              <div className="space-y-5">
                <InfoGrid title="Doctor" items={[
                  ["Name", result.doctor?.name],
                  ["Clinic", result.doctor?.clinic_name],
                  ["Phone", result.doctor?.phone],
                ]} />
                <InfoGrid title="Patient" items={[
                  ["Name", result.patient?.name],
                  ["Age", result.patient?.age],
                  ["Date", result.patient?.prescription_date],
                ]} />
                <div>
                  <h3 className="mb-3 font-semibold text-slate-900">Medicines</h3>
                  <div className="space-y-3">
                    {medicines.length === 0 ? <p className="text-sm text-slate-500">No medicines found.</p> : medicines.map((medicine, index) => (
                      <div key={`${medicine.name}-${index}`} className="rounded-lg border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-semibold text-slate-950">{medicine.name}</p>
                          {medicine.uncertain && <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">uncertain</span>}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{medicine.dosage || "Dosage not specified"} • {medicine.frequency || "Frequency not specified"}</p>
                        <p className="mt-2 text-sm text-slate-500">{medicine.instructions || medicine.duration || "No extra instructions"}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={save} disabled={busy} className="w-full">
                  {busy ? <Loader2 className="animate-spin" /> : <Save />} Save Prescription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function InfoGrid({ title, items }: { title: string; items: Array<[string, string | null | undefined]> }) {
  return (
    <div>
      <h3 className="mb-3 font-semibold text-slate-900">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 truncate font-medium text-slate-900">{value || "Not found"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
