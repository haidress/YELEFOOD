"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  formatDate,
  formatPrice,
  orderWaitMinutes,
  waitColor,
} from "@/lib/format";
import type {
  MenuItem,
  OnlineOrder,
  Order,
  Promotion,
  Reservation,
  Spectacle,
  VipClient,
} from "@/lib/types";
import type { CarouselHighlight, DailyStats, WeeklyStats } from "@/lib/types";
import { AdminDashboard } from "@/components/admin/Dashboard";
import { CarouselHighlightsTab } from "@/components/admin/CarouselHighlightsTab";
import { StockTab } from "@/components/admin/StockTab";

interface AdminData {
  promotions: Promotion[];
  spectacles: Spectacle[];
  menuItems: MenuItem[];
  orders: Order[];
  reservations: Reservation[];
  onlineOrders: OnlineOrder[];
  vipClients: VipClient[];
  carouselHighlights: CarouselHighlight[];
  stats: DailyStats;
  weeklyStats: WeeklyStats;
}

type Tab =
  | "dashboard"
  | "carte"
  | "commandes"
  | "stocks"
  | "menu"
  | "spectacles"
  | "promos"
  | "reservations"
  | "vip";

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const savedPin = sessionStorage.getItem("yele-admin-pin");
    if (!savedPin) return;
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: savedPin }),
    });
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("yele-admin-pin");
    if (saved) {
      setPin(saved);
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) {
      refresh();
      const t = setInterval(refresh, 8000);
      return () => clearInterval(t);
    }
  }, [authed, refresh]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) {
      setError("Code admin incorrect (démo : admin2026)");
      return;
    }
    sessionStorage.setItem("yele-admin-pin", pin);
    setData(await res.json());
    setAuthed(true);
    setError("");
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold text-yele-orange-dark">
          Administration
        </h1>
        <form onSubmit={login} className="card mt-6 space-y-4">
          <input
            type="password"
            className="input"
            placeholder="Code administrateur"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            Connexion
          </button>
        </form>
      </div>
    );
  }

  if (!data) return <p className="p-10 text-center">Chargement…</p>;

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "Tableau de bord" },
    { id: "carte", label: "Carte dynamique" },
    { id: "commandes", label: "Commandes" },
    { id: "stocks", label: "Stocks" },
    { id: "menu", label: "Menu" },
    { id: "spectacles", label: "Spectacles" },
    { id: "promos", label: "Promotions" },
    { id: "reservations", label: "Réservations" },
    { id: "vip", label: "Clients VIP" },
  ];

  const lowStock = data.menuItems.filter(
    (m) => m.stock <= m.stockAlert && m.available
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-yele-orange-dark">
          Pilotage Yele Food
        </h1>
        <button
          type="button"
          className="text-sm underline text-gray-500"
          onClick={() => {
            sessionStorage.removeItem("yele-admin-pin");
            setAuthed(false);
          }}
        >
          Déconnexion
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="mt-4 rounded-xl border-2 border-amber-500 bg-amber-50 p-4">
          <p className="font-bold text-amber-800">⚠ Rupture imminente</p>
          <ul className="mt-1 text-sm">
            {lowStock.map((m) => (
              <li key={m.id}>
                {m.name} — stock : {m.stock}
              </li>
            ))}
          </ul>
        </div>
      )}

      <nav className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              tab === t.id
                ? "bg-yele-orange text-white"
                : "bg-white border border-yele-orange/30"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "dashboard" && (
          <AdminDashboard
            stats={data.stats}
            weeklyStats={data.weeklyStats}
            menuItems={data.menuItems}
            onRefresh={refresh}
          />
        )}
        {tab === "carte" && (
          <CarouselHighlightsTab
            highlights={data.carouselHighlights}
            onRefresh={refresh}
          />
        )}
        {tab === "commandes" && (
          <CommandesTab
            orders={data.orders}
            onlineOrders={data.onlineOrders}
            onRefresh={refresh}
          />
        )}
        {tab === "stocks" && (
          <StockTab items={data.menuItems} onRefresh={refresh} />
        )}
        {tab === "menu" && (
          <MenuTab items={data.menuItems} onRefresh={refresh} />
        )}
        {tab === "spectacles" && (
          <SpectaclesTab spectacles={data.spectacles} onRefresh={refresh} />
        )}
        {tab === "promos" && (
          <PromosTab promotions={data.promotions} onRefresh={refresh} />
        )}
        {tab === "reservations" && (
          <ReservationsTab reservations={data.reservations} onRefresh={refresh} />
        )}
        {tab === "vip" && <VipTab clients={data.vipClients} />}
      </div>
    </div>
  );
}


