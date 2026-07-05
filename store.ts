import { RegisteredCustomer, SearchQueryLog, Pharmacy } from '../types';

// Pre-seeded Indian Pharmacies in Andhra Pradesh (Vijayawada & Guntur Hub)
const PRE_SEEDED_PHARMACIES: Pharmacy[] = [
  {
    id: 'pharma-1',
    name: 'Sri Srinivasa Medicals & General Stores',
    address: 'Near Benz Circle, Ring Road, Vijayawada, Andhra Pradesh 520010',
    lat: 16.5112,
    lng: 80.6502,
    contactNumber: '+91 94402 12345',
    rating: 4.6,
    medicines: {
      'dolo 650': 28.00,
      'paracetamol': 14.00,
      'calpol 650': 26.00,
      'asthalin inhaler': 142.00,
      'azithral 500': 144.03,
      'crocin advance': 15.00,
      'pantocid 40': 120.00,
      'augmentin 625': 200.00
    },
    stocks: {
      'azithral 500': 13,
      'dolo 650': 100
    },
    createdAt: new Date(2026, 4, 1).toISOString()
  },
  {
    id: 'pharma-2',
    name: 'Vijaya Medicals & Surgicals',
    address: 'M.G. Road, Near Labbipet, Vijayawada, Andhra Pradesh 520010',
    lat: 16.5022,
    lng: 80.6450,
    contactNumber: '+91 98480 23456',
    rating: 4.4,
    medicines: {
      'dolo 650': 29.50,
      'paracetamol': 14.50,
      'calpol 650': 27.00,
      'azithral 500': 115.97,
      'crocin advance': 14.00,
      'pantocid 40': 115.00,
      'augmentin 625': 195.00
    },
    stocks: {
      'azithral 500': 50,
      'dolo 650': 150
    },
    createdAt: new Date(2026, 4, 2).toISOString()
  },
  {
    id: 'pharma-3',
    name: 'SVR Umasankar Medicals',
    address: 'Eluru Road, Governorpet, Vijayawada, Andhra Pradesh 520002',
    lat: 16.5082,
    lng: 80.6420,
    contactNumber: '+91 99080 34567',
    rating: 4.5,
    medicines: {
      'dolo 650': 30.00,
      'paracetamol': 15.00,
      'azithral 500': 139.50,
      'crocin advance': 16.00,
      'pantocid 40': 125.00,
      'augmentin 625': 210.00
    },
    stocks: {
      'azithral 500': 3,
      'dolo 650': 80
    },
    createdAt: new Date(2026, 4, 3).toISOString()
  },
  {
    id: 'pharma-4',
    name: 'Sri Balaji Medicals',
    address: 'Kanuru Main Road, Vijayawada, Andhra Pradesh 520007',
    lat: 16.5042,
    lng: 80.6560,
    contactNumber: '+91 91770 45678',
    rating: 4.7,
    medicines: {
      'dolo 650': 31.00,
      'azithral 500': 132.01,
      'crocin advance': 15.50,
      'pantocid 40': 122.00,
      'augmentin 625': 205.00
    },
    stocks: {
      'azithral 500': 6,
      'dolo 650': 120
    },
    createdAt: new Date(2026, 4, 4).toISOString()
  },
  {
    id: 'pharma-5',
    name: 'Durga Drug House',
    address: 'One Town, Near Kaleswara Rao Market, Vijayawada, Andhra Pradesh 520001',
    lat: 16.5122,
    lng: 80.6380,
    contactNumber: '+91 94901 56789',
    rating: 4.3,
    medicines: {
      'dolo 650': 27.50,
      'azithral 500': 144.56,
      'crocin advance': 14.50,
      'pantocid 40': 118.00,
      'augmentin 625': 198.00
    },
    stocks: {
      'azithral 500': 51,
      'dolo 650': 200
    },
    createdAt: new Date(2026, 4, 5).toISOString()
  },
  {
    id: 'pharma-6',
    name: 'Apollo Pharmacy',
    address: 'NH16, Near NTR University of Health Sciences, Vijayawada, Andhra Pradesh 520008',
    lat: 16.5152,
    lng: 80.6530,
    contactNumber: '+91 866 248 5555',
    rating: 4.8,
    isBestRated: true,
    medicines: {
      'dolo 650': 30.50,
      'paracetamol': 15.00,
      'calpol 650': 28.00,
      'asthalin inhaler': 145.00,
      'azithral 500': 126.25,
      'crocin advance': 15.00,
      'pantocid 40': 120.00,
      'augmentin 625': 210.00
    },
    stocks: {
      'azithral 500': 16,
      'dolo 650': 45
    },
    createdAt: new Date(2026, 4, 6).toISOString()
  },
  {
    id: 'pharma-7',
    name: 'Sri Sai Tirumala Medicals',
    address: 'Beside GGH Hospital, Lakshmipuram, Guntur, Andhra Pradesh 522007',
    lat: 16.4982,
    lng: 80.6511,
    contactNumber: '+91 93910 67890',
    rating: 4.5,
    medicines: {
      'dolo 650': 30.00,
      'azithral 500': 120.00,
      'crocin advance': 15.00,
      'pantocid 40': 122.00,
      'augmentin 625': 202.00
    },
    stocks: {
      'azithral 500': 0,
      'dolo 650': 0
    },
    createdAt: new Date(2026, 4, 7).toISOString()
  }
];

