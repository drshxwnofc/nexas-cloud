// edge/admin.ts
import { requireAdmin } from "../lib/authGuard.ts";
import { rateLimit } from "../lib/rateLimit.ts";

export default async function handler(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  if (!rateLimit(ip, 10, 60000)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  return new Response(
    JSON.stringify({ message: "Welcome admin" }),
    { headers: { "Content-Type": "application/json" } }
  );
}
