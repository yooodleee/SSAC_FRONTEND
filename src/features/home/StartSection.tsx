'use client';

/**
 * StartSection — 시작 섹션 (카드 3개)
 *
 * 현재는 빈 카드 구조만 구현. HomeCard 인터페이스로 확장 가능.
 */

// UI-only type: not derived from API contract
interface HomeCard {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
}

// 현재는 빈 카드 — 추후 데이터 연동 예정
const PLACEHOLDER_CARDS: HomeCard[] = [{ id: 'card-1' }, { id: 'card-2' }, { id: 'card-3' }];

interface HomeCardItemProps {
  card: HomeCard;
}

function HomeCardItem({ card }: HomeCardItemProps) {
  return (
    <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-[#E8E8E8] bg-[#F5F5F5] p-5 text-center dark:border-slate-700 dark:bg-slate-800">
      {card.title ? (
        <>
          <p className="text-[16px] font-medium text-[#1A1A1A] dark:text-slate-100">{card.title}</p>
          {card.description && (
            <p className="mt-2 text-[13px] text-[#6B6B6B] dark:text-slate-400">
              {card.description}
            </p>
          )}
        </>
      ) : (
        <p className="text-[13px] text-[#BBBBBB] dark:text-slate-500">추후 추가 예정</p>
      )}
    </div>
  );
}

export function StartSection() {
  return (
    <section aria-labelledby="start-section-title">
      <h2
        id="start-section-title"
        className="mb-4 font-bold text-[#1A1A1A]"
        style={{ fontSize: '28px', lineHeight: 1.3 }}
      >
        시작
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PLACEHOLDER_CARDS.map((card) => (
          <HomeCardItem key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
