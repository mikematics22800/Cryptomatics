/** Post-login destination: prior protected URL, or `/`, never `/login` / `/register`. */
export function resolvePostAuthPath(from) {
  if (!from?.pathname) return "/"
  const p = from.pathname
  if (p === "/login" || p === "/register") return "/"
  return `${p}${from.search ?? ""}${from.hash ?? ""}`
}
