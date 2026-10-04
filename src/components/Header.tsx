import React from 'react';
import {
  Boxes,
  Dna,
  Target,
  GitCompare,
  Scissors,
  Database,
  Download,
  Info,
  ExternalLink,
} from 'lucide-react';
import { ProteinStructure } from '../types/protein';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  structure: ProteinStructure;
  onOpenReportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  structure,
  onOpenReportModal,
}) => {
  const navItems = [
    { id: 'viewer', label: '3D Structure Studio', icon: Boxes },
    { id: 'sequence', label: 'Sequence & Mutations', icon: Dna },
    { id: 'ramachandran', label: 'Ramachandran Plot', icon: Target },
    { id: 'alignment', label: 'Pairwise Alignment', icon: GitCompare },
    { id: 'proteomics', label: 'Proteomics & Digestion', icon: Scissors },
    { id: 'repository', label: 'PDB Importer', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-black">
              <span className="text-xl tracking-tighter">PX</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  ProteinX
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-semibold tracking-wider">
                  v1.0 Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Protein Structure & Sequence Intelligence Suite
              </p>
            </div>
          </div>

          {/* Active Structure Badge */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400">Target:</span>
            <span className="font-mono font-bold text-cyan-400">
              {structure.metadata.id || 'Custom'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-mono">{structure.totalResidues} aa</span>
            {structure.metadata.resolution && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-mono">
                  {structure.metadata.resolution} Å
                </span>
              </>
            )}
          </div>

          {/* Action Buttons: Export Report & Documentation */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReportModal}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none border-t border-slate-900">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800/90 text-cyan-400 shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
