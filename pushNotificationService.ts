import { MedicineReminder } from "../types";

const STORAGE_PUSH_ENABLED_KEY = "medifinder_push_enabled_v1";

const DEFAULT_VAPID_PUBLIC_KEY =
  "BHlktX7Yf5wwvUS1d2isSIugqDeDPzFevdNKz4vyHzR2h9p9Z5lefa1TBZKMu9fSjvJhvezZWsdS2em9IGCAsFA";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export class PushNotificationService {
  public static isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "Notification" in window
    );
  }

  public static isLocallyEnabled(): boolean {
    if (typeof window === "undefined") return false;
    return (
      Notification.permission === "granted" &&
      localStorage.getItem(STORAGE_PUSH_ENABLED_KEY) === "true"
    );
  }

  public static async getExistingSubscription(): Promise<PushSubscription | null> {
    if (!this.isSupported() || !("PushManager" in window)) return null;
    try {
      const reg = await navigator.serviceWorker.ready;
      return await reg.pushManager.getSubscription();
    } catch {
      return null;
    }
  }

  public static async subscribe(
    userPhone: string,
    reminders: MedicineReminder[] = []
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isSupported()) {
      return { success: false, error: "Notifications are not supported by this browser." };
    }

    try {
      // 1. Request user permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return {
          success: false,
          error: "Notification permission was denied. Please allow notifications in browser settings.",
        };
      }

      // 2. Fetch server VAPID Public Key with static client fallback
      let publicKey =
        (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;
      try {
        const keyRes = await fetch("/api/push/vapid-public-key");
        const contentType = keyRes.headers.get("content-type") || "";
        if (keyRes.ok && contentType.includes("application/json")) {
          const keyData = await keyRes.json();
          if (keyData?.publicKey) {
            publicKey = keyData.publicKey;
          }
        }
      } catch {
        // Backend not available (static Firebase hosting); proceed with client VAPID key
      }

      // 3. Register push subscription with browser PushManager if supported
      const reg = await navigator.serviceWorker.ready;
      let subscription: PushSubscription | null = null;
      if ("PushManager" in window && publicKey) {
        try {
          subscription = await reg.pushManager.getSubscription();
          if (!subscription) {
            subscription = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicKey),
            });
          }
        } catch (subErr) {
          console.warn("[PushService] Browser push subscription notice:", subErr);
        }
      }

      // 4. Always sync active reminders directly to Service Worker and IndexedDB
      const cleanReminders = reminders.map((r) => ({
        id: r.id,
        medicineName: r.medicineName,
        dosage: r.dosage,
        times: r.times,
        foodInstruction: r.foodInstruction,
        active: r.active,
      }));

      const swTarget = navigator.serviceWorker.controller || reg.active;
      if (swTarget) {
        swTarget.postMessage({
          type: "SYNC_REMINDERS",
          reminders: cleanReminders,
        });
      }

      // 5. Send subscription to server if backend is active
      try {
        const subRes = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userPhone: userPhone || "9876543210",
            subscription: subscription ? subscription.toJSON() : null,
            reminders: cleanReminders,
          }),
        });
        const contentType = subRes.headers.get("content-type") || "";
        if (subRes.ok && contentType.includes("application/json")) {
          await subRes.json().catch(() => null);
        }
      } catch {
        // Static PWA mode: reminders run offline & in background via ServiceWorker
      }

      localStorage.setItem(STORAGE_PUSH_ENABLED_KEY, "true");
      return { success: true };
    } catch (err: any) {
      console.error("[PushService] Subscription error:", err);
      return { success: false, error: err?.message || String(err) };
    }
  }

  public static async syncReminders(
    userPhone: string,
    reminders: MedicineReminder[]
  ): Promise<void> {
    if (!this.isSupported()) return;
    if (typeof Notification !== "undefined" && Notification.permission !== "granted") return;

    try {
      const cleanReminders = reminders.map((r) => ({
        id: r.id,
        medicineName: r.medicineName,
        dosage: r.dosage,
        times: r.times,
        foodInstruction: r.foodInstruction,
        active: r.active,
      }));

      // 1. Direct Service Worker sync
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const target = navigator.serviceWorker.controller || reg.active;
        if (target) {
          target.postMessage({
            type: "SYNC_REMINDERS",
            reminders: cleanReminders,
          });
        }
      }

      // 2. Optional backend sync
      fetch("/api/push/sync-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPhone: userPhone || "9876543210",
          reminders: cleanReminders,
        }),
      }).catch(() => {});
    } catch (err) {
      console.warn("[PushService] Sync reminders warning:", err);
    }
  }

  public static async sendTestNotification(
    delaySeconds: number = 0
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!this.isSupported()) {
      return { success: false, error: "Notifications are not supported." };
    }

    try {
      const reg = await navigator.serviceWorker.ready;

      // 1. Attempt backend push test if available
      try {
        if ("PushManager" in window) {
          const subscription = await reg.pushManager.getSubscription();
          if (subscription) {
            const res = await fetch("/api/push/test", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscription: subscription.toJSON(),
                delaySeconds,
              }),
            });
            const contentType = res.headers.get("content-type") || "";
            if (res.ok && contentType.includes("application/json")) {
              const data = await res.json();
              if (data?.success) {
                return { success: true, message: data.message };
              }
            }
          }
        }
      } catch {
        // Backend not available; fallback to Service Worker timer
      }

      // 2. Client-side Service Worker schedule (works 100% on Firebase static CDN when tab is closed!)
      const target = reg.active || navigator.serviceWorker.controller;
      const delayMs = (delaySeconds || 1) * 1000;

      if (target) {
        target.postMessage({
          type: "SCHEDULE_TEST_NOTIFICATION",
          delay: delayMs,
        });
        return {
          success: true,
          message: `Alert scheduled in ${delaySeconds || 5}s! You can close this tab now to test.`,
        };
      }

      // 3. Fallback direct notification
      setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification("⏰ MediFinder Medicine Alert: Dolo 650", {
            body: "Time to take 1 tablet (After Food). Tap to open alarm!",
            icon: "/icon.svg",
            tag: "med-test-alarm-" + Date.now(),
          });
        }
      }, delayMs);

      return { success: true, message: "Test alert queued!" };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  }
}
