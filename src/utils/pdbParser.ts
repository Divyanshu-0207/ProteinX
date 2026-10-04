import { Atom, Chain, HelixRecord, SheetRecord, PdbMetadata, ProteinStructure, Residue } from '../types/protein';
import { THREE_TO_ONE } from '../data/aminoAcids';

// Vector math helper for dihedral angle calculation
type Vec3 = [number, number, number];

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function length(a: Vec3): number {
  return Math.sqrt(dot(a, a));
}

function normalize(a: Vec3): Vec3 {
  const l = length(a);
  if (l === 0) return [0, 0, 0];
  return [a[0] / l, a[1] / l, a[2] / l];
}

// Compute dihedral angle in degrees between four atoms
export function computeDihedralAngle(p1: Vec3, p2: Vec3, p3: Vec3, p4: Vec3): number {
  const b1 = sub(p2, p1);
  const b2 = sub(p3, p2);
  const b3 = sub(p4, p3);

  const b2Norm = normalize(b2);
  if (length(b2) === 0) return 0;

  const n1 = cross(b1, b2);
  const n2 = cross(b2, b3);

  const m1 = cross(n1, b2Norm);

  const x = dot(n1, n2);
  const y = dot(m1, n2);

  const rad = Math.atan2(y, x);
  return (rad * 180) / Math.PI;
}

