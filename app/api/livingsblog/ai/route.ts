import { NextRequest, NextResponse } from "next/server";

const BASE = "https://job.livingsblog.com/mechanic/";
const MODEL = process.env.HF_MODEL || "Qwen/Qwen3-32B";

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

function sourceUrl(id: string) {
  const url = new URL(BASE);
  url.searchParams.set("job_detail", id);
  return url.toString();
}

const schema = {
  type: "json_schema",
  json_schema: {
    name: "job_offer_extraction",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: ["string", "null"] },
        job: { type: ["string", "null"] },
        industry: { type: ["string", "null"] },
        welding_related: { type: "boolean" },
        location: { type: ["string", "null"] },
        address: { type: ["string", "null"] },
        salary: { type: ["string", "null"] },
        salary_type: { type: ["string", "null"] },
        phone: { type: ["string", "null"] },
        fax: { type: ["string", "null"] },
        experience: { type: ["string", "null"] },
        education: { type: ["string", "null"] },
        contract: { type: ["string", "null"] },
        working_hours: { type: ["string", "null"] },
        working_days: { type: ["string", "null"] },
        accommodation: { type: ["string", "null"] },
        meal: { type: ["string", "null"] },
        visa: { type: ["string", "null"] },
        deadline: { type: ["string", "null"] },
        application_method: { type: ["string", "null"] },
        company: { type: ["string", "null"] },
        summary_fr: { type: ["string", "null"] }
      },
      required: [
        "title", "job", "industry", "welding_related", "location", "address",
        "salary", "salary_type", "phone", "fax", "experience", "education",
        "contract", "working_hours", "working_days", "accommodation", "meal",
        "visa", "deadline", "application_method", "company", "summary_fr"
      ]
    }
  }
};

const systemPrompt = `Tu es un extracteur professionnel d'annonces d'emploi coréennes.
Analyse le texte brut d'une seule annonce et retourne UNIQUEMENT le JSON demandé.

Règles impératives :
- Extrais uniquement les informations réellement présentes dans l'annonce.
- Si une information est absente, ambiguë ou impossible à confirmer, retourne null.
- N'invente jamais de salaire, téléphone, adresse, entreprise, visa ou condition.
- Conserve les numéros de téléphone exactement tels qu'ils apparaissent.
- "팩스" doit être placé dans fax, même si c'est dans la section 담당자 정보.
- Un numéro sous 담당자 정보 peut être un téléphone ou un fax selon son libellé.
- Traduis les valeurs en français de façon courte et naturelle.
- Conserve les noms propres, adresses et noms d'entreprise autant que possible.
- salary_type doit être l'un de : "horaire", "journalier", "mensuel", "annuel", "autre", ou null.
- welding_related=true seulement si l'annonce concerne réellement le soudage, un poste de soudeur ou une activité où le soudage est explicitement demandé.
- summary_fr doit résumer l'annonce en 2 à 4 phrases maximum, sans ajouter d'information absente.
- Ne fais aucune recommandation et ne donne aucun score.`;

export async function GET(req: NextRequest) {
  try {
    const token = process.env.HF_TOKEN;
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "HF_TOKEN n'est pas configuré dans Vercel." },
        { status: 500 }
      );
    }

    const id = new URL(req.url).searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ ok: false, error: "job_detail manquant" }, { status: 400 });
    }

    const source = sourceUrl(id);
    const sourceResponse = await fetch(source, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; JobFinder/1.0)" },
      cache: "no-store",
    });

    if (!sourceResponse.ok) {
      return NextResponse.json(
        { ok: false, error: `Livingsblog HTTP ${sourceResponse.status}` },
        { status: 502 }
      );
    }

    const html = await sourceResponse.text();
    const text = stripHtml(html);

    if (text.length < 80) {
      return NextResponse.json(
        { ok: false, error: "Le contenu de l'annonce est trop court pour être analysé." },
        { status: 422 }
      );
    }

    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Voici le texte brut de l'annonce. Analyse uniquement ce contenu.\\n\\n${text.slice(0, 30000)}`,
          },
        ],
        response_format: schema,
        temperature: 0.1,
        max_tokens: 1400,
        stream: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.error?.message ||
        data?.error ||
        `Hugging Face HTTP ${response.status}`;
      return NextResponse.json({ ok: false, error: String(message) }, { status: 502 });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { ok: false, error: "Le modèle IA n'a pas retourné de données." },
        { status: 502 }
      );
    }

    let result: unknown;
    try {
      result = typeof content === "string" ? JSON.parse(content) : content;
    } catch {
      return NextResponse.json(
        { ok: false, error: "Réponse IA invalide : JSON impossible à lire." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      id,
      source,
      model: MODEL,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erreur IA inconnue" },
      { status: 500 }
    );
  }
}
