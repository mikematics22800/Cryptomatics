import { Navigate, useLocation } from "react-router-dom"
import { CircularProgress } from "@mui/material"
import { useAuth } from "./AuthProvider.jsx"
import { resolvePostAuthPath } from "./resolvePostAuthPath.js"

/**
 * Route guard for auth screens: redirects signed-in users to Home (or prior protected route).
 */
export function GuestOnly({ children }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px]">
        <CircularProgress size="4rem" sx={{ color: "rgba(251,191,36,0.92)" }} />
      </div>
    )
  }

  if (session) {
    const to = resolvePostAuthPath(location.state?.from)
    return <Navigate to={to} replace />
  }

  return children
}
