import React, { useState, useMemo } from 'react';
import { ProteinStructure, RenderMode, ColorMode, Residue } from './types/protein';
import { UBQ_PDB_RAW } from './data/presetProteins';
import { parsePDB } from './utils/pdbParser';
import { calculatePhysicochemicalProperties } from './utils/bioCalculators';
import { Header } from './components/Header';
import { Viewer3D } from './components/Viewer3D';
import { RamachandranPlot } from './components/RamachandranPlot';
import { SequenceWorkbench } from './components/SequenceWorkbench';
import { AlignmentTool } from './components/AlignmentTool';
import { ProteomicsDigest } from './components/ProteomicsDigest';
import { PdbExplorer } from './components/PdbExplorer';
import { ReportModal } from './components/ReportModal';
import {
  Boxes,
  Palette,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  Atom,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export function App() {
  // Initial default protein structure: Human Ubiquitin (1UBQ)
  const [structure, setStructure] = useState<ProteinStructure>(() => parsePDB(UBQ_PDB_RAW));
  const [activeTab, setActiveTab] = useState<string>('viewer');

  // 3D Viewer Settings
  const [renderMode, setRenderMode] = useState<RenderMode>('ribbon');
  const [colorMode, setColorMode] = useState<ColorMode>('secondary');
  const [selectedResSeq, setSelectedResSeq] = useState<number | null>(null);

  // Modal State
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);

  // Computed properties
  const properties = useMemo(() => {
    return calculatePhysicochemicalProperties(structure.fastaSequence);
  }, [structure.fastaSequence]);

  // Secondary structure breakdown counts
  const secondaryStats = useMemo(() => {
    let helices = 0;
    let sheets = 0;
    let coils = 0;
    structure.chains.forEach((c) => {
      c.residues.forEach((r) => {
        if (r.secondaryType === 'helix') helices++;
        else if (r.secondaryType === 'sheet') sheets++;
        else coils++;
      });
    });
    const total = helices + sheets + coils || 1;
    return {
      helices,
      sheets,
      coils,
      helixPct: ((helices / total) * 100).toFixed(1),
      sheetPct: ((sheets / total) * 100).toFixed(1),
      coilPct: ((coils / total) * 100).toFixed(1),
    };
  }, [structure]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        structure={structure}
        onOpenReportModal={() => setReportModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* TAB 1: 3D Structure Studio */}
        {activeTab === 'viewer' && (
          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            {/* 3D Viewport Column */}
            <div className="flex-1 flex flex-col gap-3 min-h-[540px]">
              {/* 3D Representation Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-lg">
                {/* Render Mode Switcher */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 flex items-center gap-1 mr-1">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" /> Mode:
                  </span>
                  {[
                    { id: 'ribbon', label: 'Cartoon Ribbon' },
                    { id: 'ball-and-stick', label: 'Ball & Stick' },
                    { id: 'spacefill', label: 'CPK Spacefill' },
                    { id: 'backbone', label: 'Backbone Wire' },
                    { id: 'surface', label: 'Envelope Surface' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setRenderMode(m.id as RenderMode)}
                      className={`px-2.5 py-1 rounded-xl font-medium transition-all ${
                        renderMode === m.id
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                          : 'text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-800'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Color Mode Switcher */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 flex items-center gap-1 mr-1">
                    <Palette className="w-3.5 h-3.5 text-pink-400" /> Coloring:
                  </span>
                  {[
                    { id: 'secondary', label: 'Secondary Struct.' },
                    { id: 'chain', label: 'Chain' },
                    { id: 'hydrophobicity', label: 'Hydropathy' },
                    { id: 'element', label: 'CPK Atom' },
                    { id: 'bfactor', label: 'B-Factor' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setColorMode(c.id as ColorMode)}
                      className={`px-2.5 py-1 rounded-xl font-medium transition-all ${
                        colorMode === c.id
                          ? 'bg-pink-500 text-slate-950 font-bold shadow-md shadow-pink-500/20'
                          : 'text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-800'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Three.js 3D Viewer */}
              <div className="flex-1 min-h-[480px]">
                <Viewer3D
                  structure={structure}
                  renderMode={renderMode}
                  colorMode={colorMode}
                  highlightResidueNum={selectedResSeq}
                />
              </div>
            </div>

            {/* Side Intelligence Panel */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
              {/* Target Quick Stats */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Structure Summary
                  </span>
                  <span className="font-mono text-cyan-400 font-bold text-xs">
                    {structure.metadata.id || 'PDB'}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-medium leading-snug">
                  {structure.metadata.title || 'Macromolecular Protein Assembly'}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Organism</span>
                    <span className="font-semibold text-slate-200 truncate block">
                      {structure.metadata.organism || 'Synthetic / Standard'}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Resolution</span>
                    <span className="font-semibold text-emerald-400 font-mono block">
                      {structure.metadata.resolution ? `${structure.metadata.resolution} Å` : 'N/A'}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Chains</span>
                    <span className="font-semibold text-purple-400 font-mono block">
                      {structure.chains.length} ({structure.chains.map((c) => c.id).join(', ')})
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Atoms Count</span>
                    <span className="font-semibold text-white font-mono block">
                      {structure.atoms.length.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Secondary Structure Composition Bar */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Secondary Elements:</span>
                    <span className="font-mono text-white text-[10px]">
                      {secondaryStats.helixPct}% α • {secondaryStats.sheetPct}% β
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden flex">
                    <div
                      style={{ width: `${secondaryStats.helixPct}%` }}
                      className="bg-pink-500 h-full"
                      title={`Alpha Helix: ${secondaryStats.helixPct}%`}
                    />
                    <div
                      style={{ width: `${secondaryStats.sheetPct}%` }}
                      className="bg-amber-400 h-full"
                      title={`Beta Sheet: ${secondaryStats.sheetPct}%`}
                    />
                    <div
                      style={{ width: `${secondaryStats.coilPct}%` }}
                      className="bg-slate-600 h-full"
                      title={`Coil / Loop: ${secondaryStats.coilPct}%`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Helix
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Sheet
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600" /> Loop
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Ramachandran Stereochemistry Widget */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Conformational Dihedrals
                  </span>
                  <button
                    onClick={() => setActiveTab('ramachandran')}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    Full Plot →
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Residues in core favored steric regions assessed via φ/ψ backbone angles.
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-around text-center">
                  <div>
                    <span className="text-xs text-slate-500 block">Residues</span>
                    <span className="text-base font-bold font-mono text-cyan-400">
                      {structure.totalResidues}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div>
                    <span className="text-xs text-slate-500 block">pI Point</span>
                    <span className="text-base font-bold font-mono text-purple-400">
                      {properties.isoelectricPoint}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div>
                    <span className="text-xs text-slate-500 block">Mass</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      {(properties.molecularWeight / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
              </div>

              {/* Switch to PDB Importer CTA */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-800/40 text-xs flex flex-col gap-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Load Any Protein Structure
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Search across 200,000+ experimental structures in the RCSB Protein Data Bank or upload custom PDB files.
                </p>
                <button
                  onClick={() => setActiveTab('repository')}
                  className="mt-1 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs self-start transition-all cursor-pointer"
                >
                  Browse RCSB PDB Repository
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Sequence & Mutations */}
        {activeTab === 'sequence' && (
          <SequenceWorkbench
            initialSequence={structure.fastaSequence}
            proteinId={structure.metadata.id}
            onSelectResidueSeq={(seq) => {
              setSelectedResSeq(seq);
              // Option to hop to 3D
            }}
            selectedResSeq={selectedResSeq}
          />
        )}

        {/* TAB 3: Ramachandran Plot */}
        {activeTab === 'ramachandran' && (
          <RamachandranPlot
            structure={structure}
            onSelectResidue={(seq) => {
              setSelectedResSeq(seq);
              setActiveTab('viewer');
            }}
            selectedResSeq={selectedResSeq}
          />
        )}

        {/* TAB 4: Pairwise Alignment */}
        {activeTab === 'alignment' && (
          <AlignmentTool currentSequence={structure.fastaSequence} />
        )}

        {/* TAB 5: Proteomics & In-Silico Cleavage Digestion */}
        {activeTab === 'proteomics' && (
          <ProteomicsDigest
            sequence={structure.fastaSequence}
            proteinId={structure.metadata.id}
          />
        )}

        {/* TAB 6: PDB Repository & Importer */}
        {activeTab === 'repository' && (
          <PdbExplorer
            onLoadStructure={(newStruct) => {
              setStructure(newStruct);
              setActiveTab('viewer');
            }}
            activePdbId={structure.metadata.id}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ProteinX • Protein Structure & Sequence Intelligence Studio • Powered by Three.js & BioCalculators
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setActiveTab('repository')}
              className="hover:text-cyan-400 transition-colors"
            >
              RCSB PDB Database
            </button>
            <span>•</span>
            <button
              onClick={() => setReportModalOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              Export Report
            </button>
          </div>
        </div>
      </footer>

      {/* Comprehensive Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        structure={structure}
      />
    </div>
  );
}

export default App;
