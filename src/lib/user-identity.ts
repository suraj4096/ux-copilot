export function parseNameFromEmail(email: string): string {
  const localPart = email.trim().split("@")[0] ?? ""
  const tokens = localPart.split(/[._-]/)
  const first = tokens.find((part) => part.length > 0)
  return first ?? localPart
}

export function initialFromName(name: string): string {
  const ch = name.trim().charAt(0)
  return ch ? ch.toUpperCase() : "?"
}

export function greetingByHour(date: Date): "Good morning" | "Good afternoon" | "Good evening" {
  const h = date.getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}
