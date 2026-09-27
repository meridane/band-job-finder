import { NextResponse } from "next/server";
import { parseBandPost } from "../../../../lib/band-parser";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text : "";

    if (!text.trim()) {
      return NextResponse.json(
        { ok: false, error: "text is required" },
        { status: 400 }
      );
    }

    const parsed = parseBandPost(text);

    return NextResponse.json({
      ok: true,
      ...parsed
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
