import { redirect } from "@tanstack/react-router"

import { getCurrentUserFn } from "@/lib/auth.functions"

export async function requireSession(opts: { location: { href: string } }) {
  const user = await getCurrentUserFn()
  if (!user) {
    throw redirect({
      to: "/login",
      search: { redirect: opts.location.href },
    })
  }
  return { user }
}
