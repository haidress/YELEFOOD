import { NextRequest, NextResponse } from "next/server";
import { confirmReservation, createReservation, readStore } from "@/lib/store";
import type { Zone } from "@/lib/types";

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store.reservations);
}

export async function POST(req: NextRequest) {
  const { name, guests, date, zone, phone } = await req.json();
  if (!name || !guests || !date || !zone) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }
  const r = await createReservation({
    name,
    guests: Number(guests),
    date,
    zone: zone as Zone,
    phone,
  });
  return NextResponse.json(r, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { id } = await req.json();
  const r = await confirmReservation(id);
  if (!r) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  }
  return NextResponse.json(r);
}
