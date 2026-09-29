export const JOB_KEYWORDS = [
  "용접사", "용접", "알곤용접", "알곤", "TIG", "티그",
  "CO2용접", "CO2", "배관용접", "배관", "조선소",
  "플랜트", "제관용접", "제관", "철골용접", "잡철용접",
  "용접 기공", "용접 준기공", "용접 기술자"
] as const;

export const LOCATION_KEYWORDS = [
  "울산", "거제", "부산", "김해", "창원", "포항",
  "평택", "아산", "천안", "인천", "시흥", "안산", "김천"
] as const;

const phonePatterns = [
  /01[016789][ -]?\d{3,4}[ -]?\d{4}/g,
  /01[016789]\d{7,8}/g
];

export type ParsedJob = {
  isRelevant: boolean;
  matchedKeywords: string[];
  locations: string[];
  phones: string[];
  salary: string | null;
};

export function parseBandPost(text: string): ParsedJob {
  const source = text || "";
  const normalized = source.replace(/[\u2010-\u2015]/g, "-");
  const lower = normalized.toLowerCase();

  const matchedKeywords = JOB_KEYWORDS.filter((keyword) =>
    lower.includes(keyword.toLowerCase())
  );

  const locations = LOCATION_KEYWORDS.filter((location) =>
    normalized.includes(location)
  );

  const phones = Array.from(
    new Set(
      phonePatterns.flatMap((pattern) => normalized.match(pattern) || [])
        .map((phone) => phone.replace(/[^0-9]/g, ""))
        .filter((phone) => phone.length >= 10 && phone.length <= 11)
        .map((phone) =>
          phone.length === 11
            ? `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`
            : `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`
        )
    )
  );

  // Handles formats such as:
  // 일당160,000원~240,000원
  // 일당 160,000원 ~ 240,000원
  // 월급 350만원
  // 시급 13,000원
  const salaryRegex =
    /(?:일당|일급|급여|월급|시급|단가|급여조건)\s*[:：]?\s*\d{1,3}(?:,\d{3})*(?:\s*(?:원|만원))?(?:\s*[~〜-]\s*\d{1,3}(?:,\d{3})*(?:\s*(?:원|만원))?)?/i;

  const directAmountRegex =
    /\b\d{1,3}(?:,\d{3})+(?:\s*(?:원|만원))?\b/;

  const salaryMatch = normalized.match(salaryRegex);
  const salary = salaryMatch
    ? salaryMatch[0].trim()
    : normalized.match(directAmountRegex)?.[0]?.trim() ?? null;

  return {
    isRelevant: matchedKeywords.length > 0,
    matchedKeywords,
    locations,
    phones,
    salary
  };
}
