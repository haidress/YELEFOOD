"use client";

import { useCallback, useEffect, useState } from "react";
import {
  formatPrice,
  orderWaitMinutes,
  waitColor,
} from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "En attente",
  sent: "Reçue",
  preparing: "En préparation",
  ready: "Prête",
  served: "Validée",
  cancelled: "Annulée",
};

export default function BarPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [, setTick] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/orders", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setOrders(d.orders));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  async function setStatus(id: string, status: OrderStatus) {
    setBusyId(id);
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setBusyId(null);
    if (res.ok) load();
  }

  return (
    <div className="min-h-screen bg-yele-charcoal text-white px-4 py-6">
      <h1 className="text-center text-3xl font-bold text-yele-orange">
        BAR / CAISSE — Commandes en direct
      </h1>
      <p className="text-center text-gray-400 mt-1">
        Validez une commande pour l&apos;inclure au chiffre d&apos;affaires admin
      </p>

      <div className="mx-auto mt-8 grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-20">
            En attente de commandes…
          </p>
        ) : (
          orders.map((o) => {
            const min = orderWaitMinutes(o.createdAt);
            const busy = busyId === o.id;
            return (
              <article
                key={o.id}
                className="rounded-2xl border-2 border-yele-orange bg-gray-900 p-5 shadow-lg"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="rounded-full bg-yele-orange px-3 py-1 text-sm font-bold text-white">
                    {o.zone}
                  </span>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${waitColor(min)}`}>
                      {min} min
                    </span>
                    <p className="text-xs text-gray-400">
                      {STATUS_LABELS[o.status]}
                    </p>
                  </div>
                </div>
                <h2 className="mt-3 text-xl font-bold">{o.clientLabel}</h2>
                <p className="text-yele-orange-light text-sm">
                  Serveur : {o.serverName}
                </p>
                <ul className="mt-4 space-y-2 border-t border-gray-700 pt-4">
                  {o.lines.map((l, i) => (
                    <li key={i} className="flex justify-between text-lg">
                      <span>
                        <strong>{l.quantity}×</strong> {l.name}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-right text-xl font-bold text-yele-orange">
                  {formatPrice(o.total)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {o.status === "sent" && (
                    <button
                      type="button"
                      disabled={busy}
                      className="rounded-lg bg-gray-700 px-3 py-2 text-sm font-semibold hover:bg-gray-600 disabled:opacity-50"
                      onClick={() => setStatus(o.id, "preparing")}
                    >
                      En préparation
                    </button>
                  )}
                  {(o.status === "sent" || o.status === "preparing") && (
                    <button
                      type="button"
                      disabled={busy}
                      className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold hover:bg-amber-500 disabled:opacity-50"
                      onClick={() => setStatus(o.id, "ready")}
                    >
                      Prête
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    className="rounded-lg bg-green-600 px-3 py-2 text-sm font-bold hover:bg-green-500 disabled:opacity-50"
                    onClick={() => setStatus(o.id, "served")}
                  >
                    {busy ? "…" : "Valider (CA)"}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
