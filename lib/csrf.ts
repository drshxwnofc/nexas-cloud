// lib/csrf.ts
function getCookie(req: Request, name: string) {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;

  const match = cookie
    .split(";")
    .map(c => c.trim())
    .find(c => c.startsWith(name + "="));

  return match ? match.split("=")[1] : null;
}

export function verifyCSRF(req: Request) {
  const tokenHeader = req.headers.get("x-csrf-token");
  const tokenCookie = getCookie(req, "csrf_token");

  if (!tokenHeader || !tokenCookie) return false;
  return tokenHeader === tokenCookie;
}

export function createCSRF() {
  return crypto.randomUUID();
}
