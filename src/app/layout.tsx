import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PostLoginToast } from '@/components/auth/PostLoginToast';
import { ErrorToast } from '@/components/ui/ErrorToast';
import { LevelUpModal } from '@/features/mypage/LevelUpModal';
import { ThemeProvider } from '@/lib/theme';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: '🌱 SSAC',
    template: '%s | SSAC',
  },
  description: '금융 문맹 탈출의 첫 걸음, 어려운 금융 지식을 싹으로 쉽게.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('accessToken');

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Pretendard 폰트 (CDN — 한글/영문 가변 서브셋) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* FOUC 방지: React hydration 전에 data-theme 적용 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',t==='dark'||t==='light'?t:(d?'dark':'light'));}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <ThemeProvider>
          <Header isLoggedIn={isLoggedIn} />
          <main className="flex-1">{children}</main>
          <Footer />
          <PostLoginToast />
          <ErrorToast />
          <LevelUpModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
