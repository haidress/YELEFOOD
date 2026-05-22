import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { isOnLocalDay, localDateStr } from "./date";
import { computeLinesTotal } from "./orderTotals";
import type {
  CarouselHighlight,
  DailyStats,
  MenuItem,
  OnlineOrder,
  Order,
  OrderLine,
  Promotion,
  Reservation,
  Spectacle,
  StoreData,
  VipClient,
  WeeklyStats,
  Zone,
} from "./types";

const DEFAULT_VENUE = {
  address: "Cocody ANGRE, Abidjan, Côte d'Ivoire",
  landmark: "Gestoci Nouveau CHU",
  phone: "+2250710420670",
  email: "fataouyelelatifaakissikan@gmail.com",
};

function normalizeStore(raw: Partial<StoreData>): StoreData {
  return {
    carouselHighlights: raw.carouselHighlights ?? [],
    promotions: raw.promotions ?? [],
    spectacles: raw.spectacles ?? [],
    menuItems: raw.menuItems ?? [],
    orders: raw.orders ?? [],
    reservations: raw.reservations ?? [],
    onlineOrders: raw.onlineOrders ?? [],
    vipClients: raw.vipClients ?? [],
    servers: raw.servers ?? [],
    settings: {
      adminPin: raw.settings?.adminPin ?? "admin2026",
      lowStockThreshold: raw.settings?.lowStockThreshold ?? 10,
      venue: { ...DEFAULT_VENUE, ...raw.settings?.venue },
    },
  };
}

/** En hébergement (Vercel, etc.) : données écrites dans /tmp (persistant par instance) */
function getDataDir(): string {
  if (process.env.YELEFOOD_DATA_DIR) return process.env.YELEFOOD_DATA_DIR;
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join("/tmp", "yelefood");
  }
  return path.join(process.cwd(), "data");
}

const DATA_DIR = getDataDir();
const SEED_STORE_PATH = path.join(process.cwd(), "data", "store.json");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

export async function readStore(): Promise<StoreData> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return normalizeStore(JSON.parse(raw) as StoreData);
  } catch {
    const seed = await fs.readFile(SEED_STORE_PATH, "utf-8");
    const data = normalizeStore(JSON.parse(seed) as StoreData);
    try {
      await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
    } catch {
      /* premier démarrage en lecture seule — données en mémoire pour cette requête */
    }
    return data;
  }
}

