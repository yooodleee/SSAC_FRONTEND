'use client';

import { useState, useEffect, useRef } from 'react';

const ADMIN_LOGIN_ERRORS: Record<string, string> = {
  'ADMIN-001': '관리자 코드가 올바르지 않습니다.',
  SERVER_ERROR: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

interface AdminCodeModalProps {
  onClose: () => void;
}

export function AdminCodeModal({ onClose }: AdminCodeModalProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  async function handleSubmit() {
    if (!code.trim() || isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCode: code.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { errorCode?: string };
        const code_ = data.errorCode ?? 'SERVER_ERROR';
        setError(ADMIN_LOGIN_ERRORS[code_] ?? '로그인 중 오류가 발생했습니다.');
        return;
      }
      window.location.replace('/admin');
    } catch {
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    /* 백드롭 */
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* 모달 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="관리자 로그인"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">관리자 로그인</h2>
          <button
            type="button"
            aria-label="모달 닫기"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-500">관리자 코드를 입력하세요.</p>

        <input
          ref={inputRef}
          type="password"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleSubmit();
          }}
          placeholder="관리자 코드"
          autoComplete="off"
          disabled={isLoading}
          className="mb-3 h-[48px] w-full rounded-xl border border-[#E8E8E8] px-4 text-sm text-[#1A1A1A] outline-none transition-colors placeholder:text-[#BBBBBB] focus:border-[#1B4332] disabled:opacity-60"
        />

        {error && (
          <p role="alert" className="mb-3 text-center text-xs text-red-500">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!code.trim() || isLoading}
          className="flex h-[48px] w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: '#1B4332' }}
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            '로그인'
          )}
        </button>
      </div>
    </div>
  );
}
