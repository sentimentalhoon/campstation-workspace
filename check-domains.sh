#!/bin/bash
# 도메인 사용 가능 여부 빠른 확인 스크립트

domains=(
  "mycamp.com"
  "campzone.com"
  "campfind.com"
  "camphere.com"
  "campgo.com"
  "campstation.kr"
  "campstation.app"
  "campstation.co"
  "camply.com"
  "campster.com"
)

echo "도메인 사용 가능 여부 확인 중..."
echo "================================"

for domain in "${domains[@]}"; do
  if whois "$domain" 2>/dev/null | grep -q "No match\|NOT FOUND\|available"; then
    echo "✅ $domain - 사용 가능"
  else
    echo "❌ $domain - 사용 중"
  fi
done
