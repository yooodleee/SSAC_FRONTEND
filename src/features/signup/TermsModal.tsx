'use client';

import { useEffect, useRef } from 'react';

// UI-only type: not derived from API contract
type TermsId = 'service' | 'privacy' | 'age' | 'marketing';

const TERMS_CONTENT: Record<TermsId, { title: string; body: string }> = {
  service: {
    title: '서비스 이용약관',
    body: `제1조 (목적)
이 약관은 SSAC(이하 "회사")가 제공하는 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의)
① "서비스"란 회사가 제공하는 학습 콘텐츠, 퀴즈, 뉴스 등의 온라인 서비스를 말합니다.
② "이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
③ "회원"이란 회사와 서비스 이용계약을 체결하고 이용자 아이디(ID)를 부여받은 자를 말합니다.

제3조 (약관의 효력 및 변경)
① 이 약관은 서비스 초기화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.
② 회사는 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.

제4조 (서비스의 제공 및 변경)
회사는 다음과 같은 서비스를 제공합니다.
- 학습 콘텐츠 제공 서비스
- 퀴즈 서비스
- 뉴스 큐레이션 서비스
- 기타 회사가 추가 개발하거나 다른 회사와의 제휴계약 등을 통해 이용자에게 제공하는 일체의 서비스

제5조 (서비스 이용 제한)
회사는 이용자가 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 서비스 이용을 제한할 수 있습니다.`,
  },
  privacy: {
    title: '개인정보 처리방침',
    body: `1. 개인정보의 수집·이용 목적
회사는 다음과 같은 목적으로 개인정보를 수집·이용합니다.
- 회원 가입 및 관리
- 서비스 제공 및 개선
- 고객 상담 및 불만 처리

2. 수집하는 개인정보의 항목
① 필수 항목: 소셜 로그인 계정 정보(이메일, 프로필 이미지), 닉네임
② 선택 항목: 마케팅 수신 동의 여부

3. 개인정보의 보유·이용 기간
① 회원 탈퇴 시까지
② 단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관

4. 개인정보의 제3자 제공
회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 이용자의 동의가 있는 경우 또는 법령의 규정에 의한 경우에는 예외로 합니다.

5. 개인정보 보호책임자
- 이름: 개인정보보호팀
- 이메일: privacy@ssac.example.com`,
  },
  age: {
    title: '만 14세 이상 확인',
    body: `본 서비스는 만 14세 미만의 아동에게는 제공되지 않습니다.

「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 제31조에 따라, 만 14세 미만 아동의 개인정보를 수집·이용하기 위해서는 법정대리인의 동의가 필요합니다.

만 14세 미만인 경우 서비스 이용이 제한될 수 있으며, 만 14세 미만 아동임을 알게 된 경우 수집된 개인정보를 지체 없이 삭제합니다.

본 항목에 동의하심으로써 귀하가 만 14세 이상임을 확인합니다.`,
  },
  marketing: {
    title: '마케팅 정보 수신 동의',
    body: `회사는 이용자의 동의를 받아 아래와 같이 마케팅 정보를 제공합니다.

1. 마케팅 정보 제공 목적
- 신규 서비스 및 기능 안내
- 이벤트 및 프로모션 정보 제공
- 맞춤형 학습 콘텐츠 추천

2. 마케팅 정보 전달 방법
- 이메일, 앱 푸시 알림

3. 마케팅 정보 수신 동의 철회
마케팅 정보 수신 동의는 언제든지 철회할 수 있습니다. 철회를 원하시는 경우 서비스 내 설정에서 변경하실 수 있습니다.

※ 마케팅 정보 수신 동의는 선택사항이며, 동의하지 않아도 서비스 이용에는 제한이 없습니다.`,
  },
};

interface TermsModalProps {
  termsId: TermsId;
  onClose: () => void;
}

export function TermsModal({ termsId, onClose }: TermsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const content = TERMS_CONTENT[termsId];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={handleOverlayClick}
    >
      <div className="flex max-h-[80vh] w-full flex-col rounded-t-2xl bg-white sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 id="terms-modal-title" className="text-base font-semibold text-gray-900">
            {content.title}
          </h2>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700">
            {content.body}
          </pre>
        </div>
        <div className="border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-black text-sm font-medium text-white hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export type { TermsId };
