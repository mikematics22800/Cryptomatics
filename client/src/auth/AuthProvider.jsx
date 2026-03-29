import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  fetchAccountProfile,
  logout,
  onAuthStateChange,
  provisionNewUserAccounts,
} from "../utils/supabase.js"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const applyAuthSession = useCallback(async (nextSession) => {
    if (!nextSession?.user?.id) {
      setSession(null)
      setProfile(null)
      return
    }

    const userId = nextSession.user.id
    const userEmail = nextSession.user.email

    const { error: provisionError } = await provisionNewUserAccounts(
      userId,
      userEmail,
      nextSession
    )
    if (provisionError) {
      console.error(provisionError)
    }

    const { profile: nextProfile, error } = await fetchAccountProfile(userId)
    if (error) {
      console.error(error)
    }

    setSession(nextSession)
    setProfile(nextProfile)
  }, [])

  useEffect(() => {
    let cancelled = false

    const {
      data: { subscription },
    } = onAuthStateChange(async (_event, nextSession) => {
      if (cancelled) return
      setLoading(true)
      await applyAuthSession(nextSession)
      if (cancelled) return
      setLoading(false)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [applyAuthSession])

  const signOut = useCallback(async () => {
    await logout()
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signOut,
    }),
    [session, profile, loading, signOut]
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
