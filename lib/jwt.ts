// lib/jwt.ts
const encoder = new TextEncoder();

function b64(data: string) {
  return btoa(data);
}

function unb64(data: string) {
  return atob(data);
}

export async function signJWT(payload: any, secret: string) {
  const body = b64(JSON.stringify(payload));
  const sigData = encoder.encode(body + secret);

  const hash = await crypto.subtle.digest("SHA-256", sigData);
  const sig = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return `${body}.${sig}`;
}

export async function verifyJWT(token: string, secret: string) {
  if (!token) return null;

  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const sigData = encoder.encode(body + secret);
  const hash = await crypto.subtle.digest("SHA-256", sigData);
  const check = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  if (check !== sig) return null;
  return JSON.parse(unb64(body));
}
