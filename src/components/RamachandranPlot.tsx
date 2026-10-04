import React, { useRef, useEffect, useState, useMemo } from 'react';
import { ProteinStructure, Residue } from '../types/protein';
import { Target, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface RamachandranPlotProps {
  structure: ProteinStructure;
  onSelectResidue?: (resSeq: number) => void;
  selectedResSeq?: number | null;
}

interface PlotPoint {
  res: Residue;
  phi: number;
  psi: number;
  region: 'core_helix' | 'core_sheet' | 'allowed' | 'outlier';
}

export const RamachandranPlot: React.FC<RamachandranPlotProps> = ({
  structure,
  onSelectResidue,
  selectedResSeq,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<PlotPoint | null>(null);

  // Extract all residues with valid phi and psi
  const points: PlotPoint[] = useMemo(() => {
    const list: PlotPoint[] = [];

    structure.chains.forEach((chain) => {
      chain.residues.forEach((res) => {
        if (typeof res.phi === 'number' && typeof res.psi === 'number') {
          const phi = res.phi;
          const psi = res.psi;

          // Region classification
          let region: PlotPoint['region'] = 'outlier';

          // Alpha-helix favored region: phi ~ [-100, -40], psi ~ [-70, -20]
          if (phi >= -110 && phi <= -35 && psi >= -75 && psi <= -15) {
            region = 'core_helix';
          }
          // Beta-sheet favored region: phi ~ [-170, -70], psi ~ [90, 175]
          else if (phi >= -175 && phi <= -65 && psi >= 85 && psi <= 175) {
            region = 'core_sheet';
          }
          // General allowed boundary
          else if (
            (phi >= -180 && phi <= -30 && psi >= -90 && psi <= 180) ||
            (phi >= 30 && phi <= 90 && psi >= 10 && psi <= 90) // Left-handed helix
          ) {
            region = 'allowed';
          } else {
            region = 'outlier';
          }

          list.push({ res, phi, psi, region });
        }
      });
    });

    return list;
  }, [structure]);

  // Statistics
  const stats = useMemo(() => {
    const total = points.length || 1;
    const coreCount = points.filter(
      (p) => p.region === 'core_helix' || p.region === 'core_sheet'
    ).length;
    const allowedCount = points.filter((p) => p.region === 'allowed').length;
    const outlierCount = points.filter((p) => p.region === 'outlier').length;

    return {
      total: points.length,
      corePercent: Number(((coreCount / total) * 100).toFixed(1)),
      allowedPercent: Number(((allowedCount / total) * 100).toFixed(1)),
      outlierPercent: Number(((outlierCount / total) * 100).toFixed(1)),
    };
  }, [points]);

  // Coordinate mapping functions
  const mapCoords = (phi: number, psi: number, size: number) => {
    // phi: -180 to 180 -> 0 to size
    // psi: -180 to 180 -> size to 0 (canvas y is top-to-bottom)
    const x = ((phi + 180) / 360) * size;
    const y = ((180 - psi) / 360) * size;
    return { x, y };
  };

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    // 1. Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, size, size);

    // 2. Draw Favored Regions (Shaded polygons)
    // Beta Sheet Region
    const sheetTopLeft = mapCoords(-175, 175, size);
    const sheetBottomRight = mapCoords(-65, 85, size);
    ctx.fillStyle = 'rgba(234, 179, 8, 0.12)';
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(
      sheetTopLeft.x,
      sheetTopLeft.y,
      sheetBottomRight.x - sheetTopLeft.x,
      sheetBottomRight.y - sheetTopLeft.y,
      8
    );
    ctx.fill();
    ctx.stroke();

    // Alpha Helix Region
    const helixTopLeft = mapCoords(-110, -15, size);
    const helixBottomRight = mapCoords(-35, -75, size);
    ctx.fillStyle = 'rgba(236, 72, 153, 0.14)';
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.beginPath();
    ctx.roundRect(
      helixTopLeft.x,
      helixTopLeft.y,
      helixBottomRight.x - helixTopLeft.x,
      helixBottomRight.y - helixTopLeft.y,
      8
    );
    ctx.fill();
    ctx.stroke();

    // Left-handed Alpha Helix Region (small allowed island in upper right)
    const leftHelixTopLeft = mapCoords(35, 85, size);
    const leftHelixBottomRight = mapCoords(85, 20, size);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.roundRect(
      leftHelixTopLeft.x,
      leftHelixTopLeft.y,
      leftHelixBottomRight.x - leftHelixTopLeft.x,
      leftHelixBottomRight.y - leftHelixTopLeft.y,
      6
    );
    ctx.fill();
    ctx.stroke();

    // 3. Coordinate Grid and Axes
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Center Crosshair (0, 0)
    const mid = size / 2;
    ctx.beginPath();
    ctx.moveTo(mid, 0);
    ctx.lineTo(mid, size);
    ctx.moveTo(0, mid);
    ctx.lineTo(size, mid);
    ctx.stroke();

    // -90 and +90 grid lines
    const p90 = mapCoords(90, 90, size);
    const m90 = mapCoords(-90, -90, size);
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
    ctx.beginPath();
    ctx.moveTo(p90.x, 0); ctx.lineTo(p90.x, size);
    ctx.moveTo(m90.x, 0); ctx.lineTo(m90.x, size);
    ctx.moveTo(0, p90.y); ctx.lineTo(size, p90.y);
    ctx.moveTo(0, m90.y); ctx.lineTo(size, m90.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axis Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('0°', mid, size - 6);
    ctx.fillText('-180°', 20, size - 6);
    ctx.fillText('+180°', size - 24, size - 6);
    ctx.textAlign = 'left';
    ctx.fillText('+180°', 6, 14);
    ctx.fillText('0°', 6, mid + 3);
    ctx.fillText('-180°', 6, size - 18);

    // Region Watermark labels
    ctx.fillStyle = 'rgba(234, 179, 8, 0.45)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('β-Sheet', (sheetTopLeft.x + sheetBottomRight.x) / 2, (sheetTopLeft.y + sheetBottomRight.y) / 2);

    ctx.fillStyle = 'rgba(236, 72, 153, 0.5)';
    ctx.fillText('α-Helix', (helixTopLeft.x + helixBottomRight.x) / 2, (helixTopLeft.y + helixBottomRight.y) / 2);

    // 4. Plot Points
    points.forEach((p) => {
      const { x, y } = mapCoords(p.phi, p.psi, size);
      const isSelected = selectedResSeq && p.res.resSeq === selectedResSeq;

      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 6 : 3.5, 0, Math.PI * 2);

      if (isSelected) {
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      } else {
        if (p.region === 'core_helix') {
          ctx.fillStyle = '#ec4899';
        } else if (p.region === 'core_sheet') {
          ctx.fillStyle = '#eab308';
        } else if (p.region === 'allowed') {
          ctx.fillStyle = '#38bdf8';
        } else {
          ctx.fillStyle = '#ef4444'; // Outlier in red
        }
        ctx.fill();
      }
    });
  }, [points, selectedResSeq]);

  // Handle Mouse Move for Hover Tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Find closest point within threshold
    let closest: PlotPoint | null = null;
    let minDist = 12;

    for (const p of points) {
      const { x, y } = mapCoords(p.phi, p.psi, canvas.width);
      const dist = Math.hypot(x - mouseX, y - mouseY);
      if (dist < minDist) {
        minDist = dist;
        closest = p;
      }
    }

    setHoveredPoint(closest);
  };

  const handleClick = () => {
    if (hoveredPoint && onSelectResidue) {
      onSelectResidue(hoveredPoint.res.resSeq);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Ramachandran Plot
              <span className="text-xs font-mono font-normal text-slate-400">
                (φ vs ψ Dihedrals)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Conformational stereochemical quality validation
            </p>
          </div>
        </div>

        {/* Quality Badges */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Favored: {stats.corePercent}%
          </div>
          {stats.outlierPercent > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Outliers: {stats.outlierPercent}%
            </div>
          )}
        </div>
      </div>

      {/* Main Plot Area */}
      <div className="flex flex-col lg:flex-row items-center gap-6 justify-center">
        {/* Canvas */}
        <div className="relative group">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-xl border border-slate-700 shadow-inner cursor-pointer"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredPoint(null)}
            onClick={handleClick}
          />

          {/* Interactive Hover Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-3 left-3 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl pointer-events-none text-xs flex flex-col gap-1 z-20 min-w-[160px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-bold text-white">
                <span>
                  {hoveredPoint.res.resName} {hoveredPoint.res.resSeq}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Chain {hoveredPoint.res.chainId}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 text-slate-300 font-mono text-[11px] pt-1">
                <span>φ (Phi):</span>
                <span className="text-cyan-400 font-semibold">{hoveredPoint.phi.toFixed(1)}°</span>
                <span>ψ (Psi):</span>
                <span className="text-purple-400 font-semibold">{hoveredPoint.psi.toFixed(1)}°</span>
              </div>
              <div className="text-[10px] uppercase font-semibold tracking-wider pt-1">
                {hoveredPoint.region === 'core_helix' && (
                  <span className="text-pink-400">Core α-Helix</span>
                )}
                {hoveredPoint.region === 'core_sheet' && (
                  <span className="text-amber-400">Core β-Sheet</span>
                )}
                {hoveredPoint.region === 'allowed' && (
                  <span className="text-sky-400">Allowed Region</span>
                )}
                {hoveredPoint.region === 'outlier' && (
                  <span className="text-red-400">Stereochemical Outlier</span>
                )}
              </div>
              <div className="text-[9px] text-slate-500 italic mt-0.5">Click to view in 3D</div>
            </div>
          )}
        </div>

        {/* Legend and Region Breakdown */}
        <div className="flex-1 w-full flex flex-col gap-3">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col gap-2.5">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Conformation Regions
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-pink-500/5 border border-pink-500/20 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-pink-500 shrink-0" />
                <div>
                  <div className="font-semibold text-pink-300">α-Helix Core</div>
                  <div className="text-[10px] text-slate-400">φ ≈ -60°, ψ ≈ -45°</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <div className="font-semibold text-amber-300">β-Sheet Core</div>
                  <div className="text-[10px] text-slate-400">φ ≈ -120°, ψ ≈ +135°</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-sky-500/5 border border-sky-500/20 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-sky-400 shrink-0" />
                <div>
                  <div className="font-semibold text-sky-300">Allowed Conformations</div>
                  <div className="text-[10px] text-slate-400">Non-hindered steric</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/20 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
                <div>
                  <div className="font-semibold text-red-300">Outliers (Steric Clash)</div>
                  <div className="text-[10px] text-slate-400">Disallowed phi/psi</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Explanation */}
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              Developed by G. N. Ramachandran in 1963, this plot assesses backbone dihedral angles without steric collision between non-bonded atoms. High quality X-ray structures typically exhibit &gt;90% of residues in core favored regions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
