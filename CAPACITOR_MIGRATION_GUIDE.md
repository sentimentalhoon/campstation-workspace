# CampStation Capacitor 하이브리드 앱 마이그레이션 가이드

> **작성일**: 2025-10-31
> **프로젝트**: CampStation (캠핑장 예약 서비스)
> **목표**: Next.js 웹 앱을 Capacitor 기반 iOS/Android 하이브리드 앱으로 전환

---

## 📋 목차

1. [개요](#1-개요)
2. [사전 요구사항](#2-사전-요구사항)
3. [프로젝트 구조 변경](#3-프로젝트-구조-변경)
4. [Capacitor 설치 및 초기화](#4-capacitor-설치-및-초기화)
5. [Next.js 설정 수정](#5-nextjs-설정-수정)
6. [네이티브 플러그인 통합](#6-네이티브-플러그인-통합)
7. [아이콘 및 스플래시 스크린](#7-아이콘-및-스플래시-스크린)
8. [빌드 및 실행](#8-빌드-및-실행)
9. [배포 준비](#9-배포-준비)
10. [트러블슈팅](#10-트러블슈팅)

---

## 1. 개요

### 1.1 왜 Capacitor인가?

**CampStation 서비스 특성**:
- 위치 기반 캠핑장 검색 (GPS 필수)
- 리뷰 사진 촬영 (카메라 필요)
- 예약 알림 (푸시 알림 필수)
- 오프라인 예약 정보 확인
- 결제 서비스 (앱스토어 신뢰도 중요)

**Capacitor 선택 이유**:
- ✅ Next.js 코드 그대로 사용 가능
- ✅ TypeScript 완벽 지원
- ✅ 웹/iOS/Android 단일 코드베이스
- ✅ 네이티브 API 접근 용이
- ✅ Hot Reload 지원
- ✅ Ionic 생태계 플러그인 풍부

### 1.2 마이그레이션 범위

```
현재 상태:
├── Next.js 15 (App Router)
├── React 19
├── TypeScript
├── Tailwind CSS
└── 모바일 최적화 UI (완료)

목표 상태:
├── 위 모든 것 +
├── Capacitor 6
├── iOS 네이티브 앱
├── Android 네이티브 앱
└── 네이티브 플러그인 (GPS, Camera, Push)
```

### 1.3 예상 소요 시간

| 단계 | 작업 | 소요 시간 |
|------|------|-----------|
| Phase 1 | Capacitor 기본 설정 | 4-6시간 |
| Phase 2 | 네이티브 플러그인 통합 | 1-2일 |
| Phase 3 | 테스트 및 최적화 | 1-2일 |
| Phase 4 | 스토어 배포 준비 | 1일 |
| **총계** | | **3-5일** |

---

## 2. 사전 요구사항

### 2.1 개발 환경

**필수 소프트웨어**:

```bash
# Node.js (v20 이상)
node --version  # v20.x.x 이상

# npm 또는 pnpm
npm --version   # 10.x.x 이상
pnpm --version  # 9.x.x 이상 (선택)

# Git
git --version
```

**Android 개발 (Windows/Mac/Linux)**:

```bash
# 1. Android Studio 설치
다운로드: https://developer.android.com/studio

# 2. Android SDK 설치 (Android Studio에서)
- SDK Platform 34 (Android 14)
- Android SDK Build-Tools
- Android SDK Platform-Tools
- Android Emulator

# 3. 환경변수 설정
# Windows (PowerShell):
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\<your-username>\AppData\Local\Android\Sdk", "User")

# Mac/Linux (.zshrc 또는 .bashrc):
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# 4. 확인
adb --version
```

**iOS 개발 (Mac 전용)**:

```bash
# 1. Xcode 설치
앱스토어에서 "Xcode" 검색 및 설치 (약 12GB)

# 2. Xcode Command Line Tools 설치
xcode-select --install

# 3. CocoaPods 설치
sudo gem install cocoapods
pod --version

# 4. 확인
xcodebuild -version
```

### 2.2 개발자 계정

**Apple Developer Account** (iOS 배포용):
- 비용: $99/년
- 등록: https://developer.apple.com
- 필요한 것: Apple ID, 신용카드
- 승인 시간: 1-2일

**Google Play Console** (Android 배포용):
- 비용: $25 (일회성)
- 등록: https://play.google.com/console
- 필요한 것: Google 계정, 신용카드
- 승인 시간: 즉시

### 2.3 현재 프로젝트 상태 확인

```bash
cd frontend

# 프로젝트 빌드 테스트
npm run build

# 빌드 성공 확인
ls -la .next/

# 의존성 확인
npm list next react react-dom
```

---

## 3. 프로젝트 구조 변경

### 3.1 현재 구조

```
frontend/
├── src/
│   ├── app/
│   ├── components/
│   ├── contexts/
│   ├── lib/
│   └── types/
├── public/
├── next.config.ts
├── package.json
└── tsconfig.json
```

### 3.2 Capacitor 추가 후 구조

```
frontend/
├── src/                          # 기존 Next.js 소스 (변경 없음)
├── public/                       # 기존 정적 파일
├── out/                          # ✨ NEW: Next.js static export
│   └── (빌드된 정적 파일들)
├── ios/                          # ✨ NEW: iOS 네이티브 프로젝트
│   ├── App/
│   │   ├── App/
│   │   │   ├── AppDelegate.swift
│   │   │   ├── Info.plist
│   │   │   └── capacitor.config.json (심볼릭 링크)
│   │   ├── App.xcodeproj
│   │   └── Podfile
│   └── App.xcworkspace
├── android/                      # ✨ NEW: Android 네이티브 프로젝트
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── AndroidManifest.xml
│   │   │       ├── java/
│   │   │       └── res/
│   │   ├── build.gradle
│   │   └── capacitor.config.json (심볼릭 링크)
│   ├── build.gradle
│   └── settings.gradle
├── capacitor.config.ts           # ✨ NEW: Capacitor 설정
├── next.config.ts                # ✨ MODIFIED: static export 추가
└── package.json                  # ✨ MODIFIED: Capacitor 패키지 추가
```

### 3.3 주요 변경 파일 목록

**새로 생성될 파일**:
- `capacitor.config.ts` - Capacitor 메인 설정
- `ios/` 디렉토리 전체 - iOS 네이티브 프로젝트
- `android/` 디렉토리 전체 - Android 네이티브 프로젝트

**수정될 파일**:
- `next.config.ts` - static export 모드 추가
- `package.json` - Capacitor 패키지 추가
- `.gitignore` - 네이티브 빌드 파일 제외

**삭제할 파일** (선택):
- `next-pwa` 관련 설정 (더 이상 불필요)

---

## 4. Capacitor 설치 및 초기화

### 4.1 패키지 설치

```bash
cd frontend

# Capacitor CLI 및 핵심 패키지 설치
npm install @capacitor/core @capacitor/cli

# iOS/Android 플랫폼 추가
npm install @capacitor/ios @capacitor/android

# 필수 플러그인 설치
npm install @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar

# 추가 플러그인 (CampStation 필요 기능)
npm install @capacitor/geolocation      # GPS 위치
npm install @capacitor/camera           # 카메라/갤러리
npm install @capacitor/push-notifications # 푸시 알림
npm install @capacitor/share            # 공유 기능
npm install @capacitor/preferences      # 로컬 저장소
npm install @capacitor/network          # 네트워크 상태
npm install @capacitor/splash-screen    # 스플래시 화면
```

**설치 확인**:
```bash
npx cap --version  # Capacitor 버전 확인 (6.x.x)
```

### 4.2 Capacitor 초기화

```bash
# Capacitor 프로젝트 초기화
npx cap init "CampStation" "com.campstation.app" --web-dir=out

# 설명:
# - "CampStation": 앱 이름
# - "com.campstation.app": Bundle ID (변경 가능)
# - --web-dir=out: Next.js export 결과물 디렉토리
```

이 명령어는 `capacitor.config.ts` 파일을 생성합니다.

### 4.3 capacitor.config.ts 생성

초기화 후 생성된 파일을 다음과 같이 수정:

```typescript
// frontend/capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.campstation.app',
  appName: 'CampStation',
  webDir: 'out',

  server: {
    // 개발 모드: 로컬 Next.js 서버 사용
    // 프로덕션 모드: static export 사용
    url: process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : undefined,
    cleartext: true, // HTTP 허용 (개발용)
  },

  ios: {
    contentInset: 'automatic',
    // iOS 특정 설정
    scheme: 'CampStation',
  },

  android: {
    // Android 특정 설정
    allowMixedContent: true, // HTTP 허용 (개발용)
    backgroundColor: '#ffffff',
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2563eb',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
    },

    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },

    StatusBar: {
      style: 'light',
      backgroundColor: '#2563eb',
    },

    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
```

### 4.4 플랫폼 추가

```bash
# iOS 플랫폼 추가 (Mac에서만)
npx cap add ios

# Android 플랫폼 추가
npx cap add android
```

**생성 결과**:
- `ios/` 디렉토리 생성 (iOS 네이티브 프로젝트)
- `android/` 디렉토리 생성 (Android 네이티브 프로젝트)

### 4.5 .gitignore 업데이트

```bash
# .gitignore에 추가
echo "" >> .gitignore
echo "# Capacitor" >> .gitignore
echo "out/" >> .gitignore
echo "ios/App/Pods/" >> .gitignore
echo "ios/App/App.xcworkspace/xcuserdata/" >> .gitignore
echo "android/.gradle/" >> .gitignore
echo "android/.idea/" >> .gitignore
echo "android/build/" >> .gitignore
echo "android/app/build/" >> .gitignore
echo "android/local.properties" >> .gitignore
```

---

## 5. Next.js 설정 수정

### 5.1 next.config.ts 수정

Capacitor는 정적 파일을 필요로 하므로 Next.js를 **static export** 모드로 변경해야 합니다.

**수정 전 (현재)**:
```typescript
// frontend/next.config.ts
const nextConfig: NextConfig = {
  output: "standalone",
  // ... 기타 설정
};
```

**수정 후**:
```typescript
// frontend/next.config.ts
import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // ✨ CHANGED: standalone → export (Capacitor용)
  output: "export",

  // ✨ CHANGED: trailing slash 추가 (모바일 앱 라우팅)
  trailingSlash: true,

  // ✨ CHANGED: 이미지 최적화 비활성화 (static export에서 불가)
  images: {
    unoptimized: true,
    remotePatterns: [
      // ... 기존 설정 유지
    ],
  },

  compress: true,
  poweredByHeader: false,

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "@heroicons/react"],
  },

  // ✨ REMOVED: rewrites (static export에서 작동 안 함)
  // async rewrites() { ... }

  // headers는 유지 가능 (런타임에 적용)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // ... 기타 헤더
        ],
      },
    ];
  },

  webpack: (config) => {
    // ... 기존 webpack 설정 유지
    return config;
  },
};

// ✨ REMOVED: withPWA (더 이상 불필요)
export default withBundleAnalyzer(nextConfig);
```

### 5.2 주요 변경 사항 설명

#### 5.2.1 `output: "export"`
- **이유**: Capacitor는 정적 HTML/JS/CSS 파일 필요
- **영향**: 서버 사이드 기능 일부 제한
- **제한사항**:
  - ❌ API Routes 사용 불가 (`/api/*`)
  - ❌ Server Actions 사용 불가
  - ❌ Dynamic Routes with `getServerSideProps` 불가
  - ✅ Static Generation (`generateStaticParams`) 가능
  - ✅ Client Components 모두 사용 가능

#### 5.2.2 `trailingSlash: true`
- **이유**: 모바일 앱에서 `/campground/123` → `/campground/123/` 처리
- **영향**: 모든 URL 끝에 슬래시 추가

#### 5.2.3 `images.unoptimized: true`
- **이유**: static export에서 Next.js Image Optimization 불가
- **대안**: 이미지 최적화를 S3/MinIO에서 처리 (이미 구현됨)

#### 5.2.4 `rewrites` 제거
- **이유**: static export에서 작동 안 함
- **대안**: API 호출을 백엔드 URL로 직접 호출
  ```typescript
  // 수정 필요: frontend/src/lib/api/config.ts
  export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://api.campstation.com/api"; // 실제 백엔드 URL
  ```

### 5.3 API 호출 수정

`rewrites`가 제거되므로 API 호출 방식을 수정해야 합니다.

**수정 전**:
```typescript
// frontend/src/lib/api/config.ts
export const API_BASE_URL = "/api"; // Next.js rewrites 사용
```

**수정 후**:
```typescript
// frontend/src/lib/api/config.ts
export const API_BASE_URL = (() => {
  // 개발 환경: 로컬 백엔드
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  }

  // 프로덕션: 실제 백엔드 URL
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.campstation.com/api';
})();
```

**환경 변수 설정** (`.env.local`):
```bash
# 개발 환경
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# 프로덕션 환경 (배포 시)
NEXT_PUBLIC_API_URL=https://api.campstation.com/api
```

### 5.4 package.json 스크립트 추가

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",

    "build:export": "next build",
    "cap:sync": "npm run build:export && npx cap sync",
    "cap:open:ios": "npx cap open ios",
    "cap:open:android": "npx cap open android",
    "cap:run:ios": "npm run cap:sync && npx cap run ios",
    "cap:run:android": "npm run cap:sync && npx cap run android",
    "cap:build:ios": "npm run cap:sync && cd ios && xcodebuild -workspace App.xcworkspace -scheme App -configuration Release",
    "cap:build:android": "npm run cap:sync && cd android && ./gradlew assembleRelease"
  }
}
```

**스크립트 설명**:
- `build:export`: Next.js를 static export로 빌드 (→ `out/` 디렉토리)
- `cap:sync`: 빌드 + 네이티브 프로젝트 동기화
- `cap:open:ios`: Xcode 열기
- `cap:open:android`: Android Studio 열기
- `cap:run:ios`: iOS 시뮬레이터 실행
- `cap:run:android`: Android 에뮬레이터 실행

### 5.5 Static Export 호환성 확인

**현재 프로젝트에서 확인 필요한 부분**:

1. **API Routes 사용 여부**:
   ```bash
   # API Routes 검색
   find frontend/src/app -name "route.ts" -o -name "route.js"
   ```
   → 발견되면 백엔드 API로 이동 필요

2. **Server Actions 사용 여부**:
   ```bash
   # "use server" 검색
   grep -r "use server" frontend/src/
   ```
   → 발견되면 Client-side로 변경 필요

3. **Dynamic Routes**:
   - `frontend/src/app/campground/[id]/` → ✅ OK (generateStaticParams 사용)
   - 동적 경로가 많으면 빌드 시간 증가

---

## 6. 네이티브 플러그인 통합

### 6.1 플러그인 개요

CampStation에 필요한 네이티브 기능:

| 기능 | 플러그인 | 용도 |
|------|---------|------|
| GPS 위치 | `@capacitor/geolocation` | 내 주변 캠핑장 찾기 |
| 카메라 | `@capacitor/camera` | 리뷰 사진 촬영 |
| 푸시 알림 | `@capacitor/push-notifications` | 예약 알림 |
| 로컬 저장소 | `@capacitor/preferences` | 오프라인 데이터 |
| 공유 | `@capacitor/share` | 캠핑장 공유 |
| 네트워크 상태 | `@capacitor/network` | 오프라인 감지 |
| 상태바 | `@capacitor/status-bar` | UI 일관성 |
| 키보드 | `@capacitor/keyboard` | 입력 경험 개선 |
| 햅틱 | `@capacitor/haptics` | 터치 피드백 |
| 앱 상태 | `@capacitor/app` | 앱 생명주기 |

### 6.2 공통 유틸리티 생성

**파일**: `frontend/src/lib/capacitor/index.ts`

```typescript
// frontend/src/lib/capacitor/index.ts
import { Capacitor } from '@capacitor/core';

/**
 * 현재 플랫폼 확인
 */
export const isNative = Capacitor.isNativePlatform();
export const isIOS = Capacitor.getPlatform() === 'ios';
export const isAndroid = Capacitor.getPlatform() === 'android';
export const isWeb = Capacitor.getPlatform() === 'web';

/**
 * 네이티브 플러그인 사용 가능 여부 확인
 */
export const isPluginAvailable = (pluginName: string): boolean => {
  return Capacitor.isPluginAvailable(pluginName);
};

/**
 * 플랫폼별 코드 실행
 */
export const runOnPlatform = <T>(handlers: {
  ios?: () => T;
  android?: () => T;
  web?: () => T;
  default?: () => T;
}): T | undefined => {
  if (isIOS && handlers.ios) return handlers.ios();
  if (isAndroid && handlers.android) return handlers.android();
  if (isWeb && handlers.web) return handlers.web();
  if (handlers.default) return handlers.default();
  return undefined;
};

/**
 * 에러 처리 헬퍼
 */
export const handleCapacitorError = (error: any, fallback?: () => void): void => {
  console.error('[Capacitor Error]', error);
  if (fallback) fallback();
};
```

### 6.3 Geolocation (GPS 위치)

**파일**: `frontend/src/lib/capacitor/geolocation.ts`

```typescript
// frontend/src/lib/capacitor/geolocation.ts
import { Geolocation, Position } from '@capacitor/geolocation';
import { isNative, handleCapacitorError } from './index';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * 현재 위치 가져오기
 */
export const getCurrentPosition = async (): Promise<Coordinates | null> => {
  try {
    // 권한 확인
    const permission = await Geolocation.checkPermissions();

    if (permission.location !== 'granted') {
      // 권한 요청
      const requestResult = await Geolocation.requestPermissions();
      if (requestResult.location !== 'granted') {
        console.warn('위치 권한이 거부되었습니다.');
        return null;
      }
    }

    // 현재 위치 가져오기
    const position: Position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch (error) {
    handleCapacitorError(error);

    // 웹 브라우저 Geolocation API 폴백
    if (!isNative && navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
          () => resolve(null)
        );
      });
    }

    return null;
  }
};

/**
 * 위치 추적 시작 (실시간)
 */
export const watchPosition = (
  callback: (coords: Coordinates) => void,
  errorCallback?: (error: any) => void
): string | null => {
  try {
    const watchId = Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
      (position, error) => {
        if (error) {
          errorCallback?.(error);
          return;
        }
        if (position) {
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
      }
    );

    return watchId;
  } catch (error) {
    handleCapacitorError(error, () => errorCallback?.(error));
    return null;
  }
};

/**
 * 위치 추적 중지
 */
export const clearWatch = async (watchId: string): Promise<void> => {
  try {
    await Geolocation.clearWatch({ id: watchId });
  } catch (error) {
    handleCapacitorError(error);
  }
};
```

**사용 예시**:
```typescript
// frontend/src/components/campground/NearbySearch.tsx
import { getCurrentPosition } from '@/lib/capacitor/geolocation';

const handleSearchNearby = async () => {
  const coords = await getCurrentPosition();
  if (coords) {
    // 주변 캠핑장 검색
    searchCampgrounds({
      latitude: coords.latitude,
      longitude: coords.longitude,
      radius: 10, // 10km
    });
  } else {
    alert('위치 권한이 필요합니다.');
  }
};
```

### 6.4 Camera (카메라/갤러리)

**파일**: `frontend/src/lib/capacitor/camera.ts`

```typescript
// frontend/src/lib/capacitor/camera.ts
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { isNative, handleCapacitorError } from './index';

export interface CapturedPhoto {
  dataUrl: string;
  format: string;
  base64?: string;
}

/**
 * 카메라로 사진 촬영
 */
export const takePhoto = async (): Promise<CapturedPhoto | null> => {
  try {
    const photo: Photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      saveToGallery: false,
    });

    return {
      dataUrl: photo.dataUrl!,
      format: photo.format,
    };
  } catch (error) {
    handleCapacitorError(error);
    return null;
  }
};

/**
 * 갤러리에서 사진 선택
 */
export const pickPhoto = async (): Promise<CapturedPhoto | null> => {
  try {
    const photo: Photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });

    return {
      dataUrl: photo.dataUrl!,
      format: photo.format,
    };
  } catch (error) {
    handleCapacitorError(error);
    return null;
  }
};

/**
 * 사진 선택 옵션 표시 (카메라 or 갤러리)
 */
export const pickPhotoWithOptions = async (): Promise<CapturedPhoto | null> => {
  try {
    const photo: Photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt, // 사용자에게 선택하게 함
      promptLabelHeader: '사진 선택',
      promptLabelPhoto: '갤러리에서 선택',
      promptLabelPicture: '카메라로 촬영',
    });

    return {
      dataUrl: photo.dataUrl!,
      format: photo.format,
    };
  } catch (error) {
    handleCapacitorError(error);
    return null;
  }
};

