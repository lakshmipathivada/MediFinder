export interface MedicineInfo {
  id: string;
  name: string;
  genericName: string;
  category: string;
  aliases: string[];
  uses: string[];
  dosage: string;
  commonSideEffects: string[];
  seriousSideEffects: string[];
  foodInstructions: string;
  warningsAndPrecautions: string[];
  drugInteractions: string[];
  missedDose: string;
  storageInstructions: string;
  whenToConsultDoctor: string[];
}

export const MEDICINE_DATABASE: MedicineInfo[] = [
  {
    id: 'med-dolo',
    name: 'Dolo 650 / Paracetamol',
    genericName: 'Paracetamol (Acetaminophen)',
    category: 'Analgesic & Antipyretic (Pain Reliever & Fever Reducer)',
    aliases: ['dolo', 'dolo650', 'dolo 650', 'paracetamol', 'paracetmol', 'paracetimol', 'crocin', 'calpol', 'pacimol', 'acetaminophen', 'pyrexia', 'fever tablet'],
    uses: [
      'Relief of mild to moderate fever',
      'Headache and migraine relief',
      'Body pain, muscle aches, and joint stiffness',
      'Toothache and post-vaccination fever or soreness',
      'Period pain (dysmenorrhea)'
    ],
    dosage: 'Adults: 500mg to 650mg every 4 to 6 hours as needed. Do not exceed 4000mg (4 grams) in 24 hours. Minimum 4-hour gap between doses.',
    commonSideEffects: [
      'Mild nausea or stomach discomfort',
      'Sweating as fever comes down',
      'Mild drowsiness'
    ],
    seriousSideEffects: [
      'Severe allergic reaction (rash, hives, swelling of face/lips/throat)',
      'Jaundice (yellowing of eyes or skin indicating liver strain)',
      'Unusual dark urine or extreme tiredness'
    ],
    foodInstructions: 'Can be taken before or after food with a full glass of water. Taking it after food or with milk helps minimize any minor stomach irritation.',
    warningsAndPrecautions: [
      'Strictly avoid alcohol while taking paracetamol as it significantly increases the risk of severe liver damage.',
      'Do not take multiple paracetamol-containing products simultaneously (e.g., cold syrups, cough tablets).',
      'Caution required in patients with pre-existing liver disease, kidney impairment, or chronic alcoholism.'
    ],
    drugInteractions: [
      'Warfarin / Coumadin (increased risk of bleeding with prolonged high-dose paracetamol)',
      'Other cold/flu medications containing acetaminophen',
      'Cholestyramine (reduces paracetamol absorption)',
      'Metoclopramide / Domperidone'
    ],
    missedDose: 'Take the missed dose as soon as you remember. If it is almost time for your next scheduled dose, skip the missed dose. Never double the dose to make up for a forgotten one.',
    storageInstructions: 'Store at room temperature below 30°C away from moisture, direct sunlight, and excessive heat. Keep strictly out of reach of children.',
    whenToConsultDoctor: [
      'Fever persists for more than 3 days despite taking medication',
      'Pain worsens or persists for more than 5 days',
      'Development of skin rash, yellowing skin, or breathing difficulty'
    ]
  },
  {
    id: 'med-azithromycin',
    name: 'Azithral 500 / Azithromycin',
    genericName: 'Azithromycin',
    category: 'Macrolide Antibiotic',
    aliases: ['azithral', 'azithral500', 'azithral 500', 'azithromycin', 'azitral', 'azithro', 'azee', 'zithromax', 'azithral 250'],
    uses: [
      'Upper respiratory tract infections (sinusitis, tonsillitis, pharyngitis)',
      'Lower respiratory tract infections (bronchitis, pneumonia)',
      'Ear infections (otitis media)',
      'Skin and soft tissue infections',
      'Certain sexually transmitted bacterial infections (chlamydia)'
    ],
    dosage: 'General guidance: 500mg once daily for 3 to 5 days, or as prescribed by your doctor. Complete the full prescribed course even if symptoms improve early.',
    commonSideEffects: [
      'Nausea, vomiting, or stomach cramps',
      'Mild diarrhea or loose stools',
      'Temporary headache or dizziness'
    ],
    seriousSideEffects: [
      'Severe watery or bloody diarrhea (Clostridium difficile infection)',
      'Irregular heartbeat or heart palpitations (QT prolongation)',
      'Severe allergic skin reaction or facial swelling',
      'Liver dysfunction (dark urine, loss of appetite, abdominal pain)'
    ],
    foodInstructions: 'Can be taken with or without food. Taking it with meals reduces stomach upset. Avoid taking antacids containing aluminum or magnesium within 2 hours of your dose.',
    warningsAndPrecautions: [
      'Must be taken strictly as a full course to prevent bacterial resistance.',
      'Inform doctor if you have heart rhythm disorders, myasthenia gravis, or liver disease.',
      'Do not use for viral infections like common cold or flu (antibiotics only kill bacteria).'
    ],
    drugInteractions: [
      'Antacids containing aluminum or magnesium (binds and decreases absorption)',
      'Warfarin (may increase bleeding risks)',
      'Digoxin (increased digoxin levels)',
      'Ergotamine (risk of ergotism)'
    ],
    missedDose: 'Take the missed dose as soon as remembered on the same day. If close to the next day’s dose, skip it and stay on schedule. Do not take double doses.',
    storageInstructions: 'Store in a cool, dry place below 25°C protected from light and heat. Keep liquid suspensions in cool temperature and use within prescribed timeframe.',
    whenToConsultDoctor: [
      'Severe, persistent diarrhea or severe stomach cramps occur',
      'Heart palpitations, chest tightness, or dizziness',
      'Signs of severe allergic reaction (hives, difficulty breathing)'
    ]
  },
  {
    id: 'med-[#metformin]',
    name: 'Metformin 500mg / Glycomet',
    genericName: 'Metformin Hydrochloride',
    category: 'Biguanide Anti-Diabetic Agent',
    aliases: ['metformin', 'metformin500', 'glycomet', 'glucophage', 'glycomet 500', 'sugar tablet', 'diabetes medicine'],
    uses: [
      'Management of Type 2 Diabetes Mellitus to lower blood glucose levels',
      'Polycystic Ovary Syndrome (PCOS) management to improve insulin sensitivity',
      'Prevention of diabetes progression in prediabetic individuals'
    ],
    dosage: 'General guidance: Initial dose is usually 500mg once or twice daily. Maximum dose is determined by physician based on HbA1c and blood sugar readings.',
    commonSideEffects: [
      'Nausea, gas, and abdominal bloating',
      'Diarrhea or loose stools (especially when starting therapy)',
      'Metallic taste in mouth',
      'Mild loss of appetite'
    ],
    seriousSideEffects: [
      'Lactic Acidosis (rare but severe: extreme tiredness, cold skin, muscle pain, slow heart rate)',
      'Long-term Vitamin B12 deficiency (numbness or tingling in hands/feet)',
      'Hypoglycemia (low blood sugar) if combined with insulin or sulfonylureas'
    ],
    foodInstructions: 'MUST be taken WITH or immediately AFTER meals (breakfast/dinner). Taking it with food drastically reduces gastrointestinal side effects like stomach upset and diarrhea.',
    warningsAndPrecautions: [
      'Avoid heavy alcohol consumption while on Metformin to reduce the risk of lactic acidosis.',
      'Requires regular monitoring of kidney function (serum creatinine) and Vitamin B12 levels.',
      'Temporarily discontinue prior to radiological procedures using iodinated contrast dyes as advised by doctor.'
    ],
    drugInteractions: [
      'Insulin and sulfonylureas (Glimepiride/Gliclazide) — risk of low blood sugar',
      'Diuretics (Furosemide) and ACE inhibitors',
      'Cimetidine and Iodinated contrast agents'
    ],
    missedDose: 'Take with your next meal if remembered soon. If it is time for your next regular meal, skip the missed dose. Do not take extra medicine to make up the dose.',
    storageInstructions: 'Store at room temperature (15°C–30°C) away from excess moisture and heat.',
    whenToConsultDoctor: [
      'Unexplained muscle soreness, severe fatigue, trouble breathing, or feeling unusually cold (lactic acidosis warning)',
      'Persistent severe diarrhea lasting more than 2 weeks',
      'Shakiness, dizziness, or confusion caused by low blood sugar'
    ]
  },
  {
    id: 'med-amlodipine',
    name: 'Amlodipine 5mg / Amlovas',
    genericName: 'Amlodipine Besylate',
    category: 'Calcium Channel Blocker (Antihypertensive)',
    aliases: ['amlodipine', 'amlodipine5mg', 'amlovas', 'amlong', 'stamlo', 'amlo', 'bp medicine', 'high bp tablet'],
    uses: [
      'Treatment of High Blood Pressure (Hypertension)',
      'Prevention of Angina (chest pain due to reduced blood flow to heart)',
      'Coronary artery disease management'
    ],
    dosage: 'General guidance: Usually 5mg taken once daily. May be increased to 10mg once daily under medical supervision based on blood pressure response.',
    commonSideEffects: [
      'Swelling of ankles, feet, or lower legs (peripheral edema)',
      'Dizziness, flushing, or warmth in face/neck',
      'Fatigue or tiredness',
      'Palpitations or rapid heartbeat'
    ],
    seriousSideEffects: [
      'Worsening chest pain or heart attack symptoms during initial dosage',
      'Severe dizziness or fainting due to sudden blood pressure drop',
      'Allergic skin reaction or swelling of tongue/lips'
    ],
    foodInstructions: 'Can be taken with or without food. Take it at the same time every day with a glass of water. AVOID eating grapefruit or drinking grapefruit juice as it increases amlodipine concentration in blood.',
    warningsAndPrecautions: [
      'Do not stop taking amlodipine abruptly, as blood pressure may spike dangerously.',
      'Rise slowly from sitting or lying positions to avoid dizziness/fainting.',
      'Inform doctor if you have severe aortic stenosis or liver impairment.'
    ],
    drugInteractions: [
      'Grapefruit and grapefruit juice (increases drug toxicity)',
      'Simvastatin (increased risk of muscle toxicity; simvastatin dose should be capped)',
      'Other blood pressure drugs (increased hypotensive effect)',
      'Antifungals (Ketoconazole) and Tacrolimus'
    ],
    missedDose: 'If missed by more than 12 hours, skip the missed dose and take your next dose at the regular time. Do not take 2 doses at once.',
    storageInstructions: 'Store in a dry place at room temperature protected from direct light.',
    whenToConsultDoctor: [
      'Significant swelling in lower legs or ankles',
      'Persistent severe dizziness or fainting spells',
      'Chest tightness or unusually rapid heart rate'
    ]
  },
  {
    id: 'med-pantoprazole',
    name: 'Pantoprazole 40mg / Pan 40 / Pantocid',
    genericName: 'Pantoprazole Sodium',
    category: 'Proton Pump Inhibitor (PPI / Antacid)',
    aliases: ['pantoprazole', 'panto', 'pan40', 'pan 40', 'pantocid', 'pantocid 40', 'pan-d', 'acidity tablet', 'gas medicine'],
    uses: [
      'Gastroesophageal Reflux Disease (GERD) and severe acidity',
      'Stomach and duodenal ulcers',
      'Zollinger-Ellison Syndrome (excess stomach acid secretion)',
      'Prevention of NSAID-induced stomach ulcers'
    ],
    dosage: 'General guidance: Usually 40mg taken ONCE daily in the morning on an empty stomach, 30 to 60 minutes before breakfast.',
    commonSideEffects: [
      'Headache or mild dizziness',
      'Flatulence (gas), diarrhea, or constipation',
      'Mild stomach pain or dry mouth'
    ],
    seriousSideEffects: [
      'Severe watery diarrhea caused by C. difficile',
      'Low magnesium levels (muscle spasms, tremors, irregular heartbeat) with long-term use',
      'Bone fractures (hip, wrist, spine) with high-dose long-term therapy',
      'Vitamin B12 deficiency after multi-year daily use'
    ],
    foodInstructions: 'MUST be taken ON AN EMPTY STOMACH at least 30–60 minutes BEFORE breakfast. Swallow tablet whole with water; do not crush or chew.',
    warningsAndPrecautions: [
      'Not intended for immediate relief of occasional mild heartburn.',
      'Long-term use (>1 year) requires calcium and magnesium level checks.',
      'Inform doctor if you experience unexplained weight loss, persistent vomiting, or black tarry stools.'
    ],
    drugInteractions: [
      'Ketoconazole and Itraconazole (reduced absorption of antifungals)',
      'Atazanavir and Nelfinavir (HIV drugs)',
      'Methotrexate (increased blood concentrations of methotrexate)',
      'Clopidogrel (may slightly reduce blood thinning efficacy)'
    ],
    missedDose: 'Take as soon as remembered before your next meal. If it is already late in the day, skip it and resume your morning routine tomorrow.',
    storageInstructions: 'Store below 30°C in original packaging to protect from moisture.',
    whenToConsultDoctor: [
      'Symptoms do not improve after 2 weeks of continuous use',
      'Difficulty swallowing, chest pain, or vomiting blood',
      'Dizziness, muscle twitches, or irregular pulse'
    ]
  },
  {
    id: 'med-amoxicillin',
    name: 'Amoxicillin 250mg / 500mg / Mox',
    genericName: 'Amoxicillin (Penicillin-class Antibiotic)',
    category: 'Beta-lactam Antibiotic',
    aliases: ['amoxicillin', 'amox', 'mox', 'mox500', 'novamox', 'amoxil', 'amoxycillin'],
    uses: [
      'Bacterial chest, lung, and throat infections',
      'Ear, nose, and sinus infections',
      'Urinary tract infections (UTIs)',
      'Dental infections and abscesses',
      'H. pylori stomach infection (part of combination therapy)'
    ],
    dosage: 'General guidance: 250mg to 500mg taken 3 times a day (every 8 hours) or as prescribed by your physician. Complete the entire duration.',
    commonSideEffects: [
      'Mild nausea or vomiting',
      'Diarrhea or soft stools',
      'Mild skin rash or itching'
    ],
    seriousSideEffects: [
      'Severe allergic anaphylaxis (wheezing, face/throat swelling)',
      'Severe skin blistering or peeling (Stevens-Johnson syndrome)',
      'Bloody or persistent watery diarrhea'
    ],
    foodInstructions: 'Can be taken with or without food. Taking it at the start of a meal helps reduce stomach discomfort and improves absorption.',
    warningsAndPrecautions: [
      'Do NOT take if you have a known history of penicillin allergy.',
      'Must complete the full antibiotic course to prevent drug-resistant bacteria.',
      'May reduce the effectiveness of oral contraceptive pills.'
    ],
    drugInteractions: [
      'Allopurinol (increased risk of skin rash)',
      'Probenecid (increases amoxicillin level in blood)',
      'Oral contraceptives (use secondary barrier protection during course)',
      'Methotrexate and blood thinners'
    ],
    missedDose: 'Take as soon as remembered. If close to your next dose, skip the missed one. Never take a double dose.',
    storageInstructions: 'Keep in cool dry place below 25°C. Liquid suspensions should be refrigerated and discarded after 7-14 days as advised.',
    whenToConsultDoctor: [
      'Hives, itching, or swelling of lips/throat (penicillin allergy emergency)',
      'Severe diarrhea or yellowing of eyes/skin'
    ]
  },
  {
    id: 'med-cetirizine',
    name: 'Cetirizine 10mg / Cetzine',
    genericName: 'Cetirizine Hydrochloride',
    category: 'Second-Generation Antihistamine (Anti-Allergy)',
    aliases: ['cetirizine', 'cetzine', 'citrizine', 'okacet', 'zyrtec', 'allergy tablet', 'sneezing tablet'],
    uses: [
      'Allergic rhinitis (sneezing, runny nose, watery eyes, itchy nose)',
      'Urticaria (hives, itching skin, allergic rashes)',
      'Insect bite allergic reactions'
    ],
    dosage: 'General guidance: 10mg ONCE daily for adults and children above 12 years. Preferred at night due to mild sedative effect.',
    commonSideEffects: [
      'Mild drowsiness or sleepiness',
      'Dry mouth',
      'Fatigue or mild headache'
    ],
    seriousSideEffects: [
      'Difficulty urinating or urinary retention',
      'Rapid or irregular heart rate',
      'Severe confusion or extreme agitation'
    ],
    foodInstructions: 'Can be taken with or without food. Swallow with a glass of water.',
    warningsAndPrecautions: [
      'Use caution while driving or operating machinery as it can cause mild drowsiness.',
      'Avoid drinking alcohol while taking cetirizine as it increases sedation.',
      'Dose adjustment required in patients with severe kidney impairment.'
    ],
    drugInteractions: [
      'Alcohol and central nervous system depressants (increased sleepiness)',
      'Sedatives, tranquilizers, or sleep aids',
      'Theophylline'
    ],
    missedDose: 'Take when remembered. If close to your next dose time, skip it. Do not double up.',
    storageInstructions: 'Store below 30°C in a dry place away from direct sunlight.',
    whenToConsultDoctor: [
      'Severe allergic reaction or facial swelling',
      'Inability to pass urine'
    ]
  },
  {
    id: 'med-ibuprofen',
    name: 'Ibuprofen 400mg / Brufen / Combiflam',
    genericName: 'Ibuprofen',
    category: 'Non-Steroidal Anti-Inflammatory Drug (NSAID)',
    aliases: ['ibuprofen', 'brufen', 'combiflam', 'advil', 'motrin', 'painkiller'],
    uses: [
      'Relief of inflammation, swelling, and joint stiffness (arthritis)',
      'Dental pain, menstrual pain, and post-surgical pain',
      'Fever reduction and muscle pain relief'
    ],
    dosage: 'General guidance: 200mg to 400mg every 6 to 8 hours WITH FOOD. Maximum 1200mg/day over-the-counter.',
    commonSideEffects: [
      'Stomach upset, heartburn, or nausea',
      'Mild gas or constipation',
      'Dizziness or mild headache'
    ],
    seriousSideEffects: [
      'Stomach ulcers, GI bleeding (black tarry stools, blood in vomit)',
      'Kidney strain or decreased urine output',
      'Increased risk of heart attack or stroke with prolonged high-dose use'
    ],
    foodInstructions: 'MUST BE TAKEN WITH FOOD or milk to protect the stomach lining against NSAID-induced ulcers.',
    warningsAndPrecautions: [
      'Avoid if you have active stomach ulcers, asthma triggered by NSAIDs, or severe heart/kidney failure.',
      'Do not combine with aspirin or other NSAIDs.',
      'Avoid during the third trimester of pregnancy.'
    ],
    drugInteractions: [
      'Aspirin and other NSAIDs (increased GI bleeding risk)',
      'Blood thinners (Warfarin/Heparin)',
      'Antihypertensives and diuretics (decreased blood pressure control)',
      'Lithium and Methotrexate'
    ],
    missedDose: 'Take with food as soon as remembered. If near next dose, skip missed dose.',
    storageInstructions: 'Store below 25°C in a dry place.',
    whenToConsultDoctor: [
      'Black stools, stomach pain, or blood in vomit',
      'Shortness of breath or ankle swelling'
    ]
  },
  {
    id: 'med-atorvastatin',
    name: 'Atorvastatin 10mg / Atorva / Lipitor',
    genericName: 'Atorvastatin Calcium',
    category: 'HMG-CoA Reductase Inhibitor (Statin / Cholesterol-lowering)',
    aliases: ['atorvastatin', 'atorva', 'lipitor', 'cholesterol tablet'],
    uses: [
      'Lowers LDL (bad cholesterol) and triglycerides in blood',
      'Increases HDL (good cholesterol)',
      'Reduces risk of heart attack, stroke, and angina in patients with heart disease or diabetes'
    ],
    dosage: 'General guidance: 10mg to 40mg once daily, usually taken at bedtime.',
    commonSideEffects: [
      'Mild muscle aches or joint stiffness',
      'Diarrhea or mild indigestion',
      'Nausea or headache'
    ],
    seriousSideEffects: [
      'Rhabdomyolysis (unexplained severe muscle pain, weakness, dark tea-colored urine)',
      'Liver damage (yellowing of skin/eyes, elevated liver enzymes)',
      'Significant increase in blood sugar levels'
    ],
    foodInstructions: 'Can be taken with or without food. Avoid drinking large amounts of grapefruit juice (>1.2 liters daily).',
    warningsAndPrecautions: [
      'Contraindicated during pregnancy and breastfeeding.',
      'Periodic liver function blood tests (LFT) recommended.',
      'Limit alcohol consumption.'
    ],
    drugInteractions: [
      'Grapefruit juice (increases risk of statin side effects)',
      'Fibrates (Gemfibrozil) — increased muscle toxicity risk',
      'Clarithromycin, Erythromycin, and Antifungals'
    ],
    missedDose: 'If missed by less than 12 hours, take it. Otherwise skip and take next scheduled dose.',
    storageInstructions: 'Store at 20°C–25°C away from heat and moisture.',
    whenToConsultDoctor: [
      'Unexplained muscle soreness, tenderness, or weakness accompanied by dark urine'
    ]
  }
];

