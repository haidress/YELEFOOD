import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import {
  deleteSpectacle,
  getDailyStats,
  getWeeklyStats,
  readStore,
  upsertPromotion,
  upsertSpectacle,
  verifyAdminPin,
} from "@/lib/store";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  const ok = await verifyAdminPin(pin);
  if (!ok) {
    return NextResponse.json({ error: "Code admin incorrect" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({
    promotions: store.promotions,
    spectacles: store.spectacles.sort((a, b) => a.date.localeCompare(b.date)),
    menuItems: store.menuItems,
    orders: store.orders,
    reservations: store.reservations,
    onlineOrders: store.onlineOrders,
    vipClients: (store.vipClients ?? []).sort(
      (a, b) => b.totalSpent - a.totalSpent
    ),
    carouselHighlights: store.carouselHighlights ?? [],
    stats: await getDailyStats(),
    weeklyStats: await getWeeklyStats(),
  });
}

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");
  if (action === "stats") {
    return NextResponse.json(await getDailyStats());
  }
  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { type } = body;

  if (type === "promotion") {
    const promo = await upsertPromotion(body.data);
    return NextResponse.json(promo);
  }
  if (type === "spectacle") {
    const spec = await upsertSpectacle(body.data);
    return NextResponse.json(spec);
  }
  return NextResponse.json({ error: "Type inconnu" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("spectacleId");
  if (!id) {
    return NextResponse.json({ error: "ID requis" }, { status: 400 });
  }
  await deleteSpectacle(id);
  return NextResponse.json({ ok: true });
}
