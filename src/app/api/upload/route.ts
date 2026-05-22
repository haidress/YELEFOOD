import { NextRequest, NextResponse } from "next/server";
import { saveUpload, upsertSpectacle } from "@/lib/store";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const spectacleId = formData.get("spectacleId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const imageUrl = await saveUpload(file.name, buffer);

  if (spectacleId) {
    const store = await import("@/lib/store");
    const data = await store.readStore();
    const spec = data.spectacles.find((s) => s.id === spectacleId);
    if (spec) {
      const updated = await upsertSpectacle({
        id: spectacleId,
        artist: spec.artist,
        date: spec.date,
        dayLabel: spec.dayLabel,
        description: spec.description,
        imageUrl,
      });
      return NextResponse.json({ imageUrl, spectacle: updated });
    }
  }

  return NextResponse.json({ imageUrl });
}
