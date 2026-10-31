import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/Engine';
import { ELEMENTS } from '../game/constants';
import { ToolType, ElementDefinition } from '../game/types';
import { ZoomIn } from 'lucide-react';
import { soundEngine } from '../game/SoundEngine';

interface Props {
  engine: GameEngine;
  temp: number;
  activeTool: ToolType;
  activeSpawnElementId: string;
  showQuantumField?: boolean;
  showDebugPhysics?: boolean;
  onSpawnElement: (elementId: string, x: number, y: number) => void;
  onInspectElement?: (element: ElementDefinition) => void;
  onUseSpectroscope?: () => void;
}

export default function GameCanvas({
  engine,
  temp,
  activeTool,
  activeSpawnElementId,
  showQuantumField,
  showDebugPhysics,
  onSpawnElement,
  onInspectElement,
  onUseSpectroscope
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDragging = useRef<boolean>(false);
  const isLassoing = useRef<boolean>(false);
  const lastPanPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchDist = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const parent = canvas.parentElement;
    const resizeCanvas = () => {
      if (parent) {
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
      }
    };
    resizeCanvas();

    let resizeObserver: ResizeObserver | null = null;
    if (parent && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
      });
      resizeObserver.observe(parent);
    } else {
      window.addEventListener('resize', resizeCanvas);
    }

    const render = () => {
      engine.update(canvas.width, canvas.height);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep Space Starfield & Cosmic Grid Background
      ctx.fillStyle = '#07090E';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Quantum Vacuum Field (Virtual particle fluctuations)
      if (showQuantumField) {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.03)';
        for (let i = 0; i < 40; i++) {
          const rx = (Math.sin(Date.now() * 0.001 + i) * 0.5 + 0.5) * canvas.width;
          const ry = (Math.cos(Date.now() * 0.0015 + i * 2) * 0.5 + 0.5) * canvas.height;
          ctx.beginPath();
          ctx.arc(rx, ry, Math.sin(Date.now() * 0.005 + i) * 3 + 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Spatial Hash Grid Overlay if Debug Physics is enabled
      if (showDebugPhysics) {
        ctx.strokeStyle = 'rgba(0, 255, 128, 0.15)';
        ctx.lineWidth = 1;
        const cellSize = engine.spatialGrid.cellSize;
        for (let x = 0; x < canvas.width; x += cellSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += cellSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      // Gravitational Warped Coordinate Grid
      const gridSize = 80;
      const offsetX = (pan.x % gridSize);
      const offsetY = (pan.y % gridSize);

      const getWarpedPoint = (gx: number, gy: number) => {
        let wx = gx;
        let wy = gy;
        engine.particles.forEach(p => {
          const dx = gx - p.x;
          const dy = gy - p.y;
          const distSq = dx * dx + dy * dy + 400;
          const pull = (p.mass * 12) / distSq;
          wx -= (dx / Math.sqrt(distSq)) * pull;
          wy -= (dy / Math.sqrt(distSq)) * pull;
        });
        return { x: wx, y: wy };
      };

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      for (let x = offsetX; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        for (let y = 0; y <= canvas.height; y += 20) {
          const pt = getWarpedPoint(x, y);
          if (y === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      for (let y = offsetY; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 20) {
          const pt = getWarpedPoint(x, y);
          if (x === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      // Keplerian Orbital Trajectory Predictor
      if (zoom < 0.7 || engine.particles.some(p => ELEMENTS[p.elementId]?.category === 'astrophysics')) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);

        engine.particles.forEach(p => {
          const def = ELEMENTS[p.elementId];
          if (def?.category === 'astrophysics' || p.mass > 50) {
            ctx.beginPath();
            let curX = p.x;
            let curY = p.y;
            let curVx = p.vx;
            let curVy = p.vy;

            ctx.moveTo(curX, curY);
            for (let step = 0; step < 25; step++) {
              curX += curVx * 2;
              curY += curVy * 2;
              ctx.lineTo(curX, curY);
            }
            ctx.stroke();
          }
        });
        ctx.setLineDash([]);
      }

      // Reaction Zone Center Reticle
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Expanding & Fading Collision Rings / Shockwaves
      engine.shockwaves.forEach(sw => {
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.opacity;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Expanding inner secondary feedback ring for high-velocity collision visual impact
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, Math.max(0, sw.radius * 0.65), 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 1.0;
      });

      // Draw particle trails
      engine.particles.forEach(p => {
        if (p.trail && p.trail.length > 1) {
          const def = ELEMENTS[p.elementId];
          const color = def?.color || '#ffffff';
          ctx.strokeStyle = color;
          ctx.lineWidth = Math.max(1, p.radius * 0.25);
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let k = 1; k < p.trail.length; k++) {
            ctx.globalAlpha = (1 - k / p.trail.length) * 0.35;
            ctx.lineTo(p.trail[k].x, p.trail[k].y);
          }
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      });

      // Draw Particles with Bloom, Core, Symbol, and Phase Cues
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      engine.particles.forEach(p => {
        const def = ELEMENTS[p.elementId];
        const color = def?.color || '#ffffff';

        // Outer glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Solid core
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Phase Cues
        if (p.state === 'solid') {
          // Hexagonal crystalline outline
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const hx = p.x + Math.cos(angle) * (p.radius + 3);
            const hy = p.y + Math.sin(angle) * (p.radius + 3);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
        } else if (p.state === 'liquid') {
          // Cohesive surface tether ring
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius + 2, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.state === 'plasma') {
          // Pulsing electric arcs
          ctx.strokeStyle = '#FACC15';
          ctx.lineWidth = 1.5;
          for (let a = 0; a < 3; a++) {
            const angle = Date.now() * 0.01 + a * 2.1;
            const ax = p.x + Math.cos(angle) * (p.radius + 6);
            const ay = p.y + Math.sin(angle) * (p.radius + 6);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(ax, ay);
            ctx.stroke();
          }
        }

        // Crisp Symbol centered inside
        if (def) {
          ctx.fillStyle = '#07090E';
          ctx.font = `bold ${Math.max(9, Math.min(14, p.radius * 0.9))}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(def.symbol, p.x, p.y);
        }

        // Debug Hitbox
        if (showDebugPhysics) {
          ctx.strokeStyle = '#34D399';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      ctx.restore();

      // Lasso Stamp Selection Box
      if (engine.lassoStart && engine.lassoEnd) {
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        const x1 = Math.min(engine.lassoStart.x, engine.lassoEnd.x);
        const y1 = Math.min(engine.lassoStart.y, engine.lassoEnd.y);
        const w = Math.abs(engine.lassoEnd.x - engine.lassoStart.x);
        const h = Math.abs(engine.lassoEnd.y - engine.lassoStart.y);
        ctx.strokeRect(x1, y1, w, h);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.fillRect(x1, y1, w, h);
        ctx.setLineDash([]);
      }

      // Floating Texts
      engine.floatingTexts.forEach(ft => {
        const alpha = 1 - ft.life / ft.maxLife;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1.0;
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', resizeCanvas);
      }
    };
  }, [engine, temp, zoom, pan, showQuantumField, showDebugPhysics]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.2, Math.min(5.0, z * delta)));
  };

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;

    const x = (rawX - canvas.width / 2 - pan.x) / zoom + canvas.width / 2;
    const y = (rawY - canvas.height / 2 - pan.y) / zoom + canvas.height / 2;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.shiftKey) {
      isDragging.current = true;
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const { x, y } = getCanvasCoords(e.clientX, e.clientY);

    if (activeTool === 'spawn') {
      onSpawnElement(activeSpawnElementId, x, y);
    } else if (activeTool === 'attractor') {
      engine.isAttracting = true;
      engine.attractX = x;
      engine.attractY = y;
    } else if (activeTool === 'grab') {
      const found = engine.particles.find(p => {
        const dx = p.x - x;
        const dy = p.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= p.radius + 8;
      });
      if (found) {
        engine.draggedParticleId = found.id;
      }
    } else if (activeTool === 'inspector') {
      const found = engine.particles.find(p => {
        const dx = p.x - x;
        const dy = p.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= p.radius + 8;
      });
      if (found) {
        const def = ELEMENTS[found.elementId];
        if (def && onInspectElement) {
          onInspectElement(def);
        }
      }
    } else if (activeTool === 'eraser') {
      const found = engine.particles.find(p => {
        const dx = p.x - x;
        const dy = p.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= p.radius + 8;
      });
      if (found) {
        engine.particles = engine.particles.filter(p => p.id !== found.id);
        engine.addShockwave(found.x, found.y, '#EF4444', 120);
        soundEngine.playClick();
      }
    } else if (activeTool === 'laser') {
      engine.particles.forEach(p => {
        const dx = p.x - x;
        const dy = p.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < 80) {
          p.vx += (Math.random() - 0.5) * 12;
          p.vy += (Math.random() - 0.5) * 12;
        }
      });
      engine.temp += 500;
      engine.addShockwave(x, y, '#F59E0B', 100);
    } else if (activeTool === 'cryo') {
      engine.particles.forEach(p => {
        const dx = p.x - x;
        const dy = p.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < 80) {
          p.vx *= 0.4;
          p.vy *= 0.4;
        }
      });
      engine.temp = Math.max(0, engine.temp - 500);
      engine.addShockwave(x, y, '#38BDF8', 100);
    } else if (activeTool === 'spectroscope') {
      if (onUseSpectroscope) onUseSpectroscope();
    } else if (activeTool === 'lasso') {
      isLassoing.current = true;
      engine.lassoStart = { x, y };
      engine.lassoEnd = { x, y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging.current) {
      const dx = e.clientX - lastPanPos.current.x;
      const dy = e.clientY - lastPanPos.current.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const { x, y } = getCanvasCoords(e.clientX, e.clientY);

    if (isLassoing.current) {
      engine.lassoEnd = { x, y };
    }

    if (engine.isAttracting) {
      engine.attractX = x;
      engine.attractY = y;
    }

    if (engine.draggedParticleId) {
      const p = engine.particles.find(item => item.id === engine.draggedParticleId);
      if (p) {
        p.vx = (x - p.x) * 0.2;
        p.vy = (y - p.y) * 0.2;
        p.x = x;
        p.y = y;
      }
    }
  };

  const handleMouseUp = () => {
    if (isLassoing.current && engine.lassoStart && engine.lassoEnd) {
      engine.saveCustomStamp('Custom Stamp', {
        x1: engine.lassoStart.x,
        y1: engine.lassoStart.y,
        x2: engine.lassoEnd.x,
        y2: engine.lassoEnd.y
      });
      engine.lassoStart = null;
      engine.lassoEnd = null;
    }
    isLassoing.current = false;
    isDragging.current = false;
    engine.isAttracting = false;
    engine.draggedParticleId = null;
  };

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={(e) => {
          if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
          } else {
            const touch = e.touches[0];
            const mouseEvt = {
              clientX: touch.clientX,
              clientY: touch.clientY,
              button: 0,
              shiftKey: false,
              currentTarget: e.currentTarget
            } as unknown as React.MouseEvent<HTMLCanvasElement>;
            handleMouseDown(mouseEvt);
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 2 && lastTouchDist.current !== null) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const factor = dist / lastTouchDist.current;
            setZoom(z => Math.max(0.2, Math.min(5.0, z * factor)));
            lastTouchDist.current = dist;
          } else if (e.touches.length === 1) {
            const touch = e.touches[0];
            const mouseEvt = {
              clientX: touch.clientX,
              clientY: touch.clientY,
              currentTarget: e.currentTarget
            } as unknown as React.MouseEvent<HTMLCanvasElement>;
            handleMouseMove(mouseEvt);
          }
        }}
        onTouchEnd={() => {
          lastTouchDist.current = null;
          handleMouseUp();
        }}
        className="w-full h-full block cursor-crosshair"
      />

      {/* Camera Zoom Reset Overlay */}
      {(zoom !== 1.0 || pan.x !== 0 || pan.y !== 0) && (
        <button
          onClick={() => {
            soundEngine.playClick();
            setZoom(1.0);
            setPan({ x: 0, y: 0 });
          }}
          className="absolute bottom-24 right-4 z-20 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center gap-1.5 shadow-xl hover:bg-black/80 transition-all pointer-events-auto"
        >
          <ZoomIn size={14} />
          <span>Reset Camera ({zoom.toFixed(1)}x)</span>
        </button>
      )}
    </div>
  );
}
