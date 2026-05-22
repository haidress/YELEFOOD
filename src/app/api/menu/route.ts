import { NextRequest, NextResponse } from "next/server";
import {
  deleteMenuItem,
  getMenuForRole,
  readStore,
  toggleEmergency,
  upsertMenuItem,
} from "@/lib/store";

export async function GET(req: NextRequest) {
  const role = (req.nextUrl.searchParams.get("role") || "public") as
    | "public"
    | "server"
    | "admin";
  const items = await getMenuForRole(role);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await upsertMenuItem(body);
  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { id, emergencyDisabled, ...rest } = await req.json();
  if (typeof emergencyDisabled === "boolean") {
    const item = await toggleEmergency(id, emergencyDisabled);
    if (!item) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }
    return NextResponse.json(item);
  }
  const item = await upsertMenuItem({ ...rest, id });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID requis" }, { status: 400 });
  }
  await deleteMenuItem(id);
  return NextResponse.json({ ok: true });
}

export async function PUT() {
  const store = await readStore();
  return NextResponse.json(store.menuItems);
}
