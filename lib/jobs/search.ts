import { bandAdapter } from "./band";
import { normalizeJobs } from "./normalize";
import { saraminAdapter } from "./saramin";
import type { Job, JobSearchParams } from "./types";

export async function searchJobs(params: JobSearchParams): Promise<Job[]> {
  const results = await Promise.all([
    saraminAdapter.search(params),
    bandAdapter.search(params)
  ]);

  return normalizeJobs(results.flat());
}
