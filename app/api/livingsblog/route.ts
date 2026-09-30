import { NextRequest, NextResponse } from "next/server";

const BASE = "https://job.livingsblog.com/mechanic/";

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

function extractContactInfo(text: string) {
  const marker = text.indexOf("담당자 정보");
  if (marker < 0) return { contactNumber: "", contactLabel: "" };

  // 담당자 정보 영역 자체를 우선 사용합니다.
  // "팩스"라고 적혀 있어도 번호를 버리지 않고 label과 함께 보존합니다.
  const block = text.slice(marker, marker + 800);
  const match = block.match(/(전화|연락처|휴대폰|휴대전화|핸드폰|팩스|전화번호)?\s*[:：]?\s*(0\d{1,2}[ -]?\d{3,4}[ -]?\d{4})/);
  if (!match) return { contactNumber: "", contactLabel: "" };

  return {
    contactNumber: match[2],
    contactLabel: match[1] || "담당자 연락처",
  };
}

async function fetchDetailContact(url: string) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; JobFinder/1.0)" },
      cache: "no-store",
    });
    if (!response.ok) return { contactNumber: "", contactLabel: "" };

    const detailHtml = await response.text();
    return extractContactInfo(stripHtml(detailHtml));
  } catch {
    return { contactNumber: "", contactLabel: "" };
  }
}

async function parseJobs(html: string, keyword: string, region: string) {
  const jobs: Array<Record<string, string>> = [];
  const seen = new Set<string>();
  const linkRe = /<a\b[^>]*href=["']([^"']*job_detail=([^&"'#]+)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;

  while ((m = linkRe.exec(html))) {
    const href = absUrl(m[1]);
    const id = decodeURIComponent(m[2]);
    if (!id || seen.has(id)) continue;
    seen.add(id);

    const title = stripHtml(m[3]);
    const context = stripHtml(html.slice(Math.max(0, m.index - 1800), Math.min(html.length, linkRe.lastIndex + 1800)));

    const phone = (context.match(/01[0-9][ -]?\d{3,4}[ -]?\d{4}/) || [""])[0];
    const salary = (context.match(/(?:월급|일급|시급|연봉|급여)[^<]{0,80}/) || [""])[0].replace(/\s+/g, " ").trim();
    const address = (context.match(/(?:근무지|근무지역|주소)[^<]{0,100}/) || [""])[0].replace(/\s+/g, " ").trim();

    jobs.push({
      id,
      title: title || "Livingsblog 채용공고",
      phone,
      salary,
      address,
      keyword,
      region,
      url: href,
    });
  }
  const limited = jobs.slice(0, 30);
  const enriched = await Promise.all(
    limited.map(async (job) => {
      const contact = await fetchDetailContact(job.url);
      return {
        ...job,
        phone: contact.contactNumber || job.phone,
        contactLabel: contact.contactLabel || (job.phone ? "휴대폰" : ""),
      };
    })
  );

  return enriched;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get("keyword") || "";
    const region = searchParams.get("region") || "26000";
    const sourceUrl = new URL(BASE);
    if (keyword) sourceUrl.searchParams.set("job_keyword", keyword);
    if (region) sourceUrl.searchParams.set("job_region", region);

    const response = await fetch(sourceUrl.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; JobFinder/1.0)" },
      cache: "no-store",
    });
    if (!response.ok) {
      return NextResponse.json({ ok: false, error: `Livingsblog HTTP ${response.status}`, url: sourceUrl.toString() }, { status: 502 });
    }

    const html = await response.text();
    const jobs = await parseJobs(html, keyword, region);
    return NextResponse.json({ ok: true, source: "livingsblog", url: sourceUrl.toString(), count: jobs.length, jobs });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
