
export default function handler(req, res) {
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!clientId) {
    return res.status(500).json({
      error: "Configuração do Discord não encontrada"
    });
  }

  const redirectUri =
    "https://vortex-code-qwzy.vercel.app/api/auth/callback/discord";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify"
  });

  res.redirect(
    302,
    `https://discord.com/oauth2/authorize?${params.toString()}`
  );
      }
