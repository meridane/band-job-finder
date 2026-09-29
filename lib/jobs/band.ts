import type { Job, JobSearchParams, JobSourceAdapter } from "./types";
import { parseBandPost } from "../band-parser";

type BandPost = {
  post_key?: string;
  content?: string;
  created_at?: string;
  url?: string;
  photos?: Array<{ url?: string }>;
};

export function normalizeBandPost(post: BandPost): Job | null {
  const text = post.content ?? "";
  const parsed = parseBandPost(text);

  if (!parsed.isRelevant && parsed.phones.length === 0) return null;

  return {
    source: "band",
    sourceJobId: String(post.post_key ?? ""),
    sourceUrl: post.url ?? null,
    title: parsed.matchedKeywords.slice(0, 3).join(" · ") || "BAND 구인공고",
    location: parsed.locations[0] ?? null,
    description: text,
    salary: parsed.salary,
    contactPhone: parsed.phones[0] ?? null,
    images: (post.photos ?? []).map((photo) => photo.url).filter((url): url is string => Boolean(url)),
    publishedAt: post.created_at ?? null,
    matchedKeywords: parsed.matchedKeywords,
    raw: post
  };
}

export const bandAdapter: JobSourceAdapter = {
  source: "band",

  async search(_params: JobSearchParams): Promise<Job[]> {
    // BAND requires an authorized user's BAND context.
    // The API call is intentionally kept server-side and will be added once
    // the user's BAND app credentials and authorized BAND IDs are configured.
    return [];
  }
};
