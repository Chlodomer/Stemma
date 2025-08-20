import { StemmaData } from '../types';

// Data extracted from MGH Gregory of Tours manuscript descriptions
export const gregoryStemmaData: StemmaData = {
  workId: "greg-tours-hist",
  families: [
    {
      id: "A",
      label: "Classis A",
      notes: "Textus pleni - most complete manuscripts",
      evidence: [{ mghPage: "XXIII-XXIV" }]
    },
    {
      id: "B", 
      label: "Classis B",
      notes: "Antiquissimi - oldest manuscripts (VII-VIII c.), contains books I-VI only",
      evidence: [{ mghPage: "XXV-XXVII" }]
    },
    {
      id: "C",
      label: "Classis C", 
      notes: "Derived from B-like exemplar, many lacunae",
      evidence: [{ mghPage: "XXVII-XXVIII" }]
    },
    {
      id: "D",
      label: "Classis D",
      notes: "Later manuscripts with various corruptions",
      evidence: [{ mghPage: "XXVIII-XXX" }]
    }
  ],
  witnesses: [
    // Class A witnesses
    {
      id: "A1",
      siglum: "A1",
      shelfmark: "Montis Casinensis 275",
      repo: "Monte Cassino",
      century: "XI",
      place: { name: "Monte Cassino", confidence: 0.9 },
      coverage: "I-X (nearly complete, some lacunae)",
      script: "Beneventan minuscule",
      familyId: "A",
      notes: [
        "Written by multiple scribes", 
        "Some omissions and lacunae",
        "Commissioned by Abbot Desiderius (1058-1087)"
      ],
      citations: [{ mghPage: "XXIII-XXIV" }]
    },
    
    // Class B witnesses  
    {
      id: "B1",
      siglum: "B1", 
      shelfmark: "Cameracensis 624",
      repo: "Cambrai",
      century: "VII ex.",
      place: { name: "Cambrai", confidence: 0.7 },
      coverage: "I-VI (original), VII-X (8th c. supplement)",
      script: "uncial + semi-uncial",
      familyId: "B",
      notes: [
        "Oldest manuscript of Gregory",
        "Two scribes for original part",
        "Later supplement ca. 750 AD",
        "Missing some folios"
      ],
      citations: [{ mghPage: "XXV-XXVI" }]
    },
    {
      id: "B2",
      siglum: "B2",
      shelfmark: "Bruxellensis 9403", 
      repo: "Brussels",
      century: "VII ex.",
      place: { name: "Unknown", confidence: 0.3 },
      coverage: "II,3-X (beginning lost)",
      script: "minuscule mixed with semi-uncial",
      familyId: "B", 
      notes: [
        "Similar to B1 but worse scribal practices",
        "Multiple scribes with varying accuracy",
        "Some folios transposed"
      ],
      citations: [{ mghPage: "XXVI" }]
    },
    {
      id: "B3",
      siglum: "B3",
      shelfmark: "Leidensis Voss. Lat. 63",
      repo: "Leiden",
      century: "VIII",
      place: { name: "Unknown", confidence: 0.2 },
      coverage: "II,9-V,26 (fragmentary)",
      script: "minuscule with Merovingian cursive",
      familyId: "B",
      notes: [
        "Badly preserved",
        "Missing beginning and end",
        "Affected by decay"
      ],
      citations: [{ mghPage: "XXVI" }]
    },
    {
      id: "B4", 
      siglum: "B4",
      shelfmark: "Parisiacus 17654",
      repo: "Paris BnF",
      century: "VII ex.",
      place: { name: "Beauvais?", confidence: 0.6 },
      coverage: "II,3-V,22 (fragmentary)", 
      script: "uncial",
      familyId: "B",
      notes: [
        "Originally from Saint-Pierre de Beauvais",
        "Badly preserved, affected by decay",
        "Missing many quaternions"
      ],
      citations: [{ mghPage: "XXVI-XXVII" }]
    },
    {
      id: "B5",
      siglum: "B5", 
      shelfmark: "Parisiacus 17655",
      repo: "Paris BnF",
      century: "ca. 700",
      place: { name: "Luxeuil?", confidence: 0.7 },
      coverage: "I-VI (complete for B class)",
      script: "uncial (Luxeuil style)",
      familyId: "B",
      notes: [
        "Worst manuscript of class B",
        "From Corbie monastery", 
        "Multiple scribes",
        "Contains duplicate text"
      ],
      citations: [{ mghPage: "XXVII" }]
    },

    // Class C witnesses
    {
      id: "C1",
      siglum: "C1",
      shelfmark: "Heidelbergensis Pal. Lat. 864",
      repo: "Heidelberg",
      century: "IX", 
      place: { name: "Lorsch", confidence: 0.9 },
      coverage: "I-X (with lacunae and supplements)",
      script: "Carolingian minuscule",
      familyId: "C",
      notes: [
        "From Lorsch monastery",
        "Missing chapters supplied later",
        "Multiple correcting hands"
      ],
      citations: [{ mghPage: "XXVII-XXVIII" }]
    },
    {
      id: "C2",
      siglum: "C2", 
      shelfmark: "Namurcensis 11",
      repo: "Namur",
      century: "X",
      place: { name: "Saint-Hubert", confidence: 0.8 },
      coverage: "I-X (includes Fredegar continuation)",
      script: "Carolingian minuscule", 
      familyId: "C",
      notes: [
        "Often preserves correct readings",
        "Better than other C manuscripts",
        "Accurate royal names"
      ],
      citations: [{ mghPage: "XXVIII" }]
    },

    // Class D witnesses  
    {
      id: "D1",
      siglum: "D1",
      shelfmark: "Unknown (D11 in Arndt)",
      repo: "Unknown",
      century: "IX-X",
      place: { name: "Unknown", confidence: 0.1 },
      coverage: "I-X",
      script: "minuscule",
      familyId: "D", 
      notes: [
        "Best manuscript of class D",
        "Used for C2 corrections"
      ],
      citations: [{ mghPage: "XXVIII" }]
    },
    {
      id: "D4",
      siglum: "D4",
      shelfmark: "Unknown", 
      repo: "Unknown",
      century: "IX-X",
      place: { name: "Unknown", confidence: 0.1 },
      coverage: "I-X",
      script: "minuscule",
      familyId: "D",
      notes: [
        "Contains some authentic forms",
        "Preserves correct 'Chuldericus' spelling",
        "Better than D3 gemellus"
      ],
      citations: [{ mghPage: "XXVIII" }]
    }
  ],
  edges: [
    // Archetype connections
    { from: "archetype", to: "A_family", type: "copy", confidence: 0.8, evidence: [{ mghPage: "XXIII" }] },
    { from: "archetype", to: "B_family", type: "copy", confidence: 0.9, evidence: [{ mghPage: "XXV" }] },
    
    // Family to witness connections
    { from: "A_family", to: "A1", type: "copy", confidence: 0.8, evidence: [{ mghPage: "XXIII" }] },
    
    { from: "B_family", to: "B1", type: "copy", confidence: 0.9, evidence: [{ mghPage: "XXV" }] },
    { from: "B_family", to: "B2", type: "copy", confidence: 0.8, evidence: [{ mghPage: "XXV" }] },
    { from: "B_family", to: "B3", type: "copy", confidence: 0.6, evidence: [{ mghPage: "XXVI" }] },
    { from: "B_family", to: "B4", type: "copy", confidence: 0.7, evidence: [{ mghPage: "XXVI" }] },
    { from: "B_family", to: "B5", type: "copy", confidence: 0.5, evidence: [{ mghPage: "XXVII" }] },
    
    // C derives from B-like exemplar
    { from: "B_family", to: "C_family", type: "copy", confidence: 0.7, evidence: [{ mghPage: "XXVII" }] },
    { from: "C_family", to: "C1", type: "copy", confidence: 0.8, evidence: [{ mghPage: "XXVII" }] },
    { from: "C_family", to: "C2", type: "copy", confidence: 0.8, evidence: [{ mghPage: "XXVIII" }] },
    
    // D family connections
    { from: "archetype", to: "D_family", type: "inferred", confidence: 0.6, evidence: [{ mghPage: "XXVIII" }] },
    { from: "D_family", to: "D1", type: "copy", confidence: 0.7, evidence: [{ mghPage: "XXVIII" }] },
    { from: "D_family", to: "D4", type: "copy", confidence: 0.7, evidence: [{ mghPage: "XXVIII" }] },
    
    // Cross-contamination
    { from: "D1", to: "C2", type: "contamination", confidence: 0.6, evidence: [{ mghPage: "XXVIII" }] }
  ]
};