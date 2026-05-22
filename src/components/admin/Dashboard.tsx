"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { DailyStats, HourlySales, MenuItem, WeeklyStats } from "@/lib/types";

export function AdminDashboard({
  stats,
  weeklyStats,
  menuItems,
  onRefresh,
}: {
  stats: DailyStats;
  weeklyStats: WeeklyStats;
  menuItems: MenuItem[];
  onRefresh: () => void;
}) {
  const maxDayRevenue = Math.max(...weeklyStats.byDay.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Montant total du jour — mise en avant */}
      <div className="card border-2 border-yele-orange bg-gradient-to-br from-yele-cream to-white p-6 sm:p-8 text-center sm:text-left">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Montant total du jour
        </p>
        <p className="mt-2 text-4xl font-bold text-yele-orange sm:text-5xl">
          {formatPrice(stats.totalRevenue)}
        </p>
        <p className="mt-2 text-gray-600">
          {stats.ordersCount} commande{stats.ordersCount !== 1 ? "s" : ""} aujourd&apos;hui
        </p>
      </div>

      {stats.hourlySales?.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-yele-orange-dark">
            Évolution des ventes — service en cours
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Suivi en direct depuis votre espace admin
          </p>
          <ServiceEvolutionChart data={stats.hourlySales} />
        </div>
      )}

      {(stats.topZone || stats.topServer) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.topZone && (
            <div className="card border-l-4 border-l-yele-orange">
              <p className="text-sm text-gray-500">Zone la plus rentable</p>
              <p className="text-xl font-bold text-yele-orange mt-1">
                {stats.topZone.zone}
              </p>
              <p className="text-sm">{formatPrice(stats.topZone.revenue)}</p>
            </div>
          )}
          {stats.topServer && (
            <div className="card border-l-4 border-l-yele-orange-dark">
              <p className="text-sm text-gray-500">Meilleur serveur</p>
              <p className="text-xl font-bold text-yele-orange mt-1">
                {stats.topServer.name}
              </p>
              <p className="text-sm">{formatPrice(stats.topServer.revenue)}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top plats du jour */}
        <div className="card">
          <h3 className="font-bold text-yele-orange-dark">
            Plats les plus commandés — aujourd&apos;hui
          </h3>
          {stats.topDishes.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">Aucune vente enregistrée.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {stats.topDishes.map((d, i) => (
                <li
                  key={d.name}
                  className="flex items-center justify-between gap-3 rounded-xl bg-yele-cream/80 px-3 py-2"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yele-orange text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="font-medium text-sm sm:text-base">{d.name}</span>
                  </span>
                  <span className="shrink-0 font-bold text-yele-orange">
                    {d.quantity}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Stat semaine */}
        <div className="card">
          <h3 className="font-bold text-yele-orange-dark">Statistiques semaine</h3>
          <p className="mt-1 text-2xl font-bold text-yele-orange">
            {formatPrice(weeklyStats.totalRevenue)}
          </p>
          <p className="text-sm text-gray-500">
            {weeklyStats.ordersCount} commandes sur 7 jours
          </p>
          <div className="mt-4 space-y-2">
            {weeklyStats.byDay.map((day) => (
              <div key={day.date} className="flex items-center gap-2 text-sm">
                <span className="w-12 shrink-0 text-gray-600">{day.label}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-yele-orange transition-all"
                    style={{
                      width: `${Math.max(4, (day.revenue / maxDayRevenue) * 100)}%`,
                    }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-xs font-medium">
                  {formatPrice(day.revenue)}
                </span>
              </div>
            ))}
          </div>
          {weeklyStats.topDishes.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Top semaine
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {weeklyStats.topDishes.slice(0, 3).map((d) => (
                  <li key={d.name} className="flex justify-between">
                    <span>{d.name}</span>
                    <span className="text-yele-orange font-medium">{d.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Contrôle tarification */}
      <PricingControl items={menuItems} onRefresh={onRefresh} />
    </div>
  );
}

function ServiceEvolutionChart({ data }: { data: HourlySales[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="mt-4 flex items-end gap-1 sm:gap-2 h-36">
      {data.map((d) => (
        <div
          key={d.hour}
          className="flex flex-1 flex-col items-center justify-end gap-1 min-w-0"
          title={`${d.hour} : ${formatPrice(d.revenue)} (${d.orders} cmd.)`}
        >
          <div
            className="w-full rounded-t-md bg-yele-orange transition-all min-h-[4px]"
            style={{
              height: `${Math.max(8, (d.revenue / max) * 100)}%`,
            }}
          />
          <span className="text-[10px] sm:text-xs text-gray-600 truncate w-full text-center">
            {d.hour}
          </span>
        </div>
      ))}
    </div>
  );
}

function PricingControl({
  items,
  onRefresh,
}: {
  items: MenuItem[];
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function savePrice(item: MenuItem) {
    const price = editing[item.id] ?? item.price;
    setSaving(item.id);
    await fetch("/api/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, price }),
    });
    setSaving(null);
    onRefresh();
  }

  return (
    <div className="card">
      <h3 className="font-bold text-yele-orange-dark">Contrôle des tarifs</h3>
      <p className="mt-1 text-sm text-gray-500">
        Modifiez les prix en un clic — visible sur le menu public et serveurs.
      </p>
      <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-yele-cream/50 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-gray-500 capitalize">{item.category}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="input w-28 py-1.5 text-sm"
                value={editing[item.id] ?? item.price}
                onChange={(e) =>
                  setEditing((prev) => ({
                    ...prev,
                    [item.id]: Number(e.target.value),
                  }))
                }
              />
              <span className="text-xs text-gray-500">FCFA</span>
              <button
                type="button"
                disabled={saving === item.id}
                className="btn-primary py-1.5 px-3 text-xs shrink-0"
                onClick={() => savePrice(item)}
              >
                {saving === item.id ? "…" : "OK"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
