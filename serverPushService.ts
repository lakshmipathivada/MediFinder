import webpush from "web-push";
import fs from "fs";
import path from "path";

export interface StoredReminderItem {
  id: string;
  medicineName: string;
  dosage: string;
  times: string[];
  foodInstruction?: string;
  active: boolean;
}

export interface StoredSubscription {
  id: string;
  userPhone: string;
  subscription: webpush.PushSubscription;
  reminders: StoredReminderItem[];
  lastNotified: Record<string, string>; // e.g. { "rem-1_08:00": "2026-09-14" }
  createdAt: number;
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const VAPID_FILE = path.join(DATA_DIR, "vapid.json");
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, "push_subscriptions.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {}
}

class ServerPushService {
  private vapidKeys: { publicKey: string; privateKey: string };
  private subscriptions: Map<string, StoredSubscription> = new Map();
  private schedulerTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.vapidKeys = this.loadOrGenerateVapidKeys();
    webpush.setVapidDetails(
      "mailto:notifications@medifinder.app",
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey
    );
    this.loadSubscriptions();
  }

  private loadOrGenerateVapidKeys() {
    try {
      if (fs.existsSync(VAPID_FILE)) {
        const raw = fs.readFileSync(VAPID_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.publicKey && parsed.privateKey) {
          return parsed;
        }
      }
    } catch {}

    const generated = webpush.generateVAPIDKeys();
    try {
      fs.writeFileSync(VAPID_FILE, JSON.stringify(generated, null, 2), "utf-8");
    } catch {}
    return generated;
  }

  private loadSubscriptions() {
    try {
      if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
        const raw = fs.readFileSync(SUBSCRIPTIONS_FILE, "utf-8");
        const list: StoredSubscription[] = JSON.parse(raw);
        list.forEach((sub) => this.subscriptions.set(sub.subscription.endpoint, sub));
      }
    } catch {}
  }

  private persistSubscriptions() {
    try {
      const list = Array.from(this.subscriptions.values());
      fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(list, null, 2), "utf-8");
    } catch (err) {
      console.warn("[PushService] Error saving subscriptions:", err);
    }
  }

  public getPublicKey(): string {
    return this.vapidKeys.publicKey;
  }

  public saveSubscription(
    userPhone: string,
    subscription: webpush.PushSubscription,
    reminders: StoredReminderItem[] = []
  ): StoredSubscription {
    const endpoint = subscription.endpoint;
    const existing = this.subscriptions.get(endpoint);

    const stored: StoredSubscription = {
      id: existing?.id || "sub-" + Date.now(),
      userPhone: userPhone || "anonymous",
      subscription,
      reminders: reminders.length > 0 ? reminders : existing?.reminders || [],
      lastNotified: existing?.lastNotified || {},
      createdAt: existing?.createdAt || Date.now(),
    };

    this.subscriptions.set(endpoint, stored);
    this.persistSubscriptions();
    console.log(`[PushService] Registered push subscription for phone: ${userPhone} (${stored.reminders.length} reminders)`);
    return stored;
  }

  public updateRemindersForPhone(userPhone: string, reminders: StoredReminderItem[]) {
    let updated = false;
    const phoneToMatch = userPhone || "9876543210";
    this.subscriptions.forEach((sub) => {
      // Match explicit phone, default fallback, or if single active subscriber
      if (sub.userPhone === phoneToMatch || sub.userPhone === "9876543210" || this.subscriptions.size === 1) {
        sub.reminders = reminders;
        updated = true;
      }
    });
    if (updated) {
      this.persistSubscriptions();
      console.log(`[PushService] Updated ${reminders.length} reminders for subscriber (phone: ${phoneToMatch})`);
    }
  }

  public async sendTestNotification(
    subscription: webpush.PushSubscription,
    delaySeconds: number = 0
  ): Promise<boolean> {
    const triggerBursts = async () => {
      const burstCount = 3;
      for (let i = 0; i < burstCount; i++) {
        setTimeout(async () => {
          const payload = JSON.stringify({
            title: i === 0 
              ? "⏰ MediFinder Test Alarm (Ring 1/3)"
              : `🚨 ALARM RINGING! (${i + 1}/${burstCount})`,
            body: i === 0
              ? "Background alerts active! Tap notification to open full alarm."
              : "Tap notification to stop alarm and view your medicine reminders.",
            icon: "/icon.svg",
            badge: "/icon.svg",
            silent: false,
            requireInteraction: true,
            renotify: true,
            tag: "med-alarm-ring-test",
            vibrate: [500, 150, 500, 150, 500, 150, 800],
            data: {
              url: "/?tab=reminders&test=1&autoRing=1",
              test: true,
            },
            actions: [
              { action: "take", title: "Take Dose" },
              { action: "snooze", title: "Snooze 10m" },
            ],
          });

          try {
            await webpush.sendNotification(subscription, payload);
            console.log(`[PushService] Delivered alarm test burst ${i + 1}/${burstCount} to FCM`);
          } catch (err: any) {
            console.error(`[PushService] Alarm burst ${i + 1} failed:`, err?.statusCode || err);
            if (err.statusCode === 410 || err.statusCode === 404) {
              this.subscriptions.delete(subscription.endpoint);
              this.persistSubscriptions();
            }
          }
        }, i * 3500);
      }
    };

    if (delaySeconds > 0) {
      console.log(`[PushService] Scheduling alarm bursts in ${delaySeconds} seconds on the server...`);
      setTimeout(() => {
        triggerBursts().catch((err) => console.error("[PushService] Delayed test push error:", err));
      }, delaySeconds * 1000);
      return true;
    } else {
      await triggerBursts();
      return true;
    }
  }

  public async checkAndDispatchReminders() {
    if (this.subscriptions.size === 0) return;

    // Get current local time (hours & minutes in 24-hr format)
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const currentHHMM = `${hours}:${minutes}`;
    
    // Format local date string (YYYY-MM-DD)
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    const subscriptionsToRemove: string[] = [];

    for (const [endpoint, sub] of this.subscriptions.entries()) {
      if (!sub.reminders || sub.reminders.length === 0) continue;

      for (const rem of sub.reminders) {
        if (!rem.active) continue;

        if (rem.times && rem.times.includes(currentHHMM)) {
          const notificationKey = `${rem.id}_${currentHHMM}`;
          if (sub.lastNotified[notificationKey] === todayStr) {
            // Already notified for this exact minute today
            continue;
          }

          // Dispatch 3 repeated alarm bursts spaced 3.5s apart to ring like a real alarm
          const burstCount = 3;
          sub.lastNotified[notificationKey] = todayStr;
          this.persistSubscriptions();

          for (let i = 0; i < burstCount; i++) {
            setTimeout(async () => {
              const payload = JSON.stringify({
                title: i === 0 
                  ? `⏰ Medicine Alarm: ${rem.medicineName} (Ring 1/${burstCount})`
                  : `🚨 ALARM RINGING (${i + 1}/${burstCount}): ${rem.medicineName}`,
                body: `Time to take your scheduled dose: ${rem.dosage} (${rem.foodInstruction || "As directed"}). Tap to open and stop alarm.`,
                icon: "/icon.svg",
                badge: "/icon.svg",
                silent: false,
                requireInteraction: true,
                renotify: true,
                vibrate: [500, 150, 500, 150, 500, 150, 800],
                tag: `med-alarm-${rem.id}-${currentHHMM}`,
                data: {
                  url: `/?tab=reminders&alarmId=${rem.id}&timeSlot=${currentHHMM}&autoRing=1`,
                  reminderId: rem.id,
                  medicineName: rem.medicineName,
                  timeSlot: currentHHMM,
                },
                actions: [
                  { action: "take", title: "Take Now" },
                  { action: "snooze", title: "Snooze 10m" },
                ],
              });

              try {
                await webpush.sendNotification(sub.subscription, payload);
                console.log(`[PushService] Dispatched alarm burst ${i + 1}/${burstCount} for ${rem.medicineName} at ${currentHHMM} to ${sub.userPhone}`);
              } catch (err: any) {
                console.error(`[PushService] Failed to send push burst ${i + 1} to ${endpoint}:`, err?.statusCode || err);
                if (err?.statusCode === 410 || err?.statusCode === 404) {
                  subscriptionsToRemove.push(endpoint);
                }
              }
            }, i * 3500);
          }
        }
      }
    }

    if (subscriptionsToRemove.length > 0) {
      subscriptionsToRemove.forEach((ep) => this.subscriptions.delete(ep));
      this.persistSubscriptions();
    }
  }

  public startScheduler() {
    if (this.schedulerTimer) return;
    console.log("[PushService] Background reminder scheduler started (checking every 30s)...");
    this.schedulerTimer = setInterval(() => {
      this.checkAndDispatchReminders().catch((err) => {
        console.warn("[PushService] Scheduler check error:", err);
      });
    }, 30000); // Check every 30 seconds
  }

  public stopScheduler() {
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }
}

export const serverPushService = new ServerPushService();
