import type { Job, JobSearchParams, JobSourceAdapter } from "./types";

type SaraminItem = {
  id?: string;
  url?: string;
  position?: { title?: string };
  company?: { detail?: { name?: string } };
  job?: { location?: { name?: string }; experience?: { name?: string }; job_type?: { name?: string } };
  salary?: { name?: string };
  posting?: { timestamp?: string; end?: string };
};

export const saraminAdapter: JobSourceAdapter = {
  source: "saramin",

  async search(params: JobSearchParams): Promise<Job[]> {
    const apiKey = process.env.SARAMIN_API_KEY;
    if (!apiKey) return [];

    const url = new URL("https://oapi.saramin.co.kr/job-search");
    url.searchParams.set("access-key", apiKey);
    url.searchParams.set("output", "json");
    url.searchParams.set("count", String(params.limit ?? 50));

    if (params.keyword) url.searchParams.set("keywords", params.keyword);
    if (params.location) url.searchParams.set("loc_cd", params.location);

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Saramin API error: ${response.status}`);

    const data = await response.json();
    const items: SaraminItem[] = data?.jobs?.job ?? [];

    return items.map((item) => ({
      source: "saramin",
      sourceJobId: String(item.id ?? crypto.randomUUID()),
      sourceUrl: item.url ?? null,
      title: item.position?.title ?? "제목 없음",
      company: item.company?.detail?.name ?? null,
      location: item.job?.location?.name ?? null,
      salary: item.salary?.name ?? null,
      employmentType: item.job?.job_type?.name ?? null,
      experience: item.job?.experience?.name ?? null,
      publishedAt: item.posting?.timestamp ?? null,
      deadline: item.posting?.end ?? null,
      raw: item
    }));
  }
};