/**
 * DataURL을 File 객체로 변환 (API 업로드용)
 */
export const dataUrlToFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};
```

**사용 예시**:
```typescript
// frontend/src/components/review/ReviewPhotoUpload.tsx
import { pickPhotoWithOptions, dataUrlToFile } from '@/lib/capacitor/camera';
import { fileApi } from '@/lib/api';

const handleAddPhoto = async () => {
  const photo = await pickPhotoWithOptions();
  if (photo) {
    // DataURL을 File로 변환
    const file = dataUrlToFile(photo.dataUrl, `review-${Date.now()}.${photo.format}`);

    // S3에 업로드
    const uploadedUrl = await fileApi.upload(file, 'review');

    // 리뷰 이미지 목록에 추가
    setReviewImages([...reviewImages, uploadedUrl]);
  }
};
```

### 6.5 Push Notifications (푸시 알림)

**파일**: `frontend/src/lib/capacitor/push-notifications.ts`

```typescript
// frontend/src/lib/capacitor/push-notifications.ts
import {
  PushNotifications,
  PushNotificationSchema,
  Token,
  ActionPerformed
} from '@capacitor/push-notifications';
import { isNative, isIOS, handleCapacitorError } from './index';

/**
 * 푸시 알림 초기화 및 권한 요청
 */
