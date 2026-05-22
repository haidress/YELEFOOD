import { NextRequest, NextResponse } from "next/server";
import { verifyServerPin } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { pin, displayName } = await req.json();
  const server = await verifyServerPin(pin);
  if (!server) {
    return NextResponse.json({ error: "Code serveur incorrect" }, { status: 401 });
  }
  const name =
    typeof displayName === "string" && displayName.trim()
      ? displayName.trim()
      : server.name;
  return NextResponse.json({ id: server.id, name });
}
