
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const cookies = req.headers.cookie || "";

  const sessionCookie = cookies
    .split(";")
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith("vortex_session="));

  if (!sessionCookie) {
    return res.status(401).json({
      authenticated: false,
      message: "Você não está conectado"
    });
  }

  return res.status(501).json({
    authenticated: false,
    message: "Sistema de sessão ainda precisa ser configurado"
  });
}