const PRE_SEEDED_CUSTOMERS: RegisteredCustomer[] = [
  {
    id: 'cust-1',
    name: 'Lakshmi',
    phone: '9603346102',
    createdAt: new Date(2026, 4, 14, 8, 18, 5).toISOString(),
    loginsCount: 7,
    firstLogin: '14/05/2026, 08:18:05',
    lastActive: '18/05/2026, 06:57:59',
    isOnline: true
  },
  {
    id: 'cust-2',
    name: 'k.ramu',
    phone: '7569077459',
    createdAt: new Date(2026, 4, 17, 19, 39, 14).toISOString(),
    loginsCount: 1,
    firstLogin: '17/05/2026, 19:39:14',
    lastActive: '17/05/2026, 19:39:14',
    isOnline: false
  },
  {
    id: 'cust-3',
    name: 'Ramya',
    phone: '9100783439',
    createdAt: new Date(2026, 4, 17, 3, 32, 39).toISOString(),
    loginsCount: 1,
    firstLogin: '17/05/2026, 03:32:39',
    lastActive: '17/05/2026, 03:32:39',
    isOnline: false
  },
  {
    id: 'cust-4',
    name: 'Nandini',
    phone: '9100462612',
    createdAt: new Date(2026, 4, 14, 19, 39, 14).toISOString(),
    loginsCount: 6,
    firstLogin: '14/05/2026, 19:39:14',
    lastActive: '16/05/2026, 20:08:48',
    isOnline: false
  },
  {
    id: 'cust-5',
    name: 'Nitin',
    phone: '919603346102',
    createdAt: new Date(2026, 4, 14, 18, 2, 33).toISOString(),
    loginsCount: 5,
    firstLogin: '14/05/2026, 18:02:33',
    lastActive: '15/05/2026, 18:02:33',
    isOnline: false
  },
  {
    id: 'cust-6',
    name: 'Golbabu',
    phone: '9010462612',
    createdAt: new Date(2026, 4, 15, 10, 5, 35).toISOString(),
    loginsCount: 1,
    firstLogin: '15/05/2026, 10:05:35',
    lastActive: '15/05/2026, 10:05:35',
    isOnline: false
  },
  {
    id: 'cust-7',
    name: 'Alamanda Sunitha',
    phone: '919949896490',
    createdAt: new Date(2026, 4, 14, 19, 59, 26).toISOString(),
    loginsCount: 1,
    firstLogin: '14/05/2026, 19:59:26',
    lastActive: '15/05/2026, 09:43:49',
    isOnline: false
  },
  {
    id: 'cust-8',
    name: 'Boora praveen',
    phone: '7780135591',
    createdAt: new Date(2026, 4, 14, 19, 59, 26).toISOString(),
    loginsCount: 2,
    firstLogin: '14/05/2026, 19:59:26',
    lastActive: '15/05/2026, 09:43:49',
    isOnline: false
  },
  {
    id: 'cust-9',
    name: 'Alamanda Tejaswini',
    phone: '6309138071',
    createdAt: new Date(2026, 4, 14, 19, 59, 26).toISOString(),
    loginsCount: 1,
    firstLogin: '14/05/2026, 19:59:26',
    lastActive: '15/05/2026, 09:43:49',
    isOnline: false
  },
  {
    id: 'cust-10',
    name: 'Lakshmi Pathivada',
    phone: '9177060520',
    createdAt: new Date(2026, 4, 14, 19, 59, 26).toISOString(),
    loginsCount: 1,
    firstLogin: '14/05/2026, 19:59:26',
    lastActive: '15/05/2026, 09:43:49',
    isOnline: false
  },
  {
    id: 'cust-11',
    name: 'Hasini',
    phone: '9160334610',
    createdAt: new Date(2026, 4, 14, 19, 59, 26).toISOString(),
    loginsCount: 1,
    firstLogin: '14/05/2026, 19:59:26',
    lastActive: '15/05/2026, 09:43:49',
    isOnline: false
  },
  {
    id: 'cust-12',
    name: 'Kanugula sravanthi',
    phone: '9154321098',
    createdAt: new Date(2026, 4, 14, 19, 59, 26).toISOString(),
    loginsCount: 1,
    firstLogin: '14/05/2026, 19:59:26',
    lastActive: '15/05/2026, 09:43:49',
    isOnline: false
  }
];

