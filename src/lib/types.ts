export type Zone = "VIP" | "OPEN_SPACE";

export type OrderStatus =
  | "pending"
  | "sent"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";

export interface Promotion {
  id: string;
  title: string;
  description: string;
  active: boolean;
  badge?: string;
  imageUrl?: string | null;
}

export interface Spectacle {
  id: string;
  artist: string;
  date: string;
  dayLabel: string;
  description: string;
  imageUrl: string | null;
}

/** Carte dynamique — max 2 exclusivités (admin) */
export interface CarouselHighlight {
  id: string;
  title: string;
  imageUrl: string;
  active: boolean;
  order: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: "plats" | "boissons";
  price: number;
  stock: number;
  stockAlert: number;
  available: boolean;
  emergencyDisabled: boolean;
  description?: string;
  imageUrl?: string | null;
}

export interface OrderLine {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  zone: Zone;
  clientLabel: string;
  serverId: string;
  serverName: string;
  lines: OrderLine[];
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  name: string;
  guests: number;
  date: string;
  zone: Zone;
  phone?: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export interface OnlineOrder {
  id: string;
  name: string;
  phone: string;
  lines: OrderLine[];
  total: number;
  type: "click_collect";
  status:
    | "pending_validation"
    | "validated"
    | "preparing"
    | "ready"
    | "collected"
    | "cancelled";
  createdAt: string;
}

export interface VipClient {
  id: string;
  name: string;
  phone?: string;
  totalSpent: number;
  visitCount: number;
  lastVisit?: string;
  notes?: string;
}

export interface Server {
  id: string;
  name: string;
  pin: string;
}

export interface VenueSettings {
  address: string;
  landmark: string;
  phone: string;
  email: string;
}

export interface StoreData {
  promotions: Promotion[];
  spectacles: Spectacle[];
  carouselHighlights: CarouselHighlight[];
  menuItems: MenuItem[];
  orders: Order[];
  reservations: Reservation[];
  onlineOrders: OnlineOrder[];
  vipClients: VipClient[];
  servers: Server[];
  settings: {
    adminPin: string;
    lowStockThreshold: number;
    venue: VenueSettings;
  };
}

export interface HourlySales {
  hour: string;
  revenue: number;
  orders: number;
}

export interface DailyStats {
  totalRevenue: number;
  ordersCount: number;
  topServer: { name: string; revenue: number } | null;
  topZone: { zone: Zone | string; revenue: number } | null;
  bestSeller: { name: string; quantity: number } | null;
  topDishes: { name: string; quantity: number }[];
  hourlySales: HourlySales[];
  byServer: Record<string, number>;
  byZone: Record<string, number>;
  itemSales: Record<string, number>;
}

export interface WeeklyStats {
  totalRevenue: number;
  ordersCount: number;
  byDay: {
    date: string;
    label: string;
    revenue: number;
    orders: number;
  }[];
  topDishes: { name: string; quantity: number }[];
}
