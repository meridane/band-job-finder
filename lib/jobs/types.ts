export type JobSource = "band" | "saramin" | "manual";

export type Job = {
  id?: string;
  source: JobSource;
  sourceJobId: string;
  sourceUrl?: string | null;
  title: string;
  company?: string | null;
  location?: string | null;
  description?: string | null;
  salary?: string | null;
  employmentType?: string | null;
  experience?: string | null;
  contactPhone?: string | null;
  images?: string[];
  publishedAt?: string | null;
  deadline?: string | null;
  matchedKeywords?: string[];
  raw?: unknown;
};

export type JobSearchParams = {
  keyword?: string;
  location?: string;
  limit?: number;
};

export type JobSourceAdapter = {
  source: JobSource;
  search(params: JobSearchParams): Promise<Job[]>;
};
