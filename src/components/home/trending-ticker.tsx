'use client';

const items = [
  { emoji: '🔥', text: 'iPhone 15 Pro' },
  { emoji: '⚡', text: 'PlayStation 5' },
  { emoji: '🎧', text: 'AirPods Pro' },
  { emoji: '💻', text: 'MacBook Air M3' },
  { emoji: '👟', text: 'Nike Air Max' },
  { emoji: '📺', text: 'Samsung OLED TV' },
  { emoji: '⌚', text: 'Apple Watch Ultra' },
  { emoji: '🎮', text: 'Nintendo Switch' },
  { emoji: '📷', text: 'Sony A7 IV' },
  { emoji: '🧴', text: 'Dyson Airwrap' },
];

export function TrendingTicker() {
  // Double the items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="bg-blue-800 overflow-hidden py-2">
      <div className="flex items-center gap-8 animate-[ticker_30s_linear_infinite] whitespace-nowrap">
        <span className="text-[#fbbf24] text-xs font-bold flex-shrink-0 pl-4">🔥 TRENDING NOW</span>
        {doubled.map((item, i) => (
          <span key={i} className="text-white/80 text-xs flex-shrink-0">
            {item.emoji} {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
