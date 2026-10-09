export default async function handler(request, response) {
  const {code, state, error} = request.query;
  const cookies = request.headers.cookie || "";
  const savedState = cookies.match(/(?:^|;\s*)spotify_state=([^;]+)/)?.[1];

  if (error) {
    response.status(400).send(`Spotify authorization failed: ${error}`);
    return;
  }

  if (!code || !state || state !== savedState) {
    response.status(400).send("Invalid Spotify authorization state.");
    return;
  }

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");
  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI
    })
  });

  if (!tokenResponse.ok) {
    response.status(502).send("Spotify token exchange failed.");
    return;
  }

  const tokens = await tokenResponse.json();
  response
    .status(200)
    .setHeader("Content-Type", "text/html; charset=utf-8")
    .send(`<h1>Spotify connected</h1>
      <p>Add this refresh token to the Vercel environment variable
      <code>SPOTIFY_REFRESH_TOKEN</code>, then redeploy:</p>
      <pre>${tokens.refresh_token || "No refresh token was returned."}</pre>`);
}
