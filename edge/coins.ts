// edge/coins.ts
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

  // Rate limit coin API
  if (!rateLimit(`coins:${ip}`, 20, 60000)) {
    return json({ error: "Too many requests" }, 429);
  }

  // Authenticate
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const userId = auth.user.uid;
  const user = kv.get(`user:${userId}`);
  if (!user) return json({ error: "User not found" }, 404);

  // GET /api/coins → returns current balance & ledger
  if (req.method === "GET" && url.pathname === "/api/coins") {
    const ledger = kv.get("ledger") || [];
    return json({
      coins: user.coins,
      ledger: ledger.filter((tx: any) => tx.from === userId || tx.to === userId)
    });
  }

  // POST /api/coins/send → send coins to another user
  if (req.method === "POST" && url.pathname === "/api/coins/send") {
    const body = await req.json();
    const { toId, amount } = body;

    if (!toId || typeof amount !== "number" || amount <= 0) {
      return json({ error: "Invalid request" }, 400);
    }

    if (toId === userId) return json({ error: "Cannot send coins to yourself" }, 400);

    const recipient = kv.get(`user:${toId}`);
    if (!recipient) return json({ error: "Recipient not found" }, 404);

    // Check balance (admin has infinite coins)
    if (user.role !== "admin" && user.coins < amount) {
      return json({ error: "Insufficient coins" }, 400);
    }

    // Update balances
    if (user.role !== "admin") user.coins -= amount;
    recipient.coins += amount;

    kv.set(`user:${userId}`, user);
    kv.set(`user:${toId}`, recipient);

    // Immutable ledger entry
    const tx = {
      id: crypto.randomUUID(),
      from: userId,
      to: toId,
      amount,
      time: Date.now()
    };
    kv.append("ledger", tx);
    audit("coins_transfer", tx);

    return json({ success: true, tx });
  }

  return new Response("Not Found", { status: 404 });
      }
