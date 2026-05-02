"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HeartPulse, Plus, Save, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { HealthProfile } from "@/types/domain";

const profileSchema = z.object({
  allergiesText: z.string().optional(),
  medicalConditionsText: z.string().optional(),
  dietaryRestrictionsText: z.string().optional(),
  bloodType: z.string().optional(),
  dateOfBirth: z.string().optional(),
  weight: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  additionalNotes: z.string().optional(),
  currentMedications: z.array(z.object({
    name: z.string().min(1, "Medicine name is required"),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
  })),
  emergencyContacts: z.array(z.object({
    name: z.string().min(1, "Contact name is required"),
    phone: z.string().min(1, "Phone is required"),
    relationship: z.string().min(1, "Relationship is required"),
  })),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function toText(values?: string[]) {
  return (values || []).join(", ");
}

function toList(value?: string) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function HealthProfileForm({
  profile,
  submitLabel = "Save Health Profile",
  onSubmit,
}: {
  profile?: HealthProfile | null;
  submitLabel?: string;
  onSubmit: (profile: HealthProfile) => Promise<void> | void;
}) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as never,
    defaultValues: {
      allergiesText: toText(profile?.allergies),
      medicalConditionsText: toText(profile?.medicalConditions),
      dietaryRestrictionsText: toText(profile?.dietaryRestrictions),
      bloodType: profile?.bloodType || "",
      dateOfBirth: profile?.dateOfBirth || "",
      weight: profile?.weight,
      height: profile?.height,
      additionalNotes: profile?.additionalNotes || "",
      currentMedications: profile?.currentMedications?.length ? profile.currentMedications : [{ name: "", dosage: "", frequency: "" }],
      emergencyContacts: profile?.emergencyContacts?.length ? profile.emergencyContacts : [],
    },
  });

  const meds = useFieldArray({ control: form.control, name: "currentMedications" });
  const contacts = useFieldArray({ control: form.control, name: "emergencyContacts" });

  const handleSubmit = async (values: ProfileFormValues) => {
    await onSubmit({
      allergies: toList(values.allergiesText),
      medicalConditions: toList(values.medicalConditionsText),
      dietaryRestrictions: toList(values.dietaryRestrictionsText),
      currentMedications: values.currentMedications.filter((item) => item.name.trim()).map((item) => ({
        name: item.name,
        dosage: item.dosage || "",
        frequency: item.frequency || "",
      })),
      emergencyContacts: values.emergencyContacts,
      bloodType: values.bloodType,
      dateOfBirth: values.dateOfBirth,
      weight: values.weight,
      height: values.height,
      additionalNotes: values.additionalNotes,
    });
  };

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Allergies, comma separated" {...form.register("allergiesText")} />
        <Input label="Medical conditions, comma separated" {...form.register("medicalConditionsText")} />
        <Input label="Dietary restrictions, comma separated" {...form.register("dietaryRestrictionsText")} />
        <Input label="Blood type" {...form.register("bloodType")} />
        <Input label="Date of birth" type="date" {...form.register("dateOfBirth")} />
        <Input label="Weight (kg)" type="number" {...form.register("weight")} />
        <Input label="Height (cm)" type="number" {...form.register("height")} />
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-950">Current Medications</h3>
            <p className="text-sm text-slate-500">Used for interaction checks against new prescriptions.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => meds.append({ name: "", dosage: "", frequency: "" })}>
            <Plus /> Add
          </Button>
        </div>
        <div className="space-y-3">
          {meds.fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 md:grid-cols-[1fr_160px_160px_auto]">
              <Input label="Medicine" {...form.register(`currentMedications.${index}.name`)} />
              <Input label="Dosage" {...form.register(`currentMedications.${index}.dosage`)} />
              <Input label="Frequency" {...form.register(`currentMedications.${index}.frequency`)} />
              <Button type="button" variant="ghost" size="icon" onClick={() => meds.remove(index)}>
                <X />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-950">Emergency Contacts</h3>
            <p className="text-sm text-slate-500">Optional, but useful for vulnerable patients.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => contacts.append({ name: "", phone: "", relationship: "" })}>
            <Plus /> Add
          </Button>
        </div>
        <div className="space-y-3">
          {contacts.fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 md:grid-cols-[1fr_160px_160px_auto]">
              <Input label="Name" {...form.register(`emergencyContacts.${index}.name`)} />
              <Input label="Phone" {...form.register(`emergencyContacts.${index}.phone`)} />
              <Input label="Relationship" {...form.register(`emergencyContacts.${index}.relationship`)} />
              <Button type="button" variant="ghost" size="icon" onClick={() => contacts.remove(index)}>
                <X />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Textarea rows={5} placeholder="Additional notes, supplements, recent surgery, pregnancy, lifestyle context..." {...form.register("additionalNotes")} />
      </div>

      <Button type="submit" size="lg">
        <Save /> {submitLabel}
      </Button>
    </form>
  );
}
