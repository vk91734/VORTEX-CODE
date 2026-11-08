

import crypto from "node:crypto";

function getSession(req) {
  const cookies = req.headers.cookie || "";
  const item = cookies
    .split(";")
    .map(value => value.trim())
    .find(value => value.startsWith("vortex_session="));

  return item ? decodeURIComponent(item.split("=").slice(1).join("=")) : null;
}

function verifySession(token, secret) {
  if (!token || !secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (!data.id || !data.exp || data.exp < Date.now()) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const token = getSession(req);
  const session = verifySession(
    token,
    process.env.SESSION_SECRET
  );

  if (!session) {
    return res.status(401).json({
      authenticated: false,
      message: "Sessão inválida ou expirada"
    });
  }

  return res.status(200).json({
    authenticated: true,
    user: {
      id: session.id,
      username: session.username
    }
  });
    }
