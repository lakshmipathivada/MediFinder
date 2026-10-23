import { UserProfile } from '../types';
import {
  isFirebaseConfigured,
  loginWithGooglePopup,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  formatFirebaseError,
  onAuthChange
} from '../lib/firebase';

const TOKEN_KEY = 'medifinder_token';
const USER_KEY = 'medifinder_user';

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserProfile;
  error?: string;
}

class AuthService {
  public getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  public getStoredUser(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public saveSession(token: string, user: UserProfile) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public clearSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Register with Email and Password
   * Prioritizes real Firebase Authentication if configured, with server fallback.
   */
  public async register(params: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
  }): Promise<UserProfile> {
    if (isFirebaseConfigured() && params.password) {
      try {
        const user = await registerWithEmail(params.email, params.password, params.name);
        if (params.phone) {
          user.phone = params.phone;
        }
        this.saveSession('firebase_token_' + Date.now(), user);
        return user;
      } catch (fbErr: any) {
        throw new Error(formatFirebaseError(fbErr));
      }
    }

    // Backend fallback
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const data: AuthResponse = await res.json();
    if (!res.ok || !data.success || !data.user || !data.token) {
      throw new Error(data.error || 'Registration failed.');
    }

    this.saveSession(data.token, data.user);
    return data.user;
  }

  /**
   * Login with Email and Password
   * Prioritizes real Firebase Authentication if configured, with server fallback.
   */
  public async login(email: string, password: string): Promise<UserProfile> {
    if (isFirebaseConfigured()) {
      try {
        const user = await loginWithEmail(email, password);
        this.saveSession('firebase_token_' + Date.now(), user);
        return user;
      } catch (fbErr: any) {
        throw new Error(formatFirebaseError(fbErr));
      }
    }

    // Backend fallback
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data: AuthResponse = await res.json();
    if (!res.ok || !data.success || !data.user || !data.token) {
      throw new Error(data.error || 'Invalid email or password.');
    }

    this.saveSession(data.token, data.user);
    return data.user;
  }

  /**
   * Real Google Authentication
   * Launches genuine Google Popup via Firebase if configured, with server fallback.
   */
  public async loginWithGoogle(params?: {
    credential?: string;
    userInfo?: {
      email: string;
      name: string;
      avatar?: string;
      id?: string;
    };
  }): Promise<UserProfile> {
    if (isFirebaseConfigured()) {
      try {
        const user = await loginWithGooglePopup();
        this.saveSession('firebase_token_' + Date.now(), user);
        return user;
      } catch (fbErr: any) {
        throw new Error(formatFirebaseError(fbErr));
      }
    }

    // Fallback if Firebase keys are not yet entered
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || {})
    });

    const data: AuthResponse = await res.json();
    if (!res.ok || !data.success || !data.user || !data.token) {
      throw new Error(data.error || 'Google authentication failed.');
    }

    this.saveSession(data.token, data.user);
    return data.user;
  }

  /**
   * Subscribe to real Firebase auth state changes
   */
  public subscribeAuth(callback: (user: UserProfile | null) => void): () => void {
    if (isFirebaseConfigured()) {
      return onAuthChange((user) => {
        if (user) {
          this.saveSession('firebase_token_' + Date.now(), user);
        } else {
          this.clearSession();
        }
        callback(user);
      });
    }

    // If not using Firebase, verify current stored session
    this.verifyCurrentSession().then(callback);
    return () => {};
  }

  public async verifyCurrentSession(): Promise<UserProfile | null> {
    const token = this.getToken();
    if (!token) return null;

    if (token.startsWith('firebase_token_')) {
      return this.getStoredUser();
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        this.clearSession();
        return null;
      }

      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return data.user;
      }
      this.clearSession();
      return null;
    } catch {
      return this.getStoredUser();
    }
  }

  public async logout(): Promise<void> {
    try {
      if (isFirebaseConfigured()) {
        await logoutUser();
      } else {
        const token = this.getToken();
        if (token) {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }
    } catch {
      // Ignore network errors during logout
    } finally {
      this.clearSession();
    }
  }
}

export const authService = new AuthService();