export const initializePushNotifications = async (
  onTokenReceived: (token: string) => void,
  onNotificationReceived: (notification: PushNotificationSchema) => void,
  onNotificationAction: (action: ActionPerformed) => void
): Promise<void> => {
  if (!isNative) {
    console.log('푸시 알림은 네이티브 앱에서만 사용 가능합니다.');
    return;
  }

  try {
    // 권한 요청
    let permission = await PushNotifications.checkPermissions();

    if (permission.receive !== 'granted') {
      permission = await PushNotifications.requestPermissions();
    }

    if (permission.receive !== 'granted') {
      console.warn('푸시 알림 권한이 거부되었습니다.');
      return;
    }

    // 푸시 알림 등록
    await PushNotifications.register();

    // 토큰 수신 리스너
    await PushNotifications.addListener('registration', (token: Token) => {
      console.log('푸시 토큰:', token.value);
      onTokenReceived(token.value);
    });

    // 알림 수신 리스너 (앱이 포그라운드일 때)
    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('알림 수신:', notification);
        onNotificationReceived(notification);
      }
    );

    // 알림 클릭 리스너
    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('알림 클릭:', action);
        onNotificationAction(action);
      }
    );

    // iOS 전용: 배지 초기화
    if (isIOS) {
      await PushNotifications.removeAllDeliveredNotifications();
    }
  } catch (error) {
    handleCapacitorError(error);
  }
};