// Helper to check if a query is health or medicine related
export function isHealthRelatedQuery(query: string): boolean {
  const q = query.toLowerCase();
  const healthKeywords = [
    'medicine', 'tablet', 'capsule', 'syrup', 'dose', 'dosage', 'side effect', 'side-effect',
    'use', 'uses', 'used for', 'indication', 'food', 'after food', 'before food', 'eat',
    'fever', 'pain', 'headache', 'infection', 'stomach', 'cough', 'cold', 'flu', 'cough',
    'blood pressure', 'bp', 'sugar', 'diabetes', 'heart', 'liver', 'kidney', 'allergy',
    'doctor', 'pharmacist', 'prescription', 'interaction', 'precautions', 'warning',
    'missed dose', 'storage', 'avoid', 'dolo', 'paracetamol', 'azithral', 'azithromycin',
    'metformin', 'amlodipine', 'pantoprazole', 'amoxicillin', 'cetirizine', 'ibuprofen',
    'atorvastatin', 'crocin', 'calpol', 'glycomet', 'amlovas', 'pantocid', 'mox', 'brufen',
    'combiflam', 'health', 'symptom', 'cure', 'treatment', 'disease', 'condition', 'take',
    'drinking', 'milk', 'water', 'alcohol', 'pregnancy', 'safe', 'child', 'infant', 'adult'
  ];

  return healthKeywords.some(kw => q.includes(kw));
}

