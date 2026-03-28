/**
 * After sign-in, send the user to the protected route they tried to open,
 * or Home. Avoid bouncing back to auth routes.
 */
export function resolvePostAuthPath(from) {
  if (!from?.pathname) return "/"
  const p = from.pathname
  if (p === "/login" || p === "/register") return "/"
  return `${p}${from.search ?? ""}${from.hash ?? ""}`
}
