// lib/authGuard.ts
import { verifyJWT } from "./jwt.ts";

const JWT_SECRET = "CHANGE_THIS_SECRET"; // same as auth.ts

function getCookie(req: Request, name: string) {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;

  const match = cookie
    .split(";")
    .map(c => c.trim())
    .find(c => c.startsWith(name + "="));

  return match ? match.split("=")[1] : null;
}

export async function requireAuth(req: Request) {
  const token = getCookie(req, "nexas_jwt");
  const payload = await verifyJWT(token, JWT_SECRET);

  if (!payload) {
    return { error: new Response("Unauthorized", { status: 401 }) };
  }

  if (payload.exp < Date.now()) {
    return { error: new Response("Session expired", { status: 401 }) };
  }

  return { user: payload };
}

export async function requireAdmin(req: Request) {
  const auth = await requireAuth(req);
  if (auth.error) return auth;

  if (auth.user.role !== "admin") {
    return { error: new Response("Forbidden", { status: 403 }) };
  }

  return auth;
                                                     }
