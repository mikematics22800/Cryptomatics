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
  loginWithEmail,
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

const Login = ({ onSwitchToRegister }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!isSupabaseConfigured()) {
      setError("Supabase URL or key is missing. Check your Vite env variables.")
      return
    }
    setLoading(true)
    const { error: signInError } = await loginWithEmail(
      email.trim(),
      password
    )
    setLoading(false)
    if (signInError) {
      setError(signInError.message)
      return
    }
    navigate(resolvePostAuthPath(location.state?.from), { replace: true })
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              "Log in"
            )}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2, color: "rgba(148,163,184,0.95)", textAlign: "center" }}>
          Already have account?{" "}
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
