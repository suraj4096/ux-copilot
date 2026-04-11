import { createServerFn } from "@tanstack/react-start"

import { getUserFromAuthCookie, loginWithEmail, logout } from "@/lib/auth.server"

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => {
    if (typeof data.email !== "string" || !data.email) {
      throw new Error("Email is required")
    }
    return { email: data.email.trim() }
  })
  .handler(async ({ data }) => {
    try {
      return await loginWithEmail(data.email)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      return { ok: false as const, error: message }
    }
  })

export const logoutFn = createServerFn({ method: "POST" }).handler(() => logout())

export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return await getUserFromAuthCookie()
  },
)

