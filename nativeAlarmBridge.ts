/**
 * NativeAlarmBridge
 * 
 * Provides a unified native hardware alarm interface using Capacitor.
 * When running as a native Android or iOS app:
 * - Uses exact native Android AlarmManager (`allowWhileIdle: true`) to bypass OS Doze mode.
 * - Triggers high-priority Notification Channels (Importance.MAX = 5) with public lock-screen visibility.
 * - Plays bundled native sound `alarm_digital.wav`.
 * When running in standard web browser:
 * - Falls back safely with no-ops or Web Push integration.
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications, ActionType } from '@capacitor/local-notifications';
import { MedicineReminder } from '../types';

export interface NativeAlarmStatus {
  isNative: boolean;
  platform: string;
  hasPermission: boolean;
  channelReady: boolean;
}

export class NativeAlarmBridge {
  private static channelInitialized = false;
  private static actionTypeRegistered = false;

  /**
   * Returns true if running inside a native Capacitor shell (Android / iOS).
   */
  public static isNativeApp(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Returns the current platform name ('android', 'ios', 'web').
   */
  public static getPlatform(): string {
    return Capacitor.getPlatform();
  }

  /**
   * Requests native notification permissions from the OS.
   */
  public static async requestPermissions(): Promise<boolean> {
    if (!this.isNativeApp()) return false;
    try {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } catch (e) {
      console.warn('[NativeAlarmBridge] Failed to request permissions:', e);
      return false;
    }
  }

  /**
   * Initializes the native Android MAX importance notification channel.
   */
  public static async initAlarmChannels(): Promise<void> {
    if (!this.isNativeApp() || this.channelInitialized) return;

    try {
      // 1. Create MAX importance alarm channel for Android 8.0+
      await LocalNotifications.createChannel({
        id: 'medifinder_alarms',
        name: 'Critical Medicine Alarms',
        description: 'Loud, high-priority alarms for scheduled medicine doses',
        importance: 5, // MAX importance (heads-up banner + audio override)
        visibility: 1, // Public visibility on lockscreen
        sound: 'alarm_digital.wav',
        vibration: true,
        lights: true,
        lightColor: '#0BBBB6'
      });

      // 2. Register interactive action buttons on lock screen
      if (!this.actionTypeRegistered) {
        const actionType: ActionType = {
          id: 'DOSE_ALARM_ACTIONS',
          actions: [
            {
              id: 'take_dose',
              title: '💊 Take Dose'
            },
            {
              id: 'snooze_10',
              title: '⏰ Snooze 10m'
            }
          ]
        };
        await LocalNotifications.registerActionTypes({
          types: [actionType]
        });
        this.actionTypeRegistered = true;
      }

      this.channelInitialized = true;
      console.log('[NativeAlarmBridge] Native alarm channel initialized successfully.');
    } catch (e) {
      console.warn('[NativeAlarmBridge] Failed to create native alarm channel:', e);
    }
  }

  /**
   * Generates a deterministic 32-bit integer ID for Capacitor notifications.
   */
  public static hashNotificationId(reminderId: string, timeSlot: string): number {
    const str = `${reminderId}_${timeSlot}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 2147483647);
  }

  /**
   * Calculates the next scheduled occurrence Date for a given HH:MM slot.
   */
  public static getNextOccurrenceDate(timeSlot: string): Date {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(hours, minutes, 0, 0);

    if (scheduled.getTime() <= now.getTime()) {
      // If time has passed today, schedule for tomorrow
      scheduled.setDate(scheduled.getDate() + 1);
    }
    return scheduled;
  }

  /**
   * Schedules an exact native alarm for a medicine reminder.
   * Uses `allowWhileIdle: true` to trigger Android's `setExactAndAllowWhileIdle`.
   */
  public static async scheduleExactAlarm(reminder: MedicineReminder, timeSlot: string): Promise<boolean> {
    if (!this.isNativeApp()) return false;

    try {
      await this.initAlarmChannels();

      const notifId = this.hashNotificationId(reminder.id, timeSlot);
      const targetDate = this.getNextOccurrenceDate(timeSlot);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title: `⏰ Medicine Reminder: ${reminder.medicineName}`,
            body: `Dosage: ${reminder.dosage} • ${reminder.foodInstruction}`,
            schedule: {
              at: targetDate,
              allowWhileIdle: true // Bypasses Android Doze mode
            },
            sound: 'alarm_digital.wav',
            channelId: 'medifinder_alarms',
            actionTypeId: 'DOSE_ALARM_ACTIONS',
            extra: {
              reminderId: reminder.id,
              timeSlot,
              medicineName: reminder.medicineName
            }
          }
        ]
      });

      console.log(`[NativeAlarmBridge] Scheduled exact native alarm #${notifId} for ${reminder.medicineName} at ${targetDate.toLocaleTimeString()}`);
      return true;
    } catch (e) {
      console.warn('[NativeAlarmBridge] Failed to schedule native alarm:', e);
      return false;
    }
  }

  /**
   * Cancels a scheduled native alarm.
   */
  public static async cancelAlarm(reminderId: string, timeSlot?: string): Promise<void> {
    if (!this.isNativeApp()) return;

    try {
      if (timeSlot) {
        const notifId = this.hashNotificationId(reminderId, timeSlot);
        await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
      } else {
        // Cancel all potential slots for this reminder
        const pending = await LocalNotifications.getPending();
        const toCancel = pending.notifications.filter(n => n.extra?.reminderId === reminderId);
        if (toCancel.length > 0) {
          await LocalNotifications.cancel({ notifications: toCancel.map(n => ({ id: n.id })) });
        }
      }
    } catch (e) {
      console.warn('[NativeAlarmBridge] Failed to cancel native alarm:', e);
    }
  }

  /**
   * Listens for notification action buttons clicked from lock screen.
   */
  public static addActionListener(
    callback: (actionId: string, notificationExtra: any) => void
  ): void {
    if (!this.isNativeApp()) return;

    try {
      LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        const actionId = notificationAction.actionId;
        const extra = notificationAction.notification.extra;
        callback(actionId, extra);
      });
    } catch (e) {
      console.warn('[NativeAlarmBridge] Failed to register action listener:', e);
    }
  }
}
