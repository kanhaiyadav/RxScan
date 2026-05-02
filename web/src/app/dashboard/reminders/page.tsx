"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, Check, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addReminder, markReminder, removeReminder } from "@/store/slices/remindersSlice";

const reminderSchema = z.object({
  medicine: z.string().min(1, "Medicine is required"),
  dosage: z.string().optional(),
  time: z.string().min(1, "Time is required"),
  frequency: z.string().optional(),
});

type ReminderValues = z.infer<typeof reminderSchema>;

export default function RemindersPage() {
  const dispatch = useAppDispatch();
  const reminders = useAppSelector((state) => state.reminders.items);
  const prescriptions = useAppSelector((state) => state.prescriptions.items);
  const form = useForm<ReminderValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: { medicine: "", dosage: "", time: "", frequency: "" },
  });

  const create = (values: ReminderValues) => {
    dispatch(addReminder({
      id: crypto.randomUUID(),
      medicine: values.medicine,
      dosage: values.dosage,
      time: values.time,
      frequency: values.frequency,
      status: "pending",
    }));
    form.reset();
  };

  const suggestedMeds = prescriptions.flatMap((item) => item.ocrResult.medications || []).slice(0, 8);

  return (
    <main className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[420px_1fr]">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Medication adherence</p>
          <h1 className="mt-2 font-heading text-4xl text-slate-950">Reminders</h1>
          <p className="mt-2 text-slate-600">Create simple medication reminders from prescriptions or manually.</p>
        </div>

        <Card>
          <CardContent className="space-y-5 p-6">
            <h2 className="text-xl font-semibold text-slate-950">New Reminder</h2>
            <form className="space-y-4" onSubmit={form.handleSubmit(create)}>
              <div>
                <Input label="Medicine" {...form.register("medicine")} />
                {form.formState.errors.medicine && <p className="mt-1 text-sm text-red-600">{form.formState.errors.medicine.message}</p>}
              </div>
              <Input label="Dosage" {...form.register("dosage")} />
              <div>
                <Input label="Time" type="time" {...form.register("time")} />
                {form.formState.errors.time && <p className="mt-1 text-sm text-red-600">{form.formState.errors.time.message}</p>}
              </div>
              <Input label="Frequency / instructions" {...form.register("frequency")} />
              <Button type="submit" className="w-full">
                <Plus /> Add Reminder
              </Button>
            </form>
          </CardContent>
        </Card>

        {suggestedMeds.length > 0 && (
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="text-xl font-semibold text-slate-950">From Prescriptions</h2>
              {suggestedMeds.map((medicine, index) => (
                <button
                  key={`${medicine.name}-${index}`}
                  className="w-full rounded-lg border border-slate-200 p-3 text-left text-sm transition hover:bg-slate-50"
                  onClick={() => form.reset({ medicine: medicine.name, dosage: medicine.dosage || "", frequency: medicine.frequency || "", time: "" })}
                >
                  <span className="block font-semibold text-slate-900">{medicine.name}</span>
                  <span className="text-slate-500">{medicine.dosage || "No dosage"} • {medicine.frequency || "No frequency"}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-950">Upcoming</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{reminders.length} reminders</span>
            </div>
            {reminders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center">
                <Bell className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                <p className="font-semibold text-slate-900">No reminders yet</p>
                <p className="mt-1 text-sm text-slate-500">Add a medicine reminder to begin tracking doses.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950">{reminder.medicine} {reminder.dosage}</p>
                        <p className="text-sm text-slate-500">{reminder.frequency || "No instructions"} • {reminder.time}</p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">{reminder.status}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" onClick={() => dispatch(markReminder({ id: reminder.id, status: "taken" }))}>
                        <Check /> Taken
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => dispatch(markReminder({ id: reminder.id, status: "skipped" }))}>
                        Skip
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => dispatch(removeReminder(reminder.id))}>
                        <Trash2 /> Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
