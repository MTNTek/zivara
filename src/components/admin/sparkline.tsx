'use client';

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({ data, color = '#2563eb', width = 80, height = 30 }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  // Fill area under the line
  const fillPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="inline-block" aria-hidden="true">
      <polyline
        points={fillPoints}
        fill={color}
        fillOpacity={0.1}
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
