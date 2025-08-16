import { MedicineSearchResult } from "@/types/prescription";

export const dummyMedicineSearchResult: MedicineSearchResult = {
    medicines: [
        {
            prescription: {
                name: "Augmentin 625mg",
                dosage: "625mg",
                quantity: null,
                frequency: "Take once in the morning and once at night",
                duration: "5 days",
                instructions: "after meals",
                uncertain: false,
            },
            medicalInfo: {
                name: "Augmentin 625mg",
                imageUrl: null,
                uses: [
                    "Treatment of bacterial infections",
                    "Sinusitis",
                    "Pneumonia",
                    "Ear infections (otitis media)",
                    "Bronchitis",
                    "Urinary tract infections (UTIs)",
                    "Skin and soft tissue infections",
                ],
                sideEffects: {
                    common: [
                        "Diarrhea",
                        "Nausea",
                        "Skin rash",
                        "Vaginitis",
                        "Vomiting",
                        "Abdominal discomfort",
                        "Gas",
                        "Headache",
                    ],
                    serious: [
                        "Liver problems (e.g., liver damage, cholestatic jaundice)",
                        "Intestinal infection (Clostridioides difficile-associated diarrhea)",
                        "Severe skin reactions",
                        "Drug-induced enterocolitis syndrome (DIES)",
                        "Anaphylaxis (severe allergic reaction)",
                    ],
                    rare: [],
                },
                warningsAndPrecautions: [
                    "Do not take if you have a history of liver problems after taking Augmentin in the past.",
                    "Use with caution in patients with kidney problems; dose adjustment may be needed.",
                    "Use with caution in patients with liver problems; hepatic function should be monitored.",
                    "Can decrease the effectiveness of oral birth control pills.",
                    "Liquid suspension form contains phenylalanine and should not be used by phenylketonurics.",
                ],
                interactions: {
                    drugInteractions: [
                        "Oral anticoagulants (e.g., warfarin) - may increase bleeding risk.",
                        "Allopurinol - may increase risk of skin rash.",
                        "Mycophenolate mofetil - reduction in pre-dose concentration of active metabolite.",
                        "Probenecid - may result in increased and prolonged blood levels of amoxicillin.",
                    ],
                    foodInteractions: [
                        "Absorption of clavulanate potassium is optimized when taken at the start of a meal.",
                    ],
                    conditionInteractions: [
                        "Liver problems (especially history of Augmentin-induced liver issues)",
                        "Kidney problems",
                        "Penicillin allergy",
                        "Cephalosporin allergy",
                    ],
                },
                overdoseMissedDose: {
                    overdose:
                        "In case of overdose, seek immediate medical attention. Symptoms may include gastrointestinal upset and fluid/electrolyte imbalance. Renal impairment may be observed with high doses. Treatment is supportive.",
                    missedDose:
                        "Take the missed dose as soon as you remember, unless it is almost time for your next scheduled dose. In that case, skip the missed dose and take the next dose at the regular time. Do not take a double dose to make up for a missed one.",
                },
                approximatePrice: {
                    currency: "USD",
                    priceRange: "2.50-5.50",
                    unit: "per tablet (based on Indian market price of ₹200-₹450 per 10-tab strip)",
                    lastUpdated: "2024/2025",
                },
                manufacturer: [
                    "GlaxoSmithKline Pharmaceuticals Ltd.",
                    "USAntibiotics (Amoxicillin/Clavulanate in US)",
                ],
                activeIngredients: [
                    {
                        name: "Amoxicillin",
                        strength: "500mg",
                        purpose:
                            "Antibiotic (penicillin-class) that fights bacteria",
                    },
                    {
                        name: "Clavulanate Potassium",
                        strength: "125mg",
                        purpose:
                            "Beta-lactamase inhibitor that prevents bacterial resistance to amoxicillin",
                    },
                ],
                dosageForm: "tablet",
                prescriptionRequired: true,
                genericAvailable: true,
                fdaApproved: true,
                lastUpdated: "2025-08-13",
                healthProfileInteraction: {
                    hasInteractions: true,
                    criticalCount: 2,
                    highCount: 1,
                    moderateCount: 1,
                    lowCount: 0,
                    interactions: [
                        {
                            type: "allergy",
                            item: "Cephalosporins",
                            description:
                                "Augmentin (amoxicillin/clavulanate) is a penicillin-class antibiotic. Patients with a known allergy to cephalosporins may experience a cross-reactivity reaction due to structural similarities between penicillins and cephalosporins. This is a significant contraindication.",
                            severity: "critical",
                            recommendation:
                                "Augmentin is contraindicated. An alternative antibiotic from a different class should be prescribed.",
                        },
                        {
                            type: "medical_condition",
                            item: "Liver Disease",
                            description:
                                "Augmentin can cause liver problems, including liver damage and cholestatic jaundice. It is contraindicated if there's a history of liver problems after taking Augmentin previously. Patients with pre-existing liver disease should be closely monitored.",
                            severity: "critical",
                            recommendation:
                                "Augmentin should be avoided given pre-existing liver disease, especially if severe. Liver function should be monitored if no alternative is available and benefits outweigh risks. Consult a hepatologist.",
                        },
                        {
                            type: "medical_condition",
                            item: "Kidney Disease",
                            description:
                                "Augmentin components are eliminated via the kidneys. Dose adjustments are often necessary in patients with kidney impairment to prevent accumulation and increased side effects.",
                            severity: "high",
                            recommendation:
                                "Dose adjustment of Augmentin is required based on the patient's renal function (CrCl). Close monitoring of kidney function is essential. An alternative drug with less renal impact might be considered.",
                        },
                        {
                            type: "dietary_restriction",
                            item: "Alcohol Avoidance",
                            description:
                                "While there is no known direct interaction, consuming alcohol with Augmentin can worsen certain side effects such as nausea, vomiting, dizziness, and liver problems.",
                            severity: "moderate",
                            recommendation:
                                "The patient should strictly adhere to alcohol avoidance while on Augmentin to minimize potential exacerbation of side effects, especially given the liver disease.",
                        },
                    ],
                    overallRisk: "critical",
                    summary:
                        "Augmentin poses a critical risk due to the patient's cephalosporin allergy and pre-existing liver disease. Renal impairment requires careful dose adjustment. Alcohol avoidance is also advised.",
                },
            },
        },
        {
            prescription: {
                name: "Enzoflam",
                dosage: null,
                quantity: null,
                frequency: "Take once in the morning and once at night",
                duration: "5 days",
                instructions: "after meals",
                uncertain: false,
            },
            medicalInfo: {
                name: "Enzoflam",
                imageUrl: null,
                uses: [
                    "Relief of pain and inflammation (e.g., musculoskeletal and joint disorders)",
                    "Fever reduction",
                    "Osteoarthritis",
                    "Rheumatoid arthritis",
                    "Ankylosing spondylitis",
                    "Muscle pain",
                    "Tooth pain",
                    "Menstrual cramps",
                    "Post-operative inflammation",
                ],
                sideEffects: {
                    common: [
                        "Nausea",
                        "Vomiting",
                        "Stomach pain",
                        "Indigestion",
                        "Diarrhea",
                        "Dizziness",
                        "Sleepiness",
                        "Skin rash",
                        "Headache",
                    ],
                    serious: [
                        "Liver damage",
                        "Gastrointestinal bleeding",
                        "Stomach ulcers",
                        "Kidney damage",
                    ],
                    rare: [],
                },
                warningsAndPrecautions: [
                    "Avoid consuming alcohol; it may worsen liver problems and increase risk of stomach bleeding.",
                    "Do not take with other paracetamol-containing products or other NSAIDs without consulting a doctor.",
                    "Use with caution in patients with kidney disease; dose adjustment may be needed.",
                    "Not recommended for patients with severe or active liver disease.",
                    "May cause dizziness and sleepiness; avoid driving or operating heavy machinery until you know how it affects you.",
                    "Take with food to avoid stomach upset.",
                ],
                interactions: {
                    drugInteractions: [
                        "Medicines containing Acetaminophen/Paracetamol (increased risk of liver damage).",
                        "Other Non-Steroidal Anti-Inflammatory Drugs (NSAIDs) (increased risk of gastrointestinal side effects, ulcers, bleeding).",
                        "Corticosteroids (increased risk of gastrointestinal ulcers/bleeding).",
                        "Antihypertensives (e.g., enalapril, propranolol) - NSAIDs can reduce their effect.",
                        "Methotrexate, Cyclosporine, Tacrolimus (increased toxicity).",
                    ],
                    foodInteractions: [
                        "Alcohol (unsafe, increased risk of liver damage, drowsiness, stomach bleeding).",
                    ],
                    conditionInteractions: [
                        "Heart Disease (Diclofenac is an NSAID, caution with heart failure and hypertension).",
                        "Kidney Disease (can affect kidney function, not advised for severe problems).",
                        "Liver Disease (not recommended for severe or active liver disease, increased risk of damage).",
                        "Peptic ulcers (may worsen existing ulcers).",
                    ],
                },
                overdoseMissedDose: {
                    overdose:
                        "In case of overdose, seek immediate medical attention. Overdose, especially of paracetamol, can lead to severe liver toxicity. Gastric lavage and activated charcoal may be considered, along with specific antidotes for paracetamol (acetylcysteine).",
                    missedDose:
                        "If a dose is missed, take it as soon as you remember if there's enough time before the next dose. If not, skip the missed dose and continue with the regular schedule. Do not double the dose. Do not exceed recommended daily dosage.",
                },
                approximatePrice: {
                    currency: "USD",
                    priceRange: "1.65-2.00",
                    unit: "per strip of 10 tablets (based on Indian market price of ₹136.94-₹167.00)",
                    lastUpdated: "2024/2025",
                },
                manufacturer: ["Alkem Laboratories Ltd."],
                activeIngredients: [
                    {
                        name: "Diclofenac",
                        strength: "50mg",
                        purpose:
                            "Non-steroidal anti-inflammatory drug (NSAID) to reduce pain and inflammation",
                    },
                    {
                        name: "Paracetamol (Acetaminophen)",
                        strength: "325mg",
                        purpose:
                            "Analgesic and antipyretic to relieve pain and reduce fever",
                    },
                    {
                        name: "Serratiopeptidase",
                        strength: "15mg",
                        purpose:
                            "Enzyme to reduce inflammation and swelling, promote healing",
                    },
                ],
                dosageForm: "tablet",
                prescriptionRequired: true,
                genericAvailable: true,
                fdaApproved: false,
                lastUpdated: "2025-08-13",
                healthProfileInteraction: {
                    hasInteractions: true,
                    criticalCount: 2,
                    highCount: 2,
                    moderateCount: 0,
                    lowCount: 0,
                    interactions: [
                        {
                            type: "medical_condition",
                            item: "Liver Disease",
                            description:
                                "Enzoflam contains Diclofenac and Paracetamol, both of which can cause liver damage, especially in patients with pre-existing liver conditions or with alcohol. It is not recommended for severe or active liver disease.",
                            severity: "critical",
                            recommendation:
                                "Enzoflam is contraindicated in severe liver disease. Given the patient's liver disease, a safer alternative for pain and inflammation should be considered. Liver function must be closely monitored if no alternatives exist and treatment is deemed essential.",
                        },
                        {
                            type: "dietary_restriction",
                            item: "Alcohol Avoidance",
                            description:
                                "Consuming alcohol with Enzoflam is unsafe as it significantly increases the risk of liver damage (due to paracetamol and diclofenac) and can increase drowsiness and risk of stomach bleeding.",
                            severity: "critical",
                            recommendation:
                                "Strict avoidance of alcohol is critical. Alternative medications should be considered given the combined risk of alcohol, Enzoflam, and pre-existing liver disease.",
                        },
                        {
                            type: "medical_condition",
                            item: "Heart Disease",
                            description:
                                "Enzoflam contains Diclofenac, an NSAID, which can increase the risk of cardiovascular events, including heart failure and hypertension, especially with prolonged use. Caution is required in patients with pre-existing heart disease.",
                            severity: "high",
                            recommendation:
                                "Use with extreme caution. A cardiologist should be consulted to assess the risk, and a safer alternative for pain management, not an NSAID, should be preferred.",
                        },
                        {
                            type: "medical_condition",
                            item: "Kidney Disease",
                            description:
                                "NSAIDs like Diclofenac can impair kidney function and are contraindicated or require significant caution in patients with kidney disease. Prolonged use can cause kidney injury.",
                            severity: "high",
                            recommendation:
                                "Enzoflam should be used with extreme caution, and dose adjustment based on renal function is necessary. Regular monitoring of kidney function is crucial. Consider an alternative medication.",
                        },
                    ],
                    overallRisk: "critical",
                    summary:
                        "Enzoflam presents critical risks due to severe interactions with the patient's liver disease and alcohol avoidance, and high risks with heart and kidney disease. It should be avoided due to significant contraindications and high risk of exacerbating existing conditions.",
                },
            },
        },
        {
            prescription: {
                name: "Pan-D 40mg",
                dosage: "40mg",
                quantity: null,
                frequency: "Take once in the morning only",
                duration: "5 days",
                instructions: "before meals",
                uncertain: false,
            },
            medicalInfo: {
                name: "Pan-D 40mg",
                imageUrl: null,
                uses: [
                    "Treatment of Gastroesophageal Reflux Disease (GERD)",
                    "Acidity",
                    "Heartburn",
                    "Indigestion (dyspepsia)",
                    "Stomach pain",
                    "Nausea",
                    "Vomiting",
                    "Gastric and duodenal ulcers",
                ],
                sideEffects: {
                    common: [
                        "Diarrhea",
                        "Stomach pain",
                        "Flatulence (gas)",
                        "Dry mouth",
                        "Dizziness",
                        "Headache",
                    ],
                    serious: [
                        "Cardiac risks (e.g., QT interval prolongation, serious ventricular arrhythmia, sudden cardiac death) due to Domperidone",
                        "Acute interstitial nephritis and acute kidney injury (due to Pantoprazole)",
                    ],
                    rare: [],
                },
                warningsAndPrecautions: [
                    "Domperidone is contraindicated in patients with conditions where cardiac conduction is or could be impaired, underlying cardiac diseases (e.g., congestive heart failure), or those receiving other QT-prolonging medications or potent CYP3A4 inhibitors.",
                    "Domperidone is contraindicated in prolactin-releasing pituitary tumors, gastrointestinal hemorrhage, mechanical obstruction, or perforation.",
                    "Caution in patients with liver disease (Pantoprazole).",
                    "Take preferably before a meal.",
                ],
                interactions: {
                    drugInteractions: [
                        "Levothyroxine - Pantoprazole can decrease absorption, requiring dose adjustment.",
                        "Drugs that prolong the QT interval (e.g., certain antiarrhythmics, antipsychotics, some antibiotics) - increased risk of cardiac arrhythmias with Domperidone.",
                        "Potent CYP3A4 inhibitors (e.g., clarithromycin, erythromycin, itraconazole, verapamil, ritonavir) - increased domperidone plasma concentrations and cardiac risk.",
                        "Drugs whose absorption is dependent on gastric pH (e.g., some antifungals, iron salts) - Pantoprazole can affect absorption.",
                    ],
                    foodInteractions: ["Preferably taken before meals."],
                    conditionInteractions: [
                        "Heart Disease (Domperidone has cardiac risks like QT prolongation)",
                        "Kidney Disease (Pantoprazole can cause acute kidney injury)",
                        "Liver Disease (caution with Pantoprazole)",
                        "Prolactin-releasing pituitary tumor (prolactinoma)",
                        "Gastrointestinal hemorrhage, mechanical obstruction, or perforation",
                    ],
                },
                overdoseMissedDose: {
                    overdose:
                        "In case of overdose, seek immediate medical attention. Management is supportive and symptomatic. ECG monitoring is recommended due to Domperidone's cardiac effects.",
                    missedDose:
                        "If a dose is missed, take it as soon as you remember unless it is almost time for your next scheduled dose. Skip the missed dose and take the next dose at the regular time. Do not take a double dose.",
                },
                approximatePrice: {
                    currency: "USD",
                    priceRange: "1.75-3.00",
                    unit: "per strip of 15 capsules (based on Indian market price of ₹145-₹254)",
                    lastUpdated: "2024/2025",
                },
                manufacturer: ["Alkem Laboratories Limited"],
                activeIngredients: [
                    {
                        name: "Pantoprazole",
                        strength: "40mg",
                        purpose:
                            "Proton pump inhibitor (PPI) that reduces stomach acid production",
                    },
                    {
                        name: "Domperidone",
                        strength: "30mg",
                        purpose:
                            "Prokinetic and antiemetic that improves stomach and intestinal motility and reduces nausea/vomiting",
                    },
                ],
                dosageForm: "capsule",
                prescriptionRequired: true,
                genericAvailable: true,
                fdaApproved: false,
                lastUpdated: "2025-08-13",
                healthProfileInteraction: {
                    hasInteractions: true,
                    criticalCount: 0,
                    highCount: 1,
                    moderateCount: 2,
                    lowCount: 0,
                    interactions: [
                        {
                            type: "medical_condition",
                            item: "Heart Disease",
                            description:
                                "Pan-D contains Domperidone, which carries a risk of QT prolongation, ventricular arrhythmias, and sudden cardiac death, especially in patients with pre-existing heart conditions like congestive heart failure. The 30mg dose is at the higher end of recommended safe dosages.",
                            severity: "high",
                            recommendation:
                                "Use with extreme caution, if at all. A cardiologist consultation is strongly recommended to assess cardiac risk. ECG monitoring may be necessary, and a safer alternative for gastric motility/antiemetic effects should be considered.",
                        },
                        {
                            type: "current_medication",
                            item: "Levothyroxine",
                            description:
                                "Pantoprazole (a PPI) can decrease the oral bioavailability and absorption of levothyroxine by increasing gastric pH, potentially reducing its effectiveness and requiring an increase in levothyroxine dose.",
                            severity: "moderate",
                            recommendation:
                                "Monitor thyroid stimulating hormone (TSH) levels closely to ensure therapeutic efficacy of Levothyroxine. Consider separating administration times by several hours. Dose adjustment of Levothyroxine may be necessary.",
                        },
                        {
                            type: "medical_condition",
                            item: "Kidney Disease",
                            description:
                                "Pantoprazole can rarely cause acute interstitial nephritis and acute kidney injury. Domperidone's elimination may also be affected by renal impairment.",
                            severity: "moderate",
                            recommendation:
                                "Use with caution and monitor kidney function. Dose adjustment may be needed based on the severity of renal impairment. Consider alternative anti-secretory or prokinetic agents.",
                        },
                    ],
                    overallRisk: "high",
                    summary:
                        "Pan-D presents a high risk due to Domperidone's cardiac effects in a patient with heart disease. The interaction with Levothyroxine and potential impact on kidney function also require careful management and monitoring.",
                },
            },
        },
        {
            prescription: {
                name: "Hexigel gum paint",
                dosage: null,
                quantity: null,
                frequency: "Take once in the morning and once at night",
                duration: "1 week",
                instructions: "Massage",
                uncertain: false,
            },
            medicalInfo: {
                name: "Hexigel gum paint",
                imageUrl: null,
                uses: [
                    "Treatment of inflammation of gums (gingivitis)",
                    "Mouth infections",
                    "Oral ulcers",
                    "Oral candidiasis (oral thrush)",
                    "Reduces dental plaque and tartar",
                    "Pain relief in the oral cavity",
                ],
                sideEffects: {
                    common: [
                        "Temporary taste disturbance",
                        "Staining of teeth",
                        "Hard dental plaque",
                        "Local irritation",
                        "Dry mouth",
                    ],
                    serious: [],
                    rare: [],
                },
                warningsAndPrecautions: [
                    "For external/oral topical use only; avoid swallowing large amounts.",
                    "Do not eat, drink, or smoke for at least 30 minutes after using.",
                    "Inform doctor if you have had allergic reactions to similar medicines.",
                    "Prolonged use may lead to tooth staining.",
                ],
                interactions: {
                    drugInteractions: [],
                    foodInteractions: [
                        "Avoid eating, drinking, or smoking for at least 30 minutes after application.",
                    ],
                    conditionInteractions: [],
                },
                overdoseMissedDose: {
                    overdose:
                        "Overdose is unlikely with topical use unless significant amounts are swallowed. If ingested, seek medical attention. Management is supportive.",
                    missedDose:
                        "Apply as soon as remembered if there's enough time before the next scheduled application. If not, skip the missed application and continue with the regular schedule. Do not double the dose.",
                },
                approximatePrice: {
                    currency: "USD",
                    priceRange: "0.75-0.90",
                    unit: "per 15g tube (based on Indian market price of ₹60.71-₹70.9)",
                    lastUpdated: "2024/2025",
                },
                manufacturer: [
                    "Icpa Health Products Ltd.",
                    "Ipca Laboratories Ltd.",
                ],
                activeIngredients: [
                    {
                        name: "Chlorhexidine Gluconate",
                        strength: "1%w/w",
                        purpose:
                            "Antiseptic to kill harmful microorganisms and reduce plaque/tartar",
                    },
                ],
                dosageForm: "gel/mouth paint",
                prescriptionRequired: false,
                genericAvailable: true,
                fdaApproved: false,
                lastUpdated: "2025-08-13",
                healthProfileInteraction: {
                    hasInteractions: true,
                    criticalCount: 0,
                    highCount: 0,
                    moderateCount: 0,
                    lowCount: 0,
                    interactions: [
                        {
                            type: "dietary_restriction",
                            item: "Alcohol Avoidance",
                            description:
                                "It is not definitively known if Hexigel Mouth Gel interacts with alcohol. While topical application leads to minimal systemic absorption, some mouthwashes/gels may contain alcohol as a solvent. The patient's strict alcohol avoidance should be considered even for topical products if there is any alcohol content or risk of accidental ingestion.",
                            severity: "info",
                            recommendation:
                                "Confirm with the prescribing doctor or pharmacist if the specific Hexigel formulation contains alcohol. If it does, and the patient's alcohol avoidance is strict for all routes, an alternative might be considered or clear instructions given to avoid ingestion.",
                        },
                        {
                            type: "allergy",
                            item: "Latex",
                            description:
                                "Latex allergy is generally relevant for medical devices or packaging. Hexigel gum paint itself is unlikely to contain latex as an active ingredient. However, if any applicator or packaging contains latex, it could pose a risk.",
                            severity: "info",
                            recommendation:
                                "Inspect product packaging and any included applicators for latex content. If latex is present and the patient's allergy is severe, a latex-free alternative should be sought.",
                        },
                    ],
                    overallRisk: "minimal",
                    summary:
                        "Hexigel gum paint has minimal systemic interactions due to its topical nature. Minor considerations exist for alcohol avoidance and potential latex in applicators, both at an informational level.",
                },
            },
        },
    ],
    searchMetadata: {
        searchDate: "2025-08-13T02:34:41.497Z",
        sourcesCount: 49,
        reliability: "high",
        totalInteractions: 13,
        criticalInteractions: 4,
        overallRiskLevel: "critical",
        originalCount: 4,
        foundCount: 4,
    },
    citations: {
        sources: [],
        queries: [
            "Augmentin 625mg uses side effects warnings interactions 2024 2025",
            "Augmentin active ingredients",
            "Augmentin dosage forms",
            "Augmentin prescription required FDA approved generic available",
            "Augmentin price",
            "Augmentin manufacturer",
            "Augmentin and sulfa allergy",
            "Augmentin and latex allergy",
            "Augmentin and cephalosporin allergy",
            "Augmentin and heart disease",
            "Augmentin and kidney disease",
            "Augmentin and liver disease",
            "Augmentin and atorvastatin interaction",
            "Augmentin and levothyroxine interaction",
            "Augmentin and alcohol",
            "Augmentin and grapefruit",
            "Enzoflam uses side effects warnings interactions 2024 2025",
            "Enzoflam composition",
            "Enzoflam price",
            "Enzoflam manufacturer",
            "Enzoflam and sulfa allergy",
            "Enzoflam and latex allergy",
            "Enzoflam and cephalosporin allergy",
            "Enzoflam and heart disease",
            "Enzoflam and kidney disease",
            "Enzoflam and liver disease",
            "Enzoflam and atorvastatin interaction",
            "Enzoflam and levothyroxine interaction",
            "Enzoflam and alcohol",
            "Enzoflam and grapefruit",
            "Pan-D 40mg uses side effects warnings interactions 2024 2025",
            "Pan-D 40mg composition",
            "Pan-D price",
            "Pan-D manufacturer",
            "Pan-D and sulfa allergy",
            "Pan-D and latex allergy",
            "Pan-D and cephalosporin allergy",
            "Pan-D and heart disease",
            "Pan-D and kidney disease",
            "Pan-D and liver disease",
            "Pan-D and atorvastatin interaction",
            "Pan-D and levothyroxine interaction",
            "Pan-D and alcohol",
            "Pan-D and grapefruit",
            "Hexigel gum paint uses side effects warnings interactions 2024 2025",
            "Hexigel gum paint composition",
            "Hexigel gum paint price",
            "Hexigel gum paint manufacturer",
            "Hexigel gum paint and sulfa allergy",
            "Hexigel gum paint and latex allergy",
            "Hexigel gum paint and cephalosporin allergy",
            "Hexigel gum paint and heart disease",
            "Hexigel gum paint and kidney disease",
            "Hexigel gum paint and liver disease",
            "Hexigel gum paint and atorvastatin interaction",
            "Hexigel gum paint and levothyroxine interaction",
            "Hexigel gum paint and alcohol",
            "Hexigel gum paint and grapefruit",
            "Hexigel gum paint active ingredients",
            "Hexigel gum paint alcohol content",
            "Domperidone heart disease interaction QT prolongation",
            "Pantoprazole levothyroxine interaction",
            "Augmentin price in India 2024",
            "Enzoflam price in India 2024",
            "Pan-D 40mg price in India 2024",
            "Hexigel gum paint price in India 2024",
            "Augmentin manufacturer",
            "Enzoflam manufacturer",
            "Pan-D manufacturer",
            "Hexigel gum paint manufacturer",
            "Augmentin FDA approval date",
            "Enzoflam FDA approval",
            "Pan-D FDA approval",
            "Hexigel gum paint FDA approval",
        ],
        hasGrounding: true,
    },
    overallHealthAnalysis: {
        riskLevel: "critical",
        summary:
            "The patient's prescribed medications present a critical overall risk primarily due to severe interactions with existing allergies and medical conditions. Augmentin is contraindicated due to a cephalosporin allergy and also poses a critical risk with pre-existing liver disease. Enzoflam is critically contraindicated due to severe liver/kidney disease and the strict alcohol avoidance. Pan-D carries a high cardiac risk due to Domperidone in a patient with heart disease and a moderate interaction with Levothyroxine. Hexigel gum paint presents minimal risk, primarily related to topical application considerations.",
        keyRecommendations: [
            "Immediate re-evaluation of Augmentin prescription: Augmentin is contraindicated due to cephalosporin allergy. A non-cross-reactive antibiotic from a different class must be prescribed.",
            "Immediate re-evaluation of Enzoflam prescription: Enzoflam is contraindicated due to critical interactions with liver disease, kidney disease, heart disease, and alcohol avoidance. A safer alternative for pain/inflammation, preferably non-NSAID and non-paracetamol containing, should be chosen.",
            "Urgent review of Pan-D prescription: Domperidone's cardiac risks (QT prolongation) in a patient with heart disease necessitate immediate medical consultation. Consider alternatives for GERD and nausea. Levothyroxine levels should be closely monitored and dose adjusted if Pan-D is continued.",
            "Comprehensive medication review: All current and newly prescribed medications should be reviewed by a healthcare professional (physician and pharmacist) for potential cumulative effects on liver, kidney, and heart function, and for any new interactions that may arise from changes.",
            "Patient education: Provide detailed counseling to the patient regarding all identified risks and the importance of adhering to dietary restrictions and reporting any new symptoms immediately.",
        ],
        requiresImmediateAttention: true,
    },
};
