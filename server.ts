import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { authStore } from "./authStore";
import { serverPushService } from "./serverPushService";

// Automatically load environment variables from .env.local or .env if present
for (const envFile of [".env.local", ".env"]) {
  try {
    process.loadEnvFile?.(envFile);
  } catch {
    // File may not exist; safe to ignore
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini AI Setup (lazy initialization)
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  };

  // Health check API route
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "MediFinder Server" });
  });

  // Real Auth: Register with Email and Password
  app.post("/api/auth/register", (req, res) => {
    try {
      const { name, email, password, phone } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required." });
      }
      const result = authStore.register({ name, email, password, phone });
      res.status(201).json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ error: err?.message || "Registration failed." });
    }
  });

  // Real Auth: Login with Email and Password
  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }
      const result = authStore.authenticate(email, password);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(401).json({ error: err?.message || "Invalid credentials." });
    }
  });

  // Real Auth: Google OAuth / ID Token authentication
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { credential, userInfo } = req.body;
      let email = userInfo?.email;
      let name = userInfo?.name;
      let avatar = userInfo?.avatar || userInfo?.picture;
      let googleId = userInfo?.sub || userInfo?.id;

      if (credential && typeof credential === "string") {
        try {
          const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
          if (googleRes.ok) {
            const tokenInfo: any = await googleRes.json();
            email = tokenInfo.email;
            name = tokenInfo.name || name;
            avatar = tokenInfo.picture || avatar;
            googleId = tokenInfo.sub;
          }
        } catch {
          // Network issue or local dev: fall through to decode JWT
        }

        if (!email) {
          const parts = credential.split(".");
          if (parts.length >= 2) {
            let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
            while (base64.length % 4) base64 += "=";
            const payload = JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
            email = payload.email;
            name = payload.name || name;
            avatar = payload.picture || avatar;
            googleId = payload.sub || googleId;
          }
        }
      }

      if (!email) {
        return res.status(400).json({ error: "Valid Google account email could not be verified." });
      }

      const result = authStore.authenticateOrRegisterGoogle({
        email,
        name: name || "Google User",
        avatar,
        googleId
      });

      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ error: err?.message || "Google authentication failed." });
    }
  });

  // Backward-compatible Google Auth verification endpoint
  app.post("/api/auth/google/verify", (req, res) => {
    try {
      const { credential, email, name, avatar } = req.body;
      let userEmail = email;
      let userName = name;
      let userAvatar = avatar;

      if (credential && typeof credential === "string") {
        const parts = credential.split(".");
        if (parts.length >= 2) {
          let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          while (base64.length % 4) base64 += "=";
          const payload = JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
          userEmail = payload.email;
          userName = payload.name || userName;
          userAvatar = payload.picture || userAvatar;
        }
      }

      if (!userEmail) {
        return res.status(400).json({ error: "Missing user email." });
      }

      const result = authStore.authenticateOrRegisterGoogle({
        email: userEmail,
        name: userName || "Google User",
        avatar: userAvatar
      });

      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ error: "Failed to parse Google credential", details: err?.message });
    }
  });

  // Get current authenticated user by JWT token
  app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No authorization token provided." });
    }
    const token = authHeader.substring(7);
    const user = authStore.verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: "Session has expired or is invalid." });
    }
    res.json({ success: true, user });
  });

  // Logout endpoint
  app.post("/api/auth/logout", (_req, res) => {
    res.json({ success: true, message: "Logged out successfully." });
  });

  // AI Chat Endpoint with Gemini 2.5 Flash
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Valid message string is required" });
      }

      const ai = getAiClient();
      if (!ai) {
        return res.json({
          reply: null
        });
      }

      const systemInstruction = `You are MediFinder AI Assistant, a friendly, ultra-fast clinical medicine helper.

CORE RULES:
1. SHORT, SIMPLE & EASY TO UNDERSTAND:
   - Answer in 2 to 3 direct, simple sentences or bullet points (around 35–60 words).
   - Use plain, everyday English. Avoid dense medical jargon or explain it simply.
   - Answer directly without robotic greetings, preamble, or filler.
   - Answer ONLY what was specifically asked (e.g., if asked about food, answer only about food).

2. QUICK ACTIONABLE TIP:
   - Include 1 simple, practical tip (e.g., 💡 Tip: ...).

3. INTERACTIVE FOLLOW-UP SUGGESTIONS:
   - At the very end on its own line, ALWAYS suggest 2 to 3 short follow-up questions for the user to tap on, formatted EXACTLY like this:
   Suggestions: [Question 1] | [Question 2] | [Question 3]
   (e.g., Suggestions: Food rules? | Safe dosage? | Common side effects?)

4. SCOPE CONSTRAINT:
   - Only answer questions related to medicines, health conditions, dosage, side effects, food rules, precautions, drug interactions, missed doses, or storage.
   - If an unrelated question is asked, politely say: "I am your MediFinder assistant! Ask me any question about your medicines, dosage, food rules, or side effects."

5. CONVERSATION CONTEXT:
   - Remember previous messages so follow-up questions (e.g., "Can I take it with milk?", "What if I miss a dose?") refer to the medicine previously discussed.`;

      // Build conversation contents including history if provided
      let contents: any = message;
      if (Array.isArray(history) && history.length > 0) {
        contents = [
          ...history.map((item: { sender: string; text: string }) => ({
            role: item.sender === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }]
          })),
          { role: 'user', parts: [{ text: message }] }
        ];
      }

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents,
          config: {
            systemInstruction,
            temperature: 0.2
          }
        });
      } catch (geminiErr: any) {
        console.warn("Primary gemini-3.5-flash-lite failed, attempting fallback:", geminiErr?.message);
        response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.2
          }
        });
      }

      res.json({ reply: response.text });
    } catch (err: any) {
      console.error("Error in /api/chat:", err);
      res.status(500).json({ error: "Failed to query AI model", details: err?.message || String(err) });
    }
  });

  // --- Web Push Notification Endpoints (for background reminders when app/tab is closed) ---
  app.get("/api/push/vapid-public-key", (_req, res) => {
    try {
      const publicKey = serverPushService.getPublicKey();
      res.json({ publicKey });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to get VAPID key", details: err?.message });
    }
  });

  app.post("/api/push/subscribe", (req, res) => {
    try {
      const { userPhone, subscription, reminders } = req.body;
      if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: "Valid subscription object is required." });
      }
      const stored = serverPushService.saveSubscription(userPhone, subscription, reminders);
      res.status(201).json({ success: true, stored });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to save push subscription", details: err?.message });
    }
  });

  app.post("/api/push/sync-reminders", (req, res) => {
    try {
      const { userPhone, reminders } = req.body;
      if (!userPhone) {
        return res.status(400).json({ error: "userPhone is required." });
      }
      serverPushService.updateRemindersForPhone(userPhone, reminders || []);
      res.json({ success: true, count: reminders?.length || 0 });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to sync reminders", details: err?.message });
    }
  });

  app.post("/api/push/test", async (req, res) => {
    try {
      const { subscription, delaySeconds } = req.body;
      if (!subscription) {
        return res.status(400).json({ error: "subscription is required for test push." });
      }
      const delay = Number(delaySeconds) || 0;
      await serverPushService.sendTestNotification(subscription, delay);
      res.json({
        success: true,
        message: delay > 0
          ? `Server scheduled push in ${delay} seconds! You can safely close the tab now.`
          : "Test alert dispatched successfully!"
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to send test push", details: err?.message || String(err) });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MediFinder Server running on http://0.0.0.0:${PORT}`);
    serverPushService.startScheduler();
  });
}

startServer();
