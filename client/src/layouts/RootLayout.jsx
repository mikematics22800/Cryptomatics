import { Outlet, NavLink, Link } from "react-router-dom"
import { CircularProgress } from "@mui/material"
import Background from "../components/Background"
import { useAuth } from "../auth/AuthProvider.jsx"

function NavAuth() {
  const { loading, signOut } = useAuth()

  if (loading) {
    return (
      <CircularProgress
        size={22}
        sx={{ color: "rgba(251,191,36,0.9)" }}
        aria-label="Loading account"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300 transition-colors hover:bg-white/10 hover:text-amber-300"
    >
      Log out
    </button>
  )
}

const navLinkClass = ({ isActive }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium tracking-tight transition-colors",
    isActive
      ? "bg-white/12 text-amber-300 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.22)]"
      : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-50",
  ].join(" ")

export default function Root() {
  return (
    <div id="root">
      <nav>
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex min-w-0 shrink items-center rounded-lg py-1.5 px-2 outline-none transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-amber-400/35"
          >
            <span className="cryptomatics-wordmark nav-wordmark max-w-[11rem] truncate sm:max-w-none">
              CRYPTOMATICS
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div
              className="flex items-center gap-0.5 rounded-lg bg-slate-950/55 p-1 ring-1 ring-inset ring-white/[0.08]"
              role="navigation"
              aria-label="Main"
            >
              <NavLink to="/" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/currencies" className={navLinkClass}>
                Currencies
              </NavLink>
            </div>
            <div className="hidden h-6 w-px bg-white/10 sm:block" aria-hidden />
            <NavAuth />
          </div>
        </div>
      </nav>
      <Background />
      <Outlet />
    </div>
  )
}