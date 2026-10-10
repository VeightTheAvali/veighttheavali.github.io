export default async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Cache-Control", "no-store");

  if (!process.env.SPOTIFY_REFRESH_TOKEN) {
    response.status(503).json({error: "SPOTIFY_REFRESH_TOKEN is not configured."});
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
      grant_type: "refresh_token",
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN
    })
  });

  if (!tokenResponse.ok) {
    response.status(502).json({error: "Spotify access token refresh failed."});
    return;
  }

  const tokens = await tokenResponse.json();
  const playingResponse = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {headers: {Authorization: `Bearer ${tokens.access_token}`}}
  );

  if (playingResponse.status === 204) {
    response.status(200).json({playing: false});
    return;
  }

  if (!playingResponse.ok) {
    response.status(502).json({error: "Spotify currently-playing request failed."});
    return;
  }

  const playingData = await playingResponse.json();
  const item = playingData.item;
  response.status(200).json({
    playing: true,
    title: item.name,
    artist: item.artists.map(artist => artist.name).join(", "),
    progressMs: playingData.progress_ms,
    durationMs: item.duration_ms,
    url: item.external_urls.spotify
  });
}
