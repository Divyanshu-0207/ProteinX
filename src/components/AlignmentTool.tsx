import React, { useState, useMemo } from 'react';
import { alignNeedlemanWunsch } from '../utils/alignment';
import { GitCompare, Play, Sparkles, Copy, Check } from 'lucide-react';

interface AlignmentToolProps {
  currentSequence: string;
}

const PRESET_COMPARISONS = [
  {
    name: 'Human Ubiquitin vs Yeast Ubiquitin',
    seq1: 'MQIFVKTLTGKTITLEVEPSDTIENVKAKIQDKEGIPPDQQRLIFAGKQLEDGRTLSDYNIQKESTLHLVLRLRGG',
    seq2: 'MQIFVKTLTGKTITLEVESSDTIDNVKSKIQDKEGIPPDQQRLIFAGKQLEDGRTLSDYNIQKESTLHLVLRLRGG', // 96% identity
    description: 'Ultra-conserved eukaryotic degradation tag (only 3 substitutions out of 76 residues)',
  },
  {
    name: 'Hemoglobin Alpha vs Beta Subunits',
    seq1: 'MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR',
    seq2: 'MVHLTPEEKSAVTALWGKVNVDEVGGEALGRLLVVYPWTQRFFESFGDLSTPDAVMGNPKVKAHGKKVLGAFSDGLAHLDNLKGTFATLSELHCDKLHVDPENFRLLGNVLVCVLAHHFGKEFTPPVQAAYQKVVAGVANALAHKYH',
    description: 'Paralogous oxygen transport globin chains evolved via ancient gene duplication',
  },
  {
    name: 'Crambin vs Abyssinian Toxin homolog',
    seq1: 'TTCCPSIVARSNFNVCRLPGTPEAICATYTGCIIIPGATCPGDYAN',
    seq2: 'TTCCPSIVARSNFNVCRLPGTSEAINATYTGCIIIPGATCPGDYAN',
    description: 'High-affinity structural homolog comparison with preserved disulfide bridges',
  },
];

export const AlignmentTool: React.FC<AlignmentToolProps> = ({ currentSequence }) => {
  const [seqA, setSeqA] = useState<string>(currentSequence || PRESET_COMPARISONS[0].seq1);
  const [seqB, setSeqB] = useState<string>(PRESET_COMPARISONS[0].seq2);
  const [gapPenalty, setGapPenalty] = useState<number>(-4);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync seqA if currentSequence changes
  React.useEffect(() => {
    if (currentSequence) {
      setSeqA(currentSequence);
    }
  }, [currentSequence]);

  // Compute Alignment
  const result = useMemo(() => {
    return alignNeedlemanWunsch(seqA, seqB, gapPenalty);
  }, [seqA, seqB, gapPenalty]);

  const handleCopyAlignment = () => {
    const text = `>Seq1 (Query)\n${result.alignedSeq1}\n>Consensus\n${result.consensus}\n>Seq2 (Subject)\n${result.alignedSeq2}\nIdentity: ${result.identity}% | Similarity: ${result.similarity}% | Score: ${result.score}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Chunk alignment into readable blocks of 60 chars
  const chunks = useMemo(() => {
    const list = [];
    const len = result.alignedSeq1.length;
    const chunkSize = 60;
    for (let i = 0; i < len; i += chunkSize) {
      list.push({
        start: i + 1,
        end: Math.min(i + chunkSize, len),
        s1: result.alignedSeq1.substring(i, i + chunkSize),
        match: result.consensus.substring(i, i + chunkSize),
        s2: result.alignedSeq2.substring(i, i + chunkSize),
      });
    }
    return list;
  }, [result]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Presets */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Pairwise Sequence Alignment Engine
              </h3>
              <p className="text-xs text-slate-400">
                Needleman-Wunsch Dynamic Programming algorithm with BLOSUM62 substitution matrix
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Gap Penalty:</span>
            {[-2, -4, -6, -8].map((g) => (
              <button
                key={g}
                onClick={() => setGapPenalty(g)}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs font-semibold transition-colors ${
                  gapPenalty === g
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Presets:
          </span>
          {PRESET_COMPARISONS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSeqA(preset.seq1);
                setSeqB(preset.seq2);
              }}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-slate-300 hover:text-indigo-300 transition-all text-left"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Inputs for Sequence A and Sequence B */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-400 font-mono">Sequence 1 (Query)</span>
              <span className="text-slate-500 font-mono">{seqA.length} aa</span>
            </div>
            <textarea
              value={seqA}
              onChange={(e) => setSeqA(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
              rows={3}
              placeholder="Paste FASTA or amino acid sequence..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500 tracking-wider resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-400 font-mono">Sequence 2 (Subject)</span>
              <span className="text-slate-500 font-mono">{seqB.length} aa</span>
            </div>
            <textarea
              value={seqB}
              onChange={(e) => setSeqB(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
              rows={3}
              placeholder="Paste FASTA or comparison sequence..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-purple-500 tracking-wider resize-none"
            />
          </div>
        </div>
      </div>

      {/* Alignment Score & Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Sequence Identity</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {result.identity}%
          </span>
          <span className="text-[10px] text-slate-500">Exact residue matches</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Similarity</span>
          <span className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {result.similarity}%
          </span>
          <span className="text-[10px] text-slate-500">Conservative substitutions</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Gaps Introduced</span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {result.gaps}
          </span>
          <span className="text-[10px] text-slate-500">Insertions / Deletions (InDels)</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">BLOSUM62 Score</span>
          <span className="text-2xl font-bold font-mono text-indigo-400 mt-1">
            {result.score}
          </span>
          <span className="text-[10px] text-slate-500">Global matrix alignment score</span>
        </div>
      </div>

      {/* Alignment Visualizer */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <span>Aligned Sequences Output</span>
            <span className="text-xs text-slate-400 font-mono">
              ({result.length} aligned columns)
            </span>
          </div>

          <button
            onClick={handleCopyAlignment}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy FASTA Alignment'}
          </button>
        </div>

        {/* Formatted Alignment Blocks */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 overflow-x-auto flex flex-col gap-6 font-mono text-xs">
          {chunks.map((chunk, idx) => (
            <div key={idx} className="flex flex-col gap-1 tracking-widest select-all">
              {/* Header range */}
              <div className="text-[10px] text-slate-500 font-sans tracking-normal flex justify-between">
                <span>Residue {chunk.start}</span>
                <span>Residue {chunk.end}</span>
              </div>

              {/* Seq 1 */}
              <div className="flex items-center text-cyan-400">
                <span className="w-14 shrink-0 text-slate-500 text-[10px] font-sans">Query:</span>
                <span className="font-semibold">{chunk.s1}</span>
              </div>

              {/* Match bar */}
              <div className="flex items-center text-slate-500">
                <span className="w-14 shrink-0" />
                <span className="text-emerald-400 font-bold whitespace-pre">{chunk.match}</span>
              </div>

              {/* Seq 2 */}
              <div className="flex items-center text-purple-400">
                <span className="w-14 shrink-0 text-slate-500 text-[10px] font-sans">Subject:</span>
                <span className="font-semibold">{chunk.s2}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
