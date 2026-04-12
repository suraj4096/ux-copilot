import type { ZodType } from "zod"

import type {ValidationResult} from "@/lib/forms/validator/result";
import {
  
  validationFailure,
  validationOk
} from "@/lib/forms/validator/result"

function formatZodPath(path: ReadonlyArray<PropertyKey>): string {
  let s = ""
  for (const seg of path) {
    if (typeof seg === "number") s += `[${seg}]`
    else s += s ? `.${String(seg)}` : String(seg)
  }
  return s
}

export function zodSafeParseToResult<T>(
  schema: ZodType<T>,
  input: unknown,
): ValidationResult<T> {
  const r = schema.safeParse(input)
  if (r.success) return validationOk(r.data)
  return validationFailure(
    r.error.issues.map((iss) => {
      const p = iss.path.length ? `${formatZodPath(iss.path)}: ` : ""
      return `${p}${iss.message}`
    }),
  )
}
