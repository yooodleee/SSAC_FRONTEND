'use client';

interface NewsPanelProps {
  onClose: () => void;
}

export function NewsPanel({ onClose: _onClose }: NewsPanelProps) {
  return (
    <div className="px-8 py-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">새로운 소식</h2>
      <div>
        <p className="text-sm text-gray-400">
          이 영역은 추후 스프린트에서 콘텐츠가 추가될 예정입니다.
        </p>
      </div>
    </div>
  );
}
