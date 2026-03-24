'use client';

import { useEffect, useState } from 'react';

const COLORS = ['#2563eb', '#fbbf24', '#22c55e', '#ef4444', '#8b5cf6', '#f97316'];

interface Piece {
  id: number;
  left: string;
  color: string;
  delay: string;
  size: number;
}

export function Confetti() {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    const generated: Piece[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: `${Math.random() * 1.5}s`,
      size: 6 + Math.random() * 6,
    }));
    setPieces(generated);

    const timer = setTimeout(() => setPieces([]), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDelay: p.delay,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  );
}
