# 보안 가이드

> CampStation 보안 구현 및 Best Practices

## 📋 개요

본 문서는 CampStation 프론트엔드의 보안 구현 사항과
개발 시 준수해야 할 보안 Best Practices를 설명합니다.

---

## 🛡️ 구현된 보안 기능

### 1. Input Sanitization

**파일**: `lib/security/sanitize.ts`

사용자 입력값을 정제하여 XSS(Cross-Site Scripting) 공격을 방지합니다.

#### 주요 함수

```typescript
// HTML 태그 제거
sanitizeHtml("<script>alert('xss')</script>Hello");
// → "Hello"

// HTML 엔티티 변환
escapeHtml("<script>");
// → "&lt;script&gt;"

// 텍스트 정제 (HTML 태그 제거 + trim)
sanitizeText("  <b>Hello</b>  ", 10);
// → "Hello"

// 파일명 정제
sanitizeFilename("../../etc/passwd");
// → "etcpasswd"
```

#### 검증 함수

```typescript
// XSS 패턴 검사
hasXssPattern("<script>alert('xss')</script>");
// → true

// SQL Injection 패턴 검사
hasSqlInjectionPattern("SELECT * FROM users WHERE id=1");
// → true

// 이메일 검증
isValidEmail("user@example.com");
// → true

// URL 검증
isValidUrl("https://example.com");
// → true

// 전화번호 검증 (한국)
isValidPhoneNumber("010-1234-5678");
// → true
```

### 2. XSS 방지 검증

**파일**: `lib/security/validation.ts`

고급 XSS 방지 및 데이터 검증 함수들을 제공합니다.

#### 허용된 HTML 태그만 유지

```typescript
sanitizeAllowedHtml("<b>Bold</b> <script>alert('xss')</script>");
// → "<b>Bold</b> "
```

#### URL 안전성 검증

```typescript
validateUrlSafety("https://example.com", ["example.com"]);
// → { isValid: true, message: "" }

validateUrlSafety("javascript:alert('xss')");
// → { isValid: false, message: "허용되지 않는 URL 스킴입니다" }
```

#### 파일 업로드 검증

```typescript
validateFileUpload(file, {
  allowedTypes: ["image/jpeg", "image/png"],
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedExtensions: ["jpg", "jpeg", "png"],
});
```

#### 민감한 데이터 마스킹

```typescript
maskSensitiveData("user@example.com", "email");
// → "u***@example.com"

maskSensitiveData("010-1234-5678", "phone");
// → "010-****-5678"
```

### 3. 보안 강화 Form Hook

**파일**: `hooks/security/useSecureForm.ts`

입력값 정제 및 검증이 자동으로 적용되는 Form Hook입니다.

#### 기본 사용법

```typescript
const { values, errors, handleChange, handleSubmit, isSubmitting } = useSecureForm(
  { email: "", password: "" },
  {
    email: {
      required: true,
      email: true,
      message: "이메일을 입력해주세요"
    },
    password: {
      required: true,
      minLength: 8,
      message: "비밀번호를 입력해주세요"
    },
  }
);

<form onSubmit={handleSubmit(async (data) => {
  // data는 이미 정제되고 검증된 데이터
  await login(data);
})}>
  <input
    name="email"
    value={values.email}
    onChange={handleChange}
    onBlur={handleBlur}
  />
  {errors.email && <span className="text-red-500">{errors.email}</span>}

  <input
    type="password"
    name="password"
    value={values.password}
    onChange={handleChange}
    onBlur={handleBlur}
  />
  {errors.password && <span className="text-red-500">{errors.password}</span>}

  <button type="submit" disabled={isSubmitting}>
    로그인
  </button>
</form>
```

#### 검증 규칙

```typescript
type ValidationRule = {
  required?: boolean; // 필수 입력
  minLength?: number; // 최소 길이
  maxLength?: number; // 최대 길이
  email?: boolean; // 이메일 형식
  custom?: (value: string) => string | undefined; // 커스텀 검증
  message?: string; // 에러 메시지
};
```

#### 커스텀 검증

