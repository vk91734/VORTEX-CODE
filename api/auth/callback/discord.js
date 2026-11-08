
export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error || !code) {
    return res.status(400).send("Autorização do Discord cancelada");
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  const redirectUri =
    "https://vortex-code-qwzy.vercel.app/api/auth/callback/discord";

  if (!clientId || !clientSecret) {
    return res.status(500).send("Configuração do Discord incompleta");
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
      return res.status(401).send("Não foi possível validar o login");
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

    if (!userResponse.ok) {
      return res.status(401).send("Não foi possível identificar o usuário");
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      message: "Login autorizado",
      user: {
        id: user.id,
        username: user.username,
        global_name: user.global_name
      }
    });
  } catch (err) {
    return res.status(500).send("Erro ao conectar com o Discord");
  }
        }
        
