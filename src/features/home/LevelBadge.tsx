// UI-only type
type Level = 'SEED' | 'SPROUT' | 'TREE';

const BADGE_CONFIG: Record<Level, { emoji: string; label: string; bg: string; color: string }> = {
  SEED: { emoji: '🌱', label: '씨앗', bg: '#E8F5EE', color: '#4CAF82' },
  SPROUT: { emoji: '🌿', label: '새싹', bg: '#FFF8E1', color: '#F9A825' },
  TREE: { emoji: '🌳', label: '나무', bg: '#E3F2FD', color: '#1976D2' },
};

interface LevelBadgeProps {
  level: Level;
  onClick?: () => void;
}

export function LevelBadge({ level, onClick }: LevelBadgeProps) {
  const cfg = BADGE_CONFIG[level] ?? BADGE_CONFIG.SEED;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
      aria-label={`레벨: ${cfg.label}, 마이페이지로 이동`}
    >
      <span aria-hidden="true">{cfg.emoji}</span>
      {cfg.label}
    </button>
  );
}
