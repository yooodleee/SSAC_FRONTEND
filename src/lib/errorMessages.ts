// ============================================================
// BE ErrorCode → FE 사용자 안내 메시지 매핑 테이블
// swagger.json (api-contract/swagger.json) 기준으로 최신 상태 유지
// ============================================================

export const ERROR_MESSAGES: Record<string, string> = {
  // 인증
  'AUTH-001': '인증이 필요합니다. 다시 로그인해주세요.',
  'AUTH-002': '세션이 만료되었습니다. 다시 로그인해주세요.',
  'AUTH-003': '유효하지 않은 인증 정보입니다.',
  'AUTH-004': '접근 권한이 없습니다.',

  // 사용자
  'USER-001': '존재하지 않는 사용자입니다.',
  'USER-002': '이미 사용 중인 닉네임입니다.',
  'USER-003': '사용할 수 없는 닉네임입니다.',

  // 뉴스
  'NEWS-001': '존재하지 않는 뉴스입니다.',

  // 알림
  'NOTI-001': '존재하지 않는 알림입니다.',

  // Guest
  'GUEST-001': '로그인이 필요한 기능입니다.',

  // 공통
  'COMMON-001': '입력값을 확인해주세요.',
  'SERVER-001': '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',

  // 회원가입
  'TERMS-001': '필수 약관에 모두 동의해주세요.',
  'TERMS-002': '이미 회원가입이 완료된 계정입니다.',
  'USER-TYPE-001': '사용자 유형을 선택해주세요.',
  'USER-TYPE-002': '유효하지 않은 사용자 유형입니다.',

  // 온보딩
  'ONBOARDING-001': '사용자 유형이 설정되지 않았습니다.',
  'ONBOARDING-002': '이미 온보딩을 완료한 사용자입니다.',
  'ONBOARDING-003': '모든 문제에 응답해주세요.',
  'ONBOARDING-004': '유효하지 않은 문제입니다.',
  'ONBOARDING-005': '사용자 유형과 맞지 않는 문제입니다.',
};

const DEFAULT_ERROR_MESSAGE = '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

/**
 * ErrorCode를 사용자 안내 메시지로 변환한다.
 * - 매핑 테이블에 code가 있으면 해당 메시지 반환
 * - 없으면 fallbackMessage(BE message 필드)를 반환
 * - 둘 다 없으면 기본 안내 메시지 반환
 */
export function getErrorMessage(code?: string, fallbackMessage?: string): string {
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  if (fallbackMessage) return fallbackMessage;
  return DEFAULT_ERROR_MESSAGE;
}
