import { NextResponse } from "next/server";
import { getSettings } from "@/features/settings/service";
import { migrate } from "@/lib/db/client";

export async function GET() {
  await migrate();
  return NextResponse.json({ settings: await getSettings() });
}
