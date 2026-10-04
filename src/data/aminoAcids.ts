import { AminoAcidInfo } from '../types/protein';

export const AMINO_ACIDS: Record<string, AminoAcidInfo> = {
  A: {
    code: 'A',
    code3: 'ALA',
    name: 'Alanine',
    weight: 89.09,
    pKa_COOH: 2.34,
    pKa_NH3: 9.69,
    hydropathy: 1.8,
    volume: 88.6,
    charge: 0,
    category: 'hydrophobic',
    color: '#84cc16'
  },
  R: {
    code: 'R',
    code3: 'ARG',
    name: 'Arginine',
    weight: 174.20,
    pKa_COOH: 2.17,
    pKa_NH3: 9.04,
    pKa_Side: 12.48,
    hydropathy: -4.5,
    volume: 173.4,
    charge: 1,
    category: 'positive',
    color: '#3b82f6'
  },
  N: {
    code: 'N',
    code3: 'ASN',
    name: 'Asparagine',
    weight: 132.12,
    pKa_COOH: 2.02,
    pKa_NH3: 8.80,
    hydropathy: -3.5,
    volume: 114.1,
    charge: 0,
    category: 'polar',
    color: '#06b6d4'
  },
  D: {
    code: 'D',
    code3: 'ASP',
    name: 'Aspartate',
    weight: 133.10,
    pKa_COOH: 1.88,
    pKa_NH3: 9.60,
    pKa_Side: 3.65,
    hydropathy: -3.5,
    volume: 111.1,
    charge: -1,
    category: 'negative',
    color: '#ef4444'
  },
  C: {
    code: 'C',
    code3: 'CYS',
    name: 'Cysteine',
    weight: 121.16,
    pKa_COOH: 1.96,
    pKa_NH3: 10.28,
    pKa_Side: 8.18,
    hydropathy: 2.5,
    volume: 108.5,
    charge: 0,
    category: 'special',
    color: '#eab308'
  },
  E: {
    code: 'E',
    code3: 'GLU',
    name: 'Glutamate',
    weight: 147.13,
    pKa_COOH: 2.19,
    pKa_NH3: 9.67,
    pKa_Side: 4.25,
    hydropathy: -3.5,
    volume: 138.4,
    charge: -1,
    category: 'negative',
    color: '#dc2626'
  },
  Q: {
    code: 'Q',
    code3: 'GLN',
    name: 'Glutamine',
    weight: 146.15,
    pKa_COOH: 2.17,
    pKa_NH3: 9.13,
    hydropathy: -3.5,
    volume: 143.8,
    charge: 0,
    category: 'polar',
    color: '#22d3ee'
  },
  G: {
    code: 'G',
    code3: 'GLY',
    name: 'Glycine',
    weight: 75.07,
    pKa_COOH: 2.34,
    pKa_NH3: 9.60,
    hydropathy: -0.4,
    volume: 60.1,
    charge: 0,
    category: 'special',
    color: '#a3a3a3'
  },
  H: {
    code: 'H',
    code3: 'HIS',
    name: 'Histidine',
    weight: 155.16,
    pKa_COOH: 1.82,
    pKa_NH3: 9.17,
    pKa_Side: 6.00,
    hydropathy: -3.2,
    volume: 153.2,
    charge: 0.1,
    category: 'positive',
    color: '#6366f1'
  },
  I: {
    code: 'I',
    code3: 'ILE',
    name: 'Isoleucine',
    weight: 131.18,
    pKa_COOH: 2.36,
    pKa_NH3: 9.60,
    hydropathy: 4.5,
    volume: 166.7,
    charge: 0,
    category: 'hydrophobic',
    color: '#15803d'
  },
  L: {
    code: 'L',
    code3: 'LEU',
    name: 'Leucine',
    weight: 131.18,
    pKa_COOH: 2.36,
    pKa_NH3: 9.60,
    hydropathy: 3.8,
    volume: 166.7,
    charge: 0,
    category: 'hydrophobic',
    color: '#16a34a'
  },
  K: {
    code: 'K',
    code3: 'LYS',
    name: 'Lysine',
    weight: 146.19,
    pKa_COOH: 2.18,
    pKa_NH3: 8.95,
    pKa_Side: 10.53,
    hydropathy: -3.9,
    volume: 168.6,
    charge: 1,
    category: 'positive',
    color: '#2563eb'
  },
  M: {
    code: 'M',
    code3: 'MET',
    name: 'Methionine',
    weight: 149.21,
    pKa_COOH: 2.28,
    pKa_NH3: 9.21,
    hydropathy: 1.9,
    volume: 162.9,
    charge: 0,
    category: 'hydrophobic',
    color: '#ca8a04'
  },
  F: {
    code: 'F',
    code3: 'PHE',
    name: 'Phenylalanine',
    weight: 165.19,
    pKa_COOH: 1.83,
    pKa_NH3: 9.13,
    hydropathy: 2.8,
    volume: 189.9,
    charge: 0,
    category: 'hydrophobic',
    color: '#854d0e'
  },
  P: {
    code: 'P',
    code3: 'PRO',
    name: 'Proline',
    weight: 115.13,
    pKa_COOH: 1.99,
    pKa_NH3: 10.60,
    hydropathy: -1.6,
    volume: 112.7,
    charge: 0,
    category: 'special',
    color: '#fb923c'
  },
  S: {
    code: 'S',
    code3: 'SER',
    name: 'Serine',
    weight: 105.09,
    pKa_COOH: 2.21,
    pKa_NH3: 9.15,
    hydropathy: -0.8,
    volume: 89.0,
    charge: 0,
    category: 'polar',
    color: '#38bdf8'
  },
  T: {
    code: 'T',
    code3: 'THR',
    name: 'Threonine',
    weight: 119.12,
    pKa_COOH: 2.09,
    pKa_NH3: 9.10,
    hydropathy: -0.7,
    volume: 116.1,
    charge: 0,
    category: 'polar',
    color: '#0284c7'
  },
  W: {
    code: 'W',
    code3: 'TRP',
    name: 'Tryptophan',
    weight: 204.23,
    pKa_COOH: 2.83,
    pKa_NH3: 9.39,
    hydropathy: -0.9,
    volume: 227.8,
    charge: 0,
    category: 'hydrophobic',
    color: '#a855f7'
  },
  Y: {
    code: 'Y',
    code3: 'TYR',
    name: 'Tyrosine',
    weight: 181.19,
    pKa_COOH: 2.20,
    pKa_NH3: 9.11,
    pKa_Side: 10.07,
    hydropathy: -1.3,
    volume: 193.6,
    charge: 0,
    category: 'polar',
    color: '#9333ea'
  },
  V: {
    code: 'V',
    code3: 'VAL',
    name: 'Valine',
    weight: 117.15,
    pKa_COOH: 2.32,
    pKa_NH3: 9.62,
    hydropathy: 4.2,
    volume: 140.0,
    charge: 0,
    category: 'hydrophobic',
    color: '#4ade80'
  }
};