// Extract medicine matching local database using alias/fuzzy logic
export function findLocalMedicine(query: string): MedicineInfo | null {
  if (!query || !query.trim()) return null;
  const cleanQ = query.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const med of MEDICINE_DATABASE) {
    // Check aliases
    for (const alias of med.aliases) {
      const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanQ.includes(cleanAlias) || cleanAlias.includes(cleanQ)) {
        return med;
      }
    }
    // Check main name or generic name
    const cleanName = med.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanGeneric = med.genericName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanQ.includes(cleanName) || cleanQ.includes(cleanGeneric)) {
      return med;
    }
  }

  return null;
}

// Recommend alternative medicines matching category or generic class
export function findMedicineAlternatives(query: string): MedicineInfo[] {
  const matched = findLocalMedicine(query);
  if (matched) {
    return MEDICINE_DATABASE.filter(m => 
      m.id !== matched.id && (
        m.category === matched.category || 
        m.genericName.toLowerCase().includes(matched.genericName.toLowerCase().split(' ')[0]) ||
        m.uses.some(u => matched.uses.some(mu => mu.toLowerCase().includes(u.toLowerCase().split(' ')[0])))
      )
    );
  }

  // Fallback: search by generic keywords
  const q = query.toLowerCase();
  return MEDICINE_DATABASE.filter(m => 
    m.name.toLowerCase().includes(q) || 
    m.genericName.toLowerCase().includes(q) ||
    m.aliases.some(a => a.toLowerCase().includes(q))
  );
}

