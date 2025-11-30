import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Docker 배포를 위한 standalone 출력 모드
  output: "standalone",

  // 번들 크기 최적화
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tanstack/react-query",
      "date-fns",
    ],
  },

  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "mycamp.duckdns.org",
      },
      {
        protocol: "https",
        hostname: "mycamp.duckdns.org",
      },
      {
        protocol: "https",
        hostname: "**.campstation.com",
      },
      {
        protocol: "http",
        hostname: "minio",
        port: "9000",
      },
      {
        protocol: "http",
        hostname: "campstation-minio",
        port: "9000",
      },
    ],
  },

  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // XSS 보호
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // 클릭재킹 방지
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // MIME 타입 스니핑 방지
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Referrer 정책
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions Policy (구 Feature Policy)
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://oapi.map.naver.com http://oapi.map.naver.com https://nrbe.map.naver.net http://nrbe.map.naver.net https://nrbe.pstatic.net https://js.tosspayments.com https://cdn.jsdelivr.net", // Naver Maps API (with blob: for Web Workers), Toss Payments, jsDelivr CDN
              "style-src 'self' 'unsafe-inline'", // Tailwind CSS 허용
              "img-src 'self' data: blob: http: https:",
              "font-src 'self' data:",
              "connect-src 'self' http://localhost:* https://localhost:* http://mycamp.duckdns.org https://mycamp.duckdns.org https://naveropenapi.apigw.ntruss.com https://kr-col-ext.nelo.navercorp.com https://api.tosspayments.com https://event.tosspayments.com https://log.tosspayments.com https://apigw-sandbox.tosspayments.com", // Naver Maps, Toss Payments API + Sandbox
              "frame-src 'self' https://payment-widget.tosspayments.com https://payment-gateway-sandbox.tosspayments.com", // Toss Payments Widget iframe + Sandbox
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
