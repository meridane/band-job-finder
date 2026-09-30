import { NextRequest, NextResponse } from "next/server";

const BASE = "https://job.livingsblog.com/mechanic/";
const REGION = "26000";

// Tous les termes coréens courants qui peuvent signaler un poste de soudage
// ou un métier industriel directement lié au soudage.
const WELDING_KEYWORDS = [
  "용접", "용접공", "용접사", "용접원", "용접기능사", "용접기",
  "CO2용접", "CO2용접공", "CO2용접사", "CO2",
  "알곤", "알곤용접", "알곤용접공", "TIG", "MIG",
  "아크용접", "전기용접", "특수용접", "특수용접공",
  "배관용접", "배관용접공", "배관", "파이프용접",
  "조선용접", "선박용접", "조선소", "선박",
  "취부", "취부사", "제관", "제관사", "철골용접",
  "금속용접", "금속가공", "용접기능공", "용접기사",
];

const TITLE_TRANSLATIONS: Array<[RegExp, string]> = [
  [/현장직\s*사원\s*모집/g, "Recrutement d'ouvrier de terrain"],
  [/용접기능사/g, "Soudeur qualifié"],
  [/용접기능공/g, "Soudeur qualifié"],
  [/용접공/g, "Soudeur"],
  [/용접사/g, "Soudeur"],
  [/용접원/g, "Soudeur"],
  [/용접기/g, "Soudage"],
  [/용접/g, "Soudage"],
  [/알곤용접/g, "Soudage TIG / Argon"],
  [/알곤/g, "TIG / Argon"],
  [/CO2용접/g, "Soudage CO₂"],
  [/CO2/g, "CO₂"],
  [/TIG/gi, "TIG"],
  [/MIG/gi, "MIG"],
  [/아크용접/g, "Soudage à l'arc"],
  [/전기용접/g, "Soudage électrique"],
  [/특수용접/g, "Soudage spécialisé"],
  [/배관용접/g, "Soudage de tuyauterie"],
  [/배관/g, "Tuyauterie"],
  [/파이프용접/g, "Soudage de tuyauterie"],
  [/조선용접/g, "Soudage naval"],
  [/선박용접/g, "Soudage naval"],
  [/조선소/g, "Chantier naval"],
  [/선박/g, "Navire"],
  [/취부사/g, "Monteur / ajusteur"],
  [/취부/g, "Montage / ajustage"],
  [/제관사/g, "Chaudronnier"],
  [/제관/g, "Chaudronnerie"],
  [/철골용접/g, "Soudage de structures métalliques"],
  [/금속용접/g, "Soudage métallique"],
  [/금속가공/g, "Travail des métaux"],
  [/모집/g, "Recrutement"],
  [/채용/g, "Recrutement"],
  [/구합니다/g, "Recherche"],
  [/사원/g, "Employé"],
  [/보조업무/g, "Travail d'assistance"],
  [/서비스센터/g, "Centre de service"],
  [/현장직/g, "Travail sur site"],
  [/주간/g, "Équipe de jour"],
  [/야간/g, "Équipe de nuit"],
  [/급구/g, "Urgent"],
  [/가능자/g, "Profil accepté"],
  [/경력무관/g, "Expérience non exigée"],
];

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function absUrl(href: string) {
  if (!href) return "";
  if (href.startsWith("http")) return href;
  return new URL(href, BASE).toString();
}

function titleFr(title: string) {
  let out = title;
  for (const [re, replacement] of TITLE_TRANSLATIONS) out = out.replace(re, replacement);
  return out.replace(/\s+/g, " ").replace(/\s*[/|]+\s*/g, " / ").trim();
}

function extractContactInfo(text: string) {
  const marker = text.indexOf("담당자 정보");
  if (marker < 0) return { contactNumber: "", contactLabel: "" };
  const block = text.slice(marker, marker + 800);
  const match = block.match(/(전화|연락처|휴대폰|휴대전화|핸드폰|팩스|전화번호)?\s*[:：]?\s*(0\d{1,2}[ -]?\d{3,4}[ -]?\d{4})/);
  if (!match) return { contactNumber: "", contactLabel: "" };
  return { contactNumber: match[2], contactLabel: match[1] || "담당자 연락처" };
}

async function fetchDetailContact(url: string) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; JobFinder/1.0)" },
      cache: "no-store",
    });
    if (!response.ok) return { contactNumber: "", contactLabel: "" };
    return extractContactInfo(stripHtml(await response.text()));
  } catch {
    return { contactNumber: "", contactLabel: "" };
  }
}

async function fetchKeyword(keyword: string) {
  const sourceUrl = new URL(BASE);
  sourceUrl.searchParams.set("job_keyword", keyword);
  sourceUrl.searchParams.set("job_region", REGION);

  const response = await fetch(sourceUrl.toString(), {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; JobFinder/1.0)" },
    cache: "no-store",
  });
  if (!response.ok) return [];

  const html = await response.text();
  const jobs: Array<Record<string, string>> = [];
  const linkRe = /<a\b[^>]*href=["']([^"']*job_detail=([^&"'#]+)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;

  while ((m = linkRe.exec(html))) {
    const href = absUrl(m[1]);
    const id = decodeURIComponent(m[2]);
    if (!id) continue;

    const title = stripHtml(m[3]);
    const lower = title.toLowerCase();
    const relevant = WELDING_KEYWORDS.some(k => lower.includes(k.toLowerCase()));
    if (!relevant) continue;

    const context = stripHtml(html.slice(Math.max(0, m.index - 1800), Math.min(html.length, linkRe.lastIndex + 1800)));
    const salary = (context.match(/(?:월급|일급|시급|연봉|급여)[^<]{0,80}/) || [""])[0].replace(/\s+/g, " ").trim();

    jobs.push({
      id,
      title,
      titleFr: titleFr(title),
      phone: "",
      salary,
      address: "",
      keyword,
      region: REGION,
      url: href,
    });
  }

  return jobs;
}

export async function GET(_req: NextRequest) {
  try {
    const batches = await Promise.all(WELDING_KEYWORDS.map(fetchKeyword));
    const byId = new Map<string, Record<string, string>>();

    for (const jobs of batches) {
      for (const job of jobs) {
        if (!byId.has(job.id)) byId.set(job.id, job);
      }
    }

    const limited = Array.from(byId.values()).slice(0, 30);
    const enriched = await Promise.all(
      limited.map(async job => {
        const contact = await fetchDetailContact(job.url);
        return {
          ...job,
          phone: contact.contactNumber,
          contactLabel: contact.contactLabel,
        };
      })
    );

    return NextResponse.json({
      ok: true,
      source: "livingsblog",
      region: REGION,
      filter: "welding",
      keywords: WELDING_KEYWORDS,
      count: enriched.length,
      jobs: enriched,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
