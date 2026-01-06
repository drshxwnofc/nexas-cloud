// edge/audit.ts
import { kv } from "../storage/kv.ts";

export function audit(event: string, meta: any) {
  kv.append("audit_logs", {
    id: crypto.randomUUID(),
    event,
    meta,
    time: Date.now()
  });
}
