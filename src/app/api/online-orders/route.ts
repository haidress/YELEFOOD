import { NextRequest, NextResponse } from "next/server";
import {
  createOnlineOrder,
  readStore,
  validateOnlineOrder,
} from "@/lib/store";
import type { OrderLine } from "@/lib/types";

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store.onlineOrders);
}

export async function POST(req: NextRequest) {
  const { name, phone, lines } = await req.json();
  if (!name || !phone || !lines?.length) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }
  const order = await createOnlineOrder({
    name,
    phone,
    lines: lines as OrderLine[],
  });
  return NextResponse.json(order, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { id } = await req.json();
  const order = await validateOnlineOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Commande introuvable ou déjà traitée" }, { status: 404 });
  }
  return NextResponse.json(order);
}
