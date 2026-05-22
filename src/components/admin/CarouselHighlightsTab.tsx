"use client";

import Image from "next/image";
import { useState } from "react";
import type { CarouselHighlight } from "@/lib/types";

export function CarouselHighlightsTab({
  highlights,
  onRefresh,
}: {
  highlights: CarouselHighlight[];
  onRefresh: () => void;
}) {
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const active = highlights.filter((h) => h.active);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !title.trim()) {
      setMessage("Saisissez un titre avant d'ajouter l'image.");
      return;
    }
    setUploading(true);
    setMessage("");
    const fd = new FormData();
    fd.append("file", file);
    const up = await fetch("/api/upload", { method: "POST", body: fd });
    if (!up.ok) {
      setMessage("Erreur lors de l'upload.");
      setUploading(false);
      return;
    }
    const { imageUrl } = await up.json();
    const res = await fetch("/api/highlights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), imageUrl }),
    });
    if (res.ok) {
      setTitle("");
      setMessage("Exclusivité ajoutée à la carte dynamique !");
      onRefresh();
    } else {
      const err = await res.json();
      setMessage(err.error || "Erreur");
    }
    setUploading(false);
    e.target.value = "";
  }

  async function remove(id: string) {
    await fetch(`/api/highlights?id=${id}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <div className="space-y-6">
      <div className="card border-l-4 border-l-yele-orange">
        <h2 className="font-bold text-lg text-yele-orange-dark">
          Carte dynamique (page d&apos;accueil)
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Ajoutez jusqu&apos;à <strong>2 exclusivités</strong> (nouveau plat, spectacle,
          événement). Titre + image uniquement — sans toucher au code.
        </p>

        <div className="mt-4 space-y-3">
          <input
            className="input"
            placeholder="Titre (ex: Soirée Orchestre Live)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label className="btn-primary inline-flex cursor-pointer gap-2">
            {uploading ? "Envoi…" : "Choisir une image et publier"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
          {message && (
            <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
              {message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {active.length === 0 ? (
          <p className="text-gray-500 col-span-2">
            Aucune exclusivité active — le carrousel affichera les promotions par défaut.
          </p>
        ) : (
          active.map((h) => (
            <div key={h.id} className="card overflow-hidden p-0">
              <div className="relative h-40 w-full">
                <Image
                  src={h.imageUrl}
                  alt={h.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 flex justify-between items-start gap-2">
                <p className="font-bold">{h.title}</p>
                <button
                  type="button"
                  className="text-xs text-red-600 underline shrink-0"
                  onClick={() => remove(h.id)}
                >
                  Retirer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {highlights.filter((h) => !h.active).length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-500">Archivées</p>
          <ul className="mt-2 text-sm text-gray-600">
            {highlights
              .filter((h) => !h.active)
              .map((h) => (
                <li key={h.id}>{h.title}</li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
