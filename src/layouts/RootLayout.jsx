import { createContext, useState } from "react"
import { Link, Outlet } from "react-router-dom"
import { CircularProgress } from "@mui/material"
import Background from "../components/Background"
import { Search } from "@mui/icons-material"
import logo from "../assets/images/logo.svg"
import { useAuth } from "../auth/AuthProvider.jsx"

export const RootContext = createContext()

function NavAuth() {
  const { session, loading, signOut } = useAuth()

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
      className="text-sm font-semibold text-slate-200 hover:text-amber-400/95 transition-colors bg-transparent border-none cursor-pointer"
    >
      Log out
    </button>
  )
}

const RootShell = () => {
  const [query, setQuery] = useState('')

  const value = { query, setQuery }

  return (
    <RootContext.Provider value={value}>
      <div id="root">
        <nav>
          <div id="title">
            <img src={logo} alt="" className="auth-brand-logo" />
            <h1 className="cryptomatics-wordmark">CRYPTOMATICS</h1>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link to="/" className="cursor-default">
            <div id="searchbar">
              <input placeholder="Search for coin..." onChange={(e) => {setQuery(e.target.value)}}/>
              <Search/>
            </div>
          </Link>
          <NavAuth />
        </div>
        </nav>
        <Background/>
        <Outlet/>
      </div>
    </RootContext.Provider>
  )
}

const Root = () => <RootShell />

export default Root