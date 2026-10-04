import { AMINO_ACIDS } from '../data/aminoAcids';
import { PhysicochemicalProperties, DigestionFragment } from '../types/protein';

// Calculate Net Charge at a given pH using Henderson-Hasselbalch equation
export function calculateNetCharge(sequence: string, pH: number): number {
  const seq = sequence.toUpperCase().replace(/[^A-Z]/g, '');
  if (!seq) return 0;

  // Terminal pKas (approx standard)
  const pKa_NTerm = 9.69;
  const pKa_CTerm = 2.34;

  let charge = 0;

  // N-terminal positive charge
  charge += 1 / (1 + Math.pow(10, pH - pKa_NTerm));
  // C-terminal negative charge
  charge -= 1 / (1 + Math.pow(10, pKa_CTerm - pH));

  // Side chain contributions
  for (let i = 0; i < seq.length; i++) {
    const aa = seq[i];
    const info = AMINO_ACIDS[aa];
    if (!info || !info.pKa_Side) continue;

    if (info.category === 'positive') {
      // Positively charged residues: Lys, Arg, His
      charge += 1 / (1 + Math.pow(10, pH - info.pKa_Side));
    } else if (info.category === 'negative' || aa === 'C' || aa === 'Y') {
      // Negatively ionizable residues: Asp, Glu, Cys, Tyr
      charge -= 1 / (1 + Math.pow(10, info.pKa_Side - pH));
    }
  }

  return charge;
}

