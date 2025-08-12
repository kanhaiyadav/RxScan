import { MedicineSearchResult } from "@/hooks/useMedicineSearch";

export const dummyMedicineSearchResult: MedicineSearchResult = {
    medicines: [
        {
            prescription: {
                dosage: "500mg",
                duration: "7 days",
                frequency: "Twice daily",
                instructions: "Take after meals with water",
                name: "Amoxicillin",
                quantity: 14,
                uncertain: false,
            },
            medicalInfo: {
                name: "Amoxicillin",
                imageUrl: null,
                uses: ["Bacterial infections", "Respiratory tract infections"],
                sideEffects: {
                    common: ["Nausea", "Diarrhea"],
                    serious: ["Severe allergic reaction", "Liver problems"],
                    rare: ["Seizures", "Blood disorders"],
                },
                warningsAndPrecautions: [
                    "Avoid if allergic to penicillin",
                    "Consult doctor if pregnant or breastfeeding",
                ],
                interactions: {
                    drugInteractions: ["Methotrexate", "Warfarin"],
                    foodInteractions: ["Alcohol may increase side effects"],
                    conditionInteractions: ["Kidney disease"],
                },
                overdoseMissedDose: {
                    overdose: "May cause severe stomach upset or seizures",
                    missedDose:
                        "Take as soon as remembered unless close to next dose",
                },
                approximatePrice: {
                    currency: "USD",
                    priceRange: "5-15",
                    unit: "per pack",
                    lastUpdated: "2025-08-01",
                },
                manufacturer: ["Generic Pharma Co."],
                activeIngredients: [
                    {
                        name: "Amoxicillin",
                        strength: "500mg",
                        purpose: "Antibiotic",
                    },
                ],
                dosageForm: "Capsule",
                prescriptionRequired: true,
                genericAvailable: true,
                fdaApproved: true,
                lastUpdated: "2025-08-01",
            },
        },
        {
            prescription: {
                dosage: "10mg",
                duration: "30 days",
                frequency: "Once daily",
                instructions: "Take at the same time each day",
                name: "Atorvastatin",
                quantity: 30,
                uncertain: false,
            },
            medicalInfo: {
                name: "Atorvastatin",
                imageUrl: null,
                uses: ["High cholesterol", "Prevention of heart disease"],
                sideEffects: {
                    common: ["Headache", "Muscle pain"],
                    serious: ["Liver problems", "Severe muscle breakdown"],
                    rare: ["Allergic reaction", "Pancreatitis"],
                },
                warningsAndPrecautions: [
                    "Avoid excessive alcohol",
                    "Regular liver function tests recommended",
                ],
                interactions: {
                    drugInteractions: ["Grapefruit juice", "Erythromycin"],
                    foodInteractions: ["High-fat meals may affect absorption"],
                    conditionInteractions: ["Liver disease"],
                },
                overdoseMissedDose: {
                    overdose: "May cause severe muscle pain and liver damage",
                    missedDose: "Skip if close to next scheduled dose",
                },
                approximatePrice: {
                    currency: "USD",
                    priceRange: "15-40",
                    unit: "per month",
                    lastUpdated: "2025-08-01",
                },
                manufacturer: ["Pfizer Inc."],
                activeIngredients: [
                    {
                        name: "Atorvastatin Calcium",
                        strength: "10mg",
                        purpose: "Statin",
                    },
                ],
                dosageForm: "Tablet",
                prescriptionRequired: true,
                genericAvailable: true,
                fdaApproved: true,
                lastUpdated: "2025-08-01",
            },
        },
        {
            prescription: {
                dosage: "500mg",
                duration: "5 days",
                frequency: "Three times daily",
                instructions: "Take with food",
                name: "Paracetamol",
                quantity: 15,
                uncertain: false,
            },
            medicalInfo: {
                name: "Paracetamol",
                imageUrl: null,
                uses: ["Fever", "Mild to moderate pain relief"],
                sideEffects: {
                    common: ["Nausea"],
                    serious: ["Liver damage"],
                    rare: ["Allergic reaction"],
                },
                warningsAndPrecautions: [
                    "Do not exceed 4g per day",
                    "Caution in liver disease",
                ],
                interactions: {
                    drugInteractions: ["Warfarin", "Alcohol"],
                    foodInteractions: [],
                    conditionInteractions: ["Liver problems"],
                },
                overdoseMissedDose: {
                    overdose: "May cause severe liver damage",
                    missedDose:
                        "Take when remembered unless close to next dose",
                },
                approximatePrice: {
                    currency: "USD",
                    priceRange: "2-8",
                    unit: "per pack",
                    lastUpdated: "2025-08-01",
                },
                manufacturer: ["Generic Pharma Co."],
                activeIngredients: [
                    {
                        name: "Paracetamol",
                        strength: "500mg",
                        purpose: "Analgesic",
                    },
                ],
                dosageForm: "Tablet",
                prescriptionRequired: false,
                genericAvailable: true,
                fdaApproved: true,
                lastUpdated: "2025-08-01",
            },
        },
        {
            prescription: {
                dosage: "20mg",
                duration: "14 days",
                frequency: "Once daily before breakfast",
                instructions: "Take on an empty stomach",
                name: "Omeprazole",
                quantity: 14,
                uncertain: false,
            },
            medicalInfo: {
                name: "Omeprazole",
                imageUrl: null,
                uses: ["Acid reflux", "Gastric ulcers"],
                sideEffects: {
                    common: ["Headache", "Abdominal pain"],
                    serious: ["Vitamin B12 deficiency", "Kidney problems"],
                    rare: ["Allergic skin reactions"],
                },
                warningsAndPrecautions: [
                    "Avoid long-term use unless prescribed",
                    "May increase risk of bone fractures",
                ],
                interactions: {
                    drugInteractions: ["Clopidogrel", "Warfarin"],
                    foodInteractions: [],
                    conditionInteractions: ["Osteoporosis", "Liver disease"],
                },
                overdoseMissedDose: {
                    overdose: "May cause confusion, rapid heartbeat",
                    missedDose:
                        "Take as soon as possible unless near next dose",
                },
                approximatePrice: {
                    currency: "USD",
                    priceRange: "8-20",
                    unit: "per pack",
                    lastUpdated: "2025-08-01",
                },
                manufacturer: ["AstraZeneca"],
                activeIngredients: [
                    {
                        name: "Omeprazole",
                        strength: "20mg",
                        purpose: "Proton pump inhibitor",
                    },
                ],
                dosageForm: "Capsule",
                prescriptionRequired: false,
                genericAvailable: true,
                fdaApproved: true,
                lastUpdated: "2025-08-01",
            },
        },
    ],
    searchMetadata: {
        searchDate: "2025-08-12",
        originalCount: 4,
        foundCount: 4,
        sourcesCount: 2,
        reliability: "High",
    },
    citations: {
        sources: [
            {
                index: 1,
                title: "Drugs.com - Amoxicillin Information",
                url: "https://www.drugs.com/amoxicillin.html",
                domain: "drugs.com",
            },
            {
                index: 2,
                title: "WebMD - Atorvastatin Overview",
                url: "https://www.webmd.com/drugs/2/drug-889-atorvastatin.aspx",
                domain: "webmd.com",
            },
        ],
        queries: ["Amoxicillin dosage", "Atorvastatin side effects"],
        hasGrounding: true,
    },
};
