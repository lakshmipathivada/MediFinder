import { MedicineReminder, DoseLog } from '../types';
import { PushNotificationService } from './pushNotificationService';

const STORAGE_REMINDERS_KEY = 'medifinder_reminders_v2';
const STORAGE_LOGS_KEY = 'medifinder_logs_v2';
const DB_NAME = 'medifinder_idb_v1';
const DB_VERSION = 1;

// Default initial sample reminders for new users
const SAMPLE_REMINDERS: MedicineReminder[] = [
  {
    id: 'sample-1',
    userPhone: '9876543210',
    medicineName: 'Paracetamol 500mg',
    medicineType: 'Tablet',
    dosage: '1 tablet (500mg)',
    times: ['08:00', '20:00'],
    foodInstruction: 'After Food',
    frequency: 'Twice Daily',
    startDate: new Date().toISOString().split('T')[0],
    active: true,
    notes: 'For mild fever or pain relief',
    createdAt: Date.now() - 86400000
  },
  {
    id: 'sample-2',
    userPhone: '9876543210',
    medicineName: 'Amoxicillin 250mg',
    medicineType: 'Capsule',
    dosage: '1 capsule',
    times: ['14:00'],
    foodInstruction: 'With Food',
    frequency: 'Daily',
    startDate: new Date().toISOString().split('T')[0],
    active: true,
    notes: 'Prescribed antibiotic course',
    createdAt: Date.now() - 43200000
  }
];

class ReminderStore {
  private listeners: Array<() => void> = [];
  private cloudSyncHandler?: {
    pushReminder: (r: MedicineReminder) => void;
    deleteReminder: (id: string) => void;
    pushLog: (l: DoseLog) => void;
  };

  public registerCloudSyncHandler(handler: {
    pushReminder: (r: MedicineReminder) => void;
    deleteReminder: (id: string) => void;
    pushLog: (l: DoseLog) => void;
  }) {
    this.cloudSyncHandler = handler;
  }

