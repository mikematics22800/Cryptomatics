import { useNavigate, useLocation } from "react-router-dom"
import Login from "./components/Login.jsx"
import Register from "./components/Register.jsx"

const Auth = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const showRegister = location.pathname === "/register"

  const navState = { state: location.state }

  return (
    <div id="auth">
      {showRegister ? (
        <Register
          onSwitchToLogin={() => navigate("/login", navState)}
        />
      ) : (
        <Login
          onSwitchToRegister={() => navigate("/register", navState)}
        />
      )}
    </div>
  )
}

export default Auth
