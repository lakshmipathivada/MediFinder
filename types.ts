export interface MedicineReminder {
  id: string;
  userPhone: string;
  medicineName: string;
  medicineType: string;
  dosage: string;
  times: string[]; // e.g. ["08:00", "20:00"]
  foodInstruction: string; // 'Before Food' | 'After Food' | 'With Food' | 'Empty Stomach'
  frequency: string; // 'Daily' | 'Twice Daily' | 'Weekly' | 'As Needed'
  startDate: string;
  endDate?: string;
  active: boolean;
  notes?: string;
  snoozedUntil?: number; // timestamp
  createdAt: number;
}

export interface DoseLog {
  id: string;
  reminderId: string;
  userPhone: string;
  medicineName: string;
  scheduledTimeSlot: string;
  takenAt: number; // timestamp
  date: string; // 'YYYY-MM-DD'
  status: 'taken_on_time' | 'taken_late' | 'skipped' | 'missed';
  notes?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  ownerName?: string;
  email?: string;
  address: string;
  city: string;
  phone: string;
  distanceKm: number;
  lat: number;
  lng: number;
  openHours: string;
  isOpen: boolean;
  rating?: number;
  medicines: {
    name: string;
    genericName: string;
    dosage: string;
    price: number;
    stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
    quantity: number;
  }[];
}

export interface UserProfile {
  uid?: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  authProvider?: 'google' | 'phone' | 'guest';
}