// Compute Isoelectric Point (pI) where net charge equals 0 using bisection method
export function calculateIsoelectricPoint(sequence: string): number {
  let low = 0.0;
  let high = 14.0;
  const tolerance = 0.005;
  let mid = 7.0;

  for (let iter = 0; iter < 100; iter++) {
    mid = (low + high) / 2;
    const charge = calculateNetCharge(sequence, mid);

    if (Math.abs(charge) < tolerance) {
      return Number(mid.toFixed(2));
    }

    if (charge > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return Number(mid.toFixed(2));
}

// Compute comprehensive physicochemical properties
export function calculatePhysicochemicalProperties(sequence: string): PhysicochemicalProperties {
  const cleanSeq = sequence.toUpperCase().replace(/[^A-Z]/g, '');
  const length = cleanSeq.length;

  if (length === 0) {
    return {
      length: 0,
      molecularWeight: 0,
      isoelectricPoint: 0,
      netChargeAtPh7: 0,
      extinctionCoefficientCystine: 0,
      extinctionCoefficientReduced: 0,
      absorbance280: 0,
      gravy: 0,
      aliphaticIndex: 0,
      composition: {},
    };
  }

  const counts: Record<string, number> = {};
  let totalRawWeight = 0;
  let totalHydropathy = 0;

  for (const char of cleanSeq) {
    counts[char] = (counts[char] || 0) + 1;
    const aa = AMINO_ACIDS[char];
    if (aa) {
      totalRawWeight += aa.weight;
      totalHydropathy += aa.hydropathy;
    }
  }

  // Peptide bond formation releases 1 H2O (18.015 Da) per bond
  const waterLoss = (length - 1) * 18.015;
  const molecularWeight = Math.max(0, totalRawWeight - waterLoss);

  const isoelectricPoint = calculateIsoelectricPoint(cleanSeq);
  const netChargeAtPh7 = calculateNetCharge(cleanSeq, 7.4);

  // Extinction coefficients at 280 nm (Pace et al., 1995)
  // Tyr = 1490, Trp = 5500, Cystine (disulfide) = 125
  const nTrp = counts['W'] || 0;
  const nTyr = counts['Y'] || 0;
  const nCys = counts['C'] || 0;
  const nCystine = Math.floor(nCys / 2);

  const extinctionCoefficientCystine = nTrp * 5500 + nTyr * 1490 + nCystine * 125;
  const extinctionCoefficientReduced = nTrp * 5500 + nTyr * 1490;

  // Absorbance 0.1% (g/L) = Extinction / MolecularWeight
  const absorbance280 = molecularWeight > 0 ? (extinctionCoefficientCystine / molecularWeight) : 0;

  // GRAVY (Grand average of hydropathicity)
  const gravy = length > 0 ? totalHydropathy / length : 0;

  // Aliphatic Index: X(Ala) + 2.9 * X(Val) + 3.9 * (X(Ile) + X(Leu))
  const fAla = (counts['A'] || 0) / length;
  const fVal = (counts['V'] || 0) / length;
  const fIle = (counts['I'] || 0) / length;
  const fLeu = (counts['L'] || 0) / length;
  const aliphaticIndex = (fAla + 2.9 * fVal + 3.9 * (fIle + fLeu)) * 100;

  // Composition table
  const composition: Record<string, { count: number; percentage: number }> = {};
  for (const [code, count] of Object.entries(counts)) {
    composition[code] = {
      count,
      percentage: Number(((count / length) * 100).toFixed(1)),
    };
  }

  return {
    length,
    molecularWeight: Number(molecularWeight.toFixed(2)),
    isoelectricPoint,
    netChargeAtPh7: Number(netChargeAtPh7.toFixed(2)),
    extinctionCoefficientCystine,
    extinctionCoefficientReduced,
    absorbance280: Number(absorbance280.toFixed(3)),
    gravy: Number(gravy.toFixed(3)),
    aliphaticIndex: Number(aliphaticIndex.toFixed(2)),
    composition,
  };
}

// Kyte-Doolittle Hydropathy Profile with sliding window
export interface HydropathyPoint {
  position: number;
  score: number;
  residue: string;
}

export function computeHydropathyProfile(sequence: string, windowSize = 9): HydropathyPoint[] {
  const clean = sequence.toUpperCase().replace(/[^A-Z]/g, '');
  const half = Math.floor(windowSize / 2);
  const result: HydropathyPoint[] = [];

  if (clean.length < windowSize) {
    return clean.split('').map((char, idx) => ({
      position: idx + 1,
      score: AMINO_ACIDS[char]?.hydropathy || 0,
      residue: char,
    }));
  }

  for (let i = half; i < clean.length - half; i++) {
    let sum = 0;
    for (let w = -half; w <= half; w++) {
      const char = clean[i + w];
      sum += AMINO_ACIDS[char]?.hydropathy || 0;
    }
    result.push({
      position: i + 1,
      score: Number((sum / windowSize).toFixed(2)),
      residue: clean[i],
    });
  }

  return result;
}

// In-Silico Protease Cleavage Digestion
export type ProteaseType = 'trypsin' | 'chymotrypsin' | 'pepsin' | 'cnbr';

export function digestProtein(
  sequence: string,
  protease: ProteaseType = 'trypsin',
  maxMissedCleavages = 0
): DigestionFragment[] {
  const seq = sequence.toUpperCase().replace(/[^A-Z]/g, '');
  if (!seq) return [];

  // Cut points
  const cutIndices: number[] = [0];

  for (let i = 0; i < seq.length - 1; i++) {
    const cur = seq[i];
    const next = seq[i + 1];

    let cuts = false;
    if (protease === 'trypsin') {
      // Cleaves at Arg or Lys, unless followed by Proline
      if ((cur === 'K' || cur === 'R') && next !== 'P') {
        cuts = true;
      }
    } else if (protease === 'chymotrypsin') {
      // Cleaves at Phe, Trp, Tyr, unless followed by Proline
      if ((cur === 'F' || cur === 'W' || cur === 'Y') && next !== 'P') {
        cuts = true;
      }
    } else if (protease === 'pepsin') {
      // Cleaves preferentially at Phe, Leu at low pH
      if (cur === 'F' || cur === 'L') {
        cuts = true;
      }
    } else if (protease === 'cnbr') {
      // Cleaves at Met
      if (cur === 'M') {
        cuts = true;
      }
    }

    if (cuts) {
      cutIndices.push(i + 1);
    }
  }

  cutIndices.push(seq.length);

  const fragments: DigestionFragment[] = [];
  let fragId = 1;

  for (let i = 0; i < cutIndices.length - 1; i++) {
    const start = cutIndices[i];
    const end = cutIndices[i + 1];
    const fragmentSeq = seq.substring(start, end);
    if (!fragmentSeq) continue;

    // Calculate fragment mass (MW + H2O)
    let rawMass = 0;
    for (const char of fragmentSeq) {
      rawMass += AMINO_ACIDS[char]?.weight || 0;
    }
    const mass = Math.max(0, rawMass - (fragmentSeq.length - 1) * 18.015);
    const protonMass = 1.0078;

    fragments.push({
      id: fragId++,
      start: start + 1,
      end,
      sequence: fragmentSeq,
      length: fragmentSeq.length,
      mass: Number(mass.toFixed(2)),
      charge1Mz: Number((mass + protonMass).toFixed(2)),
      charge2Mz: Number(((mass + 2 * protonMass) / 2).toFixed(2)),
      charge3Mz: Number(((mass + 3 * protonMass) / 3).toFixed(2)),
      missedCleavages: 0,
    });
  }

  return fragments;
}
