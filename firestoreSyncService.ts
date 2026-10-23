import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { MedicineReminder, DoseLog } from '../types';
import { reminderStore } from './reminderStore';
import { onAuthStateChanged } from 'firebase/auth';

export type SyncState = 'offline' | 'connecting' | 'synced' | 'syncing' | 'error';

export class FirestoreSyncService {
  private currentUserId: string | null = null;
  private currentUserPhone: string = '9876543210';
  private remindersUnsubscribe: Unsubscribe | null = null;
  private logsUnsubscribe: Unsubscribe | null = null;
  private syncStatus: SyncState = 'offline';
  private statusListeners: Array<(status: SyncState) => void> = [];
  private isProcessingCloudUpdate: boolean = false;
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    if (auth) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const phone = user.phoneNumber || '9876543210';
          this.currentUserId = user.uid;
          this.currentUserPhone = phone;
          this.startSync(user.uid, phone);
        } else {
          this.stopSync();
          this.currentUserId = null;
          this.setStatus('offline');
        }
      });
    }
  }

  public getStatus(): SyncState {
    return this.syncStatus;
  }

  public getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  public onStatusChange(listener: (status: SyncState) => void): () => void {
    this.statusListeners.push(listener);
    listener(this.syncStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private setStatus(status: SyncState) {
    this.syncStatus = status;
    this.statusListeners.forEach((l) => {
      try {
        l(status);
      } catch (err) {
        console.warn('[FirestoreSync] Listener error:', err);
      }
    });
  }

  public async startSync(userId: string, phone: string): Promise<void> {
    if (!db) {
      this.setStatus('offline');
      return;
    }

    this.setStatus('connecting');
    this.stopSync();

    try {
      const remindersCol = collection(db, 'users', userId, 'reminders');
      const logsCol = collection(db, 'users', userId, 'doseLogs');

      // 1. Initial Two-Way Reconciliation
      this.setStatus('syncing');
      await this.reconcileInitialData(userId, phone, remindersCol, logsCol);

      // 2. Real-Time Reminders Listener (Multi-Device Sync)
      this.remindersUnsubscribe = onSnapshot(
        remindersCol,
        (snapshot) => {
          const cloudReminders: MedicineReminder[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as MedicineReminder;
            if (data && data.id) {
              cloudReminders.push(data);
            }
          });

          // Sort by creation or scheduled time
          cloudReminders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

          this.isProcessingCloudUpdate = true;
          reminderStore.setRemindersFromCloud(phone, cloudReminders);
          this.isProcessingCloudUpdate = false;
          this.setStatus('synced');
        },
        (error) => {
          console.warn('[FirestoreSync] Reminders snapshot warning:', error);
          this.setStatus('error');
        }
      );

      // 3. Real-Time Dose Logs Listener
      this.logsUnsubscribe = onSnapshot(
        logsCol,
        (snapshot) => {
          const cloudLogs: DoseLog[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as DoseLog;
            if (data && data.id) {
              cloudLogs.push(data);
            }
          });

          cloudLogs.sort((a, b) => (b.takenAt || 0) - (a.takenAt || 0));

          this.isProcessingCloudUpdate = true;
          reminderStore.setLogsFromCloud(phone, cloudLogs);
          this.isProcessingCloudUpdate = false;
          this.setStatus('synced');
        },
        (error) => {
          console.warn('[FirestoreSync] Logs snapshot warning:', error);
        }
      );
    } catch (err) {
      console.warn('[FirestoreSync] Failed to establish real-time sync:', err);
      this.setStatus('error');
    }
  }

  private async reconcileInitialData(
    userId: string,
    phone: string,
    remindersCol: any,
    logsCol: any
  ): Promise<void> {
    if (!db) return;

    try {
      const [remindersSnap, logsSnap] = await Promise.all([
        getDocs(remindersCol).catch(() => null),
        getDocs(logsCol).catch(() => null)
      ]);

      const localReminders = reminderStore.getReminders(phone);
      const localLogs = reminderStore.getLogs(phone);

      const batch = writeBatch(db);
      let batchCount = 0;

      // Cloud reminders map
      const cloudRemMap = new Map<string, MedicineReminder>();
      if (remindersSnap && !remindersSnap.empty) {
        remindersSnap.forEach((d) => {
          const r = d.data() as MedicineReminder;
          cloudRemMap.set(r.id, r);
        });
      }

      // If local reminders exist that are not in cloud, migrate them up to Firestore!
      for (const localRem of localReminders) {
        if (!cloudRemMap.has(localRem.id)) {
          const remDoc = doc(db, 'users', userId, 'reminders', localRem.id);
          batch.set(remDoc, { ...localRem, userPhone: phone });
          batchCount++;
        }
      }

      // Cloud logs map
      const cloudLogMap = new Map<string, DoseLog>();
      if (logsSnap && !logsSnap.empty) {
        logsSnap.forEach((d) => {
          const l = d.data() as DoseLog;
          cloudLogMap.set(l.id, l);
        });
      }

      for (const localLog of localLogs) {
        if (!cloudLogMap.has(localLog.id)) {
          const logDoc = doc(db, 'users', userId, 'doseLogs', localLog.id);
          batch.set(logDoc, { ...localLog, userPhone: phone });
          batchCount++;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }
    } catch (reconcileErr) {
      console.warn('[FirestoreSync] Initial reconciliation non-critical notice:', reconcileErr);
    }
  }

  public stopSync(): void {
    if (this.remindersUnsubscribe) {
      this.remindersUnsubscribe();
      this.remindersUnsubscribe = null;
    }
    if (this.logsUnsubscribe) {
      this.logsUnsubscribe();
      this.logsUnsubscribe = null;
    }
  }

  /**
   * Push an added or updated reminder to Cloud Firestore
   */
  public async pushReminder(reminder: MedicineReminder): Promise<void> {
    if (!db || !this.currentUserId || this.isProcessingCloudUpdate) return;
    try {
      this.setStatus('syncing');
      const remDoc = doc(db, 'users', this.currentUserId, 'reminders', reminder.id);
      await setDoc(remDoc, { ...reminder, updatedAt: Date.now() }, { merge: true });
      this.setStatus('synced');
    } catch (err) {
      console.warn('[FirestoreSync] Error saving reminder to cloud:', err);
      this.setStatus('error');
    }
  }

  /**
   * Delete a reminder from Cloud Firestore
   */
  public async deleteReminder(reminderId: string): Promise<void> {
    if (!db || !this.currentUserId || this.isProcessingCloudUpdate) return;
    try {
      this.setStatus('syncing');
      const remDoc = doc(db, 'users', this.currentUserId, 'reminders', reminderId);
      await deleteDoc(remDoc);
      this.setStatus('synced');
    } catch (err) {
      console.warn('[FirestoreSync] Error deleting reminder from cloud:', err);
      this.setStatus('error');
    }
  }

  /**
   * Push a dose log to Cloud Firestore
   */
  public async pushLog(log: DoseLog): Promise<void> {
    if (!db || !this.currentUserId || this.isProcessingCloudUpdate) return;
    try {
      this.setStatus('syncing');
      const logDoc = doc(db, 'users', this.currentUserId, 'doseLogs', log.id);
      await setDoc(logDoc, { ...log, loggedAt: Date.now() }, { merge: true });
      this.setStatus('synced');
    } catch (err) {
      console.warn('[FirestoreSync] Error saving log to cloud:', err);
      this.setStatus('error');
    }
  }
}

export const firestoreSyncService = new FirestoreSyncService();

// Register two-way sync hook with reminderStore
reminderStore.registerCloudSyncHandler({
  pushReminder: (r) => firestoreSyncService.pushReminder(r),
  deleteReminder: (id) => firestoreSyncService.deleteReminder(id),
  pushLog: (l) => firestoreSyncService.pushLog(l)
});