export async function writeStore(data: StoreData): Promise<void> {
  await ensureDirs();
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getPublicData() {
  const store = await readStore();
  return {
    promotions: store.promotions.filter((p) => p.active),
    spectacles: store.spectacles.sort((a, b) => a.date.localeCompare(b.date)),
    menuItems: store.menuItems.filter(
      (m) => m.available && !m.emergencyDisabled
    ),
    carouselHighlights: store.carouselHighlights
      .filter((h) => h.active && h.imageUrl)
      .sort((a, b) => a.order - b.order)
      .slice(0, 2),
    venue: store.settings.venue,
  };
}

export async function getMenuForRole(role: "server" | "admin" | "public") {
  const store = await readStore();
  if (role === "admin") return store.menuItems;
  if (role === "server") {
    return store.menuItems.filter((m) => m.available && !m.emergencyDisabled);
  }
  return store.menuItems.filter((m) => m.available && !m.emergencyDisabled);
}

function findMenuItem(store: StoreData, line: OrderLine): MenuItem | undefined {
  return (
    store.menuItems.find((m) => m.id === line.menuItemId) ??
    store.menuItems.find(
      (m) => m.name.toLowerCase().trim() === line.name.toLowerCase().trim()
    )
  );
}

/** Retire le stock — appelé à l'envoi commande salle ou à la validation Click & Collect */
export function deductStock(store: StoreData, lines: OrderLine[]) {
  for (const line of lines) {
    const item = findMenuItem(store, line);
    if (!item) continue;
    item.stock = Math.max(0, item.stock - line.quantity);
    if (item.stock === 0) {
      item.available = false;
    } else if (item.stock > 0 && !item.emergencyDisabled) {
      item.available = true;
    }
  }
}

export async function updateMenuStock(
  id: string,
  stock: number,
  stockAlert?: number
): Promise<MenuItem | null> {
  const store = await readStore();
  const item = store.menuItems.find((m) => m.id === id);
  if (!item) return null;
  item.stock = Math.max(0, Math.floor(stock));
  if (stockAlert !== undefined) {
    item.stockAlert = Math.max(0, Math.floor(stockAlert));
  }
  if (item.stock === 0) {
    item.available = false;
  } else if (!item.emergencyDisabled) {
    item.available = true;
  }
  await writeStore(store);
  return item;
}

function updateVip(store: StoreData, name: string, amount: number, phone?: string) {
  let vip = store.vipClients.find(
    (v) => v.name.toLowerCase() === name.toLowerCase()
  );
  if (!vip) {
    vip = {
      id: uuidv4(),
      name,
      phone,
      totalSpent: 0,
      visitCount: 0,
    };
    store.vipClients.push(vip);
  }
  vip.totalSpent += amount;
  vip.visitCount += 1;
  vip.lastVisit = new Date().toISOString();
  if (phone) vip.phone = phone;
}

export async function createOrder(params: {
  zone: Zone;
  clientLabel: string;
  serverId: string;
  serverName: string;
  lines: OrderLine[];
}): Promise<Order> {
  const store = await readStore();
  const total = computeLinesTotal(params.lines);
  const order: Order = {
    id: uuidv4(),
    zone: params.zone,
    clientLabel: params.clientLabel,
    serverId: params.serverId,
    serverName: params.serverName,
    lines: params.lines,
    status: "sent",
    total,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.orders.push(order);
  deductStock(store, params.lines);
  await writeStore(store);
  return order;
}

export async function createReservation(
  data: Omit<Reservation, "id" | "status" | "createdAt">
): Promise<Reservation> {
  const store = await readStore();
  const reservation: Reservation = {
    ...data,
    id: uuidv4(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  store.reservations.push(reservation);
  await writeStore(store);
  return reservation;
}

export async function createOnlineOrder(params: {
  name: string;
  phone: string;
  lines: OrderLine[];
}): Promise<OnlineOrder> {
  const store = await readStore();
  const total = computeLinesTotal(params.lines);
  const order: OnlineOrder = {
    id: uuidv4(),
    name: params.name,
    phone: params.phone,
    lines: params.lines,
    total,
    type: "click_collect",
    status: "pending_validation",
    createdAt: new Date().toISOString(),
  };
  store.onlineOrders.push(order);
  await writeStore(store);
  return order;
}

export async function validateOnlineOrder(id: string): Promise<OnlineOrder | null> {
  const store = await readStore();
  const order = store.onlineOrders.find((o) => o.id === id);
  if (!order || order.status !== "pending_validation") return null;
  order.status = "validated";
  order.total = computeLinesTotal(order.lines);
  deductStock(store, order.lines);
  updateVip(store, order.name, order.total, order.phone);
  await writeStore(store);
  return order;
}

export async function toggleEmergency(menuItemId: string, disabled: boolean) {
  const store = await readStore();
  const item = store.menuItems.find((m) => m.id === menuItemId);
  if (!item) return null;
  item.emergencyDisabled = disabled;
  await writeStore(store);
  return item;
}

export async function upsertMenuItem(
  item: Partial<MenuItem> & { name: string; category: MenuItem["category"]; price: number }
): Promise<MenuItem> {
  const store = await readStore();
  if (item.id) {
    const idx = store.menuItems.findIndex((m) => m.id === item.id);
    if (idx >= 0) {
      store.menuItems[idx] = { ...store.menuItems[idx], ...item } as MenuItem;
      await writeStore(store);
      return store.menuItems[idx];
    }
  }
  const newItem: MenuItem = {
    id: uuidv4(),
    name: item.name,
    category: item.category,
    price: item.price,
    stock: item.stock ?? 50,
    stockAlert: item.stockAlert ?? 10,
    available: item.available ?? true,
    emergencyDisabled: false,
    description: item.description,
  };
  store.menuItems.push(newItem);
  await writeStore(store);
  return newItem;
}

export async function deleteMenuItem(id: string) {
  const store = await readStore();
  store.menuItems = store.menuItems.filter((m) => m.id !== id);
  await writeStore(store);
}

export async function upsertPromotion(p: Omit<Promotion, "id"> & { id?: string }) {
  const store = await readStore();
  if (p.id) {
    const idx = store.promotions.findIndex((x) => x.id === p.id);
    if (idx >= 0) {
      store.promotions[idx] = { ...store.promotions[idx], ...p, id: p.id };
      await writeStore(store);
      return store.promotions[idx];
    }
  }
  const promo: Promotion = { ...p, id: uuidv4() };
  store.promotions.push(promo);
  await writeStore(store);
  return promo;
}

export async function upsertSpectacle(
  s: Omit<Spectacle, "id" | "imageUrl"> & { id?: string; imageUrl?: string | null }
) {
  const store = await readStore();
  if (s.id) {
    const idx = store.spectacles.findIndex((x) => x.id === s.id);
    if (idx >= 0) {
      store.spectacles[idx] = {
        ...store.spectacles[idx],
        ...s,
        id: s.id,
        imageUrl: s.imageUrl ?? store.spectacles[idx].imageUrl,
      };
      await writeStore(store);
      return store.spectacles[idx];
    }
  }
  const spec: Spectacle = {
    id: uuidv4(),
    artist: s.artist,
    date: s.date,
    dayLabel: s.dayLabel,
    description: s.description,
    imageUrl: s.imageUrl ?? null,
  };
  store.spectacles.push(spec);
  await writeStore(store);
  return spec;
}

export async function deleteSpectacle(id: string) {
  const store = await readStore();
  const spec = store.spectacles.find((s) => s.id === id);
  if (spec?.imageUrl) {
    const filename = spec.imageUrl.replace("/uploads/", "");
    try {
      await fs.unlink(path.join(UPLOADS_DIR, filename));
    } catch {
      /* ignore */
    }
  }
  store.spectacles = store.spectacles.filter((s) => s.id !== id);
  await writeStore(store);
}

export async function saveUpload(filename: string, buffer: Buffer) {
  await ensureDirs();
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const finalName = `${Date.now()}-${safe}`;
  await fs.writeFile(path.join(UPLOADS_DIR, finalName), buffer);
  return `/uploads/${finalName}`;
}

export function getUploadsPath() {
  return UPLOADS_DIR;
}

const COUNTED_ROOM_STATUSES: Order["status"][] = ["served"];

export function isRoomOrderCounted(status: Order["status"]) {
  return COUNTED_ROOM_STATUSES.includes(status);
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  const store = await readStore();
  const order = store.orders.find((o) => o.id === id);
  if (!order) return null;
  const wasCounted = isRoomOrderCounted(order.status);
  order.status = status;
  order.updatedAt = new Date().toISOString();
  if (
    !wasCounted &&
    isRoomOrderCounted(status) &&
    order.zone === "VIP"
  ) {
    updateVip(store, order.clientLabel, order.total);
  }
  await writeStore(store);
  return order;
}

export async function confirmReservation(id: string) {
  const store = await readStore();
  const r = store.reservations.find((x) => x.id === id);
  if (!r) return null;
  r.status = "confirmed";
  await writeStore(store);
  return r;
}

export async function getDailyStats(): Promise<DailyStats> {
  const store = await readStore();
  const today = localDateStr();
  const todayOrders = store.orders.filter(
    (o) => isOnLocalDay(o.createdAt, today) && isRoomOrderCounted(o.status)
  );
  const validatedOnline = store.onlineOrders.filter(
    (o) =>
      isOnLocalDay(o.createdAt, today) &&
      ["validated", "preparing", "ready", "collected"].includes(o.status)
  );

  const byServer: Record<string, number> = {};
  const byZone: Record<string, number> = {};
  const itemSales: Record<string, number> = {};
  let totalRevenue = 0;

  const processLines = (
    lines: OrderLine[],
    serverName: string,
    zone: string,
    storedTotal: number
  ) => {
    const total = computeLinesTotal(lines) || storedTotal;
    totalRevenue += total;
    byServer[serverName] = (byServer[serverName] || 0) + total;
    byZone[zone] = (byZone[zone] || 0) + total;
    for (const l of lines) {
      itemSales[l.name] = (itemSales[l.name] || 0) + l.quantity;
    }
  };

  for (const o of todayOrders) {
    processLines(o.lines, o.serverName, o.zone, o.total);
  }
  for (const o of validatedOnline) {
    processLines(o.lines, "Click & Collect", "ONLINE", o.total);
  }

  const topServerEntry = Object.entries(byServer).sort((a, b) => b[1] - a[1])[0];
  const topZoneEntry = Object.entries(byZone).sort((a, b) => b[1] - a[1])[0];
  const sortedItems = Object.entries(itemSales).sort((a, b) => b[1] - a[1]);
  const bestSellerEntry = sortedItems[0];
  const topDishes = sortedItems.slice(0, 5).map(([name, quantity]) => ({
    name,
    quantity,
  }));

  const hourlyMap: Record<number, { revenue: number; orders: number }> = {};
  const addHourly = (iso: string, total: number) => {
    const h = new Date(iso).getHours();
    if (!hourlyMap[h]) hourlyMap[h] = { revenue: 0, orders: 0 };
    hourlyMap[h].revenue += total;
    hourlyMap[h].orders += 1;
  };
  for (const o of todayOrders) {
    addHourly(
      o.updatedAt || o.createdAt,
      computeLinesTotal(o.lines) || o.total
    );
  }
  for (const o of validatedOnline) {
    addHourly(o.createdAt, computeLinesTotal(o.lines) || o.total);
  }
  const hourlySales = Object.entries(hourlyMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([h, v]) => ({
      hour: `${h}h`,
      revenue: v.revenue,
      orders: v.orders,
    }));

  return {
    totalRevenue,
    ordersCount: todayOrders.length + validatedOnline.length,
    hourlySales,
    topServer: topServerEntry
      ? { name: topServerEntry[0], revenue: topServerEntry[1] }
      : null,
    topZone: topZoneEntry
      ? { zone: topZoneEntry[0] as Zone, revenue: topZoneEntry[1] }
      : null,
    bestSeller: bestSellerEntry
      ? { name: bestSellerEntry[0], quantity: bestSellerEntry[1] }
      : null,
    topDishes,
    byServer,
    byZone,
    itemSales,
  };
}

function collectItemSales(
  store: StoreData,
  from: string,
  to: string
): { itemSales: Record<string, number>; revenue: number; orders: number } {
  const itemSales: Record<string, number> = {};
  let revenue = 0;
  let orders = 0;

  const inRange = (iso: string) => {
    const d = localDateStr(new Date(iso));
    return d >= from && d <= to;
  };

  for (const o of store.orders) {
    if (!inRange(o.createdAt)) continue;
    if (!isRoomOrderCounted(o.status)) continue;
    orders += 1;
    revenue += computeLinesTotal(o.lines) || o.total;
    for (const l of o.lines) {
      itemSales[l.name] = (itemSales[l.name] || 0) + l.quantity;
    }
  }
  for (const o of store.onlineOrders) {
    if (!inRange(o.createdAt)) continue;
    if (
      !["validated", "preparing", "ready", "collected"].includes(o.status)
    )
      continue;
    orders += 1;
    revenue += computeLinesTotal(o.lines) || o.total;
    for (const l of o.lines) {
      itemSales[l.name] = (itemSales[l.name] || 0) + l.quantity;
    }
  }
  return { itemSales, revenue, orders };
}

export async function getWeeklyStats(): Promise<WeeklyStats> {
  const store = await readStore();
  const now = new Date();
  const byDay: WeeklyStats["byDay"] = [];
  let totalRevenue = 0;
  let ordersCount = 0;
  const weekItemSales: Record<string, number> = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = localDateStr(d);
    const label = d.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      timeZone: "Africa/Abidjan",
    });
    const { itemSales, revenue, orders } = collectItemSales(
      store,
      dateStr,
      dateStr
    );
    totalRevenue += revenue;
    ordersCount += orders;
    for (const [name, qty] of Object.entries(itemSales)) {
      weekItemSales[name] = (weekItemSales[name] || 0) + qty;
    }
    byDay.push({ date: dateStr, label, revenue, orders });
  }

  const topDishes = Object.entries(weekItemSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));

  return { totalRevenue, ordersCount, byDay, topDishes };
}

