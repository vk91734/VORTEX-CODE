
import crypto from "node:crypto";

export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error || !code) {
    return res.status(400).send("Autorização cancelada");
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const sessionSecret = process.env.SESSION_SECRET;

  const redirectUri =
    "https://vortex-code-qwzy.vercel.app/api/auth/callback/discord";

  if (!clientId || !clientSecret || !sessionSecret) {
    return res.status(500).send("Configuração incompleta");
  }

  try {
    const tokenResponse = await fetch(
      "https://discord.com/api/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri
        })
      }
    );

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok || !tokens.access_token) {
      return res.status(401).send("Falha na autenticação");
    }

    const userResponse = await fetch(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        }
      }
    );

    const user = await userResponse.json();

    if (!userResponse.ok || !user.id) {
      return res.status(401).send("Usuário não identificado");
    }

    const payload = Buffer.from(
      JSON.stringify({
        id: user.id,
        username: user.username,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000
      })
    ).toString("base64url");

    const signature = crypto
      .createHmac("sha256", sessionSecret)
      .update(payload)
      .digest("base64url");

    const session = `${payload}.${signature}`;

    res.setHeader("Set-Cookie",
      `vortex_session=${session}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
    );

    res.setHeader("Cache-Control", "no-store");

    return res.redirect(302, "/");
  } catch (err) {
    return res.status(500).send("Erro ao autenticar com Discord");
  }
}
