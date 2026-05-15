type Level = 'SEED' | 'SPROUT' | 'TREE';

const MASCOT_CONFIG: Record<Level, { emoji: string; animClass: string; ariaLabel: string }> = {
  SEED: { emoji: '🌱', animClass: 'animate-ssac-grow', ariaLabel: '씨앗 마스코트' },
  SPROUT: { emoji: '🌿', animClass: 'animate-ssac-sway', ariaLabel: '새싹 마스코트' },
  TREE: { emoji: '🌳', animClass: 'animate-ssac-dance', ariaLabel: '나무 마스코트' },
};

export function LevelMascot({ level }: { level: Level }) {
  const config = MASCOT_CONFIG[level];
  return (
    <div
      className={`inline-block select-none text-7xl ${config.animClass}`}
      role="img"
      aria-label={config.ariaLabel}
    >
      {config.emoji}
    </div>
  );
}
