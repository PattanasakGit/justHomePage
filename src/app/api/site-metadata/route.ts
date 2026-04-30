import { NextRequest, NextResponse } from "next/server";
import { extractSiteMetadata } from "@/lib/site-metadata";

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("url");
  if (!target) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(target);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return NextResponse.json({ error: "Unsupported protocol" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: { accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
    });
    const html = await response.text();
    return NextResponse.json(extractSiteMetadata(url.toString(), html));
  } catch {
    return NextResponse.json(extractSiteMetadata(url.toString(), ""));
  }
}