export async function upsertCarouselHighlight(
  data: Partial<CarouselHighlight> & { title: string; imageUrl: string }
): Promise<CarouselHighlight> {
  const store = await readStore();
  if (!store.carouselHighlights) store.carouselHighlights = [];

  if (data.id) {
    const idx = store.carouselHighlights.findIndex((h) => h.id === data.id);
    if (idx >= 0) {
      store.carouselHighlights[idx] = {
        ...store.carouselHighlights[idx],
        ...data,
        id: data.id,
      } as CarouselHighlight;
      await writeStore(store);
      return store.carouselHighlights[idx];
    }
  }

  const activeCount = store.carouselHighlights.filter((h) => h.active).length;
  const highlight: CarouselHighlight = {
    id: uuidv4(),
    title: data.title,
    imageUrl: data.imageUrl,
    active: data.active ?? true,
    order: data.order ?? activeCount,
  };

  if (activeCount >= 2) {
    const oldest = [...store.carouselHighlights]
      .filter((h) => h.active)
      .sort((a, b) => a.order - b.order)[0];
    if (oldest) oldest.active = false;
  }

  store.carouselHighlights.push(highlight);
  await writeStore(store);
  return highlight;
}

export async function deleteCarouselHighlight(id: string) {
  const store = await readStore();
  store.carouselHighlights = store.carouselHighlights.filter((h) => h.id !== id);
  await writeStore(store);
}

export async function setCarouselHighlightActive(id: string, active: boolean) {
  const store = await readStore();
  const h = store.carouselHighlights.find((x) => x.id === id);
  if (!h) return null;
  if (active) {
    const activeCount = store.carouselHighlights.filter(
      (x) => x.active && x.id !== id
    ).length;
    if (activeCount >= 2) return null;
  }
  h.active = active;
  await writeStore(store);
  return h;
}

export async function verifyServerPin(pin: string) {
  const store = await readStore();
  return store.servers.find((s) => s.pin === pin) ?? null;
}

export async function verifyAdminPin(pin: string) {
  const store = await readStore();
  return store.settings.adminPin === pin;
}
