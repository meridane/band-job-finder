import type { Job, JobSearchParams, JobSourceAdapter } from "./types";

type SaraminItem = {
  id?: string;
  url?: string;
  company?: { detail?: { name?: string } };
  position?: {
    title?: string;
    location?: { name?: string };
    "job-type"?: { name?: string };
    "experience-level"?: { name?: string };
  };
  salary?: { name?: string };
  "posting-date"?: string;
  "expiration-date"?: string;
  "posting-timestamp"?: number | string;
};

export const saraminAdapter: JobSourceAdapter = {
  source: "saramin",

  async search(params: JobSearchParams): Promise<Job[]> {
    const apiKey = process.env.SARAMIN_API_KEY;
    if (!apiKey) return [];

    const url = new URL("https://oapi.saramin.co.kr/job-search");
    url.searchParams.set("access-key", apiKey);
    url.searchParams.set("keywords", [params.keyword, params.location].filter(Boolean).join(" "));
    url.searchParams.set("output", "json");
    url.searchParams.set("fields", "posting-date,expiration-date");
    url.searchParams.set("count", String(Math.min(params.limit ?? 50, 110)));

    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Saramin API error: ${response.status}`);
    }

    const data = await response.json();
    const items: SaraminItem[] = data?.jobs?.job ?? [];

    return items.map((item) => ({
      source: "saramin",
      sourceJobId: String(item.id ?? ""),
      sourceUrl: item.url ?? null,
      title: item.position?.title ?? "제목 없음",
      company: item.company?.detail?.name ?? null,
      location: item.position?.location?.name ?? null,
      salary: item.salary?.name ?? null,
      employmentType: item.position?.["job-type"]?.name ?? null,
      experience: item.position?.["experience-level"]?.name ?? null,
      publishedAt: item["posting-date"] ?? null,
      deadline: item["expiration-date"] ?? null,
      raw: item
    }));
  }
};
