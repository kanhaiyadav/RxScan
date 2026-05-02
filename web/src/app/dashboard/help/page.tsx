import { HelpCircle, ScanLine, ShieldCheck, Volume2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function HelpPage() {
  const items = [
    { icon: ScanLine, title: "Scanning", text: "Upload a clear prescription image. RxScan extracts doctor, patient, and medicine details with Gemini." },
    { icon: ShieldCheck, title: "Storage", text: "Connect Google Drive so uploaded prescription images stay in the user's own account." },
    { icon: Volume2, title: "Accessibility", text: "Prescription details are structured for easier reading, translation, and future audio narration." },
  ];

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Support</p>
        <h1 className="mt-2 font-heading text-4xl text-slate-950">Help Center</h1>
        <p className="mt-2 text-slate-600">Quick guidance for the prescription workflow.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Card key={item.title}>
            <CardContent className="p-6">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <item.icon />
              </div>
              <h2 className="text-xl font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="mt-1 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Medical disclaimer</h2>
              <p className="mt-2 text-sm text-slate-600">
                RxScan helps organize prescription information, but it does not replace a doctor, pharmacist, or emergency care.
                Confirm unclear or high-risk instructions with a qualified clinician.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