export const THREE_TO_ONE: Record<string, string> = {
  ALA: 'A', ARG: 'R', ASN: 'N', ASP: 'D', CYS: 'C',
  GLU: 'E', GLN: 'Q', GLY: 'G', HIS: 'H', ILE: 'I',
  LEU: 'L', LYS: 'K', MET: 'M', PHE: 'F', PRO: 'P',
  SER: 'S', THR: 'T', TRP: 'W', TYR: 'Y', VAL: 'V',
  // Modified residues fallback
  MSE: 'M', SEC: 'C', PYL: 'O', ASX: 'B', GLX: 'Z'
};

export const ELEMENT_COLORS: Record<string, string> = {
  C: '#94a3b8', // Gray/Carbon
  N: '#3b82f6', // Blue/Nitrogen
  O: '#ef4444', // Red/Oxygen
  S: '#eab308', // Yellow/Sulfur
  P: '#f97316', // Orange/Phosphorus
  H: '#f8fafc', // White/Hydrogen
  FE: '#d97706', // Iron
  ZN: '#0d9488', // Zinc
  MG: '#10b981', // Magnesium
  CA: '#059669', // Calcium
  DEFAULT: '#94a3b8'
};

export const CHAIN_COLORS = [
  '#38bdf8', // Cyan
  '#f43f5e', // Rose
  '#a855f7', // Purple
  '#10b981', // Emerald
  '#fbbf24', // Amber
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6', // Teal
];

export const SECONDARY_COLORS = {
  helix: '#ec4899', // Pink/Magenta for Alpha Helix
  sheet: '#eab308', // Gold/Yellow for Beta Sheet
  coil: '#64748b',  // Slate for Random coil/loop
};
