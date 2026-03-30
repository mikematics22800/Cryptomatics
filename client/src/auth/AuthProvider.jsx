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
  supabase,
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

    const runApply = async (nextSession) => {
      if (cancelled) return
      setLoading(true)
      try {
        await applyAuthSession(nextSession)
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    // Google OAuth (and email magic links) finish by writing tokens from the URL. That can
    // land a hair after the first frame, so read the session explicitly as well as listening.
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) void runApply(session)
    })

    const {
      data: { subscription },
    } = onAuthStateChange((_event, nextSession) => {
      void runApply(nextSession)
    })

    const oauthCatchUp = window.setTimeout(() => {
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled || !session?.user?.id) return
        void runApply(session)
      })
    }, 400)

    return () => {
      cancelled = true
      window.clearTimeout(oauthCatchUp)
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
