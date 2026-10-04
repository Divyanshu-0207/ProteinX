import React, { useState } from 'react';
import { PRESET_PROTEINS_LIST, PresetProteinSummary, UBQ_PDB_RAW } from '../data/presetProteins';
import { ProteinStructure } from '../types/protein';
import { parsePDB } from '../utils/pdbParser';
import {
  Search,
  Upload,
  Database,
  FileText,
  Loader2,
  CheckCircle,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface PdbExplorerProps {
  onLoadStructure: (structure: ProteinStructure) => void;
  activePdbId?: string;
}

export const PdbExplorer: React.FC<PdbExplorerProps> = ({ onLoadStructure, activePdbId }) => {
  const [searchPdbId, setSearchPdbId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customPdbText, setCustomPdbText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'presets' | 'rcsb' | 'upload' | 'paste'>('presets');

  // Fetch PDB directly from RCSB
  const handleFetchPdb = async (pdbIdToFetch: string) => {
    const cleanId = pdbIdToFetch.trim().toUpperCase();
    if (!cleanId || cleanId.length !== 4) {
      setErrorMsg('Please enter a valid 4-character PDB code (e.g., 1UBQ, 4INS, 1CRN).');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // Direct RCSB download URL
      const response = await fetch(`https://files.rcsb.org/download/${cleanId}.pdb`);
      if (!response.ok) {
        throw new Error(`PDB entry '${cleanId}' could not be retrieved from RCSB (status ${response.status}).`);
      }
      const text = await response.text();
      if (!text.includes('ATOM')) {
        throw new Error(`File received for '${cleanId}' contains no valid ATOM records.`);
      }

      const parsed = parsePDB(text);
      if (!parsed.metadata.id) {
        parsed.metadata.id = cleanId;
      }
      onLoadStructure(parsed);
      setSearchPdbId('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to download or parse PDB file from RCSB.');
    } finally {
      setLoading(false);
    }
  };

  // Load Preset
  const handleSelectPreset = async (preset: PresetProteinSummary) => {
    if (preset.id === '1UBQ') {
      const parsed = parsePDB(UBQ_PDB_RAW);
      onLoadStructure(parsed);
      return;
    }

    // Attempt fetching from RCSB
    await handleFetchPdb(preset.id);
  };

  // Handle Local File Upload (.pdb or .ent)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) throw new Error('File content is empty');
        const parsed = parsePDB(content);
        if (!parsed.metadata.id) {
          parsed.metadata.id = file.name.replace(/\.[^/.]+$/, '').toUpperCase();
        }
        onLoadStructure(parsed);
      } catch (err: any) {
        setErrorMsg('Failed to parse uploaded PDB file: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Error reading uploaded file.');
      setLoading(false);
    };
    reader.readAsText(file);
  };

  // Handle Manual Paste
  const handleParseCustomText = () => {
    if (!customPdbText.trim()) {
      setErrorMsg('Please paste PDB text content.');
      return;
    }
    try {
      const parsed = parsePDB(customPdbText);
      parsed.metadata.id = parsed.metadata.id || 'CUSTOM';
      onLoadStructure(parsed);
      setCustomPdbText('');
    } catch (err: any) {
      setErrorMsg('Failed to parse custom PDB text: ' + err.message);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-5">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Structure Repository & Importer</h3>
            <p className="text-xs text-slate-400">
              Access 200,000+ experimental structures from RCSB Protein Data Bank or upload custom models
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'presets'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Curated Presets
          </button>
          <button
            onClick={() => setActiveTab('rcsb')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'rcsb'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fetch RCSB PDB
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            File Upload
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'paste'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw Coordinates
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 1: Curated Presets */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_PROTEINS_LIST.map((p) => {
            const isActive = activePdbId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  isActive
                    ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/40 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-cyan-400">{p.id}</span>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {p.resolution} Å
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs mt-1">{p.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                  <span>
                    {p.residuesCount} residues • {p.organism}
                  </span>
                  {isActive ? (
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-slate-400 group-hover:text-white">Load Structure →</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Direct RCSB PDB Fetch */}
      {activeTab === 'rcsb' && (
        <div className="flex flex-col gap-4 max-w-xl mx-auto py-4">
          <div className="text-center">
            <h4 className="font-bold text-white text-sm">Download from RCSB PDB Database</h4>
            <p className="text-xs text-slate-400 mt-1">
              Enter any 4-character Protein Data Bank accession code to download and load into ProteinX
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                maxLength={4}
                value={searchPdbId}
                onChange={(e) => setSearchPdbId(e.target.value.toUpperCase())}
                placeholder="e.g. 1A3N, 1EMA, 4INS..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 uppercase tracking-widest text-center"
              />
            </div>
            <button
              onClick={() => handleFetchPdb(searchPdbId)}
              disabled={loading || !searchPdbId}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Fetch Structure
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span>Popular PDB Codes:</span>
            {['1A3N', '1MBO', '1UBQ', '1EMA', '6VSB', '4INS'].map((id) => (
              <button
                key={id}
                onClick={() => handleFetchPdb(id)}
                className="font-mono text-cyan-400 hover:underline bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: File Upload */}
      {activeTab === 'upload' && (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-950/40 text-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Upload Custom PDB Structure</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Select or drag and drop a standard <code>.pdb</code> or <code>.ent</code> atomic coordinate file
            </p>
          </div>
          <label className="mt-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-all">
            Browse PDB File
            <input
              type="file"
              accept=".pdb,.ent,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* TAB 4: Raw Text Paste */}
      {activeTab === 'paste' && (
        <div className="flex flex-col gap-3">
          <div className="text-xs text-slate-400">
            Paste raw PDB formatted ATOM/HETATM records below:
          </div>
          <textarea
            value={customPdbText}
            onChange={(e) => setCustomPdbText(e.target.value)}
            rows={8}
            placeholder="ATOM      1  N   MET A   1      27.340  24.430   2.614  1.00  9.67           N&#10;ATOM      2  CA  MET A   1      26.266  25.413   2.842  1.00  9.37           C..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-y"
          />
          <button
            onClick={handleParseCustomText}
            className="self-end px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Parse & Load Coordinates
          </button>
        </div>
      )}
    </div>
  );
};