/**
 * 푸시 토큰 백엔드로 전송
 */
export const sendTokenToBackend = async (token: string, userId: number): Promise<void> => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/push/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, userId }),
      credentials: 'include',
    });
  } catch (error) {
    console.error('푸시 토큰 전송 실패:', error);
  }
};

/**
 * 푸시 알림 리스너 제거
 */
export const removePushNotificationListeners = async (): Promise<void> => {
  await PushNotifications.removeAllListeners();
};
```

**사용 예시** (`app/layout.tsx` 또는 `AuthContext`):
```typescript
// frontend/src/app/layout.tsx
import { initializePushNotifications, sendTokenToBackend } from '@/lib/capacitor/push-notifications';
import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    // 푸시 알림 초기화
    initializePushNotifications(
      // 토큰 수신
      async (token) => {
        const user = getCurrentUser();
        if (user) {
          await sendTokenToBackend(token, user.id);
        }
      },
      // 알림 수신 (포그라운드)
      (notification) => {
        // 앱 내 알림 표시
        showInAppNotification(notification.title, notification.body);
      },
      // 알림 클릭
      (action) => {
        // Deep link 처리
        const data = action.notification.data;
        if (data.reservationId) {
          router.push(`/dashboard/reservations/${data.reservationId}`);
        }
      }
    );
  }, []);

  return <html>{children}</html>;
}
```

### 6.6 Preferences (로컬 저장소)

**파일**: `frontend/src/lib/capacitor/preferences.ts`

```typescript
// frontend/src/lib/capacitor/preferences.ts
import { Preferences } from '@capacitor/preferences';
import { handleCapacitorError } from './index';

