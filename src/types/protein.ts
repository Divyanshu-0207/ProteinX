export interface Atom {
  serial: number;
  name: string;
  altLoc: string;
  resName: string;
  chainId: string;
  resSeq: number;
  iCode: string;
  x: number;
  y: number;
  z: number;
  occupancy: number;
  tempFactor: number;
  element: string;
  charge: string;
  isHet: boolean;
}

export interface Residue {
  resSeq: number;
  resName: string;
  chainId: string;
  atoms: Atom[];
  caAtom?: Atom;
  cAtom?: Atom;
  nAtom?: Atom;
  secondaryType?: 'helix' | 'sheet' | 'coil';
  phi?: number;
  psi?: number;
}

export interface Chain {
  id: string;
  residues: Residue[];
}

export interface HelixRecord {
  helixID: string;
  initChainID: string;
  initSeqNum: number;
  endChainID: string;
  endSeqNum: number;
  helixClass: number;
}

export interface SheetRecord {
  sheetID: string;
  chainID: string;
  initSeqNum: number;
  endSeqNum: number;
  sense: number;
}

export interface PdbMetadata {
  id?: string;
  title?: string;
  classification?: string;
  resolution?: number;
  depositionDate?: string;
  method?: string;
  organism?: string;
  authors?: string;
  doi?: string;
}

export interface ProteinStructure {
  metadata: PdbMetadata;
  chains: Chain[];
  atoms: Atom[];
  helices: HelixRecord[];
  sheets: SheetRecord[];
  center: [number, number, number];
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
    radius: number;
  };
  totalResidues: number;
  fastaSequence: string;
}

export interface AminoAcidInfo {
  code: string;        // 1-letter
  code3: string;       // 3-letter
  name: string;
  weight: number;      // g/mol
  pKa_COOH: number;
  pKa_NH3: number;
  pKa_Side?: number;
  hydropathy: number;  // Kyte-Doolittle scale
  volume: number;      // A^3
  charge: number;      // Net charge at pH 7.4
  category: 'hydrophobic' | 'polar' | 'positive' | 'negative' | 'special';
  color: string;
}

export interface PhysicochemicalProperties {
  length: number;
  molecularWeight: number;
  isoelectricPoint: number;
  netChargeAtPh7: number;
  extinctionCoefficientCystine: number;
  extinctionCoefficientReduced: number;
  absorbance280: number; // 0.1% (1g/L)
  gravy: number; // Grand average of hydropathicity
  aliphaticIndex: number;
  composition: Record<string, { count: number; percentage: number }>;
}

export interface DigestionFragment {
  id: number;
  start: number;
  end: number;
  sequence: string;
  length: number;
  mass: number;
  charge1Mz: number;
  charge2Mz: number;
  charge3Mz: number;
  missedCleavages: number;
}

export interface AlignmentResult {
  score: number;
  identity: number;
  similarity: number;
  gaps: number;
  length: number;
  alignedSeq1: string;
  alignedSeq2: string;
  consensus: string;
}

export type RenderMode = 'ribbon' | 'ball-and-stick' | 'spacefill' | 'backbone' | 'surface';
export type ColorMode = 'secondary' | 'chain' | 'hydrophobicity' | 'element' | 'bfactor';