  constructor() {
    this.initDefaults();
    this.initIDBSync();
    this.setupSWListener();
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        return reject(new Error('IndexedDB not supported'));
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('reminders')) {
          db.createObjectStore('reminders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('logs')) {
          db.createObjectStore('logs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        }
      };
      request.onsuccess = (event: any) => resolve(event.target.result);
      request.onerror = (event: any) => reject(event.target.error);
    });
  }

  private initDefaults() {
    if (typeof window === 'undefined') return;
    const existing = localStorage.getItem(STORAGE_REMINDERS_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(SAMPLE_REMINDERS));
    }
  }

  private async initIDBSync() {
    if (typeof window === 'undefined') return;
    try {
      const db = await this.openDB();
      const localReminders = this.getAllReminders();
      const localLogs = this.getAllLogs();

      // Read from IndexedDB to check for offline background updates
      const tx = db.transaction(['reminders', 'logs'], 'readwrite');
      const remStore = tx.objectStore('reminders');
      const logStore = tx.objectStore('logs');

      const remReq = remStore.getAll();
      remReq.onsuccess = () => {
        const idbReminders: MedicineReminder[] = remReq.result || [];
        if (idbReminders.length > 0) {
          // Merge IDB with localStorage
          const map = new Map<string, MedicineReminder>();
          localReminders.forEach(r => map.set(r.id, r));
          idbReminders.forEach(r => map.set(r.id, r));
          const merged = Array.from(map.values());
          localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(merged));
          this.notify();
        } else if (localReminders.length > 0) {
          // Populate IDB from localStorage if IDB is empty
          const writeTx = db.transaction('reminders', 'readwrite');
          const wStore = writeTx.objectStore('reminders');
          localReminders.forEach(r => wStore.put(r));
        }
      };

      const logReq = logStore.getAll();
      logReq.onsuccess = () => {
        const idbLogs: DoseLog[] = logReq.result || [];
        if (idbLogs.length > 0) {
          const map = new Map<string, DoseLog>();
          localLogs.forEach(l => map.set(l.id, l));
          idbLogs.forEach(l => map.set(l.id, l));
          const mergedLogs = Array.from(map.values());
          localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(mergedLogs));
          this.notify();
        } else if (localLogs.length > 0) {
          const writeTx = db.transaction('logs', 'readwrite');
          const wStore = writeTx.objectStore('logs');
          localLogs.forEach(l => wStore.put(l));
        }
      };
    } catch (err) {
      console.warn('[ReminderStore] IDB init sync failed:', err);
    }
  }

  private setupSWListener() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (!event.data) return;
        if (event.data.type === 'SYNC_REMINDERS' && Array.isArray(event.data.reminders)) {
          localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(event.data.reminders));
          this.notify();
        } else if (event.data.type === 'SYNC_LOGS' && Array.isArray(event.data.logs)) {
          localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(event.data.logs));
          this.notify();
        } else if (event.data.type === 'BACKGROUND_SYNC_COMPLETE') {
          this.syncIDBToLocalStorage();
        }
      });

      window.addEventListener('online', () => {
        this.triggerBackgroundSync();
      });
    }
  }

  private async syncIDBToLocalStorage() {
    try {
      const db = await this.openDB();
      const tx = db.transaction(['reminders', 'logs'], 'readonly');
      
      const remReq = tx.objectStore('reminders').getAll();
      remReq.onsuccess = () => {
        if (remReq.result) {
          localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(remReq.result));
        }
      };

      const logReq = tx.objectStore('logs').getAll();
      logReq.onsuccess = () => {
        if (logReq.result) {
          localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logReq.result));
        }
      };
      this.notify();
    } catch {}
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public triggerBackgroundSync() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg: any) => {
        if ('sync' in reg) {
          reg.sync.register('sync-reminders').catch(() => {});
          reg.sync.register('sync-dose-logs').catch(() => {});
        }
        const target = reg.active || navigator.serviceWorker.controller;
        if (target) {
          target.postMessage({ type: 'PROCESS_SYNC_NOW' });
        }
      }).catch(() => {});
    }
  }

  public async syncServiceWorker(userPhone: string) {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const reminders = this.getReminders(userPhone);
      const logs = this.getLogs(userPhone);

      // Save to IndexedDB
      try {
        const db = await this.openDB();
        const tx = db.transaction(['reminders', 'logs'], 'readwrite');
        const remStore = tx.objectStore('reminders');
        const logStore = tx.objectStore('logs');
        
        remStore.clear();
        reminders.forEach(r => remStore.put(r));

        logs.forEach(l => logStore.put(l));
      } catch (err) {
        console.warn('[ReminderStore] IDB update error:', err);
      }

      // Post message to Service Worker
      const target = navigator.serviceWorker.controller || (navigator.serviceWorker as any).active;
      if (target) {
        target.postMessage({ type: 'SYNC_REMINDERS', reminders });
        target.postMessage({ type: 'SYNC_LOGS', logs });
      } else {
        navigator.serviceWorker.ready.then((reg) => {
          if (reg.active) {
            reg.active.postMessage({ type: 'SYNC_REMINDERS', reminders });
            reg.active.postMessage({ type: 'SYNC_LOGS', logs });
          }
        }).catch(() => {});
      }

      // Sync to Push Notification Server (for closed-tab reminders)
      PushNotificationService.syncReminders(userPhone, reminders).catch(() => {});

      this.triggerBackgroundSync();
    }
  }

  public getReminders(userPhone: string): MedicineReminder[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_REMINDERS_KEY);
      if (!raw) return [];
      const all: MedicineReminder[] = JSON.parse(raw);
      return all.filter(r => r.userPhone === userPhone || r.userPhone === '9876543210');
    } catch {
      return [];
    }
  }

  public getAllReminders(): MedicineReminder[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_REMINDERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public setRemindersFromCloud(userPhone: string, cloudReminders: MedicineReminder[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(cloudReminders));
      this.notify();
      this.syncServiceWorker(userPhone);
    } catch (err) {
      console.warn('[ReminderStore] Error applying cloud reminders:', err);
    }
  }

  public setLogsFromCloud(userPhone: string, cloudLogs: DoseLog[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(cloudLogs));
      this.notify();
      this.syncServiceWorker(userPhone);
    } catch (err) {
      console.warn('[ReminderStore] Error applying cloud logs:', err);
    }
  }

  public addReminder(userPhone: string, reminder: Omit<MedicineReminder, 'id' | 'userPhone' | 'createdAt'>): MedicineReminder {
    const newRem: MedicineReminder = {
      ...reminder,
      id: 'rem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userPhone,
      createdAt: Date.now()
    };
    const all = this.getAllReminders();
    all.unshift(newRem);
    localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(all));
    this.notify();
    this.syncServiceWorker(userPhone);
    this.cloudSyncHandler?.pushReminder(newRem);
    return newRem;
  }

  public updateReminder(userPhone: string, updated: MedicineReminder): void {
    const all = this.getAllReminders();
    const idx = all.findIndex(r => r.id === updated.id);
    if (idx !== -1) {
      all[idx] = updated;
      localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(all));
      this.notify();
      this.syncServiceWorker(userPhone);
      this.cloudSyncHandler?.pushReminder(updated);
    }
  }

  public toggleActive(userPhone: string, reminderId: string): void {
    const all = this.getAllReminders();
    const target = all.find(r => r.id === reminderId);
    if (target) {
      target.active = !target.active;
      localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(all));
      this.notify();
      this.syncServiceWorker(userPhone);
      this.cloudSyncHandler?.pushReminder(target);
    }
  }

  public deleteReminder(userPhone: string, reminderId: string): void {
    let all = this.getAllReminders();
    all = all.filter(r => r.id !== reminderId);
    localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(all));
    this.notify();
    this.syncServiceWorker(userPhone);
    this.cloudSyncHandler?.deleteReminder(reminderId);
  }

  public clearAllReminders(userPhone: string): void {
    const targets = this.getAllReminders().filter(r => r.userPhone === userPhone || r.userPhone === '9876543210');
    let all = this.getAllReminders();
    all = all.filter(r => r.userPhone !== userPhone && r.userPhone !== '9876543210');
    localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(all));
    this.notify();
    this.syncServiceWorker(userPhone);
    targets.forEach(t => this.cloudSyncHandler?.deleteReminder(t.id));
  }

  public snoozeReminder(userPhone: string, reminderId: string, minutes: number): void {
    const all = this.getAllReminders();
    const target = all.find(r => r.id === reminderId);
    if (target) {
      target.snoozedUntil = Date.now() + minutes * 60 * 1000;
      localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(all));
      this.notify();
      this.syncServiceWorker(userPhone);
      this.cloudSyncHandler?.pushReminder(target);
    }
  }

  public clearSnooze(userPhone: string, reminderId: string): void {
    const all = this.getAllReminders();
    const target = all.find(r => r.id === reminderId);
    if (target && target.snoozedUntil) {
      delete target.snoozedUntil;
      localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(all));
      this.notify();
      this.syncServiceWorker(userPhone);
      this.cloudSyncHandler?.pushReminder(target);
    }
  }

  public getLogs(userPhone: string): DoseLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_LOGS_KEY);
      if (!raw) return [];
      const all: DoseLog[] = JSON.parse(raw);
      return all.filter(l => l.userPhone === userPhone || l.userPhone === '9876543210');
    } catch {
      return [];
    }
  }

  public getAllLogs(): DoseLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_LOGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public recordDoseAction(
    userPhone: string,
    reminderId: string,
    timeSlot: string,
    status: 'taken_on_time' | 'taken_late' | 'skipped' | 'missed',
    notes?: string
  ): DoseLog {
    const reminders = this.getReminders(userPhone);
    const targetRem = reminders.find(r => r.id === reminderId);
    const todayStr = new Date().toISOString().split('T')[0];

    const newLog: DoseLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      reminderId,
      userPhone,
      medicineName: targetRem ? targetRem.medicineName : 'Medicine',
      scheduledTimeSlot: timeSlot,
      takenAt: Date.now(),
      date: todayStr,
      status,
      notes
    };

    const allLogs = this.getAllLogs();
    allLogs.unshift(newLog);
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(allLogs));
    this.notify();
    this.syncServiceWorker(userPhone);
    this.cloudSyncHandler?.pushLog(newLog);
    return newLog;
  }
}

export const reminderStore = new ReminderStore();
