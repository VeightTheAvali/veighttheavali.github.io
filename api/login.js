export default function handler(request, response) {
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: "user-read-currently-playing",
    state
  });

  response.setHeader(
    "Set-Cookie",
    `spotify_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api`
  );
  response.redirect(`https://accounts.spotify.com/authorize?${params}`);
}
