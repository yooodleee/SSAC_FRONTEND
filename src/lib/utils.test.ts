import { cn, formatDate, truncate, formatRelativeTime } from './utils';

describe('cn', () => {
  it('falsy 값을 제거하고 클래스명을 합친다', () => {
    expect(cn('a', 'b')).toBe('a b');
    expect(cn('a', undefined, null, false, 'b')).toBe('a b');
    expect(cn()).toBe('');
  });
});

describe('formatDate', () => {
  it('날짜 문자열을 한국어 형식으로 변환한다', () => {
    const result = formatDate('2026-01-15');
    expect(result).toContain('2026');
    expect(result).toContain('1');
    expect(result).toContain('15');
  });
});

describe('truncate', () => {
  it('maxLength 이하면 원본을 반환한다', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('maxLength 초과 시 잘라내고 "…"을 붙인다', () => {
    expect(truncate('hello world', 5)).toBe('hello…');
  });
});

describe('formatRelativeTime', () => {
  it('1분 미만은 "방금 전"을 반환한다', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('방금 전');
  });

  it('1시간 미만은 "N분 전"을 반환한다', () => {
    const past = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(past)).toBe('5분 전');
  });
});
