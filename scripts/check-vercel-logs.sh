#!/bin/bash
echo "▲ Vercel 최신 배포 로그 수집 중..."
echo "======================================"

# 최신 배포 URL 추출
LATEST_URL=$(vercel ls --json 2>/dev/null | \
  node -e "
    const d = require('fs').readFileSync('/dev/stdin','utf8');
    const deployments = JSON.parse(d);
    if (deployments.length > 0) {
      console.log(deployments[0].url);
    }
  ")

if [ -z "$LATEST_URL" ]; then
  echo "❌ 배포 URL을 찾을 수 없습니다."
  echo "vercel ls 명령어로 직접 확인해주세요."
  exit 1
fi

echo "📋 최신 배포 URL: https://$LATEST_URL"
echo "======================================"

# 전체 로그 출력
vercel logs "https://$LATEST_URL"

echo "======================================"
echo "❌ 오류 필터링 결과:"
vercel logs "https://$LATEST_URL" 2>&1 | \
  grep -i "error\|failed\|warning\|cannot find" | \
  head -20

echo "======================================"
echo "🔍 환경 변수 관련 오류:"
vercel logs "https://$LATEST_URL" 2>&1 | \
  grep -i "environment\|undefined\|NEXT_PUBLIC" | \
  head -10
