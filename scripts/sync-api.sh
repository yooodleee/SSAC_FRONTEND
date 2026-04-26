#!/usr/bin/env bash
# scripts/sync-api.sh
# 백엔드 Swagger를 로컬에 동기화하고 타입을 자동 생성합니다.
# 직접 실행: ./scripts/sync-api.sh
# npm 스크립트: npm run sync:api

set -euo pipefail

# ──────────────────────────────────────────────
# .env.local 로드 (환경변수 미설정 시 폴백)
# ──────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env.local"
if [[ -f "$ENV_FILE" ]]; then
  while IFS='=' read -r key value; do
    [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
    value="${value%"${value##*[![:space:]]}"}"  # 후행 공백 제거
    if [[ -n "$key" && -z "${!key+x}" ]]; then
      export "$key=$value"
    fi
  done < "$ENV_FILE"
fi

# ──────────────────────────────────────────────
# 설정
# ──────────────────────────────────────────────
SWAGGER_URL="${SWAGGER_URL:-${NEXT_PUBLIC_API_BASE_URL:-}/api-docs/swagger.json}"
CONTRACT_DIR="$(cd "$(dirname "$0")/../api-contract" && pwd)"
CACHE_FILE="$CONTRACT_DIR/swagger.json"
TYPES_FILE="$CONTRACT_DIR/generated/api-types.ts"
CHANGELOG="$CONTRACT_DIR/CHANGELOG.md"
TEMP_FILE="$(mktemp)"

# ──────────────────────────────────────────────
# 사전 검사
# ──────────────────────────────────────────────
if [[ -z "$SWAGGER_URL" || "$SWAGGER_URL" == "/api-docs/swagger.json" ]]; then
  echo "❌ SWAGGER_URL 환경변수가 설정되지 않았습니다."
  echo "   예) export SWAGGER_URL=https://api.example.com/api-docs/swagger.json"
  exit 1
fi

if ! command -v curl &>/dev/null; then
  echo "❌ curl이 필요합니다. 설치 후 다시 실행하세요."
  exit 1
fi

mkdir -p "$CONTRACT_DIR/generated"

# ──────────────────────────────────────────────
# ① 최신 swagger.json 다운로드
# ──────────────────────────────────────────────
echo "🔄 Swagger 다운로드 중: $SWAGGER_URL"
if ! curl -fsSL "$SWAGGER_URL" -o "$TEMP_FILE"; then
  echo "❌ Swagger 다운로드 실패 — URL을 확인하거나 백엔드 서버 상태를 점검하세요."
  rm -f "$TEMP_FILE"
  exit 1
fi

# JSON 유효성 검사
if ! python3 -m json.tool "$TEMP_FILE" &>/dev/null; then
  echo "❌ 다운로드된 파일이 유효한 JSON이 아닙니다."
  rm -f "$TEMP_FILE"
  exit 1
fi

# ──────────────────────────────────────────────
# ② 로컬 캐시와 diff 비교 후 CHANGELOG 기록
# ──────────────────────────────────────────────
CHANGED=false
DIFF_SUMMARY=""

if [[ -f "$CACHE_FILE" ]]; then
  # 경로(paths) 키 기준 diff — 엔드포인트 변경에 집중
  OLD_PATHS=$(python3 -c "
import json, sys
with open('$CACHE_FILE') as f:
    d = json.load(f)
paths = d.get('paths', {})
for p, methods in sorted(paths.items()):
    for m in sorted(methods.keys()):
        if m in ('get','post','put','patch','delete','head','options'):
            print(f'{m.upper()} {p}')
" 2>/dev/null || echo "")

  NEW_PATHS=$(python3 -c "
import json, sys
with open('$TEMP_FILE') as f:
    d = json.load(f)
paths = d.get('paths', {})
for p, methods in sorted(paths.items()):
    for m in sorted(methods.keys()):
        if m in ('get','post','put','patch','delete','head','options'):
            print(f'{m.upper()} {p}')
" 2>/dev/null || echo "")

  if [[ "$OLD_PATHS" != "$NEW_PATHS" ]]; then
    CHANGED=true

    ADDED=$(comm -13 <(echo "$OLD_PATHS" | sort) <(echo "$NEW_PATHS" | sort) | sed 's/^/  + /')
    REMOVED=$(comm -23 <(echo "$OLD_PATHS" | sort) <(echo "$NEW_PATHS" | sort) | sed 's/^/  - /')

    DIFF_SUMMARY=""
    [[ -n "$ADDED"   ]] && DIFF_SUMMARY+=$'\n'"**추가된 엔드포인트:**"$'\n'"$ADDED"
    [[ -n "$REMOVED" ]] && DIFF_SUMMARY+=$'\n'"**제거된 엔드포인트:**"$'\n'"$REMOVED"
  fi
else
  # 첫 동기화
  CHANGED=true
  DIFF_SUMMARY=$'\n'"**초기 동기화** — 이전 캐시 없음"
fi

if $CHANGED; then
  NOW=$(date '+%Y-%m-%d %H:%M')
  ENTRY="## $NOW 동기화"$'\n'"$DIFF_SUMMARY"$'\n'

  # CHANGELOG 맨 위에 삽입
  if [[ -f "$CHANGELOG" ]]; then
    EXISTING=$(cat "$CHANGELOG")
    printf '%s\n\n%s\n' "$ENTRY" "$EXISTING" > "$CHANGELOG"
  else
    printf '# API CHANGELOG\n\n%s\n' "$ENTRY" > "$CHANGELOG"
  fi

  cp "$TEMP_FILE" "$CACHE_FILE"
  echo "📝 CHANGELOG.md 업데이트 완료"
else
  cp "$TEMP_FILE" "$CACHE_FILE"
fi

rm -f "$TEMP_FILE"

# ──────────────────────────────────────────────
# ③ openapi-typescript로 api-types.ts 자동 생성
# ──────────────────────────────────────────────
echo "⚙️  타입 생성 중..."

# openapi-typescript CLI 위치 탐색 (로컬 우선)
OAT_BIN=""
if [[ -x "node_modules/.bin/openapi-typescript" ]]; then
  OAT_BIN="node_modules/.bin/openapi-typescript"
elif command -v openapi-typescript &>/dev/null; then
  OAT_BIN="openapi-typescript"
else
  echo "⚠️  openapi-typescript가 없습니다. 설치합니다..."
  npm install --save-dev openapi-typescript
  OAT_BIN="node_modules/.bin/openapi-typescript"
fi

# 헤더 주석 추가 후 생성
HEADER="// ============================================================
// ⚠️  이 파일은 자동 생성됩니다 — 절대 수동으로 편집하지 마세요.
// 생성 명령: npm run sync:api
// 소스: $SWAGGER_URL
// 생성 시각: $(date '+%Y-%m-%d %H:%M:%S')
// ============================================================

"

TEMP_TYPES="$(mktemp).ts"

# --output 플래그로 파일에 직접 쓴다.
# set -e 환경에서 stdout 캡처($())는 openapi-typescript가 비정상 종료할 때
# 스크립트 전체를 즉시 종료시켜 api-types.ts를 빈 채로 남기는 문제가 있었다.
# if ! 구문으로 set -e 영향을 차단하고 실패를 명시적으로 처리한다.
if ! "$OAT_BIN" "$CACHE_FILE" --output "$TEMP_TYPES" 2>&1; then
  rm -f "$TEMP_TYPES"
  echo "❌ openapi-typescript 실행 실패 — swagger.json이 유효한지 확인하세요."
  echo "   이전 api-types.ts는 변경되지 않았습니다."
  exit 1
fi

{ printf '%s' "$HEADER"; cat "$TEMP_TYPES"; } > "$TYPES_FILE"
rm -f "$TEMP_TYPES"

echo "✅ api-types.ts 생성 완료: $TYPES_FILE"

# ──────────────────────────────────────────────
# ④ 완료 메시지
# ──────────────────────────────────────────────
if $CHANGED; then
  echo ""
  echo "⚠️  API가 변경되었습니다."
  echo "    CHANGELOG.md를 확인하고 영향받는 컴포넌트를 점검하세요."
  echo "    파일: api-contract/CHANGELOG.md"
else
  echo ""
  echo "✅ API 동기화 완료 — 변경사항 없음"
fi
