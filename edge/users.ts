// edge/users.ts
import { kv } from "../storage/kv.ts";
import { requireAuth } from "../lib/authGuard.ts";
import { rateLimit } from "../lib/rateLimit.ts";
import { audit } from "./audit.ts";

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  // Rate limit all user endpoints
  if (!rateLimit(`users:${ip}`, 60, 60000)) {
    return json({ error: "Too many requests" }, 429);
  }

  // 🔐 /api/users/me (private profile)
  if (url.pathname === "/api/users/me") {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const user = kv.get(`user:${auth.user.uid}`);
    if (!user) return json({ error: "User not found" }, 404);

    user.lastSeen = Date.now();
    kv.set(`user:${user.id}`, user);

    audit("user_profile_self_view", { userId: user.id });

    return json({
      id: user.id,
      username: user.username,
      role: user.role,
      coins: user.coins,
      createdAt: user.createdAt,
      lastSeen: user.lastSeen
    });
  }

  // 🌐 /api/users/{id} (public profile)
  if (url.pathname.startsWith("/api/users/")) {
    const userId = url.pathname.split("/").pop();
    if (!userId) return json({ error: "Invalid user id" }, 400);

    const user = kv.get(`user:${userId}`);
    if (!user) return json({ error: "User not found" }, 404);

    audit("user_profile_public_view", { userId });

    return json({
      id: user.id,
      username: user.username,
      joined: user.createdAt,
      lastSeen: user.lastSeen || null
    });
  }

  return new Response("Not Found", { status: 404 });
}
