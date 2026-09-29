import type { Job } from "./types";

export function normalizeJobs(jobs: Job[]): Job[] {
  const seen = new Map<string, Job>();

  for (const job of jobs) {
    const phone = job.contactPhone?.replace(/\\D/g, "") ?? "";
    const company = (job.company ?? "").toLowerCase().trim();
    const title = job.title.toLowerCase().trim();
    const location = (job.location ?? "").toLowerCase().trim();

    const key = phone
      ? `phone:${phone}`
      : `text:${company}|${title}|${location}`;

    if (!seen.has(key)) seen.set(key, job);
  }

  return [...seen.values()];
}
