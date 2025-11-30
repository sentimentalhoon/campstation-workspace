/**
 * API 테스트 스크립트
 * 백엔드 API 연결 및 응답 확인
 */

const BASE_URL = "http://localhost:8080/api";

// ANSI 색상 코드
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url, options = {}) {
  const startTime = Date.now();

  try {
    log(`\n[테스트] ${name}`, "cyan");
    log(`URL: ${url}`, "blue");

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      log(`✓ 성공 (${response.status}) - ${responseTime}ms`, "green");
      console.log(JSON.stringify(data, null, 2));
      return { success: true, data, responseTime };
    } else {
      const errorData = await response.text();
      log(`✗ 실패 (${response.status}) - ${responseTime}ms`, "red");
      console.log(errorData);
      return { success: false, error: errorData, responseTime };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    log(`✗ 에러 - ${responseTime}ms`, "red");
    console.error(error.message);
    return { success: false, error: error.message, responseTime };
  }
}

async function runTests() {
  log("\n=================================================", "yellow");
  log("  CampStation API 테스트", "yellow");
  log("=================================================\n", "yellow");

  const results = [];

  // 1. Health Check
  results.push(
    await testEndpoint("Health Check", "http://localhost:8080/actuator/health")
  );

  // 2. ADMIN 통계 (인증 필요 - 실패 예상)
  results.push(
    await testEndpoint("ADMIN 통계 (인증 없음)", `${BASE_URL}/v1/admin/stats`)
  );

  // 3. 캠핑장 목록 (공개 API)
  results.push(
    await testEndpoint(
      "캠핑장 목록",
      `${BASE_URL}/v1/campgrounds?page=0&size=10`
    )
  );

  // 요약
  log("\n=================================================", "yellow");
  log("  테스트 결과 요약", "yellow");
  log("=================================================\n", "yellow");

  const successCount = results.filter((r) => r.success).length;
  const totalCount = results.length;

  log(
    `성공: ${successCount}/${totalCount}`,
    successCount === totalCount ? "green" : "yellow"
  );

  results.forEach((result, index) => {
    const status = result.success ? "✓" : "✗";
    const color = result.success ? "green" : "red";
    log(`  ${status} 테스트 ${index + 1}: ${result.responseTime}ms`, color);
  });

  log("\n");
}

// 실행
runTests().catch(console.error);
