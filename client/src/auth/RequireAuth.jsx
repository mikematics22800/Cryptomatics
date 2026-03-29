import { Navigate, useLocation } from "react-router-dom"
import { CircularProgress } from "@mui/material"
import { useAuth } from "./AuthProvider.jsx"

export function RequireAuth({ children }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px]">
        <CircularProgress size="4rem" sx={{ color: "rgba(251,191,36,0.92)" }} />
      </div>
    )
  }

  if (!session) {
    return (
      <Navigate to="/login" replace state={{ from: location }} />
    )
  }

  return children
}
