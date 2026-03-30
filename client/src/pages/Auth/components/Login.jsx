import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material"
import {
  loginWithEmail,
  provisionNewUserAccounts,
  signInWithGoogle,
} from "../../../utils/supabase.js"
import {
  getPasswordPolicyError,
} from "../../../utils/passwordPolicy.js"
import { resolvePostAuthPath } from "../../../auth/resolvePostAuthPath.js"

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "rgba(255,255,255,0.92)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.22)" },
    "&:hover fieldset": { borderColor: "rgba(251,191,36,0.45)" },
    "&.Mui-focused fieldset": { borderColor: "rgba(251,191,36,0.75)" },
  },
  "& .MuiInputLabel-root": { color: "rgba(148,163,184,0.95)" },
}

const Login = ({ onSwitchToRegister }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)

  const authBusy = loading || oauthLoading

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    const policyError = getPasswordPolicyError(password)
    if (policyError) {
      setError(policyError)
      return
    }
    setLoading(true)
    const { data, error: signInError } = await loginWithEmail(
      email.trim(),
      password
    )
    if (signInError) {
      setLoading(false)
      setError(signInError.message)
      return
    }

    const session = data?.session
    const signedInUser = data?.user ?? session?.user
    if (session && signedInUser?.id) {
      const { error: provisionError } = await provisionNewUserAccounts(
        signedInUser.id,
        signedInUser.email,
        session
      )
      if (provisionError) {
        console.error(provisionError)
      }
    }

    setLoading(false)
    navigate(resolvePostAuthPath(location.state?.from), { replace: true })
  }

  const handleGoogle = async () => {
    setError("")
    setOauthLoading(true)
    try {
      const { error: oauthError } = await signInWithGoogle()
      if (oauthError) {
        setError(oauthError.message)
        setOauthLoading(false)
      }
    } catch (err) {
      setError(err?.message ?? "Could not start Google sign-in.")
      setOauthLoading(false)
    }
  }

  return (
      <Paper className="auth-card" elevation={0}>
        <Box className="auth-brand-lockup">
          <p className="cryptomatics-wordmark text-lg">CRYPTOMATICS</p>
        </Box>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            disabled={authBusy}
            sx={fieldSx}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            disabled={authBusy}
            sx={fieldSx}
            FormHelperTextProps={{
              sx: { color: "rgba(148,163,184,0.85)" },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((v) => !v)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                    disabled={authBusy}
                    sx={{ color: "rgba(148,163,184,0.95)" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={authBusy}
            sx={{
              mt: 2,
              py: 1.25,
              fontWeight: 700,
              bgcolor: "rgba(251,191,36,0.92)",
              color: "rgb(15,23,42)",
              "&:hover": { bgcolor: "rgba(251,191,36,1)" },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "rgb(15,23,42)" }} />
            ) : (
              "Log in"
            )}
          </Button>
        </Box>

        <Divider
          sx={{
            my: 2.5,
            borderColor: "rgba(255,255,255,0.12)",
            "&::before, &::after": { borderColor: "rgba(255,255,255,0.12)" },
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "rgba(148,163,184,0.85)", px: 1 }}
          >
            or
          </Typography>
        </Divider>

        <Button
          type="button"
          fullWidth
          variant="outlined"
          onClick={handleGoogle}
          disabled={authBusy}
          aria-label="Continue with Google"
          sx={{
            py: 1.1,
            fontFamily: '"Google Sans", "Space Grotesk", ui-sans-serif, system-ui, sans-serif',
            fontWeight: 600,
            color: "rgba(255,255,255,0.92)",
            borderColor: "rgba(255,255,255,0.22)",
            "&:hover": {
              borderColor: "rgba(251,191,36,0.45)",
              bgcolor: "rgba(255,255,255,0.04)",
            },
            "&.Mui-disabled": {
              borderColor: "rgba(255,255,255,0.1)",
              color: "rgba(148,163,184,0.5)",
            },
          }}
        >
          {oauthLoading ? (
            <CircularProgress size={22} sx={{ color: "rgba(251,191,36,0.92)" }} />
          ) : (
            <>
              <Box
                component="svg"
                viewBox="0 0 24 24"
                aria-hidden
                sx={{ width: 20, height: 20, mr: 1.25, flexShrink: 0 }}
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </Box>
              Continue with Google
            </>
          )}
        </Button>

        <Typography variant="body2" sx={{ mt: 2, color: "rgba(148,163,184,0.95)", textAlign: "center" }}>
          Don&apos;t have an account?{" "}
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={onSwitchToRegister}
            sx={{
              verticalAlign: "baseline",
              color: "rgba(251,191,36,0.95)",
              cursor: "pointer",
              border: "none",
              background: "none",
              font: "inherit",
              padding: 0,
            }}
          >
            Register
          </Link>
        </Typography>
      </Paper>
  )
}

export default Login
