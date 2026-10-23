/**
 * BackgroundAudioKeepAlive
 * 
 * Overcomes browser and OS background throttling for Web & PWA apps:
 * 1. HTML5 MediaSession Keep-Alive: Maintains an inaudible background audio stream with
 *    `playbackState = 'playing'`, preventing mobile OSes (Android Chrome, iOS Safari)
 *    from suspending the audio subsystem when tabs are minimized or screens locked.
 * 2. Screen Wake Lock API (`navigator.wakeLock`): Keeps the device screen awake
 *    during active alarms until dismissed or snoozed.
 */

// 1-second inaudible base64-encoded silent PCM audio WAV
const SILENT_WAV_BASE64 = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

export class BackgroundAudioKeepAlive {
  private static audioElement: HTMLAudioElement | null = null;
  private static wakeLockSentinel: any = null;
  private static isRunning = false;
  private static listeners: Array<(active: boolean) => void> = [];

  /**
   * Initializes or returns the cached silent audio element.
   */
  private static getAudioElement(): HTMLAudioElement {
    if (!this.audioElement) {
      this.audioElement = new Audio(SILENT_WAV_BASE64);
      this.audioElement.loop = true;
      this.audioElement.volume = 0.01; // Inaudible minimal volume
      this.audioElement.preload = 'auto';

      // Keep replaying if ended
      this.audioElement.addEventListener('ended', () => {
        if (this.isRunning && this.audioElement) {
          this.audioElement.play().catch(() => {});
        }
      });
    }
    return this.audioElement;
  }

  /**
   * Configures the browser's MediaSession API.
   * This signals the OS that MediFinder is an active audio player, exempting it
   * from aggressive process freezing on mobile devices.
   */
  private static setupMediaSession(): void {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'MediFinder Alarm Guard',
        artist: 'Active Dose Monitor',
        album: 'MediFinder Clinical Safety',
        artwork: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.playbackState = 'playing';

      // Setup default playback handlers
      navigator.mediaSession.setActionHandler('play', () => {
        this.enable();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        this.disable();
      });
    } catch (e) {
      console.warn('[BackgroundAudioKeepAlive] MediaSession setup error:', e);
    }
  }

  /**
   * Activates the background audio keep-alive session.
   * Must be called in response to a user gesture (e.g. tapping "Enable Alarm Guard").
   */
  public static async enable(): Promise<boolean> {
    try {
      const audio = this.getAudioElement();
      await audio.play();
      this.setupMediaSession();
      this.isRunning = true;
      this.notifyListeners();
      console.log('[BackgroundAudioKeepAlive] Background alarm guard activated.');
      return true;
    } catch (err) {
      console.warn('[BackgroundAudioKeepAlive] Could not enable background audio:', err);
      return false;
    }
  }

  /**
   * Stops the background audio keep-alive.
   */
  public static disable(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
    this.isRunning = false;
    this.notifyListeners();
    console.log('[BackgroundAudioKeepAlive] Background alarm guard disabled.');
  }

  /**
   * Toggles the active state.
   */
  public static async toggle(): Promise<boolean> {
    if (this.isRunning) {
      this.disable();
      return false;
    } else {
      return await this.enable();
    }
  }

  /**
   * Checks if background guard is actively running.
   */
  public static isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Subscribes to status changes.
   */
  public static onStatusChange(callback: (active: boolean) => void): () => void {
    this.listeners.push(callback);
    callback(this.isRunning);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private static notifyListeners(): void {
    this.listeners.forEach(l => l(this.isRunning));
  }

  /**
   * Acquires a screen WakeLock to keep display on during active alarm ringing.
   */
  public static async acquireScreenWakeLock(): Promise<void> {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) return;
    try {
      if (!this.wakeLockSentinel) {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        this.wakeLockSentinel.addEventListener('release', () => {
          this.wakeLockSentinel = null;
        });
        console.log('[BackgroundAudioKeepAlive] Screen WakeLock acquired.');
      }
    } catch (e) {
      console.warn('[BackgroundAudioKeepAlive] WakeLock request notice:', e);
    }
  }

  /**
   * Releases screen WakeLock after alarm is dismissed.
   */
  public static releaseScreenWakeLock(): void {
    if (this.wakeLockSentinel) {
      try {
        this.wakeLockSentinel.release();
        this.wakeLockSentinel = null;
        console.log('[BackgroundAudioKeepAlive] Screen WakeLock released.');
      } catch (e) {
        console.warn('[BackgroundAudioKeepAlive] WakeLock release notice:', e);
      }
    }
  }
}
