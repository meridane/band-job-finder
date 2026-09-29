import { NextRequest, NextResponse } from "next/server";
import { searchJobs } from "../../../../lib/jobs/search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    const jobs = await searchJobs({
      keyword: searchParams.get("keyword") ?? undefined,
      location: searchParams.get("location") ?? undefined,
      limit: Number(searchParams.get("limit") ?? "50")
    });

    return NextResponse.json({ jobs, count: jobs.length });
  } catch (error) {
    console.error("Job search failed", error);
    return NextResponse.json(
      { error: "JOB_SEARCH_FAILED" },
      { status: 500 }
    );
  }
}