```typescript
const { values, errors, handleChange, handleSubmit } = useSecureForm(
  { username: "" },
  {
    username: {
      required: true,
      minLength: 3,
      maxLength: 20,
      custom: (value) => {
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return "영문, 숫자, 언더스코어만 사용 가능합니다";
        }
      },
    },
  }
);
```

### 4. Next.js 보안 헤더

**파일**: `next.config.ts`

HTTP 응답 헤더를 통한 보안 강화를 설정했습니다.

#### 설정된 보안 헤더

```javascript
{
  // XSS 보호
  "X-XSS-Protection": "1; mode=block",

  // 클릭재킹 방지
  "X-Frame-Options": "SAMEORIGIN",

  // MIME 타입 스니핑 방지
  "X-Content-Type-Options": "nosniff",

  // Referrer 정책
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Permissions Policy (카메라, 마이크 등 제한)
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",

  // Content Security Policy
  "Content-Security-Policy": "..."
}
```

#### CSP (Content Security Policy)

```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: http: https:;
connect-src 'self' http://localhost:* https://localhost:*;
frame-ancestors 'self';
base-uri 'self';
form-action 'self';
```

---

## 🚀 사용 가이드

### Form 보안 강화

#### Before (보안 취약)

```typescript
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ❌ 입력값 검증 없음
    // ❌ XSS 공격 가능
    await login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {/* ... */}
    </form>
  );
}
```

#### After (보안 강화)

```typescript
function LoginForm() {
  const { values, errors, handleChange, handleSubmit, isSubmitting } = useSecureForm(
    { email: "", password: "" },
    {
      email: { required: true, email: true },
      password: { required: true, minLength: 8 },
    }
  );

  return (
    <form onSubmit={handleSubmit(async (data) => {
      // ✅ data는 자동으로 정제되고 검증됨
      await login(data);
    })}>
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
      />
      {errors.email && <span>{errors.email}</span>}
      {/* ... */}
    </form>
  );
}
```

### 사용자 입력 처리

```typescript
// ❌ Bad: 직접 사용
function CommentForm() {
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    await saveComment({ content: comment }); // XSS 위험
  };
}

// ✅ Good: sanitize 후 사용
import { sanitizeText, validateInput } from "@/lib/security/sanitize";

function CommentForm() {
  const [comment, setComment] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const sanitized = sanitizeText(e.target.value);
    setComment(sanitized);
  };

  const handleSubmit = async () => {
    const validation = validateInput(comment);
    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    await saveComment({ content: comment });
  };
}
```

### URL 검증

```typescript
// ❌ Bad: URL 검증 없이 리다이렉트
function handleRedirect(url: string) {
  window.location.href = url; // javascript:alert('xss') 가능
}

// ✅ Good: URL 검증 후 리다이렉트
import { validateUrlSafety } from "@/lib/security/validation";

function handleRedirect(url: string) {
  const validation = validateUrlSafety(url);
  if (!validation.isValid) {
    toast.error("올바르지 않은 URL입니다");
    return;
  }

  window.location.href = url;
}
```

### 파일 업로드

```typescript
import { validateFileUpload } from "@/lib/security/validation";
import { sanitizeFilename } from "@/lib/security/sanitize";

function FileUpload() {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 검증
    const validation = validateFileUpload(file, {
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    });

    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    // 파일명 정제
    const safeName = sanitizeFilename(file.name);

    // 업로드 진행
    uploadFile(file, safeName);
  };

  return <input type="file" onChange={handleFileChange} accept="image/*" />;
}
```

---

## 📐 보안 Best Practices

### 1. 항상 입력값 검증

```typescript
// ✅ Good
const handleSubmit = async (data: FormData) => {
  // 1. 클라이언트 검증
  const validation = validateInput(data.comment);
  if (!validation.isValid) {
    toast.error(validation.message);
    return;
  }

  // 2. 서버로 전송 (서버에서도 다시 검증)
  await api.post("/comments", data);
};
```

### 2. React의 기본 보안 활용

```typescript
// ✅ Good: React가 자동으로 이스케이프
<div>{userInput}</div>

// ⚠️ Caution: dangerouslySetInnerHTML 사용 시 주의
<div
  dangerouslySetInnerHTML={{
    __html: sanitizeAllowedHtml(richText) // 반드시 정제 후 사용
  }}
/>
```

