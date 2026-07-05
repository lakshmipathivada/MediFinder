export interface RegisteredCustomer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  loginsCount?: number;
  firstLogin?: string;
  lastActive?: string;
  isOnline?: boolean;
}

export interface SearchQueryLog {
  id: string;
  customerName: string;
  customerPhone: string;
  query: string;
  timestamp: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  contactNumber: string;
  rating: number; // e.g., 4.8
  isBestRated?: boolean;
  medicines: {
    [medicineName: string]: number; // Price in ₹
  };
  stocks?: {
    [medicineName: string]: number; // Stock count
  };
  createdAt: string;
}

export interface UserCoords {
  lat: number;
  lng: number;
  isLive: boolean;
  simulatedName?: string;
}
