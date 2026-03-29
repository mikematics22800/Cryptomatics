/** Optional `confirm` adds a "Passwords match" checklist row. */
export function getPasswordRequirementStatus(password, confirm) {
  const p = password ?? ""
  const rows = [
    {
      id: "length",
      label: "At least 8 characters",
      met: p.length >= 8,
    },
    {
      id: "lower",
      label: "One lowercase letter",
      met: /[a-z]/.test(p),
    },
    {
      id: "upper",
      label: "One uppercase letter",
      met: /[A-Z]/.test(p),
    },
    {
      id: "number",
      label: "One number",
      met: /[0-9]/.test(p),
    },
    {
      id: "symbol",
      label: "One symbol (e.g. !@#$%)",
      met: /[^A-Za-z0-9]/.test(p),
    },
  ]
  if (confirm !== undefined) {
    const c = confirm ?? ""
    rows.push({
      id: "match",
      label: "Passwords match",
      met: Boolean(p && c && p === c),
    })
  }
  return rows
}

/** @returns {string | null} */
export function getPasswordPolicyError(password) {
  const checks = getPasswordRequirementStatus(password)
  const failed = checks.find((row) => !row.met)
  if (!failed) return null
  const messages = {
    length: "Use at least 8 characters.",
    lower: "Include at least one lowercase letter.",
    upper: "Include at least one uppercase letter.",
    number: "Include at least one number.",
    symbol: "Include at least one symbol (e.g. !@#$%).",
  }
  return messages[failed.id] ?? "Password does not meet requirements."
}
