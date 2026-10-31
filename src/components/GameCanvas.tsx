import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/Engine';
import { ELEMENTS, REACTION_RULES } from '../game/constants';
import { ToolType } from '../game/types';
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
  onInspectParticle?: (particleId: string) => void;
}

export default function GameCanvas({
  engine,
  temp,
  activeTool,
  activeSpawnElementId,
  showQuantumField,
  showDebugPhysics,
  onSpawnElement
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastTouchDist = useRef<number | null>(null);
  const lastPanPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      engine.update(canvas.width, canvas.height);

      ctx.save();
      // Background obsidian
      ctx.fillStyle = '#07090E';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Camera transform (zoom & pan)
      ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Dynamic background heat haze tint based on temp
      if (temp > 10000) {
        const alpha = Math.min(0.2, (temp - 10000) / 500000);
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (temp < 200) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Quantum Field Probability Grid Layer
      if (showQuantumField) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
        ctx.lineWidth = 0.75;
        const qSize = 40;
        const phase = engine.universeAge * 0.003;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += qSize) {
          for (let y = 0; y < canvas.height; y += qSize) {
            const wave = Math.sin(x * 0.04 + phase) * Math.cos(y * 0.04 + phase) * 8;
            ctx.strokeRect(x + wave, y + wave, qSize * 0.6, qSize * 0.6);
          }
        }
        ctx.stroke();
      }

      // Debug Physics Layer (Spatial Hash Grid cells & Particle Hitboxes)
      if (showDebugPhysics) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        const cellSize = 65;
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

        engine.particles.forEach(p => {
          ctx.strokeStyle = '#00F0FF';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = '#FACC15';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 4, p.y + p.vy * 4);
          ctx.stroke();
        });
      }

      // Warping Coordinate Grid based on particle mass proximity (spacetime curvature)
      ctx.strokeStyle = '#162032';
      ctx.lineWidth = 1;
      const gridSize = 60;
      const offsetX = (engine.universeAge * 0.04) % gridSize;
      const offsetY = (engine.universeAge * 0.02) % gridSize;

      const getWarpedPoint = (gx: number, gy: number) => {
        let dxSum = 0;
        let dySum = 0;
        for (const p of engine.particles) {
          if (p.mass && p.mass > 15) {
            const pdx = p.x - gx;
            const pdy = p.y - gy;
            const distSq = pdx * pdx + pdy * pdy + 2000;
            const force = (p.mass * 300) / distSq;
            dxSum += (pdx / Math.sqrt(distSq)) * force;
            dySum += (pdy / Math.sqrt(distSq)) * force;
          }
        }
        return { x: gx + dxSum, y: gy + dySum };
      };

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

      // Draw Shockwaves
      engine.shockwaves.forEach(sw => {
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.opacity;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
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

      // Draw Particles with Bloom, Core, Symbol, and Diagnostic Micro-labels
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

        // Crisp Symbol centered inside
        if (def) {
          ctx.fillStyle = '#07090E';
          ctx.font = `bold ${Math.max(9, Math.min(14, p.radius * 0.9))}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(def.symbol, p.x, p.y);
        }

        // Diagnostic Failure Micro-label
        if (p.failedReason) {
          ctx.fillStyle = '#EF4444';
          ctx.font = '9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(p.failedReason, p.x, p.y - p.radius - 8);
          p.failedReason = undefined; // clear after rendering
        }
      });
      ctx.restore();

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
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [engine, temp, zoom, pan, showQuantumField]);

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
        engine.particles = engine.particles.filter(p => p.id !== found.id);
        engine.addShockwave(found.x, found.y, '#EF4444');
      }
    } else if (activeTool === 'laser') {
      engine.particles.forEach(p => {
        const dx = p.x - x;
        const dy = p.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < 70) {
          p.vx += (Math.random() - 0.5) * 10;
          p.vy += (Math.random() - 0.5) * 10;
        }
      });
      engine.addShockwave(x, y, '#F59E0B');
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
