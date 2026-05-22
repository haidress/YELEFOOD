import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { getPublicData } from "@/lib/store";

export async function GET() {
  const data = await getPublicData();
  return NextResponse.json(data);
}
