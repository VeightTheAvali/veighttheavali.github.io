import bcrypt from "bcryptjs";
import {neon} from "@neondatabase/serverless";

const allowedOrigins = new Set([
  "https://www.veight.dev",
  "https://veight.dev",
  "http://www.veight.dev",
  "http://veight.dev"
]);

export default async function handler(request, response) {
  const origin = request.headers.origin;
  if (allowedOrigins.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  }
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Cache-Control", "no-store");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({error: "Method not allowed."});
    return;
  }

  const {username, password, mood} = request.body || {};
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof mood !== "string" ||
    !mood.trim()
  ) {
    response.status(400).json({error: "Username, password, and mood are required."});
    return;
  }

  const connectionString =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL;
  if (!connectionString) {
    response.status(503).json({error: "Mood database is not configured."});
    return;
  }

  try {
    if (!process.env.MOOD_USERNAME || !process.env.MOOD_PASSWORD_HASH) {
      response.status(503).json({error: "Mood authentication is not configured."});
      return;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      process.env.MOOD_PASSWORD_HASH
    );
    if (username !== process.env.MOOD_USERNAME || !passwordMatches) {
      response.status(401).json({error: "Invalid username or password."});
      return;
    }

    const sql = neon(connectionString);
    await sql`
      CREATE TABLE IF NOT EXISTS mood_status (
        id INTEGER PRIMARY KEY,
        mood TEXT NOT NULL
      )
    `;
    const result = await sql`
      INSERT INTO mood_status (id, mood)
      VALUES (1, ${mood.trim()})
      ON CONFLICT (id)
      DO UPDATE SET mood = EXCLUDED.mood
      RETURNING mood
    `;
    response.status(200).json({mood: result[0].mood});
  } catch (error) {
    console.error("Could not update mood:", error);
    response.status(500).json({error: "Could not update mood."});
  }
}
