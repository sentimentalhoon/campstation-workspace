/**
 * 숫자를 한국 원화 형식으로 포맷
 * @example formatKRW(15000) => "15,000원"
 */
export function formatKRW(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

/**
 * 전화번호 포맷
 * @example formatPhoneNumber("01012345678") => "010-1234-5678"
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }

  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }

  return phone;
}

/**
 * 사업자 등록번호 포맷
 * @example formatBusinessNumber("1234567890") => "123-45-67890"
 */
export function formatBusinessNumber(number: string): string {
  const cleaned = number.replace(/\D/g, "");

  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{2})(\d{5})/, "$1-$2-$3");
  }

  return number;
}
