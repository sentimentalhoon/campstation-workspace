import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { ConditionalBottomNav, ConditionalHeader } from "@/components/layout";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { ToastProvider } from "@/contexts/ToastContext";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CampStation - 캠핑장 예약 플랫폼",
    template: "%s | CampStation",
  },
  description:
    "전국 최고의 캠핑장을 예약하고 자연과 함께하는 특별한 경험을 만들어보세요. 실시간 예약, 리뷰, 찜하기 기능으로 완벽한 캠핑을 준비하세요.",
  keywords: [
    "캠핑장",
    "캠핑장 예약",
    "오토캠핑",
    "글램핑",
    "캠핑",
    "야영장",
    "캠핑 예약",
    "캠핑 리뷰",
  ],
  authors: [{ name: "CampStation Team" }],
  creator: "CampStation",
  publisher: "CampStation",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "http://localhost:3000",
    siteName: "CampStation",
    title: "CampStation - 캠핑장 예약 플랫폼",
    description:
      "전국 최고의 캠핑장을 예약하고 자연과 함께하는 특별한 경험을 만들어보세요",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CampStation 캠핑장 예약 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampStation - 캠핑장 예약 플랫폼",
    description:
      "전국 최고의 캠핑장을 예약하고 자연과 함께하는 특별한 경험을 만들어보세요",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console 인증 코드 (나중에 추가)
    // google: 'verification_code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <head>
        <meta name="referrer" content="origin" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex justify-center antialiased`}
      >
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <LocationProvider>
                <ToastProvider>
                  <div className="bg-background mx-auto flex min-h-screen w-full max-w-[640px] flex-col shadow-xl">
                    <ConditionalHeader />
                    <main className="flex-1">{children}</main>
                    {/* <Footer /> */}
                    <ConditionalBottomNav />
                  </div>
                </ToastProvider>
              </LocationProvider>
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
