"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { MenuItem, OrderLine, Zone } from "@/lib/types";

interface ServerSession {
  id: string;
  name: string;
}

export default function ServeurPage() {
  const [session, setSession] = useState<ServerSession | null>(null);
  const [pin, setPin] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [zone, setZone] = useState<Zone>("OPEN_SPACE");
  const [clientLabel, setClientLabel] = useState("");
  const [cart, setCart] = useState<OrderLine[]>([]);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const loadMenu = useCallback(() => {
    fetch("/api/menu?role=server")
      .then((r) => r.json())
      .then(setMenu);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("yele-server");
    if (saved) setSession(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (session) {
      loadMenu();
      const t = setInterval(loadMenu, 5000);
      return () => clearInterval(t);
    }
  }, [session, loadMenu]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/server", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, displayName: displayName.trim() }),
    });
    if (!res.ok) {
      setMessage("Code incorrect");
      return;
    }
    const data = await res.json();
    sessionStorage.setItem("yele-server", JSON.stringify(data));
    setSession(data);
    setMessage("");
  }

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((l) => l.menuItemId === item.id);
      if (existing) {
        return prev.map((l) =>
          l.menuItemId === item.id
            ? { ...l, quantity: l.quantity + 1 }
            : l
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

  async function sendOrder() {
    if (!session || !clientLabel.trim() || cart.length === 0) {
      setMessage("Zone, repère client et articles requis");
      return;
    }
    setSending(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zone,
        clientLabel: clientLabel.trim(),
        serverId: session.id,
        serverName: session.name,
        lines: cart,
      }),
    });
    setSending(false);
    if (res.ok) {
      setCart([]);
      setClientLabel("");
      setMessage("Commande envoyée au bar !");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Erreur d'envoi");
    }
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold text-yele-orange-dark">
          Espace Serveur
        </h1>
        <p className="mt-2 text-gray-600">
          Connexion par code PIN (démo : 1234 ou 5678)
        </p>
        <form onSubmit={login} className="card mt-6 space-y-4">
          <input
            className="input"
            placeholder="Votre prénom / nom"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <input
            type="password"
            className="input"
            placeholder="Code PIN"
            required
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          {message && <p className="text-red-600 text-sm">{message}</p>}
          <button type="submit" className="btn-primary w-full">
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  const total = cart.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const plats = menu.filter((m) => m.category === "plats");
  const boissons = menu.filter((m) => m.category === "boissons");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-yele-orange-dark">
            Bonjour {session.name}
          </h1>
          <p className="text-sm text-gray-500">Saisie tactile — envoi instantané</p>
        </div>
        <button
          type="button"
          className="text-sm text-gray-500 underline"
          onClick={() => {
            sessionStorage.removeItem("yele-server");
            setSession(null);
          }}
        >
          Déconnexion
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-xl bg-green-100 px-4 py-2 text-green-800">
          {message}
        </p>
      )}

      <div className="card mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Zone</label>
          <select
            className="input mt-1"
            value={zone}
            onChange={(e) => setZone(e.target.value as Zone)}
          >
            <option value="VIP">VIP</option>
            <option value="OPEN_SPACE">Open Space</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">
            Client / repère visuel
          </label>
          <input
            className="input mt-1"
            placeholder="ex: Table Groupe VIP 1"
            value={clientLabel}
            onChange={(e) => setClientLabel(e.target.value)}
          />
        </div>
      </div>

      <h2 className="mt-8 font-bold">Plats</h2>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {plats.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => addToCart(item)}
            className="rounded-xl border border-yele-orange/30 bg-white p-3 text-left hover:border-yele-orange active:bg-yele-cream"
          >
            <p className="font-semibold text-sm">{item.name}</p>
            <p className="text-yele-orange text-sm">{formatPrice(item.price)}</p>
          </button>
        ))}
      </div>

      <h2 className="mt-6 font-bold">Boissons</h2>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {boissons.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => addToCart(item)}
            className="rounded-xl border border-yele-orange/30 bg-white p-3 text-left hover:border-yele-orange active:bg-yele-cream"
          >
            <p className="font-semibold text-sm">{item.name}</p>
            <p className="text-yele-orange text-sm">{formatPrice(item.price)}</p>
          </button>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 shadow-lg">
          <p className="font-bold">Panier — {formatPrice(total)}</p>
          <ul className="mt-1 max-h-24 overflow-y-auto text-sm">
            {cart.map((l) => (
              <li key={l.menuItemId}>
                {l.quantity}× {l.name}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn-primary mt-3 w-full"
            disabled={sending}
            onClick={sendOrder}
          >
            {sending ? "Envoi…" : "Envoyer au bar"}
          </button>
        </div>
      )}
    </div>
  );
}

