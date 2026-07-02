import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

let cache: Record<string, unknown> | null = null;

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  if (!cache) {
    const filePath = path.join(process.cwd(), "data", "settlements-detail.json");
    cache = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  const detail = cache?.[id];
  if (!detail) {
    return NextResponse.json({ error: "Settlement not found" }, { status: 404 });
  }

  return NextResponse.json(detail, {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
