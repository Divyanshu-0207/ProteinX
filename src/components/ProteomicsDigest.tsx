import React, { useState, useMemo } from 'react';
import { digestProtein, ProteaseType } from '../utils/bioCalculators';
import { Scissors, Search, Sliders, FileSpreadsheet, Download } from 'lucide-react';

interface ProteomicsDigestProps {
  sequence: string;
  proteinId?: string;
}

export const ProteomicsDigest: React.FC<ProteomicsDigestProps> = ({ sequence, proteinId }) => {
  const [selectedProtease, setSelectedProtease] = useState<ProteaseType>('trypsin');
  const [minMass, setMinMass] = useState<number>(400);
  const [maxMass, setMaxMass] = useState<number>(4000);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fragments = useMemo(() => {
    return digestProtein(sequence, selectedProtease);
  }, [sequence, selectedProtease]);

  // Filter fragments for mass spec window
  const filteredFragments = useMemo(() => {
    return fragments.filter((f) => {
      const matchMass = f.mass >= minMass && f.mass <= maxMass;
      const matchSearch =
        !searchTerm ||
        f.sequence.includes(searchTerm.toUpperCase()) ||
        f.start.toString().includes(searchTerm);
      return matchMass && matchSearch;
    });
  }, [fragments, minMass, maxMass, searchTerm]);

  // Export CSV
  const handleExportCSV = () => {
    const header = 'Fragment ID,Start,End,Length,Sequence,Mass (Da),[M+H]+,[M+2H]2+,[M+3H]3+\n';
    const rows = filteredFragments
      .map(
        (f) =>
          `${f.id},${f.start},${f.end},${f.length},"${f.sequence}",${f.mass},${f.charge1Mz},${f.charge2Mz},${f.charge3Mz}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${proteinId || 'ProteinX'}_${selectedProtease}_digestion.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Protease Select */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                In-Silico Proteolytic Cleavage & Mass Spec Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Predict peptide fragments and mass-to-charge (m/z) ratios for LC-MS/MS proteomics
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            Export Peptide Table (CSV)
          </button>
        </div>

        {/* Protease Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'trypsin',
              name: 'Trypsin',
              rule: 'Cleaves C-term to Arg (R) & Lys (K), except if followed by Pro (P)',
              color: 'border-rose-500/40 text-rose-400',
            },
            {
              id: 'chymotrypsin',
              name: 'Chymotrypsin',
              rule: 'Cleaves C-term to Phe (F), Trp (W), Tyr (Y), except before Pro',
              color: 'border-amber-500/40 text-amber-400',
            },
            {
              id: 'pepsin',
              name: 'Pepsin (pH < 2)',
              rule: 'Preferentially cleaves Phe (F) & Leu (L) in acidic environments',
              color: 'border-cyan-500/40 text-cyan-400',
            },
            {
              id: 'cnbr',
              name: 'Cyanogen Bromide (CNBr)',
              rule: 'Chemical cleavage C-terminal to Methionine (M) residues',
              color: 'border-purple-500/40 text-purple-400',
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedProtease(item.id as ProteaseType)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedProtease === item.id
                  ? 'bg-slate-800/90 border-cyan-400 ring-1 ring-cyan-400/50 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-xs text-white flex items-center justify-between">
                <span>{item.name}</span>
                {selectedProtease === item.id && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 leading-snug">{item.rule}</div>
            </button>
          ))}
        </div>

        {/* Mass Window Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" /> MS Mass Range (Da):
            </span>
            <input
              type="number"
              value={minMass}
              onChange={(e) => setMinMass(Number(e.target.value))}
              className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-white text-center"
            />
            <span className="text-slate-500 text-xs">to</span>
            <input
              type="number"
              value={maxMass}
              onChange={(e) => setMaxMass(Number(e.target.value))}
              className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-white text-center"
            />
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search fragment..."
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Simulated Mass Spectrometry Peak Plot */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Simulated MS1 Precursor Ion Spectrum ([M+2H]²⁺ / [M+H]⁺)
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {filteredFragments.length} fragments detected
          </span>
        </div>

        <div className="w-full h-36 bg-slate-950/80 rounded-xl border border-slate-800 p-2 relative overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1000 120" preserveAspectRatio="none">
            {/* Base line */}
            <line x1="0" y1="110" x2="1000" y2="110" stroke="#334155" strokeWidth="1" />

            {/* Mass spec sticks */}
            {filteredFragments.map((f, i) => {
              // Map mass range (minMass to maxMass) to x 50 to 950
              const x = 50 + ((f.charge2Mz - minMass) / Math.max(1, maxMass - minMass)) * 900;
              // Intensity proportional to peptide length (approx ionizability)
              const intensity = Math.min(100, Math.max(20, f.length * 6));
              const y = 110 - intensity;

              if (x < 0 || x > 1000) return null;

              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1="110"
                    x2={x}
                    y2={y}
                    stroke="#f43f5e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="hover:stroke-cyan-400 transition-colors"
                  />
                  <circle cx={x} cy={y} r="2" fill="#fda4af" />
                </g>
              );
            })}
          </svg>

          <div className="absolute bottom-1 left-3 text-[10px] font-mono text-slate-500">
            m/z {minMass}
          </div>
          <div className="absolute bottom-1 right-3 text-[10px] font-mono text-slate-500">
            m/z {maxMass}
          </div>
        </div>
      </div>

      {/* Table of Generated Peptides */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-sm font-bold text-white">
            Peptide Fragments ({filteredFragments.length})
          </span>
          <span className="text-xs text-slate-400">
            Theoretical Monoisotopic Masses & Ion Charge States
          </span>
        </div>

        <div className="overflow-x-auto max-h-[360px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950/80 sticky top-0 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3 font-mono">#</th>
                <th className="p-3">Position</th>
                <th className="p-3">Length</th>
                <th className="p-3 font-mono">Mass (Da)</th>
                <th className="p-3 font-mono text-rose-400">[M+H]⁺</th>
                <th className="p-3 font-mono text-cyan-400">[M+2H]²⁺</th>
                <th className="p-3 font-mono text-purple-400">[M+3H]³⁺</th>
                <th className="p-3 font-mono">Sequence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredFragments.map((f) => (
                <tr key={f.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 text-slate-500">{f.id}</td>
                  <td className="p-3 text-slate-300 font-sans">
                    {f.start} – {f.end}
                  </td>
                  <td className="p-3 text-slate-400">{f.length} aa</td>
                  <td className="p-3 font-bold text-white">{f.mass.toFixed(2)}</td>
                  <td className="p-3 text-rose-300">{f.charge1Mz.toFixed(2)}</td>
                  <td className="p-3 text-cyan-300 font-semibold">{f.charge2Mz.toFixed(2)}</td>
                  <td className="p-3 text-purple-300">{f.charge3Mz.toFixed(2)}</td>
                  <td className="p-3 text-emerald-300 max-w-[280px] truncate" title={f.sequence}>
                    {f.sequence}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
