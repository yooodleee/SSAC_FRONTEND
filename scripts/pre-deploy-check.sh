#!/bin/bash
echo "🔍 배포 전 사전 검증 시작..."
echo "======================================"

# TypeScript 타입 검사
echo "1️⃣ TypeScript 타입 검사 중..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ TypeScript 타입 오류 발견"
  echo "→ 위 오류를 수정 후 다시 시도해주세요."
  exit 1
fi
echo "✅ TypeScript 타입 검사 통과"

# ESLint 검사
echo "2️⃣ ESLint 검사 중..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ ESLint 오류 발견"
  echo "→ 위 오류를 수정 후 다시 시도해주세요."
  exit 1
fi
echo "✅ ESLint 검사 통과"

# 빌드 검사
echo "3️⃣ 빌드 검사 중..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ 빌드 실패"
  echo "→ 위 오류를 수정 후 다시 시도해주세요."
  exit 1
fi
echo "✅ 빌드 성공"

echo "======================================"
echo "🎉 모든 사전 검증 통과! 배포 가능합니다."
