import { NextRequest, NextResponse } from "next/server";
import {
  deleteCarouselHighlight,
  setCarouselHighlightActive,
  upsertCarouselHighlight,
} from "@/lib/store";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, imageUrl, id } = body;
  if (!title || !imageUrl) {
    return NextResponse.json(
      { error: "Titre et image requis" },
      { status: 400 }
    );
  }
  const h = await upsertCarouselHighlight({ id, title, imageUrl });
  return NextResponse.json(h, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { id, active } = await req.json();
  const h = await setCarouselHighlightActive(id, active);
  if (!h) {
    return NextResponse.json(
      { error: "Maximum 2 exclusivités actives" },
      { status: 400 }
    );
  }
  return NextResponse.json(h);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID requis" }, { status: 400 });
  }
  await deleteCarouselHighlight(id);
  return NextResponse.json({ ok: true });
}
