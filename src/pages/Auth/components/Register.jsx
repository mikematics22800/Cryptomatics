import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material"
import {
  isSupabaseConfigured,
  registerWithEmail,
} from "../../../utils/supabase.js"
import { resolvePostAuthPath } from "../../../auth/resolvePostAuthPath.js"
import logo from "../../../assets/images/logo.svg"

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "rgba(255,255,255,0.92)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.22)" },
    "&:hover fieldset": { borderColor: "rgba(251,191,36,0.45)" },
    "&.Mui-focused fieldset": { borderColor: "rgba(251,191,36,0.75)" },
  },
  "& .MuiInputLabel-root": { color: "rgba(148,163,184,0.95)" },
}

const Register = ({ onSwitchToLogin }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setInfo("")
    if (!isSupabaseConfigured()) {
      setError("Supabase URL or key is missing. Check your Vite env variables.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 6) {
      setError("Use at least 6 characters for your password.")
      return
    }
    setLoading(true)
    const { data, error: signUpError } = await registerWithEmail(
      email.trim(),
      password
    )
    setLoading(false)
    if (signUpError) {
      setError(signUpError.message)
      return
    }
    if (data.session) {
      navigate(resolvePostAuthPath(location.state?.from), { replace: true })
      return
    }
    setInfo(
      "Check your inbox to confirm your email before signing in (if confirmation is enabled in Supabase)."
    )
  }

  return (
      <Paper className="auth-card" elevation={0}>
        <Box className="auth-brand-lockup">
          <Box
            component="img"
            src={logo}
            alt=""
            className="auth-brand-logo"
            sx={{ width: 36, height: "auto", display: "block" }}
          />
          <p className="cryptomatics-wordmark">CRYPTOMATICS</p>
        </Box>
        <p className="text-amber-400/95 text-center font-semibold">Start learning and earning now!</p>
        {!isSupabaseConfigured() && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_KEY</code>{" "}
            in <code>.env</code>.
          </Alert>
        )}

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        {info ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            {info}
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
            disabled={loading}
            sx={fieldSx}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            disabled={loading}
            sx={fieldSx}
          />
          <TextField
            fullWidth
            label="Confirm password"
            type="password"
            name="confirm"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            margin="normal"
            required
            disabled={loading}
            sx={fieldSx}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
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
              "Register"
            )}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2, color: "rgba(148,163,184,0.95)", textAlign: "center" }}>
          Don&apos;t have an account?{" "}
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={onSwitchToLogin}
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
            Login
          </Link>
        </Typography>
      </Paper>
  )
}

export default Register
