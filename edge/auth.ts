// edge/auth.ts
import { kv } from "../storage/kv.ts";
import { signJWT } from "../lib/jwt.ts";
import { hash } from "../lib/crypto.ts";
import { audit } from "./audit.ts";

const JWT_SECRET = "CHANGE_THIS_SECRET"; // move to env later

// SERVER-ONLY ADMIN (never exposed)
const ADMIN = {
  username: "admin",
  passwordHash: await hash("@Mukudzei2022"),
  role: "admin"
};

export default async function handler(req: Request) {
  const url = new URL(req.url);

  // Start GitHub OAuth
  if (url.pathname === "/api/auth/github") {
    const redirect = `https://github.com/login/oauth/authorize?client_id=${crypto.env.GITHUB_CLIENT_ID}`;
    return Response.redirect(redirect);
  }

  // OAuth callback (simplified for now)
  if (url.pathname === "/api/auth/callback") {
    const githubUser = {
      id: crypto.randomUUID(),
      username: "github_user"
    };

    let user = kv.get(`user:${githubUser.id}`);

    if (!user) {
      user = {
        id: githubUser.id,
        username: githubUser.username,
        role: "user",
        coins: 100,
        createdAt: Date.now(),
        lastLogin: Date.now()
      };
      kv.set(`user:${user.id}`, user);
      audit("user_created", { userId: user.id });
    }

    user.lastLogin = Date.now();
    kv.set(`user:${user.id}`, user);

    const token = await signJWT(
      {
        uid: user.id,
        role: user.role,
        iat: Date.now(),
        exp: Date.now() + 1000 * 60 * 60 * 24
      },
      JWT_SECRET
    );

    audit("login", { userId: user.id });

    return new Response("Authenticated", {
      headers: {
        "Set-Cookie": `nexas_jwt=${token}; HttpOnly; Secure; Path=/`
      }
    });
  }

  return new Response("Not Found", { status: 404 });
        }
