import { Pharmacy } from '../types';

const STORAGE_PHARMACIES_KEY = 'medifinder_pharmacies_v4';

export const INITIAL_PHARMACIES: Pharmacy[] = [
  {
    id: 'ph-1',
    name: 'Apollo Pharmacy - Health Hub',
    address: 'Plot 42, Road No 1, Jubilee Hills',
    city: 'Hyderabad',
    phone: '+91 98765 11111',
    distanceKm: 0.8,
    lat: 17.4325,
    lng: 78.4071,
    openHours: 'Open 24 Hours',
    isOpen: true,
    medicines: [
      { name: 'Dolo 650', genericName: 'Paracetamol / Acetaminophen', dosage: '650mg', price: 30, stockStatus: 'In Stock', quantity: 180 },
      { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', dosage: '500mg', price: 25, stockStatus: 'In Stock', quantity: 150 },
      { name: 'Crocin 650mg', genericName: 'Paracetamol', dosage: '650mg', price: 32, stockStatus: 'In Stock', quantity: 90 },
      { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', dosage: '250mg', price: 65, stockStatus: 'In Stock', quantity: 80 },
      { name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', dosage: '5mg', price: 40, stockStatus: 'In Stock', quantity: 45 },
      { name: 'Metformin 500mg', genericName: 'Metformin HCl', dosage: '500mg', price: 30, stockStatus: 'Low Stock', quantity: 12 },
      { name: 'Azithromycin 500mg', genericName: 'Azithromycin', dosage: '500mg', price: 110, stockStatus: 'Out of Stock', quantity: 0 },
      { name: 'Pantoprazole 40mg', genericName: 'Pantoprazole Sodium', dosage: '40mg', price: 55, stockStatus: 'In Stock', quantity: 95 }
    ]
  },
  {
    id: 'ph-2',
    name: 'MedPlus Wellness Chemist',
    address: 'Shop 12, Main Commercial Complex, Banjara Hills',
    city: 'Hyderabad',
    phone: '+91 98765 22222',
    distanceKm: 1.4,
    lat: 17.4156,
    lng: 78.4347,
    openHours: '7:00 AM - 11:00 PM',
    isOpen: true,
    medicines: [
      { name: 'Dolo 650', genericName: 'Paracetamol', dosage: '650mg', price: 28, stockStatus: 'In Stock', quantity: 220 },
      { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', dosage: '500mg', price: 22, stockStatus: 'In Stock', quantity: 200 },
      { name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', dosage: '5mg', price: 38, stockStatus: 'In Stock', quantity: 60 },
      { name: 'Metformin 500mg', genericName: 'Metformin HCl', dosage: '500mg', price: 28, stockStatus: 'In Stock', quantity: 110 },
      { name: 'Azithromycin 500mg', genericName: 'Azithromycin', dosage: '500mg', price: 105, stockStatus: 'In Stock', quantity: 25 },
      { name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', dosage: '10mg', price: 18, stockStatus: 'In Stock', quantity: 140 }
    ]
  },
  {
    id: 'ph-3',
    name: 'Care & Cure Medical Stores',
    address: 'Door 8-2-293, Beside City Center Mall, Punjagutta',
    city: 'Hyderabad',
    phone: '+91 98765 33333',
    distanceKm: 2.1,
    lat: 17.4239,
    lng: 78.4518,
    openHours: '8:00 AM - 10:30 PM',
    isOpen: true,
    medicines: [
      { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', dosage: '500mg', price: 24, stockStatus: 'In Stock', quantity: 90 },
      { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', dosage: '250mg', price: 62, stockStatus: 'Low Stock', quantity: 8 },
      { name: 'Pantoprazole 40mg', genericName: 'Pantoprazole Sodium', dosage: '40mg', price: 50, stockStatus: 'In Stock', quantity: 70 },
      { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', dosage: '400mg', price: 35, stockStatus: 'In Stock', quantity: 120 }
    ]
  },
  {
    id: 'ph-4',
    name: 'Wellness Forever 24x7 Pharmacy',
    address: 'Road No 36, Near Metro Pillar 125, Jubilee Hills',
    city: 'Hyderabad',
    phone: '+91 98765 44444',
    distanceKm: 0.5,
    lat: 17.4350,
    lng: 78.4020,
    openHours: 'Open 24 Hours',
    isOpen: true,
    medicines: [
      { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', dosage: '500mg', price: 26, stockStatus: 'In Stock', quantity: 300 },
      { name: 'Azithromycin 500mg', genericName: 'Azithromycin', dosage: '500mg', price: 108, stockStatus: 'In Stock', quantity: 40 },
      { name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', dosage: '10mg', price: 85, stockStatus: 'In Stock', quantity: 75 },
      { name: 'Insulin Glargine 100IU', genericName: 'Insulin', dosage: '100IU/ml', price: 450, stockStatus: 'Low Stock', quantity: 5 }
    ]
  },
  {
    id: 'ph-5',
    name: 'Apollo Express Chemist',
    address: 'Plot 18, Kavuri Hills, Madhapur',
    city: 'Hyderabad',
    phone: '+91 98765 55555',
    distanceKm: 2.8,
    lat: 17.4420,
    lng: 78.3910,
    openHours: '8:00 AM - 11:00 PM',
    isOpen: true,
    medicines: [
      { name: 'Metformin 500mg', genericName: 'Metformin HCl', dosage: '500mg', price: 32, stockStatus: 'In Stock', quantity: 180 },
      { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', dosage: '250mg', price: 68, stockStatus: 'In Stock', quantity: 95 },
      { name: 'Omeprazole 20mg', genericName: 'Omeprazole', dosage: '20mg', price: 42, stockStatus: 'In Stock', quantity: 110 }
    ]
  }
];

export class PharmacyStore {
  public static getPharmacies(): Pharmacy[] {
    if (typeof window === 'undefined') return INITIAL_PHARMACIES;
    try {
      const raw = localStorage.getItem(STORAGE_PHARMACIES_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_PHARMACIES_KEY, JSON.stringify(INITIAL_PHARMACIES));
        return INITIAL_PHARMACIES;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_PHARMACIES;
    }
  }

  public static addPharmacy(pharmacy: Omit<Pharmacy, 'id'>): Pharmacy {
    const newPh: Pharmacy = {
      ...pharmacy,
      id: 'ph-' + Date.now()
    };
    const current = this.getPharmacies();
    current.unshift(newPh);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_PHARMACIES_KEY, JSON.stringify(current));
    }
    return newPh;
  }

  public static updatePharmacy(id: string, updatedData: Partial<Pharmacy>): Pharmacy | null {
    const current = this.getPharmacies();
    const index = current.findIndex(p => p.id === id);
    if (index === -1) return null;

    current[index] = {
      ...current[index],
      ...updatedData
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_PHARMACIES_KEY, JSON.stringify(current));
    }
    return current[index];
  }

  public static upsertPharmacy(pharmacyData: Omit<Pharmacy, 'id'> & { id?: string }): Pharmacy {
    const current = this.getPharmacies();
    
    // Check if pharmacy exists by id or exact phone number
    let existingIndex = -1;
    if (pharmacyData.id) {
      existingIndex = current.findIndex(p => p.id === pharmacyData.id);
    }
    if (existingIndex === -1 && pharmacyData.phone) {
      existingIndex = current.findIndex(p => p.phone.replace(/\D/g, '') === pharmacyData.phone.replace(/\D/g, ''));
    }

    if (existingIndex !== -1) {
      const existing = current[existingIndex];
      const updated: Pharmacy = {
        ...existing,
        ...pharmacyData,
        id: existing.id
      };
      current[existingIndex] = updated;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_PHARMACIES_KEY, JSON.stringify(current));
      }
      return updated;
    } else {
      return this.addPharmacy(pharmacyData);
    }
  }
}
