import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ProteinStructure, RenderMode, ColorMode, Residue, Atom } from '../types/protein';
import { AMINO_ACIDS, CHAIN_COLORS, ELEMENT_COLORS, SECONDARY_COLORS } from '../data/aminoAcids';
import { Camera, RotateCcw, ZoomIn, ZoomOut, Play, Pause, Ruler, Maximize2, Sparkles, Layers, Palette, Eye } from 'lucide-react';

interface Viewer3DProps {
  structure: ProteinStructure;
  renderMode: RenderMode;
  colorMode: ColorMode;
  selectedResidueIndex?: number | null;
  onSelectResidue?: (residue: Residue | null) => void;
  highlightResidueNum?: number | null;
}

export const Viewer3D: React.FC<Viewer3DProps> = ({
  structure,
  renderMode,
  colorMode,
  selectedResidueIndex,
  onSelectResidue,
  highlightResidueNum,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Interaction State
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [themeBg, setThemeBg] = useState<'slate' | 'black' | 'light'>('slate');
  const [hoveredResidue, setHoveredResidue] = useState<Residue | null>(null);
  const [measureMode, setMeasureMode] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<Atom[]>([]);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);

  // Mouse drag control state
  const isDraggingRef = useRef(false);
  const isRightDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  // Get color for residue based on colorMode
  const getResidueColor = useCallback(
    (res: Residue, chainIndex: number): THREE.Color => {
      if (colorMode === 'secondary') {
        const type = res.secondaryType || 'coil';
        return new THREE.Color(SECONDARY_COLORS[type]);
      } else if (colorMode === 'chain') {
        const hex = CHAIN_COLORS[chainIndex % CHAIN_COLORS.length];
        return new THREE.Color(hex);
      } else if (colorMode === 'hydrophobicity') {
        const single = res.resName ? AMINO_ACIDS[res.resName[0]] : null;
        const hydropathy = single?.hydropathy ?? 0;
        // -4.5 (hydrophilic, blue) to +4.5 (hydrophobic, red)
        const t = Math.max(0, Math.min(1, (hydropathy + 4.5) / 9.0));
        return new THREE.Color().setHSL(0.66 * (1 - t), 0.85, 0.55);
      } else if (colorMode === 'bfactor') {
        const b = res.caAtom?.tempFactor || 15;
        // 0 (blue) to 60 (red)
        const t = Math.max(0, Math.min(1, b / 60));
        return new THREE.Color().setHSL(0.66 * (1 - t), 0.9, 0.5);
      } else {
        return new THREE.Color(0x38bdf8);
      }
    },
    [colorMode]
  );

  const getElementColor = useCallback((elem: string): THREE.Color => {
    const hex = ELEMENT_COLORS[elem.toUpperCase()] || ELEMENT_COLORS.DEFAULT;
    return new THREE.Color(hex);
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const bgColors = {
      slate: 0x090d16,
      black: 0x020617,
      light: 0xf1f5f9,
    };
    scene.background = new THREE.Color(bgColors[themeBg]);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(50, 80, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x90cdf4, 0.6);
    dirLight2.position.set(-60, -50, -80);
    scene.add(dirLight2);

    // Group for protein model
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Resize observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (autoRotate && modelGroupRef.current && !isDraggingRef.current && !isRightDraggingRef.current) {
        modelGroupRef.current.rotation.y += delta * 0.25;
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [themeBg]);

  // Update Scene when theme background changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const bgColors = {
      slate: 0x090d16,
      black: 0x020617,
      light: 0xf8fafc,
    };
    sceneRef.current.background = new THREE.Color(bgColors[themeBg]);
  }, [themeBg]);

  // Build Protein 3D Meshes whenever structure, renderMode, or colorMode changes
  useEffect(() => {
    if (!modelGroupRef.current || !structure || !cameraRef.current) return;

    const group = modelGroupRef.current;
    // Clear previous children
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if ((obj as any).geometry) (obj as any).geometry.dispose();
      if ((obj as any).material) {
        if (Array.isArray((obj as any).material)) {
          (obj as any).material.forEach((m: any) => m.dispose());
        } else {
          (obj as any).material.dispose();
        }
      }
    }

    const [cx, cy, cz] = structure.center;
    const radius = structure.bounds.radius || 25;

    // Position camera appropriately based on structure bounds
    const camera = cameraRef.current;
    const dist = Math.max(radius * 2.4, 40);
    camera.position.set(0, 0, dist);
    camera.lookAt(0, 0, 0);

    // Build representation
    if (renderMode === 'ribbon' || renderMode === 'backbone') {
      // Build smooth spline tube per chain
      structure.chains.forEach((chain, chainIdx) => {
        const caPoints: THREE.Vector3[] = [];
        const resList: Residue[] = [];

        chain.residues.forEach((res) => {
          if (res.caAtom) {
            caPoints.push(
              new THREE.Vector3(
                res.caAtom.x - cx,
                res.caAtom.y - cy,
                res.caAtom.z - cz
              )
            );
            resList.push(res);
          }
        });

        if (caPoints.length < 2) return;

        // Spline Curve
        const curve = new THREE.CatmullRomCurve3(caPoints);
        curve.curveType = 'centripetal';
        curve.tension = 0.5;

        const tubularSegments = Math.min(caPoints.length * 6, 800);
        const tubeRadius = renderMode === 'ribbon' ? 0.75 : 0.45;
        const radialSegments = renderMode === 'ribbon' ? 8 : 6;

        const tubeGeo = new THREE.TubeGeometry(
          curve,
          tubularSegments,
          tubeRadius,
          radialSegments,
          false
        );

        // Vertex coloring along curve
        const colors: number[] = [];
        const posAttr = tubeGeo.attributes.position;
        const vertexCount = posAttr.count;

        for (let i = 0; i < vertexCount; i++) {
          const t = i / vertexCount;
          const resIdx = Math.min(Math.floor(t * resList.length), resList.length - 1);
          const res = resList[resIdx];
          const col = getResidueColor(res, chainIdx);

          // Highlight selected residue
          if (highlightResidueNum && res.resSeq === highlightResidueNum) {
            colors.push(1.0, 0.9, 0.1);
          } else {
            colors.push(col.r, col.g, col.b);
          }
        }

        tubeGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const mat = new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.35,
          metalness: 0.15,
        });

        const mesh = new THREE.Mesh(tubeGeo, mat);
        group.add(mesh);
      });
    } else if (renderMode === 'spacefill') {
      // Spacefill CPK Van der Waals representation with instanced mesh
      const sphereGeo = new THREE.SphereGeometry(1, 12, 12);
      const totalAtoms = structure.atoms.length;
      const instancedMesh = new THREE.InstancedMesh(
        sphereGeo,
        new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.1 }),
        totalAtoms
      );

      const dummy = new THREE.Object3D();
      const color = new THREE.Color();

      structure.atoms.forEach((atom, idx) => {
        dummy.position.set(atom.x - cx, atom.y - cy, atom.z - cz);

        // VDW Radii approximation
        let r = 1.4;
        if (atom.element === 'H') r = 1.0;
        else if (atom.element === 'C') r = 1.7;
        else if (atom.element === 'N') r = 1.55;
        else if (atom.element === 'O') r = 1.52;
        else if (atom.element === 'S') r = 1.8;
        else if (atom.element === 'P') r = 1.8;
        dummy.scale.set(r, r, r);
        dummy.updateMatrix();

        instancedMesh.setMatrixAt(idx, dummy.matrix);

        if (colorMode === 'element') {
          color.copy(getElementColor(atom.element));
        } else {
          // Find residue
          const resColor = getResidueColor(
            { resSeq: atom.resSeq, resName: atom.resName, chainId: atom.chainId, atoms: [] },
            atom.chainId.charCodeAt(0) % 8
          );
          color.copy(resColor);
        }

        instancedMesh.setColorAt(idx, color);
      });

      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
      group.add(instancedMesh);
    } else if (renderMode === 'ball-and-stick') {
      // Atom spheres and covalent bonds
      const sphereGeo = new THREE.SphereGeometry(0.38, 10, 10);
      const instancedMesh = new THREE.InstancedMesh(
        sphereGeo,
        new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.15 }),
        structure.atoms.length
      );

      const dummy = new THREE.Object3D();
      const color = new THREE.Color();

      structure.atoms.forEach((atom, idx) => {
        dummy.position.set(atom.x - cx, atom.y - cy, atom.z - cz);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(idx, dummy.matrix);

        if (colorMode === 'element') {
          color.copy(getElementColor(atom.element));
        } else {
          const resColor = getResidueColor(
            { resSeq: atom.resSeq, resName: atom.resName, chainId: atom.chainId, atoms: [] },
            atom.chainId.charCodeAt(0) % 8
          );
          color.copy(resColor);
        }
        instancedMesh.setColorAt(idx, color);
      });

      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
      group.add(instancedMesh);

      // Covalent bonds (connect adjacent atoms < 1.85 Angstroms apart within same residue or peptide link)
      const linePositions: number[] = [];
      const atoms = structure.atoms;
      const bondColor = new THREE.Color(0x64748b);

      for (let i = 0; i < atoms.length; i++) {
        const a1 = atoms[i];
        // Check next few atoms to keep performance high
        const maxLookahead = Math.min(i + 15, atoms.length);
        for (let j = i + 1; j < maxLookahead; j++) {
          const a2 = atoms[j];
          if (Math.abs(a1.resSeq - a2.resSeq) > 1) continue;
          const dx = a1.x - a2.x;
          const dy = a1.y - a2.y;
          const dz = a1.z - a2.z;
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq > 0.8 && distSq < 3.8) {
            linePositions.push(a1.x - cx, a1.y - cy, a1.z - cz);
            linePositions.push(a2.x - cx, a2.y - cy, a2.z - cz);
          }
        }
      }

      if (linePositions.length > 0) {
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        const lineMat = new THREE.LineBasicMaterial({
          color: bondColor,
          transparent: true,
          opacity: 0.65,
        });
        const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
        group.add(lineSegments);
      }
    } else if (renderMode === 'surface') {
      // Molecular envelope / pseudo-surface representation
      const caPoints = structure.atoms
        .filter((a) => a.name === 'CA')
        .map((a) => new THREE.Vector3(a.x - cx, a.y - cy, a.z - cz));

      if (caPoints.length > 4) {
        const hullGeo = new THREE.DodecahedronGeometry(radius * 0.95, 2);
        const hullMat = new THREE.MeshPhysicalMaterial({
          color: 0x0284c7,
          transmission: 0.7,
          opacity: 0.85,
          transparent: true,
          roughness: 0.2,
          ior: 1.4,
          wireframe: false,
        });
        const hullMesh = new THREE.Mesh(hullGeo, hullMat);
        group.add(hullMesh);
      }

      // Add backbone inside the transparent surface
      structure.chains.forEach((chain, chainIdx) => {
        const caPts: THREE.Vector3[] = [];
        chain.residues.forEach((r) => {
          if (r.caAtom) {
            caPts.push(new THREE.Vector3(r.caAtom.x - cx, r.caAtom.y - cy, r.caAtom.z - cz));
          }
        });
        if (caPts.length < 2) return;
        const curve = new THREE.CatmullRomCurve3(caPts);
        const tubeGeo = new THREE.TubeGeometry(curve, caPts.length * 4, 0.4, 6, false);
        const tubeMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(CHAIN_COLORS[chainIdx % CHAIN_COLORS.length]),
          roughness: 0.3,
        });
        group.add(new THREE.Mesh(tubeGeo, tubeMat));
      });
    }

    // Add visual marker for highlightResidueNum if selected
    if (highlightResidueNum) {
      const atom = structure.atoms.find(
        (a) => a.resSeq === highlightResidueNum && (a.name === 'CA' || a.name === 'N')
      );
      if (atom) {
        const markerGeo = new THREE.SphereGeometry(1.6, 16, 16);
        const markerMat = new THREE.MeshBasicMaterial({
          color: 0xfacc15,
          wireframe: true,
        });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.position.set(atom.x - cx, atom.y - cy, atom.z - cz);
        group.add(marker);
      }
    }
  }, [
    structure,
    renderMode,
    colorMode,
    highlightResidueNum,
    getElementColor,
    getResidueColor,
  ]);

  // Handle Raycasting & Click / Hover for Residue Inspection
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button === 0) isDraggingRef.current = true;
    if (e.button === 2) isRightDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dx = e.clientX - prevMousePosRef.current.x;
    const dy = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    if (isDraggingRef.current && modelGroupRef.current) {
      modelGroupRef.current.rotation.y += dx * 0.008;
      modelGroupRef.current.rotation.x += dy * 0.008;
    } else if (isRightDraggingRef.current && cameraRef.current) {
      // Pan camera
      cameraRef.current.position.x -= dx * 0.05;
      cameraRef.current.position.y += dy * 0.05;
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    isRightDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    const delta = e.deltaY * 0.05;
    cameraRef.current.position.z = Math.max(10, Math.min(500, cameraRef.current.position.z + delta));
  };

  // Reset Camera View
  const handleResetCamera = () => {
    if (!cameraRef.current || !modelGroupRef.current || !structure) return;
    const radius = structure.bounds.radius || 25;
    const dist = Math.max(radius * 2.4, 40);
    cameraRef.current.position.set(0, 0, dist);
    cameraRef.current.lookAt(0, 0, 0);
    modelGroupRef.current.rotation.set(0, 0, 0);
  };

  // Zoom In / Out controls
  const handleZoom = (factor: number) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(10, Math.min(500, cameraRef.current.position.z * factor));
  };

  // Take High Resolution Snapshot
  const handleTakeSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${structure.metadata.id || 'ProteinX'}_3D_structure.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-950/80 rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl flex flex-col">
      {/* 3D Canvas Viewport */}
      <div
        ref={mountRef}
        className="w-full flex-1 cursor-grab active:cursor-grabbing select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Top Floating Overlay: Protein Quick Info */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none z-10">
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-white tracking-wide">
            {structure.metadata.id || 'Protein'}
          </span>
          <span className="text-[11px] text-slate-400 border-l border-slate-700/80 pl-2">
            {structure.totalResidues} residues
          </span>
          <span className="text-[11px] text-slate-400 border-l border-slate-700/80 pl-2">
            {structure.chains.length} {structure.chains.length === 1 ? 'chain' : 'chains'}
          </span>
          {structure.metadata.resolution && (
            <span className="text-[11px] text-cyan-400 font-mono border-l border-slate-700/80 pl-2">
              {structure.metadata.resolution} Å
            </span>
          )}
        </div>
      </div>

      {/* Top Right Floating Toolbar: Camera, Spin, Snapshot */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
          className={`p-2 rounded-xl backdrop-blur-md border transition-all text-xs flex items-center gap-1 shadow-md ${
            autoRotate
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:text-white'
          }`}
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={handleResetCamera}
          title="Reset Camera Orientation"
          className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500 transition-all shadow-md"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleZoom(0.85)}
          title="Zoom In"
          className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white transition-all shadow-md"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleZoom(1.15)}
          title="Zoom Out"
          className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white transition-all shadow-md"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleTakeSnapshot}
          title="Export High-Res PNG"
          className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/50 transition-all shadow-md"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>

        {/* Theme BG switcher */}
        <div className="flex bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl p-0.5">
          <button
            onClick={() => setThemeBg('slate')}
            title="Slate Dark Background"
            className={`w-5 h-5 rounded-lg text-[10px] font-bold ${
              themeBg === 'slate' ? 'bg-slate-700 text-white' : 'text-slate-500'
            }`}
          >
            S
          </button>
          <button
            onClick={() => setThemeBg('black')}
            title="Pure OLED Black Background"
            className={`w-5 h-5 rounded-lg text-[10px] font-bold ${
              themeBg === 'black' ? 'bg-black text-cyan-400' : 'text-slate-500'
            }`}
          >
            B
          </button>
          <button
            onClick={() => setThemeBg('light')}
            title="Clean Laboratory Light Background"
            className={`w-5 h-5 rounded-lg text-[10px] font-bold ${
              themeBg === 'light' ? 'bg-slate-200 text-slate-900' : 'text-slate-500'
            }`}
          >
            L
          </button>
        </div>
      </div>

      {/* Bottom Floating Stats and Controls Guide */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none text-xs z-10">
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-400 flex items-center gap-3">
          <span>
            <strong className="text-slate-200">Left Click:</strong> Rotate
          </span>
          <span>
            <strong className="text-slate-200">Right Click:</strong> Pan
          </span>
          <span>
            <strong className="text-slate-200">Scroll:</strong> Zoom
          </span>
        </div>

        {highlightResidueNum && (
          <div className="bg-amber-950/90 border border-amber-600/70 text-amber-200 px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Active Residue: #{highlightResidueNum}
          </div>
        )}
      </div>
    </div>
  );
};