const generatePreSeededLogs = (): SearchQueryLog[] => {
  const list: SearchQueryLog[] = [];
  const queries = [
    { q: 'paracetamol', count: 16 },
    { q: 'dolo 650', count: 15 },
    { q: 'medicine', count: 14 },
    { q: 'crocin advance', count: 12 },
    { q: 'paracetamol 650', count: 10 },
    { q: 'pantocid 40', count: 9 },
    { q: 'azithral 500', count: 8 },
    { q: 'pantocid-500', count: 6 },
    { q: 'pantoprazole', count: 5 },
    { q: 'remidif', count: 4 }
  ];

  const customersPool = [
    { name: 'Lakshmi', phone: '9603346102' },
    { name: 'k.ramu', phone: '7569077459' },
    { name: 'Ramya', phone: '9100783439' },
    { name: 'Nandini', phone: '9100462612' },
    { name: 'Nitin', phone: '919603346102' }
  ];

  let idCounter = 1;
  queries.forEach(({ q, count }) => {
    for (let i = 0; i < count; i++) {
      const cust = customersPool[Math.floor(Math.random() * customersPool.length)];
      const day = Math.floor(Math.random() * 5) + 14;
      const hour = Math.floor(Math.random() * 12) + 8;
      const min = Math.floor(Math.random() * 60);
      list.push({
        id: `log-${idCounter++}`,
        customerName: cust.name,
        customerPhone: cust.phone,
        query: q,
        timestamp: new Date(2026, 4, day, hour, min).toISOString()
      });
    }
  });

  return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const PRE_SEEDED_LOGS: SearchQueryLog[] = generatePreSeededLogs();

class AppStore {
  private listeners: Set<() => void> = new Set();
  private customers: RegisteredCustomer[] = [];
  private searchLogs: SearchQueryLog[] = [];
  private pharmacies: Pharmacy[] = [];
  private activeUser: { name: string; phone: string } | null = null;

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedCustomers = localStorage.getItem('mf_customers');
      const storedLogs = localStorage.getItem('mf_logs');
      const storedPharmacies = localStorage.getItem('mf_pharmacies');
      const storedUser = localStorage.getItem('mf_active_user');
      const hasLoggedOut = localStorage.getItem('mf_logged_out') === 'true';

      this.customers = storedCustomers ? JSON.parse(storedCustomers) : PRE_SEEDED_CUSTOMERS;
      this.searchLogs = storedLogs ? JSON.parse(storedLogs) : PRE_SEEDED_LOGS;
      this.pharmacies = storedPharmacies ? JSON.parse(storedPharmacies) : PRE_SEEDED_PHARMACIES;
      
      if (hasLoggedOut) {
        this.activeUser = null;
      } else {
        this.activeUser = storedUser ? JSON.parse(storedUser) : null;
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
      this.customers = PRE_SEEDED_CUSTOMERS;
      this.searchLogs = PRE_SEEDED_LOGS;
      this.pharmacies = PRE_SEEDED_PHARMACIES;
      this.activeUser = null;
    }
  }

  private saveState() {
    try {
      localStorage.setItem('mf_customers', JSON.stringify(this.customers));
      localStorage.setItem('mf_logs', JSON.stringify(this.searchLogs));
      localStorage.setItem('mf_pharmacies', JSON.stringify(this.pharmacies));
      if (this.activeUser) {
        localStorage.setItem('mf_active_user', JSON.stringify(this.activeUser));
      } else {
        localStorage.removeItem('mf_active_user');
      }
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // Active User / Auth operations
  public getActiveUser() {
    return this.activeUser;
  }

  public loginUser(name: string, phone: string) {
    const formattedPhone = phone.trim();
    const formattedName = name.trim();

    try {
      localStorage.removeItem('mf_logged_out');
    } catch (e) {
      console.error(e);
    }

    this.activeUser = { name: formattedName, phone: formattedPhone };

    // Register customer if they don't already exist in our customer logs
    const exists = this.customers.some(
      c => c.phone === formattedPhone || (c.name.toLowerCase() === formattedName.toLowerCase() && c.phone === formattedPhone)
    );

    if (!exists) {
      const newCustomer: RegisteredCustomer = {
        id: 'cust-' + Math.random().toString(36).substr(2, 9),
        name: formattedName,
        phone: formattedPhone,
        createdAt: new Date().toISOString()
      };
      this.customers = [newCustomer, ...this.customers];
    }

    this.saveState();
    return this.activeUser;
  }

  public logoutUser() {
    this.activeUser = null;
    try {
      localStorage.setItem('mf_logged_out', 'true');
    } catch (e) {
      console.error(e);
    }
    this.saveState();
  }

  // Customers Querying
  public getCustomers() {
    return this.customers;
  }

  // Searching & Logging
  public getSearchLogs() {
    return this.searchLogs;
  }

  public logSearch(query: string) {
    if (!this.activeUser || !query.trim()) return;

    const newLog: SearchQueryLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      customerName: this.activeUser.name,
      customerPhone: this.activeUser.phone,
      query: query.trim(),
      timestamp: new Date().toISOString()
    };

    this.searchLogs = [newLog, ...this.searchLogs];
    this.saveState();
  }

  // Pharmacies Querying and Connection
  public getPharmacies() {
    return this.pharmacies;
  }

  public connectPharmacy(
    name: string,
    address: string,
    lat: number,
    lng: number,
    contactNumber: string,
    medicines: { [medicineName: string]: number }
  ) {
    // Normalise all medicine names to lowercase for robust matching
    const normalisedMeds: { [medicineName: string]: number } = {};
    Object.entries(medicines).forEach(([med, price]) => {
      normalisedMeds[med.trim().toLowerCase()] = Number(price);
    });

    const newPharma: Pharmacy = {
      id: 'pharma-' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      address: address.trim(),
      lat: Number(lat),
      lng: Number(lng),
      contactNumber: contactNumber.trim(),
      rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)), // random nice rating between 4.0 and 5.0
      medicines: normalisedMeds,
      createdAt: new Date().toISOString()
    };

    this.pharmacies = [newPharma, ...this.pharmacies];
    this.saveState();
    return newPharma;
  }

  // Clear data (useful for reset)
  public resetAllData() {
    localStorage.removeItem('mf_customers');
    localStorage.removeItem('mf_logs');
    localStorage.removeItem('mf_pharmacies');
    localStorage.removeItem('mf_active_user');
    this.loadState();
    this.notify();
  }
}

export const store = new AppStore();
