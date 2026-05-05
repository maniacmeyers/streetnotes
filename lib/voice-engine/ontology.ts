export const AESTHETIC_TRANSCRIPTION_PROMPT = [
  'Aesthetic sales meeting notes.',
  'Terms may include injector, MA, practice manager, medical director, practice owner, medspa, dermatology, plastic surgery, tox, neurotoxin, HA filler, biostimulator, skincare, energy device, units, syringes, vials, mL, price per unit, rebate, trial, ordering, formulary, Salesforce, HubSpot.',
  'Brands may include Botox, Dysport, Xeomin, Jeuveau, Daxxify, Juvederm, Restylane, RHA, Versa, Belotero, Sculptra, Radiesse, Morpheus8, BBL, HALO, MOXI, Sofwave, Ultherapy, CoolSculpting, EmSculpt Neo, Emface, AviClear, Potenza, Opus Plasma, Symplast, PatientNow, Nextech, AestheticRecord, Aesthetics Pro, Mangomint, Boulevard, Vagaro.',
].join(' ')

export const AESTHETIC_CALL_SEGMENTS = [
  'injector-check-in',
  'new-practice',
  'practice-manager',
  'device-demo',
  'lunch-learn',
  'conference',
] as const

export const AESTHETIC_DEAL_STAGES = [
  'New account (no trial)',
  'Trialing (vials/units out)',
  'Low volume',
  'Growing',
  'Loyal',
  'At risk of switching',
  'Lost to competitor',
] as const

export const AESTHETIC_MODALITIES = [
  'neurotoxin',
  'HA filler',
  'biostimulator',
  'energy device',
  'skincare',
  'practice-management',
  'unknown',
] as const

export const AESTHETIC_COMPETITOR_TAXONOMY = {
  neurotoxin: ['Botox', 'Dysport', 'Xeomin', 'Jeuveau', 'Daxxify'],
  haFiller: ['Juvederm', 'Restylane', 'RHA', 'Versa', 'Belotero'],
  biostimulator: ['Sculptra', 'Radiesse'],
  energyDevice: [
    'Morpheus8',
    'BBL',
    'HALO',
    'MOXI',
    'Sofwave',
    'Ultherapy',
    'CoolSculpting',
    'EmSculpt Neo',
    'Emface',
    'AviClear',
    'Potenza',
    'Opus Plasma',
  ],
  practiceManagement: [
    'Symplast',
    'PatientNow',
    'Nextech',
    'AestheticRecord',
    'Aesthetics Pro',
    'Mangomint',
    'Boulevard',
    'Vagaro',
  ],
} as const

export function buildAestheticOntologyBlock(): string {
  return `## AESTHETIC FIELD-SALES ONTOLOGY

This transcript is from an aesthetic sales rep after an injector visit, practice-manager meeting, device demo, lunch and learn, or conference booth conversation.

People to recognize:
- injector, MD, PA, NP, RN, MA, practice manager, PM, medical director, practice owner, front desk

Modalities to recognize:
- neurotoxin / tox, HA filler, biostimulator, energy device, skincare, practice-management software

Commercial signals to capture:
- unit counts, syringes, vials, mL, treatment areas, price per unit, monthly order volume, quarterly spend, rebate terms, trial quantities, buying windows

Buying windows:
- Aesthetic Next, AMWC, Vegas Cosmetic, IMCAS, AAD, ASPS, MOAS

Competitor taxonomy:
- Neurotoxin: ${AESTHETIC_COMPETITOR_TAXONOMY.neurotoxin.join(', ')}
- HA filler: ${AESTHETIC_COMPETITOR_TAXONOMY.haFiller.join(', ')}
- Biostimulator: ${AESTHETIC_COMPETITOR_TAXONOMY.biostimulator.join(', ')}
- Energy device: ${AESTHETIC_COMPETITOR_TAXONOMY.energyDevice.join(', ')}
- Practice-management adjacent: ${AESTHETIC_COMPETITOR_TAXONOMY.practiceManagement.join(', ')}

Normalize common speech:
- "tox" means neurotoxin unless a brand/product makes a narrower meaning clear.
- "PM" usually means practice manager in this context.
- Brand names should use proper casing.
- Capture current incumbent products as competitors/alternatives when named.`
}
