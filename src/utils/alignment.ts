import { AlignmentResult } from '../types/protein';

// Standard BLOSUM62 Matrix for protein sequence alignment
const BLOSUM62_CHARS = 'ARNDCQEGHILKMFPSTWYV';
const BLOSUM62_RAW: number[][] = [
  /* A */ [ 4, -1, -2, -2,  0, -1, -1,  0, -2, -1, -1, -1, -1, -2, -1,  1,  0, -3, -2,  0],
  /* R */ [-1,  5,  0, -2, -3,  1,  0, -2,  0, -3, -2,  2, -1, -3, -2, -1, -1, -3, -2, -3],
  /* N */ [-2,  0,  6,  1, -3,  0,  0,  0,  1, -3, -3,  0, -2, -3, -2,  1,  0, -4, -2, -3],
  /* D */ [-2, -2,  1,  6, -3,  0,  2, -1, -1, -3, -4, -1, -3, -3, -1,  0, -1, -4, -3, -3],
  /* C */ [ 0, -3, -3, -3,  9, -3, -4, -3, -3, -1, -1, -3, -1, -2, -3, -1, -1, -2, -2, -1],
  /* Q */ [-1,  1,  0,  0, -3,  5,  2, -2,  0, -3, -2,  1,  0, -3, -1,  0, -1, -2, -1, -2],
  /* E */ [-1,  0,  0,  2, -4,  2,  5, -2,  0, -3, -3,  1, -2, -3, -1,  0, -1, -3, -2, -2],
  /* G */ [ 0, -2,  0, -1, -3, -2, -2,  6, -2, -4, -4, -2, -3, -3, -2,  0, -2, -2, -3, -3],
  /* H */ [-2,  0,  1, -1, -3,  0,  0, -2,  8, -3, -3, -1, -2, -1, -2, -1, -2, -2,  2, -3],
  /* I */ [-1, -3, -3, -3, -1, -3, -3, -4, -3,  4,  2, -3,  1,  0, -3, -2, -1, -3, -1,  3],
  /* L */ [-1, -2, -3, -4, -1, -2, -3, -4, -3,  2,  4, -2,  2,  0, -3, -2, -1, -2, -1,  1],
  /* K */ [-1,  2,  0, -1, -3,  1,  1, -2, -1, -3, -2,  5, -1, -3, -1,  0, -1, -3, -2, -2],
  /* M */ [-1, -1, -2, -3, -1,  0, -2, -3, -2,  1,  2, -1,  5,  0, -2, -1, -1, -1, -1,  1],
  /* F */ [-2, -3, -3, -3, -2, -3, -3, -3, -1,  0,  0, -3,  0,  6, -4, -2, -2,  1,  3, -1],
  /* P */ [-1, -2, -2, -1, -3, -1, -1, -2, -2, -3, -3, -1, -2, -4,  7, -1, -1, -4, -3, -2],
  /* S */ [ 1, -1,  1,  0, -1,  0,  0,  0, -1, -2, -2,  0, -1, -2, -1,  4,  1, -3, -2, -2],
  /* T */ [ 0, -1,  0, -1, -1, -1, -1, -2, -2, -1, -1, -1, -1, -2, -1,  1,  5, -2, -2,  0],
  /* W */ [-3, -3, -4, -4, -2, -2, -3, -2, -2, -3, -2, -3, -1,  1, -4, -3, -2, 11,  2, -3],
  /* Y */ [-2, -2, -2, -3, -2, -1, -2, -3,  2, -1, -1, -2, -1,  3, -3, -2, -2,  2,  7, -1],
  /* V */ [ 0, -3, -3, -3, -1, -2, -2, -3, -3,  3,  1, -2,  1, -1, -2, -2,  0, -3, -1,  4]
];

export function getScore(a: string, b: string): number {
  const i = BLOSUM62_CHARS.indexOf(a);
  const j = BLOSUM62_CHARS.indexOf(b);
  if (i === -1 || j === -1) {
    return a === b ? 1 : -1;
  }
  return BLOSUM62_RAW[i][j];
}

// Needleman-Wunsch Global Alignment
export function alignNeedlemanWunsch(
  seqA: string,
  seqB: string,
  gapPenalty = -4
): AlignmentResult {
  const a = seqA.toUpperCase().replace(/[^A-Z]/g, '');
  const b = seqB.toUpperCase().replace(/[^A-Z]/g, '');
  const n = a.length;
  const m = b.length;

  if (n === 0 || m === 0) {
    return {
      score: 0,
      identity: 0,
      similarity: 0,
      gaps: Math.max(n, m),
      length: Math.max(n, m),
      alignedSeq1: a,
      alignedSeq2: b,
      consensus: '',
    };
  }

  // Initialize DP Matrix
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i * gapPenalty;
  for (let j = 0; j <= m; j++) dp[0][j] = j * gapPenalty;

  // Fill Matrix
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const match = dp[i - 1][j - 1] + getScore(a[i - 1], b[j - 1]);
      const deleteGap = dp[i - 1][j] + gapPenalty;
      const insertGap = dp[i][j - 1] + gapPenalty;
      dp[i][j] = Math.max(match, deleteGap, insertGap);
    }
  }

  // Traceback
  let alignedA = '';
  let alignedB = '';
  let consensus = '';
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + getScore(a[i - 1], b[j - 1])) {
      alignedA = a[i - 1] + alignedA;
      alignedB = b[j - 1] + alignedB;
      if (a[i - 1] === b[j - 1]) {
        consensus = '|' + consensus;
      } else if (getScore(a[i - 1], b[j - 1]) > 0) {
        consensus = ':' + consensus;
      } else {
        consensus = '.' + consensus;
      }
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + gapPenalty) {
      alignedA = a[i - 1] + alignedA;
      alignedB = '-' + alignedB;
      consensus = ' ' + consensus;
      i--;
    } else {
      alignedA = '-' + alignedA;
      alignedB = b[j - 1] + alignedB;
      consensus = ' ' + consensus;
      j--;
    }
  }

  // Calculate statistics
  let identities = 0;
  let similarities = 0;
  let gaps = 0;

  for (let k = 0; k < alignedA.length; k++) {
    const charA = alignedA[k];
    const charB = alignedB[k];
    if (charA === '-' || charB === '-') {
      gaps++;
    } else if (charA === charB) {
      identities++;
      similarities++;
    } else if (getScore(charA, charB) > 0) {
      similarities++;
    }
  }

  const length = alignedA.length;
  const identity = length > 0 ? Number(((identities / length) * 100).toFixed(1)) : 0;
  const similarity = length > 0 ? Number(((similarities / length) * 100).toFixed(1)) : 0;

  return {
    score: dp[n][m],
    identity,
    similarity,
    gaps,
    length,
    alignedSeq1: alignedA,
    alignedSeq2: alignedB,
    consensus,
  };
}
