
import crypto from "node:crypto";

export default function handler(req, res) {
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!clientId) {
    return res.status(500).send("Configuração do Discord ausente");
  }

  const redirectUri =
    "https://vortex-code-qwzy.vercel.app/api/auth/callback/discord";

  const state = crypto.randomBytes(32).toString("hex");

  res.setHeader(
    "Set-Cookie",
    `vortex_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=600`
  );

  res.setHeader("Cache-Control", "no-store");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify",
    state
  });

  return res.redirect(
    302,
    `https://discord.com/oauth2/authorize?${params.toString()}`
  );
}