/**
 * 데이터 저장
 */
export const setPreference = async (key: string, value: any): Promise<void> => {
  try {
    await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  } catch (error) {
    handleCapacitorError(error);
  }
};

/**
 * 데이터 가져오기
 */
export const getPreference = async <T>(key: string): Promise<T | null> => {
  try {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : null;
  } catch (error) {
    handleCapacitorError(error);
    return null;
  }
};

/**
 * 데이터 삭제
 */
export const removePreference = async (key: string): Promise<void> => {
  try {
    await Preferences.remove({ key });
  } catch (error) {
    handleCapacitorError(error);
  }
};

/**
 * 모든 데이터 삭제
 */
export const clearPreferences = async (): Promise<void> => {
  try {
    await Preferences.clear();
  } catch (error) {
    handleCapacitorError(error);
  }
};

/**
 * 모든 키 가져오기
 */
export const getAllPreferenceKeys = async (): Promise<string[]> => {
  try {
    const { keys } = await Preferences.keys();
    return keys;
  } catch (error) {
    handleCapacitorError(error);
    return [];
  }
};
```

**사용 예시** (오프라인 예약 저장):
```typescript
// 예약 정보 오프라인 저장
import { setPreference, getPreference } from '@/lib/capacitor/preferences';

// 저장
await setPreference('my_reservations', reservations);

// 불러오기
const cachedReservations = await getPreference<Reservation[]>('my_reservations');
```

### 6.7 Share (공유 기능)

**파일**: `frontend/src/lib/capacitor/share.ts`

```typescript
// frontend/src/lib/capacitor/share.ts
import { Share } from '@capacitor/share';
import { isNative, handleCapacitorError } from './index';

export interface ShareOptions {
  title: string;
  text: string;
  url: string;
  dialogTitle?: string;
}

/**
 * 콘텐츠 공유
 */
export const shareContent = async (options: ShareOptions): Promise<boolean> => {
  if (!isNative) {
    // 웹 브라우저 Share API 폴백
    if (navigator.share) {
      try {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url,
        });
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('공유 실패:', error);
        }
        return false;
      }
    } else {
      // 공유 불가능 - 링크 복사로 대체
      await navigator.clipboard.writeText(options.url);
      alert('링크가 복사되었습니다.');
      return true;
    }
  }

  try {
    await Share.share({
      title: options.title,
      text: options.text,
      url: options.url,
      dialogTitle: options.dialogTitle || '공유하기',
    });
    return true;
  } catch (error) {
    handleCapacitorError(error);
    return false;
  }
};
```

**사용 예시**:
```typescript
// 캠핑장 공유
import { shareContent } from '@/lib/capacitor/share';

const handleShare = async () => {
  await shareContent({
    title: campground.name,
    text: `${campground.name} - CampStation에서 확인하세요!`,
    url: `https://campstation.com/campground/${campground.id}`,
    dialogTitle: '캠핑장 공유',
  });
};
```

### 6.8 Network (네트워크 상태)

**파일**: `frontend/src/lib/capacitor/network.ts`

```typescript
// frontend/src/lib/capacitor/network.ts
import { Network, ConnectionStatus } from '@capacitor/network';
import { handleCapacitorError } from './index';

/**
 * 현재 네트워크 상태 확인
 */
export const getNetworkStatus = async (): Promise<ConnectionStatus | null> => {
  try {
    return await Network.getStatus();
  } catch (error) {
    handleCapacitorError(error);
    return null;
  }
};

/**
 * 온라인 여부 확인
 */
export const isOnline = async (): Promise<boolean> => {
  const status = await getNetworkStatus();
  return status?.connected ?? navigator.onLine;
};

/**
 * 네트워크 상태 변경 리스너
 */
