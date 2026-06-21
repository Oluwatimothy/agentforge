"use client";

import { useEffect, useRef } from "react";

export function NetworkVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // TypeScript null-safe reference
    const c = ctx;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width;
    const H = canvas.height;

    const nodes = [
      { x: W * 0.2, y: H * 0.5, label: "Agent A", color: "#7c97f8", r: 8 },
      { x: W * 0.5, y: H * 0.25, label: "0G Storage", color: "#22d3ee", r: 12 },
      { x: W * 0.5, y: H * 0.75, label: "0G Chain", color: "#34d399", r: 12 },
      { x: W * 0.8, y: H * 0.5, label: "Agent B", color: "#a78bfa", r: 8 },
    ];

    const particles: Array<{
      x: number; y: number; t: number;
      from: number; to: number; color: string;
    }> = [];

    const edges = [
      { from: 0, to: 1, color: "#22d3ee" },
      { from: 0, to: 2, color: "#34d399" },
      { from: 1, to: 3, color: "#7c97f8" },
      { from: 2, to: 3, color: "#a78bfa" },
    ];

    let frame = 0;
    let animId: number;

    function spawnParticle() {
      const edge = edges[Math.floor(Math.random() * edges.length)];
      particles.push({ x: 0, y: 0, t: 0, from: edge.from, to: edge.to, color: edge.color });
    }

    function draw() {
      c.clearRect(0, 0, W, H);

      // Draw edges
      edges.forEach(edge => {
        const from = nodes[edge.from];
        const to = nodes[edge.to];
        c.beginPath();
        c.moveTo(from.x, from.y);
        c.lineTo(to.x, to.y);
        c.strokeStyle = edge.color + "20";
        c.lineWidth = 1.5;
        c.stroke();
      });

      // Draw and update particles
      particles.forEach(p => {
        const from = nodes[p.from];
        const to = nodes[p.to];
        p.t += 0.015;
        p.x = from.x + (to.x - from.x) * p.t;
        p.y = from.y + (to.y - from.y) * p.t;

        c.beginPath();
        c.arc(p.x, p.y, 3, 0, Math.PI * 2);
        c.fillStyle = p.color;
        c.shadowColor = p.color;
        c.shadowBlur = 8;
        c.fill();
        c.shadowBlur = 0;
      });

      // Remove finished particles
      for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].t >= 1) particles.splice(i, 1);
      }

      // Draw nodes
      nodes.forEach(node => {
        const grad = c.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 3);
        grad.addColorStop(0, node.color + "40");
        grad.addColorStop(1, "transparent");
        c.beginPath();
        c.arc(node.x, node.y, node.r * 3, 0, Math.PI * 2);
        c.fillStyle = grad;
        c.fill();

        c.beginPath();
        c.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        c.fillStyle = node.color + "30";
        c.strokeStyle = node.color;
        c.lineWidth = 2;
        c.fill();
        c.stroke();

        c.fillStyle = node.color;
        c.font = "11px Inter, sans-serif";
        c.textAlign = "center";
        c.fillText(node.label, node.x, node.y + node.r + 16);
      });

      if (frame % 30 === 0) spawnParticle();
      frame++;
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}