export function parsePDB(pdbText: string): ProteinStructure {
  const lines = pdbText.split('\n');
  const metadata: PdbMetadata = {};
  const atoms: Atom[] = [];
  const helices: HelixRecord[] = [];
  const sheets: SheetRecord[] = [];

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  let sumX = 0, sumY = 0, sumZ = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const recordType = line.substring(0, 6).trim();

    if (recordType === 'HEADER') {
      metadata.classification = line.substring(10, 50).trim();
      metadata.depositionDate = line.substring(50, 59).trim();
      metadata.id = line.substring(62, 66).trim();
    } else if (recordType === 'TITLE') {
      metadata.title = (metadata.title ? metadata.title + ' ' : '') + line.substring(10, 80).trim();
    } else if (recordType === 'REMARK' && line.substring(6, 10).trim() === '2') {
      const resMatch = line.match(/RESOLUTION\.\s+([0-9\.]+)\s+ANGSTROMS/i);
      if (resMatch) {
        metadata.resolution = parseFloat(resMatch[1]);
      }
    } else if (recordType === 'EXPDTA') {
      metadata.method = line.substring(10, 79).trim();
    } else if (recordType === 'SOURCE' && line.includes('ORGANISM_SCIENTIFIC:')) {
      const match = line.match(/ORGANISM_SCIENTIFIC:\s*([^;]+)/i);
      if (match) {
        metadata.organism = match[1].trim();
      }
    } else if (recordType === 'HELIX') {
      helices.push({
        helixID: line.substring(11, 14).trim(),
        initChainID: line.substring(19, 20).trim(),
        initSeqNum: parseInt(line.substring(21, 25).trim(), 10),
        endChainID: line.substring(31, 32).trim(),
        endSeqNum: parseInt(line.substring(33, 37).trim(), 10),
        helixClass: parseInt(line.substring(38, 40).trim() || '1', 10),
      });
    } else if (recordType === 'SHEET') {
      sheets.push({
        sheetID: line.substring(11, 14).trim(),
        chainID: line.substring(21, 22).trim(),
        initSeqNum: parseInt(line.substring(22, 26).trim(), 10),
        endSeqNum: parseInt(line.substring(32, 36).trim(), 10),
        sense: parseInt(line.substring(38, 40).trim() || '0', 10),
      });
    } else if (recordType === 'ATOM' || recordType === 'HETATM') {
      const isHet = recordType === 'HETATM';
      const serial = parseInt(line.substring(6, 11).trim(), 10);
      const name = line.substring(12, 16).trim();
      const altLoc = line.substring(16, 17).trim();
      const resName = line.substring(17, 20).trim();
      const chainId = line.substring(21, 22).trim() || 'A';
      const resSeq = parseInt(line.substring(22, 26).trim(), 10);
      const iCode = line.substring(26, 27).trim();
      const x = parseFloat(line.substring(30, 38).trim());
      const y = parseFloat(line.substring(38, 46).trim());
      const z = parseFloat(line.substring(46, 54).trim());
      const occupancy = parseFloat(line.substring(54, 60).trim() || '1.0');
      const tempFactor = parseFloat(line.substring(60, 66).trim() || '0.0');
      let element = line.substring(76, 78).trim().toUpperCase();
      if (!element && name.length > 0) {
        element = name.replace(/[0-9]/g, '').substring(0, 1).toUpperCase();
      }
      const charge = line.substring(78, 80).trim();

      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        atoms.push({
          serial,
          name,
          altLoc,
          resName,
          chainId,
          resSeq,
          iCode,
          x,
          y,
          z,
          occupancy,
          tempFactor,
          element,
          charge,
          isHet,
        });

        // Bounding box
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (z < minZ) minZ = z;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        if (z > maxZ) maxZ = z;

        sumX += x;
        sumY += y;
        sumZ += z;
      }
    }
  }

  const count = atoms.length || 1;
  const center: [number, number, number] = [sumX / count, sumY / count, sumZ / count];

  // Calculate radius from center
  let maxRadSq = 0;
  for (const a of atoms) {
    const dx = a.x - center[0];
    const dy = a.y - center[1];
    const dz = a.z - center[2];
    const distSq = dx * dx + dy * dy + dz * dz;
    if (distSq > maxRadSq) maxRadSq = distSq;
  }
  const radius = Math.sqrt(maxRadSq);

  // Group into Chains and Residues
  const chainMap = new Map<string, Map<number, Residue>>();

  for (const atom of atoms) {
    // Only standard polymer residues for main chain logic
    if (atom.isHet && !['MSE', 'HYP'].includes(atom.resName)) continue;

    if (!chainMap.has(atom.chainId)) {
      chainMap.set(atom.chainId, new Map());
    }
    const resGroup = chainMap.get(atom.chainId)!;

    if (!resGroup.has(atom.resSeq)) {
      resGroup.set(atom.resSeq, {
        resSeq: atom.resSeq,
        resName: atom.resName,
        chainId: atom.chainId,
        atoms: [],
      });
    }

    const res = resGroup.get(atom.resSeq)!;
    res.atoms.push(atom);

    if (atom.name === 'CA') res.caAtom = atom;
    else if (atom.name === 'C') res.cAtom = atom;
    else if (atom.name === 'N') res.nAtom = atom;
  }

  // Assign secondary structures from HELIX & SHEET records
  const chains: Chain[] = [];
  let fastaSequence = '';

  chainMap.forEach((residueMap, chainId) => {
    const residues = Array.from(residueMap.values()).sort((a, b) => a.resSeq - b.resSeq);

    for (let rIdx = 0; rIdx < residues.length; rIdx++) {
      const res = residues[rIdx];

      // Check helix
      const isHelix = helices.some(
        (h) => h.initChainID === chainId && res.resSeq >= h.initSeqNum && res.resSeq <= h.endSeqNum
      );
      // Check sheet
      const isSheet = sheets.some(
        (s) => s.chainID === chainId && res.resSeq >= s.initSeqNum && res.resSeq <= s.endSeqNum
      );

      if (isHelix) res.secondaryType = 'helix';
      else if (isSheet) res.secondaryType = 'sheet';
      else res.secondaryType = 'coil';

      // Calculate phi and psi dihedral angles
      // phi_i: C_(i-1) -> N_i -> CA_i -> C_i
      // psi_i: N_i -> CA_i -> C_i -> N_(i+1)
      const prevRes = residues[rIdx - 1];
      const nextRes = residues[rIdx + 1];

      if (prevRes?.cAtom && res.nAtom && res.caAtom && res.cAtom) {
        res.phi = computeDihedralAngle(
          [prevRes.cAtom.x, prevRes.cAtom.y, prevRes.cAtom.z],
          [res.nAtom.x, res.nAtom.y, res.nAtom.z],
          [res.caAtom.x, res.caAtom.y, res.caAtom.z],
          [res.cAtom.x, res.cAtom.y, res.cAtom.z]
        );
      }

      if (res.nAtom && res.caAtom && res.cAtom && nextRes?.nAtom) {
        res.psi = computeDihedralAngle(
          [res.nAtom.x, res.nAtom.y, res.nAtom.z],
          [res.caAtom.x, res.caAtom.y, res.caAtom.z],
          [res.cAtom.x, res.cAtom.y, res.cAtom.z],
          [nextRes.nAtom.x, nextRes.nAtom.y, nextRes.nAtom.z]
        );
      }

      const singleLetter = THREE_TO_ONE[res.resName] || 'X';
      fastaSequence += singleLetter;
    }

    chains.push({
      id: chainId,
      residues,
    });
  });

  const totalResidues = chains.reduce((acc, c) => acc + c.residues.length, 0);

  return {
    metadata,
    chains,
    atoms,
    helices,
    sheets,
    center,
    bounds: {
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ],
      radius: radius || 30,
    },
    totalResidues,
    fastaSequence,
  };
}
