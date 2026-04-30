import { NextResponse } from "next/server";
import { listWidgets } from "@/features/widgets/service";
import { migrate } from "@/lib/db/client";

export async function GET() {
  await migrate();
  return NextResponse.json({ widgets: await listWidgets() });
}
