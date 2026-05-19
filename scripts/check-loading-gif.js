// prebuild 단계에서 ssac-loading.gif 존재 여부를 검증한다.
// GIF 파일이 없으면 빌드를 중단한다.

const fs = require('fs');
const path = require('path');

const gifPath = path.join(process.cwd(), 'public', 'assets', 'ssac-loading.gif');

if (!fs.existsSync(gifPath)) {
  process.stderr.write(
    '\n❌ 빌드 실패: public/assets/ssac-loading.gif 파일이 없습니다.\n' +
      '   GIF 파일을 public/assets/ssac-loading.gif 경로에 추가한 후 다시 빌드하세요.\n\n',
  );
  process.exit(1);
}

const stats = fs.statSync(gifPath);
const sizeKB = stats.size / 1024;

if (sizeKB > 500) {
  process.stderr.write(
    `\n⚠️  경고: ssac-loading.gif 파일 크기가 ${sizeKB.toFixed(0)}KB 입니다 (권장: 500KB 이하).\n\n`,
  );
}

process.stdout.write(`✅ ssac-loading.gif 확인 완료 (${sizeKB.toFixed(0)}KB)\n`);
