"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

export function StockTab({
  items,
  onRefresh,
}: {
  items: MenuItem[];
  onRefresh: () => void;
}) {
  const plats = items.filter((m) => m.category === "plats");
  const boissons = items.filter((m) => m.category === "boissons");
  const low = items.filter((m) => m.stock <= m.stockAlert);

  return (
    <div className="space-y-6">
      <div className="card border-l-4 border-l-yele-orange bg-yele-cream/50">
        <h2 className="font-bold text-yele-orange-dark">Gestion des stocks</h2>
        <p className="mt-2 text-sm text-gray-600">
          Le stock est <strong>automatiquement déduit</strong> lorsque :
        </p>
        <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>un serveur envoie une commande en salle ;</li>
          <li>vous validez une commande Click & Collect (après appel client).</li>
        </ul>
      </div>

      {low.length > 0 && (
        <div className="rounded-xl border-2 border-amber-500 bg-amber-50 p-4">
          <p className="font-bold text-amber-900">
            {low.length} alerte{low.length > 1 ? "s" : ""} rupture imminente
          </p>
          <p className="text-sm text-amber-800 mt-1">
            {low.map((m) => m.name).join(" · ")}
          </p>
        </div>
      )}

      <StockGroup title="Plats" items={plats} onRefresh={onRefresh} />
      <StockGroup title="Boissons" items={boissons} onRefresh={onRefresh} />
    </div>
  );
}

function StockGroup({
  title,
  items,
  onRefresh,
}: {
  title: string;
  items: MenuItem[];
  onRefresh: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h3 className="font-bold text-lg mb-3">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <StockRow key={item.id} item={item} onRefresh={onRefresh} />
        ))}
      </div>
    </section>
  );
}

function StockRow({
  item,
  onRefresh,
}: {
  item: MenuItem;
  onRefresh: () => void;
}) {
  const [stock, setStock] = useState(item.stock);
  const [alert, setAlert] = useState(item.stockAlert);
  const [saving, setSaving] = useState(false);

  const maxBar = Math.max(item.stockAlert * 3, item.stock, 1);
  const pct = Math.min(100, (item.stock / maxBar) * 100);
  const isLow = item.stock <= item.stockAlert;
  const isOut = item.stock === 0;

  async function save() {
    setSaving(true);
    await fetch("/api/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...item,
        stock,
        stockAlert: alert,
      }),
    });
    setSaving(false);
    onRefresh();
  }

  async function adjust(delta: number) {
    const next = Math.max(0, item.stock + delta);
    setStock(next);
    setSaving(true);
    await fetch("/api/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, stock: next, stockAlert: alert }),
    });
    setSaving(false);
    onRefresh();
  }

  return (
    <div
      className={`card py-4 ${
        isOut
          ? "border-red-400 bg-red-50"
          : isLow
            ? "border-amber-400 bg-amber-50/50"
            : ""
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold">{item.name}</p>
          <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
          {isOut && (
            <span className="text-xs font-bold text-red-600">Rupture</span>
          )}
          {isLow && !isOut && (
            <span className="text-xs font-bold text-amber-700">Stock bas</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-9 w-9 rounded-lg border border-yele-orange/40 font-bold hover:bg-yele-cream"
            onClick={() => adjust(-1)}
            disabled={saving}
          >
            −
          </button>
          <button
            type="button"
            className="h-9 w-9 rounded-lg border border-yele-orange/40 font-bold hover:bg-yele-cream"
            onClick={() => adjust(1)}
            disabled={saving}
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${
            isOut ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-yele-orange"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
        <label className="text-xs text-gray-500">
          Stock actuel
          <input
            type="number"
            min={0}
            className="input mt-1 py-1.5 text-sm"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
          />
        </label>
        <label className="text-xs text-gray-500">
          Alerte à
          <input
            type="number"
            min={0}
            className="input mt-1 py-1.5 text-sm"
            value={alert}
            onChange={(e) => setAlert(Number(e.target.value))}
          />
        </label>
        <div className="col-span-2 sm:col-span-1 flex items-end">
          <button
            type="button"
            className="btn-primary w-full py-1.5 text-sm"
            disabled={saving}
            onClick={save}
          >
            {saving ? "…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
