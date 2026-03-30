import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Check from "@mui/icons-material/Check"
import Close from "@mui/icons-material/Close"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material"
import {
  provisionNewUserAccounts,
  registerWithEmail,
  signInWithGoogle,
} from "../../../utils/supabase.js"
import { getPasswordRequirementStatus } from "../../../utils/passwordPolicy.js"
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

const Register = ({ onSwitchToLogin }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [verificationMessage, setVerificationMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)

  const authBusy = loading || oauthLoading

  const passwordChecklist = getPasswordRequirementStatus(password, confirm)
  const passwordRequirementsMet = passwordChecklist.every((row) => row.met)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setVerificationMessage("")
    if (!passwordRequirementsMet) {
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

    const user = data.user
    const hasSession = Boolean(data.session)
    const emailConfirmed = Boolean(user?.email_confirmed_at)

    if (!hasSession) {
      setPassword("")
      setConfirm("")
      setVerificationMessage(
        "We sent a verification link to your email. Open it to confirm your account — after that you can sign in, and we will finish setting up your profile and wallet."
      )
      return
    }

    if (emailConfirmed) {
      const session = data.session
      const rowUser = data.user ?? session?.user
      if (session && rowUser?.id) {
        const { error: provisionError } = await provisionNewUserAccounts(
          rowUser.id,
          rowUser.email,
          session
        )
        if (provisionError) {
          console.error(provisionError)
        }
      }
      navigate(resolvePostAuthPath(location.state?.from), { replace: true })
      return
    }

    setPassword("")
    setConfirm("")
    setVerificationMessage(
      "Please verify your email using the link we sent. Once verified, sign in here and we will complete your account setup."
    )
  }

  const handleGoogle = async () => {
    setError("")
    setVerificationMessage("")
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
          <p className="cryptomatics-wordmark text-xl">CRYPTOMATICS</p>
        </Box>
        <p className="text-amber-400/95 text-center font-semibold mb-4">Start learning and earning now!</p>
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            disabled={authBusy}
            sx={fieldSx}
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
          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirm ? "text" : "password"}
            name="confirm"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            margin="normal"
            required
            disabled={authBusy}
            sx={fieldSx}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showConfirm ? "Hide confirm password" : "Show confirm password"
                    }
                    onClick={() => setShowConfirm((v) => !v)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                    disabled={authBusy}
                    sx={{ color: "rgba(148,163,184,0.95)" }}
                  >
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box
            component="ul"
            aria-label="Password requirements"
            sx={{
              listStyle: "none",
              m: 0,
              mt: 1.5,
              mb: 0,
              p: 0,
              display: "flex",
              flexDirection: "column",
              gap: 0.75,
            }}
          >
            {passwordChecklist.map(({ id, label, met }) => (
              <Box
                key={id}
                component="li"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  minHeight: 22,
                }}
              >
                {met ? (
                  <Check
                    sx={{
                      fontSize: 20,
                      color: "rgba(74,222,128,0.95)",
                      flexShrink: 0,
                    }}
                    aria-hidden
                  />
                ) : (
                  <Close
                    sx={{
                      fontSize: 20,
                      color: "rgba(148,163,184,0.75)",
                      flexShrink: 0,
                    }}
                    aria-hidden
                  />
                )}
                <Typography
                  variant="body2"
                  component="span"
                  sx={{
                    color: met
                      ? "rgba(226,232,240,0.95)"
                      : "rgba(148,163,184,0.9)",
                  }}
                >
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={
              authBusy ||
              !passwordRequirementsMet ||
              !email.trim()
            }
            sx={{
              mt: 2,
              py: 1.25,
              fontWeight: 700,
              bgcolor: "rgba(251,191,36,0.92)",
              color: "rgb(15,23,42)",
              "&:hover:not(.Mui-disabled)": {
                bgcolor: "rgba(251,191,36,1)",
              },
              "&.Mui-disabled": loading
                ? {
                    bgcolor: "rgba(251,191,36,0.75)",
                    color: "rgb(15,23,42)",
                    opacity: 1,
                  }
                : {
                    bgcolor: "rgba(51, 65, 85, 0.65)",
                    color: "rgba(148, 163, 184, 0.95)",
                    opacity: 1,
                  },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "rgb(15,23,42)" }} />
            ) : (
              "Register"
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
          Already have an account?{" "}
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

        <Dialog
          open={Boolean(verificationMessage)}
          onClose={() => setVerificationMessage("")}
          aria-labelledby="register-verification-title"
          PaperProps={{
            sx: {
              bgcolor: "rgb(15, 23, 42)",
              backgroundImage:
                "linear-gradient(145deg, rgba(30,41,59,0.98), rgba(15,23,42,0.99))",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 2,
              maxWidth: 440,
            },
          }}
        >
          <DialogTitle
            id="register-verification-title"
            sx={{
              color: "rgba(251,191,36,0.95)",
              fontWeight: 700,
              pb: 1,
            }}
          >
            Verify your email
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "rgba(226,232,240,0.95)", lineHeight: 1.6 }}>
              {verificationMessage}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              variant="contained"
              onClick={() => {
                setVerificationMessage("")
                onSwitchToLogin?.()
              }}
              sx={{
                fontWeight: 700,
                bgcolor: "rgba(251,191,36,0.92)",
                color: "rgb(15,23,42)",
                "&:hover": { bgcolor: "rgba(251,191,36,1)" },
              }}
            >
              Got it
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
  )
}

export default Register
