import { desc, gte } from "drizzle-orm";
import { db } from "../../db/index.js";
import { dispatchEvents } from "../../db/schema.js";

const json = (data: unknown, status = 200) => Response.json(data, {
  status,
  headers: { "Cache-Control": "no-store" },
});

const clean = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

export default async (request: Request) => {
  if (request.method === "GET") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);

    const events = await db
      .select({
        id: dispatchEvents.id,
        eventType: dispatchEvents.eventType,
        issueType: dispatchEvents.issueType,
        priority: dispatchEvents.priority,
        status: dispatchEvents.status,
        createdAt: dispatchEvents.createdAt,
      })
      .from(dispatchEvents)
      .where(gte(dispatchEvents.createdAt, sevenDaysAgo))
      .orderBy(desc(dispatchEvents.createdAt))
      .limit(50);

    return json({ events });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  if (body.website) {
    return json({ ok: true }, 201);
  }

  const eventType = body.eventType === "call" ? "call" : "priority_dispatch";
  const customerName = clean(body.name, 120);
  const customerPhone = clean(body.phone, 40);
  const issueType = clean(body.issueType, 80);
  const message = clean(body.message, 1200);

  if (eventType === "priority_dispatch" && (!customerName || !customerPhone || !issueType)) {
    return json({ error: "Name, phone number, and request type are required." }, 400);
  }

  const [event] = await db.insert(dispatchEvents).values({
    eventType,
    customerName: customerName || null,
    customerPhone: customerPhone || null,
    issueType: issueType || null,
    message: message || null,
    priority: eventType === "priority_dispatch",
    status: eventType === "call" ? "call_started" : "priority_received",
  }).returning({ id: dispatchEvents.id, createdAt: dispatchEvents.createdAt });

  return json({ ok: true, event }, 201);
};

export const config = {
  path: "/api/dispatch",
};
