import { getRequest, setResponseHeader } from "@tanstack/react-start/server"
import { SignJWT, jwtVerify } from "jose"

import { getUserByEmail } from "@/lib/db/queries"

const cookieName = "auth_token"
const sevenDaysSeconds = 7 * 24 * 60 * 60

type JwtPayload = {
  email: string
  iat: number
  exp: number
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("Missing JWT_SECRET env var")
  }
  return new TextEncoder().encode(secret)
}

function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}
  const out: Record<string, string> = {}
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=")
    if (!rawName) continue
    out[rawName] = decodeURIComponent(rawValue.join("="))
  }
  return out
}

function serializeCookie(
  name: string,
  value: string,
  opts: {
    httpOnly?: boolean
    secure?: boolean
    sameSite?: "lax" | "strict" | "none"
    path?: string
    maxAge?: number
  } = {},
) {
  const parts = [`${name}=${encodeURIComponent(value)}`]
  parts.push(`Path=${opts.path ?? "/"}`)
  if (typeof opts.maxAge === "number") parts.push(`Max-Age=${opts.maxAge}`)
  if (opts.httpOnly) parts.push("HttpOnly")
  if (opts.secure) parts.push("Secure")
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`)
  return parts.join("; ")
}

function setAuthCookie(token: string) {
  const secure = process.env.NODE_ENV === "production"
  setResponseHeader(
    "Set-Cookie",
    serializeCookie(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      maxAge: sevenDaysSeconds,
      path: "/",
    }),
  )
}

function clearAuthCookie() {
  const secure = process.env.NODE_ENV === "production"
  setResponseHeader(
    "Set-Cookie",
    serializeCookie(cookieName, "", {
      httpOnly: true,
      sameSite: "lax",
      secure,
      maxAge: 0,
      path: "/",
    }),
  )
}

async function createAuthToken(email: string) {
  const secret = getJwtSecret()
  const nowSeconds = Math.floor(Date.now() / 1000)
  const exp = nowSeconds + sevenDaysSeconds

  return await new SignJWT({ email } satisfies Omit<JwtPayload, "iat" | "exp">)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(nowSeconds)
    .setExpirationTime(exp)
    .sign(secret)
}

function readAuthTokenFromCookie(): string | null {
  const request = getRequest()
  const cookies = parseCookieHeader(request.headers.get("cookie"))
  return cookies[cookieName] ?? null
}

export async function getUserFromAuthCookie() {
  const token = readAuthTokenFromCookie()
  if (!token) return null

  let payload: JwtPayload
  try {
    const verified = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    })
    payload = verified.payload as unknown as JwtPayload
  } catch {
    return null
  }

  if (!payload.email) return null
  const user = await getUserByEmail(payload.email)
  if (!user) return null

  return { email: user.email }
}

export async function loginWithEmail(email: string) {
  const user = await getUserByEmail(email)
  if (!user) return { ok: false as const, error: "User not found" }

  const token = await createAuthToken(user.email)
  setAuthCookie(token)
  return { ok: true as const, user: { email: user.email } }
}

export function logout() {
  clearAuthCookie()
  return { ok: true as const }
}

