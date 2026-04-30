import { createClient } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { migrations } from "./schema";

const url = process.env.DATABASE_URL ?? "file:data/justhomepage.sqlite";
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (url.startsWith("file:data/")) {
  mkdirSync("data", { recursive: true });
}

export const db = createClient({
  url,
  authToken,
});

let migrated = false;

export async function migrate() {
  if (migrated) return;
  for (const statement of migrations) {
    await db.execute(statement);
  }
  migrated = true;
}
