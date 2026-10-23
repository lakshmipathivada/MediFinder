import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash?: string;
  avatar?: string;
  authProvider: "local" | "google";
  googleId?: string;
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<StoredUser, "passwordHash">;

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const JWT_SECRET = process.env.JWT_SECRET || "medifinder_auth_jwt_secret_2026_secure_key";

class AuthStore {
  private users: Map<string, StoredUser> = new Map();
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(USERS_FILE)) {
        const raw = fs.readFileSync(USERS_FILE, "utf-8");
        const list: StoredUser[] = JSON.parse(raw);
        for (const u of list) {
          this.users.set(u.id, u);
        }
      } else {
        this.seedDemoUsers();
      }
    } catch (err) {
      console.error("Failed to initialize AuthStore:", err);
      this.seedDemoUsers();
    }
    this.initialized = true;
  }

  private seedDemoUsers() {
    const demoPasswordHash = bcrypt.hashSync("Password@123", 10);
    const demos: StoredUser[] = [
      {
        id: "usr_alex_01",
        name: "Alex Johnson",
        email: "alex.johnson@gmail.com",
        phone: "9123456789",
        passwordHash: demoPasswordHash,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
        authProvider: "local",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "usr_govardhan_02",
        name: "Govardhan",
        email: "govardhan.dev@gmail.com",
        phone: "9848012345",
        passwordHash: demoPasswordHash,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
        authProvider: "local",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "usr_lakshmi_03",
        name: "Lakshmi Pathi Vada",
        email: "lakshmipathivada25@gmail.com",
        phone: "9876543210",
        passwordHash: demoPasswordHash,
        authProvider: "local",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const d of demos) {
      this.users.set(d.id, d);
    }
    this.saveToDisk();
  }

  private saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const list = Array.from(this.users.values());
      fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to save users to disk:", err);
    }
  }

  public toSafeUser(user: StoredUser): SafeUser {
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  public findByEmail(email: string): StoredUser | null {
    const norm = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === norm) {
        return user;
      }
    }
    return null;
  }

  public findById(id: string): StoredUser | null {
    return this.users.get(id) || null;
  }

  public register(params: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    avatar?: string;
    authProvider?: "local" | "google";
    googleId?: string;
  }): { user: SafeUser; token: string } {
    const normEmail = params.email.trim().toLowerCase();
    if (this.findByEmail(normEmail)) {
      throw new Error("An account with this email address already exists.");
    }

    let passwordHash: string | undefined = undefined;
    if (params.password) {
      if (params.password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }
      passwordHash = bcrypt.hashSync(params.password, 10);
    }

    const id = "usr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const now = new Date().toISOString();

    const newUser: StoredUser = {
      id,
      name: params.name.trim(),
      email: normEmail,
      phone: params.phone ? params.phone.trim() : "9876543210",
      passwordHash,
      avatar: params.avatar,
      authProvider: params.authProvider || "local",
      googleId: params.googleId,
      createdAt: now,
      updatedAt: now
    };

    this.users.set(id, newUser);
    this.saveToDisk();

    const token = this.generateToken(newUser);
    return { user: this.toSafeUser(newUser), token };
  }

  public authenticate(email: string, password: string): { user: SafeUser; token: string } {
    const user = this.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password.");
    }
    if (!user.passwordHash) {
      if (user.authProvider === "google") {
        throw new Error("This account is registered with Google. Please use Continue with Google.");
      }
      throw new Error("No password configured for this account.");
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid email or password.");
    }

    const token = this.generateToken(user);
    return { user: this.toSafeUser(user), token };
  }

  public authenticateOrRegisterGoogle(params: {
    email: string;
    name: string;
    avatar?: string;
    googleId?: string;
  }): { user: SafeUser; token: string } {
    const normEmail = params.email.trim().toLowerCase();
    let user = this.findByEmail(normEmail);

    if (!user) {
      const id = "usr_g_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      const now = new Date().toISOString();
      user = {
        id,
        name: params.name || "Google User",
        email: normEmail,
        phone: "9876543210",
        avatar: params.avatar,
        authProvider: "google",
        googleId: params.googleId,
        createdAt: now,
        updatedAt: now
      };
      this.users.set(id, user);
      this.saveToDisk();
    } else {
      if (!user.avatar && params.avatar) {
        user.avatar = params.avatar;
      }
      if (params.googleId) {
        user.googleId = params.googleId;
      }
      user.updatedAt = new Date().toISOString();
      this.saveToDisk();
    }

    const token = this.generateToken(user);
    return { user: this.toSafeUser(user), token };
  }

  public generateToken(user: StoredUser): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider
      },
      JWT_SECRET,
      { expiresIn: "14d" }
    );
  }

  public verifyToken(token: string): SafeUser | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      if (!decoded || !decoded.userId) return null;
      const user = this.findById(decoded.userId);
      return user ? this.toSafeUser(user) : null;
    } catch {
      return null;
    }
  }
}

export const authStore = new AuthStore();
