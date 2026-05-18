'use client';

/**
 * SignupPageClient — 회원가입 페이지
 *
 * 레이아웃:
 *   - 최상단 좌측: 뒤로가기 화살표 (→ /)
 *   - 로고 + 제목 + 로그인 안내 링크
 *   - 소셜 가입 섹션 (Kakao / Naver)
 *   - 구분선
 *   - 폼 (이름 / 생일 / 휴대폰 / 성별 / 이메일)
 *   - 약관 동의
 *   - 가입 완료하기 버튼
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { TermsModal } from '@/features/signup/TermsModal';
import type { TermsId } from '@/features/signup/TermsModal';
import { env } from '@/lib/env';
import { cn } from '@/lib/utils';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatBirthDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function isAgeAtLeast14(dateStr: string): boolean {
  const birth = new Date(dateStr);
  if (isNaN(birth.getTime())) return false;
  const today = new Date();
  const threshold = new Date(birth.getFullYear() + 14, birth.getMonth(), birth.getDate());
  return threshold <= today;
}

function validateField(
  field: 'name' | 'birthDate' | 'phone' | 'email' | 'password',
  value: string,
): string {
  switch (field) {
    case 'name':
      return value.trim() ? '' : '이름을 입력해주세요.';
    case 'birthDate':
      if (!value) return '생년월일을 입력해주세요.';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '생년월일을 YYYY-MM-DD 형식으로 입력해주세요.';
      if (!isAgeAtLeast14(value)) return '만 14세 이상만 가입할 수 있습니다.';
      return '';
    case 'phone':
      if (!value) return '휴대폰 번호를 입력해주세요.';
      if (!/^010-\d{4}-\d{4}$/.test(value))
        return '휴대폰 번호를 010-1234-5678 형식으로 입력해주세요.';
      return '';
    case 'email':
      if (!value) return '이메일을 입력해주세요.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '올바른 이메일 형식으로 입력해주세요.';
      return '';
    case 'password':
      if (!value) return '비밀번호를 입력해주세요.';
      if (value.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
      if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value))
        return '비밀번호는 영문과 숫자를 포함해야 합니다.';
      return '';
  }
}

function inputCls(error?: string) {
  return cn(
    'w-full rounded-lg px-3 py-2.5 text-sm text-[#1A1A1A] outline-none transition-colors',
    'border',
    error ? 'border-[#FF6B6B] focus:border-[#FF6B6B]' : 'border-[#E8E8E8] focus:border-[#4CAF82]',
  );
}

const GENDER_OPTIONS = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
  { value: 'PREFER_NOT_TO_SAY', label: '응답 거부' },
] as const;

const TERMS_ITEMS = [
  { id: 'service' as TermsId, label: '서비스 이용 약관', required: true },
  { id: 'privacy' as TermsId, label: '개인 정보 처리방침', required: true },
  { id: 'age' as TermsId, label: '만 14세 이상 확인', required: true },
  { id: 'marketing' as TermsId, label: '마케팅 정보 수신 동의', required: false },
];

export function SignupPageClient() {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // 소셜(OAuth) 경로 여부 — lazy initializer로 mount 시 1회 결정 (effect 없이 SSR-safe)
  const [isSocialFlow] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!sessionStorage.getItem('signupTempToken');
  });

  const [errors, setErrors] = useState<
    Partial<
      Record<'name' | 'birthDate' | 'phone' | 'email' | 'password' | 'passwordConfirm', string>
    >
  >({});
  const [touched, setTouched] = useState<
    Partial<
      Record<'name' | 'birthDate' | 'phone' | 'email' | 'password' | 'passwordConfirm', boolean>
    >
  >({});

  const [terms, setTerms] = useState({
    service: false,
    privacy: false,
    age: false,
    marketing: false,
  });
  const [termsError, setTermsError] = useState('');

  const [genderOpen, setGenderOpen] = useState(false);
  const [termsModal, setTermsModal] = useState<TermsId | null>(null);
  const [birthTooltip, setBirthTooltip] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [isNaverLoading, setIsNaverLoading] = useState(false);
  const isLoading = isKakaoLoading || isNaverLoading;

  useSearchParams();

  function handleBlur(field: 'name' | 'birthDate' | 'phone' | 'email' | 'password', value: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  }

  const requiredTermsChecked = terms.service && terms.privacy && terms.age;
  const passwordValid = isSocialFlow || validateField('password', password) === '';
  const passwordConfirmValid = isSocialFlow || password === passwordConfirm;
  const isFormValid =
    name.trim().length > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(birthDate) &&
    isAgeAtLeast14(birthDate) &&
    /^010-\d{4}-\d{4}$/.test(phone) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    passwordValid &&
    passwordConfirmValid &&
    requiredTermsChecked;

  const allTermsChecked = Object.values(terms).every(Boolean);

  function toggleAllTerms() {
    const next = !allTermsChecked;
    setTerms({ service: next, privacy: next, age: next, marketing: next });
  }

  function toggleTerm(id: TermsId) {
    setTerms((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const handleKakaoLogin = () => {
    if (isLoading) return;
    setIsKakaoLoading(true);
    sessionStorage.setItem('kakaoRedirectTo', '/home');
    const kakaoUrl = new URL('/oauth2/authorization/kakao', env.backendUrl);
    kakaoUrl.searchParams.set('redirectTo', '/');
    window.location.href = kakaoUrl.toString();
  };

  const handleNaverLogin = () => {
    if (isLoading) return;
    setIsNaverLoading(true);
    sessionStorage.setItem('naverRedirectTo', '/home');
    window.location.href = `${env.backendUrl}/api/v1/auth/naver/login`;
  };

  async function handleSubmit() {
    if (isSubmitting || !isFormValid) return;

    const allFields = ['name', 'birthDate', 'phone', 'email'] as const;
    const newErrors = Object.fromEntries(
      allFields.map((f) => [
        f,
        validateField(
          f,
          f === 'name' ? name : f === 'birthDate' ? birthDate : f === 'phone' ? phone : email,
        ),
      ]),
    ) as Record<'name' | 'birthDate' | 'phone' | 'email', string>;

    const passwordError = isSocialFlow ? '' : validateField('password', password);
    const passwordConfirmError = isSocialFlow
      ? ''
      : password !== passwordConfirm
        ? '비밀번호가 일치하지 않습니다.'
        : '';
    const fullErrors = {
      ...newErrors,
      ...(isSocialFlow ? {} : { password: passwordError, passwordConfirm: passwordConfirmError }),
    };
    setErrors(fullErrors);
    setTouched({
      name: true,
      birthDate: true,
      phone: true,
      email: true,
      ...(!isSocialFlow ? { password: true, passwordConfirm: true } : {}),
    });

    if (!requiredTermsChecked) {
      setTermsError('필수 약관에 동의해주세요.');
      return;
    }
    setTermsError('');

    if (Object.values(fullErrors).some(Boolean)) return;

    setIsSubmitting(true);
    setSubmitError('');

    const agreements = {
      serviceTerm: terms.service,
      privacyTerm: terms.privacy,
      ageVerification: terms.age,
      marketingTerm: terms.marketing,
    };

    try {
      let res: Response;

      if (isSocialFlow) {
        const tempToken = sessionStorage.getItem('signupTempToken') ?? '';
        res = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tempToken,
            name: name.trim(),
            birthDate,
            phone,
            ...(gender ? { gender } : {}),
            email,
            agreements,
          }),
        });
      } else {
        res = await fetch('/api/v1/auth/register/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            birthDate,
            phone,
            ...(gender ? { gender } : {}),
            email,
            password,
            agreements,
          }),
        });
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { errorCode?: string };
        const code = data.errorCode ?? '';
        const errorMap: Record<string, () => void> = {
          'EMAIL-002': () => setErrors((p) => ({ ...p, email: '이미 사용 중인 이메일입니다.' })),
          'EMAIL-001': () =>
            setErrors((p) => ({ ...p, email: '올바른 이메일 형식으로 입력해주세요.' })),
          'BIRTH-001': () =>
            setErrors((p) => ({ ...p, birthDate: '생년월일을 YYYY-MM-DD 형식으로 입력해주세요.' })),
          'BIRTH-002': () =>
            setErrors((p) => ({ ...p, birthDate: '만 14세 이상만 가입할 수 있습니다.' })),
          'PHONE-001': () =>
            setErrors((p) => ({
              ...p,
              phone: '휴대폰 번호를 010-1234-5678 형식으로 입력해주세요.',
            })),
          'NAME-001': () => setErrors((p) => ({ ...p, name: '이름을 입력해주세요.' })),
          'TERMS-001': () => setTermsError('필수 약관에 동의해주세요.'),
          'PASSWORD-001': () =>
            setErrors((p) => ({ ...p, password: '비밀번호 형식이 올바르지 않습니다.' })),
        };
        (
          errorMap[code] ??
          (() => setSubmitError('가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'))
        )();
        return;
      }

      sessionStorage.removeItem('signupTempToken');
      sessionStorage.removeItem('signupProvider');
      window.location.replace('/home');
    } catch {
      setSubmitError('가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-5">
        <Link
          href="/"
          aria-label="홈으로 돌아가기"
          className="inline-flex items-center text-gray-500 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF82] rounded"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
        </Link>
      </div>

      <div className="mx-auto max-w-md px-6 pb-16 pt-6">
        <Link
          href="/"
          aria-label="SSAC 홈으로 이동"
          className="inline-flex items-center gap-2 mb-5"
        >
          <Image
            src="/gress.png"
            alt="SSAC 마스코트"
            width={28}
            height={28}
            className="object-contain"
          />
          <span className="font-bold text-[#1A1A1A]" style={{ fontSize: '16px' }}>
            SSAC
          </span>
        </Link>

        <h1 className="font-bold text-[#1A1A1A] mb-2" style={{ fontSize: '22px', lineHeight: 1.3 }}>
          SSAC 멤버 가입
        </h1>

        <p className="text-[#1A1A1A] mb-8" style={{ fontSize: '13px' }}>
          이미 가입하셨나요?{' '}
          <Link href="/login" className="underline cursor-pointer hover:text-gray-600">
            로그인하기
          </Link>
        </p>

        <div className="mb-6">
          <p className="font-semibold text-[#1A1A1A] mb-1" style={{ fontSize: '15px' }}>
            카카오 또는 네이버로 빠르게 가입하세요!
          </p>
          <p className="text-[#6B6B6B] mb-4" style={{ fontSize: '13px' }}>
            SSAC.io 계정을 카카오 계정 또는 네이버 계정과 연동해 보세요.
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleKakaoLogin}
              disabled={isLoading}
              aria-label="카카오로 시작하기"
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: '#000000' }}
            >
              {isKakaoLoading ? <Spinner /> : <KakaoIcon />}
              {isKakaoLoading ? '처리 중...' : '카카오로 시작하기'}
            </button>

            <button
              type="button"
              onClick={handleNaverLogin}
              disabled={isLoading}
              aria-label="네이버로 시작하기"
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: '#000000' }}
            >
              {isNaverLoading ? <Spinner /> : <NaverIcon />}
              {isNaverLoading ? '처리 중...' : '네이버로 시작하기'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-[#E8E8E8]" />
          <span className="text-xs text-[#6B6B6B]">또는 직접 입력</span>
          <div className="h-px flex-1 bg-[#E8E8E8]" />
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <label
              htmlFor="signup-name"
              className="block text-sm font-medium text-[#1A1A1A] mb-1.5"
            >
              이름
            </label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur('name', name)}
              className={inputCls(touched.name ? errors.name : '')}
              placeholder="홍길동"
              autoComplete="name"
            />
            {touched.name && errors.name && (
              <p className="mt-1 text-xs text-[#FF6B6B]">{errors.name}</p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label htmlFor="signup-birth" className="text-sm font-medium text-[#1A1A1A]">
                생일
              </label>
              <div className="relative">
                <button
                  type="button"
                  aria-label="생일 안내"
                  onClick={() => setBirthTooltip((v) => !v)}
                  onMouseEnter={() => setBirthTooltip(true)}
                  onMouseLeave={() => setBirthTooltip(false)}
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600 hover:bg-gray-300"
                >
                  ?
                </button>
                {birthTooltip && (
                  <div className="absolute left-6 top-0 z-10 w-max rounded-md bg-gray-800 px-3 py-1.5 text-xs text-white shadow-lg">
                    만 14세 이상만 가입할 수 있습니다.
                  </div>
                )}
              </div>
            </div>
            <input
              id="signup-birth"
              type="text"
              value={birthDate}
              onChange={(e) => {
                const formatted = formatBirthDate(e.target.value);
                setBirthDate(formatted);
                if (touched.birthDate)
                  setErrors((prev) => ({
                    ...prev,
                    birthDate: validateField('birthDate', formatted),
                  }));
              }}
              onBlur={() => handleBlur('birthDate', birthDate)}
              className={inputCls(touched.birthDate ? errors.birthDate : '')}
              placeholder="YYYY-MM-DD"
              maxLength={10}
              autoComplete="bday"
              inputMode="numeric"
            />
            <p className="mt-1 text-xs text-[#6B6B6B]">YYYY-MM-DD</p>
            {touched.birthDate && errors.birthDate && (
              <p className="mt-0.5 text-xs text-[#FF6B6B]">{errors.birthDate}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="signup-phone"
              className="block text-sm font-medium text-[#1A1A1A] mb-1.5"
            >
              휴대폰
            </label>
            <input
              id="signup-phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value);
                setPhone(formatted);
                if (touched.phone)
                  setErrors((prev) => ({ ...prev, phone: validateField('phone', formatted) }));
              }}
              onBlur={() => handleBlur('phone', phone)}
              className={inputCls(touched.phone ? errors.phone : '')}
              placeholder="010-1234-5678"
              maxLength={13}
              autoComplete="tel"
            />
            <p className="mt-1 text-xs text-[#6B6B6B]">010-1234-5678</p>
            {touched.phone && errors.phone && (
              <p className="mt-0.5 text-xs text-[#FF6B6B]">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              성별 <span className="font-normal text-[#6B6B6B]">(선택 사항)</span>
            </label>
            <div className="relative">
              {genderOpen && (
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden="true"
                  onClick={() => setGenderOpen(false)}
                />
              )}
              <button
                type="button"
                onClick={() => setGenderOpen((v) => !v)}
                aria-expanded={genderOpen}
                aria-haspopup="listbox"
                className="flex w-full items-center justify-between rounded-lg border border-[#E8E8E8] px-3 py-2.5 text-sm text-left focus:border-[#4CAF82] focus:outline-none"
              >
                <span className={gender ? 'text-[#1A1A1A]' : 'text-[#BBBBBB]'}>
                  {gender ? GENDER_OPTIONS.find((o) => o.value === gender)?.label : '선택'}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  className={cn('transition-transform', genderOpen ? 'rotate-180' : '')}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {genderOpen && (
                <ul
                  role="listbox"
                  aria-label="성별 선택"
                  className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-[#E8E8E8] bg-white shadow-md"
                >
                  {GENDER_OPTIONS.map((opt) => (
                    <li key={opt.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={gender === opt.value}
                        onClick={() => {
                          setGender(opt.value);
                          setGenderOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-gray-50',
                          gender === opt.value ? 'text-[#4CAF82] font-medium' : 'text-[#1A1A1A]',
                        )}
                      >
                        <span className="h-4 w-4 rounded border border-[#E8E8E8] flex items-center justify-center flex-shrink-0">
                          {gender === opt.value && (
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 12 12"
                              fill="none"
                              stroke="#4CAF82"
                              strokeWidth="2"
                              aria-hidden="true"
                            >
                              <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-email"
              className="block text-sm font-medium text-[#1A1A1A] mb-1.5"
            >
              이메일
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched.email)
                  setErrors((prev) => ({ ...prev, email: validateField('email', e.target.value) }));
              }}
              onBlur={() => handleBlur('email', email)}
              className={inputCls(touched.email ? errors.email : '')}
              placeholder="@example.com"
              autoComplete="email"
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-xs text-[#FF6B6B]">{errors.email}</p>
            )}
          </div>

          {!isSocialFlow && (
            <>
              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-sm font-medium text-[#1A1A1A] mb-1.5"
                >
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password)
                        setErrors((prev) => ({
                          ...prev,
                          password: validateField('password', e.target.value),
                        }));
                      if (touched.passwordConfirm)
                        setErrors((prev) => ({
                          ...prev,
                          passwordConfirm:
                            e.target.value !== passwordConfirm
                              ? '비밀번호가 일치하지 않습니다.'
                              : '',
                        }));
                    }}
                    onBlur={() => handleBlur('password', password)}
                    className={cn(inputCls(touched.password ? errors.password : ''), 'pr-10')}
                    placeholder="영문+숫자 8자 이상"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BBBBBB] hover:text-[#6B6B6B] focus-visible:outline-none"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-[#6B6B6B]">영문과 숫자를 포함하여 8자 이상</p>
                {touched.password && errors.password && (
                  <p className="mt-0.5 text-xs text-[#FF6B6B]">{errors.password}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="signup-password-confirm"
                  className="block text-sm font-medium text-[#1A1A1A] mb-1.5"
                >
                  비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    id="signup-password-confirm"
                    type={showPasswordConfirm ? 'text' : 'password'}
                    value={passwordConfirm}
                    onChange={(e) => {
                      setPasswordConfirm(e.target.value);
                      if (touched.passwordConfirm)
                        setErrors((prev) => ({
                          ...prev,
                          passwordConfirm:
                            password !== e.target.value ? '비밀번호가 일치하지 않습니다.' : '',
                        }));
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, passwordConfirm: true }));
                      setErrors((prev) => ({
                        ...prev,
                        passwordConfirm:
                          password !== passwordConfirm ? '비밀번호가 일치하지 않습니다.' : '',
                      }));
                    }}
                    className={cn(
                      inputCls(touched.passwordConfirm ? errors.passwordConfirm : ''),
                      'pr-10',
                    )}
                    placeholder="비밀번호를 다시 입력해주세요"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    aria-label={showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
                    onClick={() => setShowPasswordConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BBBBBB] hover:text-[#6B6B6B] focus-visible:outline-none"
                  >
                    <EyeIcon open={showPasswordConfirm} />
                  </button>
                </div>
                {touched.passwordConfirm && errors.passwordConfirm && (
                  <p className="mt-1 text-xs text-[#FF6B6B]">{errors.passwordConfirm}</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-8">
          <ul className="flex flex-col gap-2.5 mb-5" role="list">
            {TERMS_ITEMS.map((item) => (
              <li key={item.id} className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id={`term-${item.id}`}
                  checked={terms[item.id]}
                  onChange={() => toggleTerm(item.id)}
                  className="h-4 w-4 flex-shrink-0 cursor-pointer rounded border-[#E8E8E8] accent-[#4CAF82]"
                />
                <label
                  htmlFor={`term-${item.id}`}
                  className="flex-1 cursor-pointer text-sm text-[#1A1A1A]"
                >
                  <span
                    className={cn(
                      'mr-1 text-xs font-semibold',
                      item.required ? 'text-[#4CAF82]' : 'text-[#6B6B6B]',
                    )}
                  >
                    [{item.required ? '필수' : '선택'}]
                  </span>
                  {item.label}
                </label>
                <button
                  type="button"
                  onClick={() => setTermsModal(item.id)}
                  className="shrink-0 text-xs text-[#6B6B6B] underline hover:text-[#1A1A1A] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4CAF82]"
                  aria-label={`${item.label} 보기`}
                >
                  보기 →
                </button>
              </li>
            ))}
          </ul>

          <div className="h-px bg-[#E8E8E8] mb-4" />

          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={allTermsChecked}
              onChange={toggleAllTerms}
              className="h-4 w-4 flex-shrink-0 cursor-pointer rounded border-[#E8E8E8] accent-[#4CAF82]"
              aria-label="약관 전체 동의"
            />
            <span className="text-sm font-semibold text-[#1A1A1A]">약관 전체 동의</span>
          </label>

          {termsError && <p className="mt-2 text-xs text-[#FF6B6B]">{termsError}</p>}
        </div>

        {submitError && (
          <div role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-[#FF6B6B]">
            {submitError}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: '#000000' }}
        >
          {isSubmitting ? (
            <>
              <Spinner />
              가입 처리 중...
            </>
          ) : (
            '가입 완료하기 →'
          )}
        </button>
      </div>

      {termsModal !== null && (
        <TermsModal termsId={termsModal} onClose={() => setTermsModal(null)} />
      )}
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 1.5C4.85786 1.5 1.5 4.21634 1.5 7.57143C1.5 9.65169 2.74364 11.4989 4.66071 12.6027L3.80357 15.8036C3.73036 16.0714 4.03393 16.2857 4.26786 16.1339L8.08036 13.6875C8.38393 13.7143 8.6875 13.7143 9 13.7143C13.1421 13.7143 16.5 11 16.5 7.57143C16.5 4.21634 13.1421 1.5 9 1.5Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10.18 9.31L7.62 5.4H5.4V12.6H7.82V8.69L10.38 12.6H12.6V5.4H10.18V9.31Z"
        fill="white"
      />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Spinner({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={cn(
        'h-4 w-4 animate-spin rounded-full border-2',
        dark ? 'border-[#00000040] border-t-[#000000D9]' : 'border-white/40 border-t-white',
      )}
    />
  );
}
