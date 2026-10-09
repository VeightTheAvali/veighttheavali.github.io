import {sql} from "@vercel/postgres";

export default async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "https://www.veight.dev");
  response.setHeader("Cache-Control", "no-store");

  try {
    const result = await sql`SELECT mood FROM mood_status WHERE id = 1`;
    response.status(200).json({mood: result.rows[0]?.mood || "vibing"});
  } catch (error) {
    console.error("Could not read mood:", error);
    response.status(500).json({error: "Could not load mood."});
  }
}
