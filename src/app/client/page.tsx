"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { MenuItem, OrderLine, Zone } from "@/lib/types";

function ClientContent() {
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "commande" ? "commande" : "reservation";

  const [tab, setTab] = useState<"reservation" | "commande">(initialTab);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<OrderLine[]>([]);
  const [success, setSuccess] = useState("");

  const [resForm, setResForm] = useState({
    name: "",
    guests: 2,
    date: "",
    zone: "OPEN_SPACE" as Zone,
    phone: "",
  });

  const [orderForm, setOrderForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    fetch("/api/menu?role=public")
      .then((r) => r.json())
      .then(setMenu);
  }, []);

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const ex = prev.find((l) => l.menuItemId === item.id);
      if (ex) {
        return prev.map((l) =>
          l.menuItemId === item.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          quantity: 1,
          unitPrice: item.price,
        },
      ];
    });
  }

  function changeCartQty(menuItemId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) =>
          l.menuItemId === menuItemId
            ? { ...l, quantity: l.quantity + delta }
            : l
        )
        .filter((l) => l.quantity > 0)
    );
  }

  function removeFromCart(menuItemId: string) {
    setCart((prev) => prev.filter((l) => l.menuItemId !== menuItemId));
  }

  function cartQty(menuItemId: string) {
    return cart.find((l) => l.menuItemId === menuItemId)?.quantity ?? 0;
  }

  async function submitReservation(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resForm),
    });
    if (res.ok) {
      setSuccess(
        "Réservation envoyée ! Notre équipe vous contactera pour confirmer."
      );
      setResForm({
        name: "",
        guests: 2,
        date: "",
        zone: "OPEN_SPACE",
        phone: "",
      });
    }
  }

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) return;
    const res = await fetch("/api/online-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...orderForm, lines: cart }),
    });
    if (res.ok) {
      setSuccess(
        "Commande reçue ! Un appel de confirmation sera effectué avant la préparation."
      );
      setCart([]);
      setOrderForm({ name: "", phone: "" });
    }
  }

  const cartTotal = cart.reduce((s, l) => s + l.quantity * l.unitPrice, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-yele-orange-dark">Espace Client</h1>
      <p className="mt-1 text-gray-600">
        Réservations et commandes Click & Collect
      </p>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("reservation")}
          className={`flex-1 rounded-xl py-2 font-semibold ${
            tab === "reservation"
              ? "bg-yele-orange text-white"
              : "bg-white border border-yele-orange/30"
          }`}
        >
          Réservation
        </button>
        <button
          type="button"
          onClick={() => setTab("commande")}
          className={`flex-1 rounded-xl py-2 font-semibold ${
            tab === "commande"
              ? "bg-yele-orange text-white"
              : "bg-white border border-yele-orange/30"
          }`}
        >
          Click & Collect
        </button>
      </div>

      {success && (
        <p className="mt-4 rounded-xl bg-green-100 px-4 py-3 text-green-800">
          {success}
        </p>
      )}

      {tab === "reservation" ? (
        <form onSubmit={submitReservation} className="card mt-6 space-y-4">
          <input
            className="input"
            placeholder="Votre nom"
            required
            value={resForm.name}
            onChange={(e) => setResForm({ ...resForm, name: e.target.value })}
          />
          <input
            type="tel"
            className="input"
            placeholder="Téléphone (optionnel)"
            value={resForm.phone}
            onChange={(e) => setResForm({ ...resForm, phone: e.target.value })}
          />
          <input
            type="number"
            min={1}
            className="input"
            placeholder="Nombre de personnes"
            required
            value={resForm.guests}
            onChange={(e) =>
              setResForm({ ...resForm, guests: Number(e.target.value) })
            }
          />
          <input
            type="date"
            className="input"
            required
            value={resForm.date}
            onChange={(e) => setResForm({ ...resForm, date: e.target.value })}
          />
          <select
            className="input"
            value={resForm.zone}
            onChange={(e) =>
              setResForm({ ...resForm, zone: e.target.value as Zone })
            }
          >
            <option value="VIP">Zone VIP</option>
            <option value="OPEN_SPACE">Open Space</option>
          </select>
          <button type="submit" className="btn-primary w-full">
            Demander une réservation
          </button>
        </form>
      ) : (
        <>
          <form
            onSubmit={submitOrder}
            className="card mt-6 space-y-4"
          >
            <input
              className="input"
              placeholder="Nom"
              required
              value={orderForm.name}
              onChange={(e) =>
                setOrderForm({ ...orderForm, name: e.target.value })
              }
            />
            <input
              type="tel"
              className="input"
              placeholder="Téléphone"
              required
              value={orderForm.phone}
              onChange={(e) =>
                setOrderForm({ ...orderForm, phone: e.target.value })
              }
            />
          </form>

          <h2 className="mt-8 font-bold">Choisir dans le menu</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {menu.map((item) => {
              const qty = cartQty(item.id);
              return (
                <div
                  key={item.id}
                  className={`card flex items-center justify-between gap-2 py-3 ${
                    qty > 0 ? "ring-2 ring-yele-orange/40" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => addToCart(item)}
                    className="min-w-0 flex-1 text-left hover:opacity-80"
                  >
                    <span className="font-semibold">{item.name}</span>
                    <span className="block text-sm text-yele-orange">
                      {formatPrice(item.price)}
                    </span>
                  </button>
                  {qty > 0 && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Retirer un ${item.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-yele-orange/40 text-lg font-bold text-yele-orange hover:bg-yele-cream"
                        onClick={() => changeCartQty(item.id, -1)}
                      >
                        −
                      </button>
                      <span className="min-w-[1.5rem] text-center font-bold text-sm">
                        {qty}
                      </span>
                      <button
                        type="button"
                        aria-label={`Ajouter un ${item.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-yele-orange/40 text-lg font-bold text-yele-orange hover:bg-yele-cream"
                        onClick={() => changeCartQty(item.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {cart.length > 0 && (
            <div className="card mt-6">
              <h3 className="font-bold">Votre panier</h3>
              <ul className="mt-3 divide-y divide-yele-orange/10">
                {cart.map((l) => (
                  <li
                    key={l.menuItemId}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">{l.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(l.unitPrice)} × {l.quantity}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Diminuer"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-yele-orange/40 font-bold text-yele-orange hover:bg-yele-cream"
                          onClick={() => changeCartQty(l.menuItemId, -1)}
                        >
                          −
                        </button>
                        <span className="min-w-[1.25rem] text-center font-bold">
                          {l.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Augmenter"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-yele-orange/40 font-bold text-yele-orange hover:bg-yele-cream"
                          onClick={() => changeCartQty(l.menuItemId, 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label="Supprimer"
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                        onClick={() => removeFromCart(l.menuItemId)}
                      >
                        Retirer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-yele-orange/15 pt-4 font-bold text-lg">
                Total : {formatPrice(cartTotal)}
              </p>
              <button
                type="button"
                className="btn-primary mt-4 w-full"
                onClick={submitOrder}
              >
                Envoyer la commande (validation par appel)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ClientPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center">Chargement…</p>}>
      <ClientContent />
    </Suspense>
  );
}
