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
  response.setHeader("Cache-Control", "no-store");

  const connectionString =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL;
  if (!connectionString) {
    response.status(503).json({error: "Mood database is not configured."});
    return;
  }

  const sql = neon(connectionString);

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS mood_status (
        id INTEGER PRIMARY KEY,
        mood TEXT NOT NULL
      )
    `;
    const result = await sql`SELECT mood FROM mood_status WHERE id = 1`;
    response.status(200).json({mood: result[0]?.mood || "vibing"});
  } catch (error) {
    console.error("Could not read mood:", error);
    response.status(500).json({error: "Could not load mood."});
  }
}
