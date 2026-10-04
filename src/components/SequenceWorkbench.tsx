import React, { useState, useMemo } from 'react';
import { AMINO_ACIDS } from '../data/aminoAcids';
import {
  calculatePhysicochemicalProperties,
  computeHydropathyProfile,
} from '../utils/bioCalculators';
import {
  Dna,
  Zap,
  TrendingUp,
  Activity,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';

interface SequenceWorkbenchProps {
  initialSequence: string;
  proteinId?: string;
  onSelectResidueSeq?: (resSeq: number) => void;
  selectedResSeq?: number | null;
}

export const SequenceWorkbench: React.FC<SequenceWorkbenchProps> = ({
  initialSequence,
  proteinId,
  onSelectResidueSeq,
  selectedResSeq,
}) => {
  const [currentSeq, setCurrentSeq] = useState<string>(initialSequence || '');
  const [windowSize, setWindowSize] = useState<number>(9);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Mutation Simulator State
  const [selectedMutationIndex, setSelectedMutationIndex] = useState<number | null>(null);
  const [replacementAA, setReplacementAA] = useState<string>('A');
  const [mutationHistory, setMutationHistory] = useState<
    { index: number; original: string; mutated: string }[]
  >([]);

  // Update currentSeq when initialSequence changes
  React.useEffect(() => {
    setCurrentSeq(initialSequence || '');
    setMutationHistory([]);
  }, [initialSequence]);

  // Baseline properties
  const baseProperties = useMemo(() => {
    return calculatePhysicochemicalProperties(initialSequence);
  }, [initialSequence]);

  // Mutated / Current properties
  const currentProperties = useMemo(() => {
    return calculatePhysicochemicalProperties(currentSeq);
  }, [currentSeq]);

  // Hydropathy Profile
  const hydropathyData = useMemo(() => {
    return computeHydropathyProfile(currentSeq, windowSize);
  }, [currentSeq, windowSize]);

  // Handle applying a mutation
  const handleApplyMutation = () => {
    if (selectedMutationIndex === null) return;
    const orig = currentSeq[selectedMutationIndex];
    if (!orig || orig === replacementAA) return;

    const newSeq =
      currentSeq.substring(0, selectedMutationIndex) +
      replacementAA +
      currentSeq.substring(selectedMutationIndex + 1);

    setCurrentSeq(newSeq);
    setMutationHistory((prev) => [
      ...prev,
      { index: selectedMutationIndex + 1, original: orig, mutated: replacementAA },
    ]);
  };

  // Reset mutations back to wildtype
  const handleResetToWildtype = () => {
    setCurrentSeq(initialSequence);
    setMutationHistory([]);
    setSelectedMutationIndex(null);
  };

  // Mutation Delta calculation
  const mutationDelta = useMemo(() => {
    if (selectedMutationIndex === null) return null;
    const origChar = currentSeq[selectedMutationIndex];
    const origInfo = AMINO_ACIDS[origChar];
    const mutInfo = AMINO_ACIDS[replacementAA];

    if (!origInfo || !mutInfo) return null;

    const deltaMw = mutInfo.weight - origInfo.weight;
    const deltaHydro = mutInfo.hydropathy - origInfo.hydropathy;
    const deltaVol = mutInfo.volume - origInfo.volume;
    const deltaCharge = mutInfo.charge - origInfo.charge;

    return {
      origChar,
      origInfo,
      mutInfo,
      deltaMw: Number(deltaMw.toFixed(2)),
      deltaHydro: Number(deltaHydro.toFixed(2)),
      deltaVol: Number(deltaVol.toFixed(1)),
      deltaCharge: Number(deltaCharge.toFixed(1)),
    };
  }, [selectedMutationIndex, currentSeq, replacementAA]);

  // Clean characters array for sequence viewer
  const seqChars = currentSeq.split('');

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner: Key Biochemical Property Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Residues</span>
          <span className="text-xl font-bold font-mono text-cyan-400 mt-1">
            {currentProperties.length}
          </span>
          <span className="text-[10px] text-slate-500">chain length</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Mol. Weight</span>
          <span className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {(currentProperties.molecularWeight / 1000).toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">kDa</span>
          </span>
          <span className="text-[10px] text-slate-500">
            {currentProperties.molecularWeight.toLocaleString()} Da
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Isoelectric pI</span>
          <span className="text-xl font-bold font-mono text-purple-400 mt-1">
            {currentProperties.isoelectricPoint}
          </span>
          <span className="text-[10px] text-slate-500">neutral pH point</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Net Charge (pH 7.4)</span>
          <span
            className={`text-xl font-bold font-mono mt-1 ${
              currentProperties.netChargeAtPh7 > 0
                ? 'text-sky-400'
                : currentProperties.netChargeAtPh7 < 0
                ? 'text-rose-400'
                : 'text-slate-300'
            }`}
          >
            {currentProperties.netChargeAtPh7 > 0 ? '+' : ''}
            {currentProperties.netChargeAtPh7}
          </span>
          <span className="text-[10px] text-slate-500">physiological state</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">GRAVY Index</span>
          <span
            className={`text-xl font-bold font-mono mt-1 ${
              currentProperties.gravy > 0 ? 'text-amber-400' : 'text-blue-400'
            }`}
          >
            {currentProperties.gravy > 0 ? '+' : ''}
            {currentProperties.gravy}
          </span>
          <span className="text-[10px] text-slate-500">
            {currentProperties.gravy > 0 ? 'Hydrophobic' : 'Hydrophilic'}
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Absorbance A280</span>
          <span className="text-xl font-bold font-mono text-pink-400 mt-1">
            {currentProperties.absorbance280}
          </span>
          <span className="text-[10px] text-slate-500">0.1% (1 g/L) solution</span>
        </div>
      </div>

      {/* Main Sequence Grid & Interactive Residue Inspector */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        {/* Sequence Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Primary Sequence Explorer
                <span className="text-xs font-mono text-slate-400">
                  ({currentSeq.length} residues)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Click any residue to simulate in-silico point mutations and assess biophysical impact
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeCategoryFilter === 'all'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveCategoryFilter('hydrophobic')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeCategoryFilter === 'hydrophobic'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hydrophobic
              </button>
              <button
                onClick={() => setActiveCategoryFilter('polar')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeCategoryFilter === 'polar'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Polar
              </button>
              <button
                onClick={() => setActiveCategoryFilter('positive')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeCategoryFilter === 'positive'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                (+) Basic
              </button>
              <button
                onClick={() => setActiveCategoryFilter('negative')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  activeCategoryFilter === 'negative'
                    ? 'bg-red-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                (-) Acidic
              </button>
            </div>

            {mutationHistory.length > 0 && (
              <button
                onClick={handleResetToWildtype}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Mutations ({mutationHistory.length})
              </button>
            )}
          </div>
        </div>

        {/* Residue Tiles Grid */}
        <div className="max-h-[300px] overflow-y-auto pr-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex flex-wrap gap-1.5 font-mono text-xs select-none">
            {seqChars.map((char, index) => {
              const resNum = index + 1;
              const info = AMINO_ACIDS[char];
              const isSelected = selectedMutationIndex === index;
              const is3dSelected = selectedResSeq === resNum;

              // Filter check
              const matchesFilter =
                activeCategoryFilter === 'all' || info?.category === activeCategoryFilter;

              const isMutated = mutationHistory.some((m) => m.index === resNum);

              return (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedMutationIndex(index);
                    if (onSelectResidueSeq) onSelectResidueSeq(resNum);
                  }}
                  className={`relative flex flex-col items-center justify-center w-8 h-10 rounded-lg cursor-pointer transition-all border ${
                    isSelected || is3dSelected
                      ? 'ring-2 ring-amber-400 scale-110 z-10 shadow-lg'
                      : ''
                  } ${
                    !matchesFilter
                      ? 'opacity-25 grayscale'
                      : 'hover:scale-105 hover:border-slate-500'
                  } ${
                    isMutated
                      ? 'border-dashed border-amber-400 bg-amber-950/40'
                      : 'border-slate-800/80 bg-slate-900/90'
                  }`}
                  style={{
                    borderTopColor: info ? info.color : '#64748b',
                    borderTopWidth: '3px',
                  }}
                  title={`#${resNum} ${info?.name || char} (${info?.code3 || 'UNK'})\nCategory: ${
                    info?.category || 'N/A'
                  }\nHydropathy: ${info?.hydropathy ?? 0}\nCharge: ${info?.charge ?? 0}`}
                >
                  <span className="text-[8px] text-slate-500 font-sans leading-none mb-0.5">
                    {resNum % 10 === 0 || resNum === 1 ? resNum : ''}
                  </span>
                  <span
                    className="font-bold text-sm"
                    style={{ color: info ? info.color : '#e2e8f0' }}
                  >
                    {char}
                  </span>
                  {isMutated && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* In-Silico Mutation Simulator Drawer */}
        {selectedMutationIndex !== null && (
          <div className="bg-slate-950/90 border border-cyan-500/30 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  Mutation Sandbox: Residue #{selectedMutationIndex + 1}
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                    {currentSeq[selectedMutationIndex]} (
                    {AMINO_ACIDS[currentSeq[selectedMutationIndex]]?.code3})
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Select replacement amino acid to calculate stability delta
                </div>
              </div>
            </div>

            {/* Substitution Selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-1.5">
                <span className="text-xs text-slate-400 pl-2">Mutate To:</span>
                <select
                  value={replacementAA}
                  onChange={(e) => setReplacementAA(e.target.value)}
                  className="bg-slate-950 text-white font-mono text-xs rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none focus:border-cyan-400"
                >
                  {Object.values(AMINO_ACIDS).map((aa) => (
                    <option key={aa.code} value={aa.code}>
                      {aa.code} - {aa.code3} ({aa.name})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleApplyMutation}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Apply Variant
              </button>
            </div>

            {/* Delta metrics */}
            {mutationDelta && (
              <div className="flex items-center gap-4 text-xs font-mono border-t md:border-t-0 md:border-l border-slate-800 md:pl-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400">Δ Mass:</span>
                  <span
                    className={
                      mutationDelta.deltaMw > 0
                        ? 'text-amber-400'
                        : mutationDelta.deltaMw < 0
                        ? 'text-cyan-400'
                        : 'text-slate-300'
                    }
                  >
                    {mutationDelta.deltaMw > 0 ? '+' : ''}
                    {mutationDelta.deltaMw} Da
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400">Δ Hydro:</span>
                  <span
                    className={
                      mutationDelta.deltaHydro > 0
                        ? 'text-amber-400'
                        : mutationDelta.deltaHydro < 0
                        ? 'text-blue-400'
                        : 'text-slate-300'
                    }
                  >
                    {mutationDelta.deltaHydro > 0 ? '+' : ''}
                    {mutationDelta.deltaHydro}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400">Δ Charge:</span>
                  <span
                    className={
                      mutationDelta.deltaCharge > 0
                        ? 'text-sky-400'
                        : mutationDelta.deltaCharge < 0
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }
                  >
                    {mutationDelta.deltaCharge > 0 ? '+' : ''}
                    {mutationDelta.deltaCharge}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kyte-Doolittle Hydropathy Profile Plot */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Kyte-Doolittle Hydropathy Profile
              </h3>
              <p className="text-xs text-slate-400">
                Sliding window hydrophobicity analysis (&gt; +1.6 indicates putative transmembrane/core regions)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Window Size:</span>
            {[5, 7, 9, 11, 15].map((w) => (
              <button
                key={w}
                onClick={() => setWindowSize(w)}
                className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-colors ${
                  windowSize === w
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Hydropathy Chart */}
        <div className="w-full h-48 bg-slate-950/80 rounded-xl border border-slate-800 p-2 overflow-hidden relative">
          <svg className="w-full h-full" viewBox="0 0 800 160" preserveAspectRatio="none">
            {/* Zero line (neutral hydropathy) */}
            <line
              x1="0"
              y1="80"
              x2="800"
              y2="80"
              stroke="#334155"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            {/* +1.6 Transmembrane threshold line */}
            {/* Map score -4.5 to +4.5: y = 80 - (score / 4.5) * 70 */}
            <line
              x1="0"
              y1={80 - (1.6 / 4.5) * 70}
              x2="800"
              y2={80 - (1.6 / 4.5) * 70}
              stroke="#ca8a04"
              strokeWidth="1"
              strokeDasharray="2 2"
            />

            {/* Polygon Area Under Curve */}
            {hydropathyData.length > 1 && (
              <polygon
                points={`0,80 ${hydropathyData
                  .map((d, i) => {
                    const x = (i / (hydropathyData.length - 1)) * 800;
                    const y = Math.max(10, Math.min(150, 80 - (d.score / 4.5) * 70));
                    return `${x},${y}`;
                  })
                  .join(' ')} 800,80`}
                fill="url(#hydropathy-grad)"
                opacity="0.25"
              />
            )}

            {/* Main Polyline Path */}
            {hydropathyData.length > 1 && (
              <polyline
                points={hydropathyData
                  .map((d, i) => {
                    const x = (i / (hydropathyData.length - 1)) * 800;
                    const y = Math.max(10, Math.min(150, 80 - (d.score / 4.5) * 70));
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            <defs>
              <linearGradient id="hydropathy-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Chart Labels Overlay */}
          <div className="absolute top-2 left-3 text-[10px] font-mono text-emerald-400">
            +4.5 (Hydrophobic)
          </div>
          <div className="absolute top-[38%] left-3 text-[10px] font-mono text-amber-400/90">
            +1.6 (Transmembrane cutoff)
          </div>
          <div className="absolute top-[48%] left-3 text-[10px] font-mono text-slate-500">
            0.0 (Neutral)
          </div>
          <div className="absolute bottom-2 left-3 text-[10px] font-mono text-blue-400">
            -4.5 (Hydrophilic)
          </div>
        </div>
      </div>
    </div>
  );
};