// Generate structured response from local medicine info
export function formatLocalMedicineResponse(med: MedicineInfo, query: string): string {
  const q = query.toLowerCase();

  // Detect query intent
  const isUses = q.includes('use') || q.includes('indication') || q.includes('why') || q.includes('for what') || q.includes('work');
  const isSideEffects = q.includes('side effect') || q.includes('risk') || q.includes('harm') || q.includes('adverse') || q.includes('reaction');
  const isDosage = q.includes('dose') || q.includes('dosage') || q.includes('how much') || q.includes('how many') || q.includes('frequency');
  const isFood = q.includes('food') || q.includes('eat') || q.includes('empty stomach') || q.includes('after food') || q.includes('before food') || q.includes('milk');
  const isWarning = q.includes('avoid') || q.includes('warning') || q.includes('precaution') || q.includes('alcohol') || q.includes('safe');
  const isInteraction = q.includes('interaction') || q.includes('combine') || q.includes('together') || q.includes('other medicine');
  const isMissed = q.includes('miss') || q.includes('forgot') || q.includes('skip');
  const isStorage = q.includes('store') || q.includes('storage') || q.includes('fridge') || q.includes('keep');

  // If specific single intent requested
  if (isUses && !isSideEffects && !isDosage && !isFood) {
    return `### 💊 Uses of ${med.name}\n\n` +
      `**Generic Name:** ${med.genericName}\n` +
      `**Category:** ${med.category}\n\n` +
      `**Primary Indications & Uses:**\n` +
      med.uses.map(u => `• ${u}`).join('\n') + `\n\n` +
      `**Food Instructions:** ${med.foodInstructions}\n\n` +
      `*This information is for educational purposes and does not replace professional medical advice.*`;
  }

  if (isSideEffects && !isUses) {
    return `### ⚠️ Side Effects of ${med.name}\n\n` +
      `**Generic Name:** ${med.genericName}\n\n` +
      `**Common Side Effects (usually mild):**\n` +
      med.commonSideEffects.map(s => `• ${s}`).join('\n') + `\n\n` +
      `**Serious Side Effects (seek medical attention):**\n` +
      med.seriousSideEffects.map(s => `• ${s}`).join('\n') + `\n\n` +
      `*This information is for educational purposes and does not replace professional medical advice.*`;
  }

  if (isFood) {
    return `### 🍽️ Food & Administration Instructions for ${med.name}\n\n` +
      `**Instructions:** ${med.foodInstructions}\n\n` +
      `**Key Precautions:**\n` +
      med.warningsAndPrecautions.map(w => `• ${w}`).join('\n') + `\n\n` +
      `*This information is for educational purposes and does not replace professional medical advice.*`;
  }

  if (isDosage) {
    return `### ⏱️ Dosage Guidance for ${med.name}\n\n` +
      `**General Dosage Guidance:** ${med.dosage}\n\n` +
      `**Food Requirement:** ${med.foodInstructions}\n\n` +
      `**Missed Dose Guidance:** ${med.missedDose}\n\n` +
      `*General guidance only. Always follow the exact dosage prescribed by your medical doctor.*`;
  }

  // Full comprehensive structured response
  return `### 💊 ${med.name}\n` +
    `**Generic Name:** ${med.genericName}\n` +
    `**Category:** ${med.category}\n\n` +
    `**Primary Uses:**\n` +
    med.uses.map(u => `• ${u}`).join('\n') + `\n\n` +
    `**Dosage Guidance (General):**\n${med.dosage}\n\n` +
    `**Food & Administration Instructions:**\n${med.foodInstructions}\n\n` +
    `**Common Side Effects:**\n` +
    med.commonSideEffects.map(s => `• ${s}`).join('\n') + `\n\n` +
    `**Serious Side Effects (Seek Help):**\n` +
    med.seriousSideEffects.map(s => `• ${s}`).join('\n') + `\n\n` +
    `**Warnings & What to Avoid:**\n` +
    med.warningsAndPrecautions.map(w => `• ${w}`).join('\n') + `\n\n` +
    `**Drug Interactions:**\n` +
    med.drugInteractions.map(i => `• ${i}`).join('\n') + `\n\n` +
    `**Storage Instructions:**\n${med.storageInstructions}\n\n` +
    `**When to Consult a Doctor:**\n` +
    med.whenToConsultDoctor.map(d => `• ${d}`).join('\n') + `\n\n` +
    `*This information is for educational purposes and does not replace professional medical advice.*`;
}