export const addNetworkListener = (
  callback: (status: ConnectionStatus) => void
): (() => void) => {
  try {
    const listener = Network.addListener('networkStatusChange', callback);

    // 리스너 제거 함수 반환
    return () => {
      listener.remove();
    };
  } catch (error) {
    handleCapacitorError(error);
    return () => {};
  }
};
```

**사용 예시**:
```typescript
// 오프라인 감지
import { addNetworkListener, isOnline } from '@/lib/capacitor/network';
import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // 초기 상태 확인
    isOnline().then(setOnline);

    // 네트워크 변경 감지
    const removeListener = addNetworkListener((status) => {
      setOnline(status.connected);

      if (status.connected) {
        // 온라인 복귀 - 데이터 동기화
        syncOfflineData();
      } else {
        // 오프라인 - 사용자에게 알림
        showOfflineNotice();
      }
    });

    return removeListener;
  }, []);

  return online;
}
```

### 6.9 Status Bar / Keyboard / Haptics

**파일**: `frontend/src/lib/capacitor/ui.ts`

```typescript
// frontend/src/lib/capacitor/ui.ts
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { isNative, isIOS, handleCapacitorError } from './index';

/**
 * Status Bar 설정
 */
export const configureStatusBar = async (options: {
  style: 'light' | 'dark';
  backgroundColor?: string;
}): Promise<void> => {
  if (!isNative) return;

  try {
    await StatusBar.setStyle({
      style: options.style === 'light' ? Style.Light : Style.Dark
    });

    if (options.backgroundColor) {
      await StatusBar.setBackgroundColor({ color: options.backgroundColor });
    }
  } catch (error) {
    handleCapacitorError(error);
  }
};

/**
 * 키보드 숨기기
 */
export const hideKeyboard = async (): Promise<void> => {
  if (!isNative) return;

  try {
    await Keyboard.hide();
  } catch (error) {
    handleCapacitorError(error);
  }
};

/**
 * 햅틱 피드백 (가볍게)
 */
export const hapticLight = async (): Promise<void> => {
  if (!isNative) return;

  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (error) {
    handleCapacitorError(error);
  }
};

/**
 * 햅틱 피드백 (중간)
 */
export const hapticMedium = async (): Promise<void> => {
  if (!isNative) return;

  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (error) {
    handleCapacitorError(error);
  }
};

/**
 * 햅틱 피드백 (강하게)
 */
export const hapticHeavy = async (): Promise<void> => {
  if (!isNative) return;

  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (error) {
    handleCapacitorError(error);
  }
};
```

**사용 예시**:
```typescript
// 앱 시작 시 Status Bar 설정
import { configureStatusBar } from '@/lib/capacitor/ui';

useEffect(() => {
  configureStatusBar({
    style: 'light',
    backgroundColor: '#2563eb', // theme-color와 동일
  });
}, []);

// 버튼 클릭 시 햅틱 피드백
import { hapticLight } from '@/lib/capacitor/ui';

const handleReserve = async () => {
  await hapticLight(); // 터치 피드백
  // 예약 로직...
};
```

---

## 7. 아이콘 및 스플래시 스크린

### 7.1 필요한 이미지

**앱 아이콘**:
- 1024x1024 PNG (마스터 이미지)
- 배경 투명 불가 (iOS 요구사항)

**스플래시 스크린**:
- 2732x2732 PNG (권장)
- 배경색: `#2563eb` (브랜드 컬러)

### 7.2 아이콘 생성 방법

**Option A: 자동 생성 (추천)**

```bash
# cordova-res 설치
npm install -g cordova-res

# 마스터 이미지 준비
# frontend/resources/icon.png (1024x1024)
# frontend/resources/splash.png (2732x2732)

# 모든 플랫폼 아이콘 자동 생성
npx cordova-res ios --skip-config --copy
npx cordova-res android --skip-config --copy
```

**Option B: 수동 생성**

iOS 아이콘 사이즈:
- 20x20, 29x29, 40x40, 58x58, 60x60
- 76x76, 80x80, 87x87, 120x120, 152x152
- 167x167, 180x180, 1024x1024

Android 아이콘 사이즈:
- mdpi: 48x48
- hdpi: 72x72
- xhdpi: 96x96
- xxhdpi: 144x144
- xxxhdpi: 192x192

### 7.3 iOS 아이콘 설정

**파일**: `ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json`

```json
{
  "images": [
    {
      "size": "20x20",
      "idiom": "iphone",
      "filename": "icon-20@2x.png",
      "scale": "2x"
    },
    {
      "size": "20x20",
      "idiom": "iphone",
      "filename": "icon-20@3x.png",
      "scale": "3x"
    },
    // ... (자동 생성 시 자동으로 채워짐)
  ],
  "info": {
    "version": 1,
    "author": "xcode"
  }
}
```

### 7.4 Android 아이콘 설정

자동 생성 시 다음 위치에 배치됨:
```
android/app/src/main/res/
├── mipmap-mdpi/ic_launcher.png
├── mipmap-hdpi/ic_launcher.png
├── mipmap-xhdpi/ic_launcher.png
├── mipmap-xxhdpi/ic_launcher.png
└── mipmap-xxxhdpi/ic_launcher.png
```

### 7.5 스플래시 스크린 설정

**iOS** (`ios/App/App/Assets.xcassets/Splash.imageset/`):
- splash.png
- splash@2x.png
- splash@3x.png

**Android** (`android/app/src/main/res/drawable/`):
- splash.png

**Capacitor 설정** (이미 완료 - `capacitor.config.ts`):
```typescript
SplashScreen: {
  launchShowDuration: 2000,
  backgroundColor: '#2563eb',
  androidSplashResourceName: 'splash',
  showSpinner: false,
}
```

### 7.6 앱 이름 및 버전 설정

**iOS** (`ios/App/App/Info.plist`):
```xml
<key>CFBundleDisplayName</key>
<string>CampStation</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

**Android** (`android/app/build.gradle`):
```gradle
android {
    defaultConfig {
        applicationId "com.campstation.app"
        versionCode 1
        versionName "1.0.0"
    }
}
```

---

## 8. 빌드 및 실행

### 8.1 개발 모드 실행

**iOS (Mac 필요)**:
```bash
# 1. Next.js 빌드
npm run build:export

