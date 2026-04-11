export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] }

export function validationFailure(errors: string[]): ValidationResult<never> {
  return { ok: false, errors }
}

export function validationOk<T>(value: T): ValidationResult<T> {
  return { ok: true, value }
}