### 3. API 응답 검증

```typescript
// ✅ Good
const fetchData = async () => {
  const response = await api.get("/data");

  // API 응답도 검증
  if (response.data.url) {
    const validation = validateUrlSafety(response.data.url);
    if (!validation.isValid) {
      throw new Error("Invalid URL from API");
    }
  }

  return response.data;
};
```

### 4. 민감한 정보 마스킹

```typescript
import { maskSensitiveData } from "@/lib/security/validation";

function UserProfile({ user }: { user: User }) {
  return (
    <div>
      <p>이메일: {maskSensitiveData(user.email, "email")}</p>
      <p>전화번호: {maskSensitiveData(user.phone, "phone")}</p>
    </div>
  );
}
```

### 5. HTTPS 사용

```typescript
// ✅ Good: 프로덕션에서는 항상 HTTPS
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.campstation.com"
    : "http://localhost:8080";
```

---

## 🔒 보안 체크리스트

### Form 입력

- [ ] useSecureForm Hook 사용
- [ ] 입력값 정제 (sanitizeText)
- [ ] XSS 패턴 검증 (validateInput)
- [ ] 필수 입력 검증
- [ ] 길이 제한 검증
- [ ] 이메일/전화번호 형식 검증

### URL 처리

- [ ] URL 검증 (validateUrlSafety)
- [ ] 허용된 프로토콜만 사용 (http, https)
- [ ] 외부 리다이렉트 시 경고 표시

### 파일 업로드

- [ ] 파일 타입 검증 (allowedTypes)
- [ ] 파일 크기 제한 (maxSize)
- [ ] 파일 확장자 검증 (allowedExtensions)
- [ ] 파일명 정제 (sanitizeFilename)

### API 통신

- [ ] HTTPS 사용 (프로덕션)
- [ ] HttpOnly 쿠키 사용 (인증 토큰)
- [ ] API 응답 검증
- [ ] 에러 메시지에 민감한 정보 미포함

### 코드 작성

- [ ] React 기본 이스케이프 활용
- [ ] dangerouslySetInnerHTML 최소화
- [ ] 민감한 정보 마스킹
- [ ] 환경변수 사용 (API 키, 토큰)

---

## 🐛 알려진 제한사항

### 1. React의 XSS 보호

React는 기본적으로 XSS를 방지하지만, 다음 경우에는 주의가 필요합니다:

```typescript
// ⚠️ 주의 필요
<div dangerouslySetInnerHTML={{ __html: userInput }} />
<a href={userInput}>Link</a>
```

### 2. 서버 검증 필수

클라이언트 검증은 보조 수단이며, **서버에서 반드시 재검증**해야 합니다.

### 3. CSP와 개발 모드

Next.js 개발 모드에서는 `'unsafe-eval'`, `'unsafe-inline'`이 필요합니다.
프로덕션에서는 더 엄격한 CSP를 적용할 수 있습니다.

---

## 📚 참고 문서

### 내부 문서

- `/docs/technical/UX-IMPROVEMENTS.md` - UX 개선 작업
- `/docs/technical/02-CODING-CONVENTIONS.md` - 코딩 컨벤션
- `/docs/technical/04-API-GUIDE.md` - API 가이드

### 외부 문서

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security](https://react.dev/learn/keeping-components-pure#detecting-impure-calculations-with-strict-mode)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

---

## 🔜 향후 개선 사항

### P1 (높은 우선순위)

- [ ] Rate Limiting (요청 제한)
- [ ] CSRF 토큰 서버 검증
- [ ] Subresource Integrity (SRI)

### P2 (중간 우선순위)

- [ ] 보안 이벤트 로깅
- [ ] 자동 보안 스캔 (npm audit)
- [ ] 정기적인 의존성 업데이트

### P3 (낮은 우선순위)

- [ ] 보안 테스트 자동화
- [ ] 보안 대시보드
- [ ] 침투 테스트

---

**작성일**: 2025-11-11  
**버전**: 1.0.0  
**상태**: ✅ 완료