# 2. Capacitor 동기화
npx cap sync ios

# 3. Xcode 열기
npx cap open ios

# Xcode에서:
# - 시뮬레이터 선택 (iPhone 15 Pro 등)
# - ▶ 버튼 클릭
```

**또는 CLI로 직접 실행**:
```bash
npx cap run ios --target="iPhone 15 Pro"
```

**Android**:
```bash
# 1. Next.js 빌드
npm run build:export

# 2. Capacitor 동기화
npx cap sync android

# 3. Android Studio 열기
npx cap open android

# Android Studio에서:
# - 에뮬레이터 시작 (Pixel 7 등)
# - ▶ 버튼 클릭
```

**또는 CLI로 직접 실행**:
```bash
npx cap run android
```

### 8.2 Live Reload (개발 편의성)

**방법 1: capacitor.config.ts 수정**

```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  // ... 기존 설정
  server: {
    url: 'http://192.168.1.100:3000', // 로컬 IP로 변경
    cleartext: true,
  },
};
```

**방법 2: 명령어로 실행**

```bash
# Next.js 개발 서버 시작
npm run dev

# 로컬 IP 확인
# Windows: ipconfig
# Mac/Linux: ifconfig

# iOS Live Reload 실행
npx cap run ios --livereload --external --host=192.168.1.100

# Android Live Reload 실행
npx cap run android --livereload --external --host=192.168.1.100
```

### 8.3 프로덕션 빌드

**iOS**:
```bash
# 1. Next.js 프로덕션 빌드
NODE_ENV=production npm run build:export

# 2. Capacitor 동기화
npx cap sync ios

# 3. Xcode 열기
npx cap open ios

# Xcode에서:
# 1. Product > Scheme > Edit Scheme
# 2. Run > Build Configuration > Release 선택
# 3. Product > Archive
# 4. Distribute App
```

**Android**:
```bash
# 1. Next.js 프로덕션 빌드
NODE_ENV=production npm run build:export

# 2. Capacitor 동기화
npx cap sync android

# 3. 릴리즈 APK 빌드
cd android
./gradlew assembleRelease

# 또는 AAB (App Bundle) 빌드
./gradlew bundleRelease

# 빌드 결과물:
# APK: android/app/build/outputs/apk/release/app-release-unsigned.apk
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

### 8.4 서명 (Signing)

**iOS 서명**:
- Xcode에서 자동 관리 (Automatic Signing)
- Apple Developer 계정 연결 필요
- Provisioning Profile 자동 생성

**Android 서명**:

```bash
# 1. 키스토어 생성 (최초 1회)
keytool -genkey -v -keystore campstation.keystore -alias campstation -keyalg RSA -keysize 2048 -validity 10000

# 2. android/key.properties 생성
cat > android/key.properties << EOF
storePassword=your-store-password
keyPassword=your-key-password
keyAlias=campstation
storeFile=../campstation.keystore
EOF

# 3. android/app/build.gradle 수정
```

**build.gradle 수정**:
```gradle
// android/app/build.gradle

def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... 기존 설정

    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 9. 배포 준비

### 9.1 iOS App Store 제출

**준비물**:
1. Apple Developer 계정 ($99/년)
2. 앱 아이콘 (1024x1024)
3. 스크린샷 (6.7", 6.5", 5.5" 필수)
4. 앱 설명 (한국어/영어)
5. 개인정보 처리방침 URL
6. 서비스 약관 URL

**제출 절차**:

```bash
# 1. App Store Connect 접속
https://appstoreconnect.apple.com

# 2. "나의 앱" > "+" > "새로운 앱"
- 플랫폼: iOS
- 이름: CampStation
- 기본 언어: 한국어
- 번들 ID: com.campstation.app
- SKU: campstation-ios-001

# 3. 앱 정보 입력
- 카테고리: 여행 > 레저
- 가격: 무료
- 앱 내 구입: 없음 (결제는 웹뷰)

# 4. 빌드 업로드 (Xcode)
- Product > Archive
- Distribute App
- App Store Connect
- Upload

# 5. 심사 제출
- 빌드 선택
- 테스트 정보 입력
- 심사 제출
```

**심사 기간**: 평균 1-3일

### 9.2 Google Play 제출

**준비물**:
1. Google Play 개발자 계정 ($25 일회성)
2. 앱 아이콘 (512x512)
3. 스크린샷 (최소 2장)
4. 배너 이미지 (1024x500)
5. 앱 설명 (한국어/영어)
6. 개인정보 처리방침 URL

**제출 절차**:

```bash
# 1. Google Play Console 접속
https://play.google.com/console

# 2. "앱 만들기"
- 앱 이름: CampStation
- 기본 언어: 한국어
- 앱 또는 게임: 앱
- 무료 또는 유료: 무료

# 3. 스토어 등록정보 작성
- 간단한 설명 (80자)
- 자세한 설명 (4000자)
- 스크린샷 업로드
- 배너 이미지 업로드

# 4. 콘텐츠 등급
- 설문지 작성
- 등급 받기

# 5. 프로덕션 트랙 만들기
- 릴리즈 만들기
- AAB 파일 업로드
- 출시 노트 작성

# 6. 심사 제출
```

**심사 기간**: 평균 1-7일

### 9.3 버전 관리

**버전 체계**: `Major.Minor.Patch` (예: 1.0.0)

**버전 업데이트 시**:

```json
// package.json
{
  "version": "1.0.1"
}
```

```xml
<!-- ios/App/App/Info.plist -->
<key>CFBundleShortVersionString</key>
<string>1.0.1</string>
<key>CFBundleVersion</key>
<string>2</string>  <!-- Build Number: 증가 -->
```

```gradle
// android/app/build.gradle
defaultConfig {
    versionCode 2          // 정수형, 증가
    versionName "1.0.1"    // 표시용
}
```

---

## 10. 트러블슈팅

### 10.1 빌드 오류

**문제**: `Module not found: Can't resolve 'fs'`

