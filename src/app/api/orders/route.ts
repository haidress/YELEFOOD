import { NextRequest, NextResponse } from "next/server";
import { createOrder, readStore, updateOrderStatus } from "@/lib/store";
import type { OrderLine, Zone } from "@/lib/types";

export async function GET() {
  const store = await readStore();
  const active = store.orders
    .filter((o) => !["served", "cancelled"].includes(o.status))
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  return NextResponse.json({ orders: active, all: store.orders });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { zone, clientLabel, serverId, serverName, lines } = body as {
    zone: Zone;
    clientLabel: string;
    serverId: string;
    serverName: string;
    lines: OrderLine[];
  };
  if (!zone || !clientLabel || !serverId || !lines?.length) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }
  const order = await createOrder({
    zone,
    clientLabel,
    serverId,
    serverName,
    lines,
  });
  return NextResponse.json(order, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  const order = await updateOrderStatus(id, status);
  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }
  return NextResponse.json(order);
}
