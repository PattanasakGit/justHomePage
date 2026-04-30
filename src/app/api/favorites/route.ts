import { NextResponse } from "next/server";
import { listFavorites } from "@/features/favorites/service";
import { migrate } from "@/lib/db/client";

export async function GET() {
  await migrate();
  return NextResponse.json({ favorites: await listFavorites() });
}
