import { LevelBadge } from './LevelBadge';

// UI-only type
type Level = 'SEED' | 'SPROUT' | 'TREE';

const SUB_MESSAGES: Record<Level, string> = {
  SEED: '처음이어도 괜찮아요!',
  SPROUT: '조금씩 더 알아가요!',
  TREE: '더 깊이 알아봐요!',
};

interface GreetingSectionProps {
  nickname: string;
  level: Level;
  onLevelBadgeClick: () => void;
}

export function GreetingSection({ nickname, level, onLevelBadgeClick }: GreetingSectionProps) {
  const subMessage = SUB_MESSAGES[level] ?? SUB_MESSAGES.SEED;

  return (
    <section>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
            안녕하세요, {nickname}님! 👋
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{subMessage}</p>
        </div>
        <LevelBadge level={level} onClick={onLevelBadgeClick} />
      </div>
    </section>
  );
}