**원인**: Node.js 전용 모듈 사용

**해결**:
```typescript
// next.config.ts
webpack: (config) => {
  config.resolve.fallback = {
    fs: false,
    net: false,
    tls: false,
  };
  return config;
}
```

---

**문제**: iOS 빌드 실패 - `Podfile.lock out of sync`

**해결**:
```bash
cd ios/App
pod install --repo-update
```

---

**문제**: Android 빌드 실패 - `SDK not found`

**해결**:
```bash
# ANDROID_HOME 환경변수 확인
echo $ANDROID_HOME

# 설정 안 되어 있으면
export ANDROID_HOME=$HOME/Library/Android/sdk  # Mac
# 또는
export ANDROID_HOME=C:\Users\<username>\AppData\Local\Android\Sdk  # Windows
```

---

### 10.2 런타임 오류

**문제**: 앱이 백엔드 API에 연결 안 됨

**원인**: CORS 설정 부족

**해결**:
```java
// backend: WebConfig.java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "capacitor://localhost",  // iOS
                "http://localhost",        // Android
                "https://campstation.com"  // 웹
            )
            .allowedMethods("*")
            .allowCredentials(true);
    }
}
```

---

**문제**: 카메라 권한 거부 오류

**원인**: Info.plist에 권한 설명 없음

**해결**:
```xml
<!-- ios/App/App/Info.plist -->
<key>NSCameraUsageDescription</key>
<string>리뷰 사진을 촬영하기 위해 카메라 권한이 필요합니다.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>갤러리에서 사진을 선택하기 위해 권한이 필요합니다.</string>
```

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

---

**문제**: 푸시 알림 수신 안 됨

**iOS 해결**:
```bash
# 1. Push Notification Capability 활성화
Xcode > Signing & Capabilities > + Capability > Push Notifications

# 2. Apple Developer Console에서 APNs 키 생성
# 3. Firebase Console에 APNs 키 등록
```

**Android 해결**:
```bash
# 1. google-services.json 추가
android/app/google-services.json

# 2. build.gradle 플러그인 추가
classpath 'com.google.gms:google-services:4.3.15'
```

---

### 10.3 성능 최적화

**문제**: 앱 번들 크기가 너무 큼

**해결**:
```typescript
// next.config.ts
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@mui/material',
    '@mui/icons-material',
  ],
},

// Tree shaking 확인
npm run build:export
du -sh out/  # 크기 확인
```

---

**문제**: 앱 시작 시간이 느림

**해결**:
```typescript
// 1. Dynamic import 사용
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});

// 2. 코드 스플리팅 최적화
// next.config.ts
webpack: (config) => {
  config.optimization.splitChunks = {
    chunks: 'all',
    cacheGroups: {
      default: false,
      vendors: false,
      framework: {
        chunks: 'all',
        name: 'framework',
        test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-sync-external-store)[\\/]/,
        priority: 40,
        enforce: true,
      },
    },
  };
  return config;
}
```

---

## 11. 체크리스트

### 11.1 개발 체크리스트

- [ ] Capacitor 설치 및 초기화
- [ ] iOS/Android 플랫폼 추가
- [ ] next.config.ts 수정 (static export)
- [ ] API URL 수정 (rewrites 제거)
- [ ] 네이티브 플러그인 통합
  - [ ] Geolocation
  - [ ] Camera
  - [ ] Push Notifications
  - [ ] Preferences
  - [ ] Share
  - [ ] Network
- [ ] 아이콘 및 스플래시 스크린
- [ ] iOS 빌드 테스트
- [ ] Android 빌드 테스트
- [ ] 실제 디바이스 테스트

### 11.2 배포 체크리스트

**iOS**:
- [ ] Apple Developer 계정 등록
- [ ] 앱 아이콘 (1024x1024)
- [ ] 스크린샷 (6.7", 6.5", 5.5")
- [ ] 앱 설명 작성
- [ ] 개인정보 처리방침 URL
- [ ] 서비스 약관 URL
- [ ] 프로덕션 빌드
- [ ] TestFlight 베타 테스트
- [ ] App Store 제출

**Android**:
- [ ] Google Play 개발자 계정 등록
- [ ] 앱 아이콘 (512x512)
- [ ] 스크린샷 (최소 2장)
- [ ] 배너 이미지 (1024x500)
- [ ] 앱 설명 작성
- [ ] 개인정보 처리방침 URL
- [ ] 콘텐츠 등급 받기
- [ ] 서명된 AAB 생성
- [ ] 내부 테스트
- [ ] Google Play 제출

---

## 12. 참고 자료

### 12.1 공식 문서

- **Capacitor**: https://capacitorjs.com/docs
- **Next.js Static Export**: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- **iOS Developer**: https://developer.apple.com/documentation/
- **Android Developer**: https://developer.android.com/docs

### 12.2 플러그인 문서

- **Geolocation**: https://capacitorjs.com/docs/apis/geolocation
- **Camera**: https://capacitorjs.com/docs/apis/camera
- **Push Notifications**: https://capacitorjs.com/docs/apis/push-notifications
- **Preferences**: https://capacitorjs.com/docs/apis/preferences

### 12.3 커뮤니티

- **Capacitor Community**: https://github.com/capacitor-community
- **Ionic Forum**: https://forum.ionicframework.com

---

## 13. 다음 단계

1. **개발 환경 구축** (Section 2)
2. **Capacitor 설치** (Section 4)
3. **Next.js 설정 수정** (Section 5)
4. **첫 번째 빌드 시도** (Section 8.1)
5. **네이티브 플러그인 통합** (Section 6)
6. **테스트 및 디버깅**
7. **배포 준비** (Section 9)

---

**작성자**: Claude
**마지막 업데이트**: 2025-10-31
**문서 버전**: 1.0.0