function CommandesTab({
  orders,
  onlineOrders,
  onRefresh,
}: {
  orders: Order[];
  onlineOrders: OnlineOrder[];
  onRefresh: () => void;
}) {
  const active = orders.filter((o) => !["served", "cancelled"].includes(o.status));

  async function validateOnline(id: string) {
    await fetch("/api/online-orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onRefresh();
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-bold">Commandes salle (minuteur d&apos;attente)</h2>
        <div className="mt-3 space-y-3">
          {active.length === 0 ? (
            <p className="text-gray-500">Aucune commande active.</p>
          ) : (
            active.map((o) => {
              const min = orderWaitMinutes(o.createdAt);
              return (
                <div key={o.id} className="card">
                  <div className="flex justify-between">
                    <span className="font-bold">
                      {o.zone} — {o.clientLabel}
                    </span>
                    <span className={waitColor(min)}>{min} min</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Serveur : {o.serverName} · {formatPrice(o.total)}
                  </p>
                  <ul className="mt-2 text-sm">
                    {o.lines.map((l, i) => (
                      <li key={i}>
                        {l.quantity}× {l.name}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section>
        <h2 className="font-bold">Click & Collect — à valider</h2>
        <div className="mt-3 space-y-3">
          {onlineOrders
            .filter((o) => o.status === "pending_validation")
            .map((o) => (
              <div key={o.id} className="card">
                <p className="font-bold">
                  {o.name} — {o.phone}
                </p>
                <p>{formatPrice(o.total)}</p>
                <button
                  type="button"
                  className="btn-primary mt-2 text-sm"
                  onClick={() => validateOnline(o.id)}
                >
                  Valider après appel client
                </button>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}

function MenuTab({
  items,
  onRefresh,
}: {
  items: MenuItem[];
  onRefresh: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    category: "plats" as MenuItem["category"],
    price: 0,
    stock: 50,
    stockAlert: 10,
    description: "",
  });

  async function saveItem(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({
      name: "",
      category: "plats",
      price: 0,
      stock: 50,
      stockAlert: 10,
      description: "",
    });
    onRefresh();
  }

  async function toggleEmergency(id: string, disabled: boolean) {
    await fetch("/api/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, emergencyDisabled: disabled }),
    });
    onRefresh();
  }

  async function toggleAvailable(item: MenuItem) {
    await fetch("/api/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, available: !item.available }),
    });
    onRefresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={saveItem} className="card space-y-3">
        <h2 className="font-bold">Ajouter un article au menu</h2>
        <input
          className="input"
          placeholder="Nom"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <select
          className="input"
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value as MenuItem["category"],
            })
          }
        >
          <option value="plats">Plat</option>
          <option value="boissons">Boisson</option>
        </select>
        <input
          type="number"
          className="input"
          placeholder="Prix (FCFA)"
          required
          value={form.price || ""}
          onChange={(e) =>
            setForm({ ...form, price: Number(e.target.value) })
          }
        />
        <input
          type="number"
          className="input"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) =>
            setForm({ ...form, stock: Number(e.target.value) })
          }
        />
        <input
          className="input"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />
        <button type="submit" className="btn-primary">
          Ajouter au menu
        </button>
      </form>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`card ${item.emergencyDisabled ? "border-red-500 bg-red-50" : ""}`}
          >
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-bold">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.category} · {formatPrice(item.price)} · Stock :{" "}
                  {item.stock}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white"
                  onClick={() =>
                    toggleEmergency(item.id, !item.emergencyDisabled)
                  }
                >
                  {item.emergencyDisabled
                    ? "Réactiver"
                    : "Mode urgence"}
                </button>
                <button
                  type="button"
                  className="btn-secondary text-xs py-1"
                  onClick={() => toggleAvailable(item)}
                >
                  {item.available ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpectaclesTab({
  spectacles,
  onRefresh,
}: {
  spectacles: Spectacle[];
  onRefresh: () => void;
}) {
  const [form, setForm] = useState({
    artist: "",
    date: "",
    dayLabel: "Vendredi",
    description: "",
  });

  const [saveMsg, setSaveMsg] = useState("");

  async function addSpectacle(e: React.FormEvent) {
    e.preventDefault();
    setSaveMsg("");
    const res = await fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "spectacle", data: form }),
    });
    if (!res.ok) {
      setSaveMsg("Erreur lors de l'enregistrement");
      return;
    }
    setForm({ artist: "", date: "", dayLabel: "Vendredi", description: "" });
    setSaveMsg("Spectacle enregistré");
    await onRefresh();
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function uploadImage(spectacleId: string, file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("spectacleId", spectacleId);
    await fetch("/api/upload", { method: "POST", body: fd });
    onRefresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addSpectacle} className="card space-y-3">
        <h2 className="font-bold">Ajouter un spectacle</h2>
        <input
          className="input"
          placeholder="Artiste / Orchestre"
          required
          value={form.artist}
          onChange={(e) => setForm({ ...form, artist: e.target.value })}
        />
        <input
          type="date"
          className="input"
          required
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <select
          className="input"
          value={form.dayLabel}
          onChange={(e) => setForm({ ...form, dayLabel: e.target.value })}
        >
          <option>Vendredi</option>
          <option>Samedi</option>
        </select>
        <textarea
          className="input"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />
        <button type="submit" className="btn-primary">
          Enregistrer
        </button>
        {saveMsg && (
          <p
            className={`text-sm ${saveMsg.startsWith("Erreur") ? "text-red-600" : "text-green-700"}`}
          >
            {saveMsg}
          </p>
        )}
      </form>

      {spectacles.map((s) => (
        <div key={s.id} className="card flex flex-col sm:flex-row gap-4">
          <div className="relative h-32 w-full sm:w-40 shrink-0 rounded-xl overflow-hidden bg-yele-cream">
            {s.imageUrl ? (
              <Image src={s.imageUrl} alt={s.artist} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-3xl">
                🎵
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-bold">{s.artist}</p>
            <p className="text-sm text-yele-orange">{formatDate(s.date)}</p>
            <p className="text-sm text-gray-600 mt-1">{s.description}</p>
            <label className="mt-3 inline-block cursor-pointer text-sm font-semibold text-yele-orange">
              Uploader une affiche / photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImage(s.id, f);
                }}
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

function PromosTab({
  promotions,
  onRefresh,
}: {
  promotions: Promotion[];
  onRefresh: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    badge: "En cours",
    active: true,
  });

  async function addPromo(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "promotion", data: form }),
    });
    setForm({ title: "", description: "", badge: "En cours", active: true });
    onRefresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addPromo} className="card space-y-3">
        <h2 className="font-bold">Nouvelle promotion</h2>
        <input
          className="input"
          placeholder="Titre"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="input"
          placeholder="Description"
          required
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />
        <button type="submit" className="btn-primary">
          Publier
        </button>
      </form>
      {promotions.map((p) => (
        <div key={p.id} className="card">
          <span className="badge">{p.badge}</span>
          <p className="mt-2 font-bold">{p.title}</p>
          <p className="text-sm text-gray-600">{p.description}</p>
        </div>
      ))}
    </div>
  );
}

function ReservationsTab({
  reservations,
  onRefresh,
}: {
  reservations: Reservation[];
  onRefresh: () => void;
}) {
  async function confirm(id: string) {
    await fetch("/api/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onRefresh();
  }

  return (
    <div className="space-y-3">
      {reservations.map((r) => (
        <div key={r.id} className="card">
          <p className="font-bold">
            {r.name} — {r.guests} pers. — {r.zone}
          </p>
          <p className="text-sm">{formatDate(r.date)}</p>
          <p className="text-sm">
            Statut :{" "}
            <span
              className={
                r.status === "confirmed" ? "text-green-600" : "text-amber-600"
              }
            >
              {r.status}
            </span>
          </p>
          {r.status === "pending" && (
            <button
              type="button"
              className="btn-primary mt-2 text-sm"
              onClick={() => confirm(r.id)}
            >
              Confirmer
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function VipTab({ clients }: { clients: VipClient[] }) {
  return (
    <div className="space-y-3">
      <p className="text-gray-600">
        Carnet d&apos;adresses VIP — historique des clients fidèles
      </p>
      {clients.length === 0 ? (
        <p className="text-gray-500">Aucun client enregistré.</p>
      ) : (
        clients.map((c) => (
          <div key={c.id} className="card">
            <p className="font-bold">{c.name}</p>
            <p className="text-sm text-gray-600">
              {c.visitCount} visites · Total : {formatPrice(c.totalSpent)}
            </p>
            {c.phone && <p className="text-sm">{c.phone}</p>}
          </div>
        ))
      )}
    </div>
  );
}
