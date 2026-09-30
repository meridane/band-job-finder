import { NextRequest, NextResponse } from "next/server";

const BASE = "https://job.livingsblog.com/mechanic/";

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>|<\/div>|<\/li>|<\/tr>|<\/td>|<\/h[1-6]>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function absUrl(id: string) {
  const u = new URL(BASE);
  u.searchParams.set("job_detail", id);
  return u.toString();
}

const labels: Record<string, string> = {
  "업종": "Secteur d'activité",
  "사업내용": "Activité de l'entreprise",
  "근무지": "Lieu de travail",
  "근무지역": "Région",
  "주소": "Adresse",
  "모집직종": "Poste recherché",
  "모집분야": "Domaine",
  "급여": "Salaire",
  "월급": "Salaire mensuel",
  "일급": "Salaire journalier",
  "시급": "Salaire horaire",
  "연봉": "Salaire annuel",
  "근무시간": "Horaires",
  "근무요일": "Jours de travail",
  "고용형태": "Type de contrat",
  "경력": "Expérience",
  "학력": "Niveau d'études",
  "자격요건": "Conditions / qualifications",
  "우대사항": "Profil recherché",
  "복리후생": "Avantages",
  "사업내용": "Activité",
  "담당자 정보": "Informations du responsable",
  "전화": "Téléphone",
  "연락처": "Contact",
  "휴대폰": "Téléphone mobile",
  "휴대전화": "Téléphone mobile",
  "핸드폰": "Téléphone mobile",
  "팩스": "Fax",
  "전화번호": "Téléphone",
  "자본금": "Capital",
  "연매출액": "Chiffre d'affaires annuel",
};

const replacements: Array<[RegExp, string]> = [
  [/용접사/g, "Soudeur"], [/용접공/g, "Soudeur"], [/용접/g, "Soudage"],
  [/조선소/g, "Chantier naval"], [/선박/g, "Navire"], [/알곤/g, "TIG / Argon"],
  [/CO2/g, "CO₂"], [/배관용접/g, "Soudage de tuyauterie"], [/배관/g, "Tuyauterie"],
  [/철골/g, "Structure métallique"], [/기계/g, "Mécanique"], [/제조/g, "Fabrication"],
  [/생산/g, "Production"], [/공장/g, "Usine"], [/건설/g, "Construction"],
  [/정규직/g, "CDI / poste permanent"], [/계약직/g, "Contrat"], [/주5일/g, "5 jours/semaine"],
  [/주6일/g, "6 jours/semaine"], [/주말근무/g, "Travail le week-end"],
  [/경력무관/g, "Expérience non exigée"], [/초보가능/g, "Débutant accepté"],
  [/협의/g, "À négocier"], [/퇴직금/g, "Indemnité de départ"],
  [/식사제공/g, "Repas fourni"], [/숙소제공/g, "Logement fourni"],
  [/출퇴근/g, "Trajet domicile-travail"], [/면접/g, "Entretien"],
];

function fr(value: string) {
  let out = value;
  for (const [re, replacement] of replacements) out = out.replace(re, replacement);
  return out;
}

function findField(text: string, key: string) {
  const re = new RegExp(key + "\\s*[:：]?\\s*([^\\n]{1,180})", "i");
  const m = text.match(re);
  return m ? m[1].trim() : "";
}

function extractContact(text: string) {
  const marker = text.indexOf("담당자 정보");
  if (marker < 0) return { number: "", label: "" };
  const block = text.slice(marker, marker + 700);
  const m = block.match(/(전화번호|전화|연락처|휴대폰|휴대전화|핸드폰|팩스)?\s*[:：]?\s*(0\d{1,2}[ -]?\d{3,4}[ -]?\d{4})/);
  return m ? { number: m[2], label: m[1] || "담당자 연락처" } : { number: "", label: "" };
}

export async function GET(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id")?.trim();
    if (!id) return NextResponse.json({ ok: false, error: "job_detail manquant" }, { status: 400 });

    const url = absUrl(id);
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; JobFinder/1.0)" },
      cache: "no-store",
    });
    if (!response.ok) {
      return NextResponse.json({ ok: false, error: `Livingsblog HTTP ${response.status}` }, { status: 502 });
    }

    const html = await response.text();
    const text = stripHtml(html);
    const titleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i) || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? stripHtml(titleMatch[1]) : "Offre Livingsblog";
    const contact = extractContact(text);

    const fieldKeys = ["업종","사업내용","근무지","근무지역","주소","모집직종","모집분야","급여","월급","일급","시급","연봉","근무시간","근무요일","고용형태","경력","학력","자격요건","우대사항","복리후생","자본금","연매출액"];
    const fields = fieldKeys.map(key => ({ key, label: labels[key] || key, value: findField(text, key) })).filter(x => x.value);

    return NextResponse.json({
      ok: true,
      id,
      url,
      title: fr(title),
      titleOriginal: title,
      contact: contact.number ? { number: contact.number, type: labels[contact.label] || contact.label } : null,
      fields: fields.map(x => ({ ...x, valueFr: fr(x.value), valueOriginal: x.value })),
      descriptionFr: fr(text),
      descriptionOriginal: text,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Erreur inconnue" }, { status: 500 });
  }
}
