// edge/apps.ts
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

// Helper: simple project type detection (mock)
function detectProjectType(repo: any) {
  if (repo.files.includes("package.json")) return "node";
  if (repo.files.includes("requirements.txt")) return "python";
  if (repo.files.includes("index.html")) return "static";
  return "worker";
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  // Rate limit app API
  if (!rateLimit(`apps:${ip}`, 20, 60000)) {
    return json({ error: "Too many requests" }, 429);
  }

  // Authenticate
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const userId = auth.user.uid;

  // GET /api/apps → list user apps
  if (req.method === "GET" && url.pathname === "/api/apps") {
    const apps = kv.get(`apps:${userId}`) || [];
    return json({ apps });
  }

  // POST /api/apps/deploy → deploy a new app
  if (req.method === "POST" && url.pathname === "/api/apps/deploy") {
    const body = await req.json();
    const { repoUrl, env = {} } = body;

    if (!repoUrl) return json({ error: "repoUrl required" }, 400);

    // Mock repo fetch & file scan
    const repo = {
      url: repoUrl,
      files: ["index.html", "app.js"], // For demo, can extend later
    };

    const type = detectProjectType(repo);

    const app = {
      id: crypto.randomUUID(),
      userId,
      repoUrl,
      type,
      env,
      status: "deployed",
      logs: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Store user apps
    const apps = kv.get(`apps:${userId}`) || [];
    apps.push(app);
    kv.set(`apps:${userId}`, apps);

    audit("app_deploy", { userId, appId: app.id, repoUrl, type });

    return json({ success: true, app });
  }

  // POST /api/apps/:id/restart → restart app
  if (req.method === "POST" && url.pathname.startsWith("/api/apps/")) {
    const parts = url.pathname.split("/");
    const appId = parts[3];
    if (!appId) return json({ error: "App ID required" }, 400);

    const apps = kv.get(`apps:${userId}`) || [];
    const app = apps.find((a: any) => a.id === appId);
    if (!app) return json({ error: "App not found" }, 404);

    // Mock restart
    app.status = "restarting";
    app.updatedAt = Date.now();
    app.logs.push({ time: Date.now(), message: "Restart triggered" });
    kv.set(`apps:${userId}`, apps);

    audit("app_restart", { userId, appId });

    return json({ success: true, app });
  }

  return new Response("Not Found", { status: 404 });
  }
