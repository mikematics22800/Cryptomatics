import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/index.css'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom"
import { appTheme } from './styles/muiTheme.js'
import Root from "./layouts/RootLayout.jsx"
import AuthLayout from "./layouts/AuthLayout.jsx"
import Coins from "./pages/Coins/Coins.jsx"
import Coin from "./pages/Coin/Coin.jsx"
import Dashboard from "./pages/Dashboard/Dashboard.jsx"
import { AuthProvider } from "./auth/AuthProvider.jsx"
import { RequireAuth } from "./auth/RequireAuth.jsx"
import { NoAuth } from "./auth/NoAuth.jsx"

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Outlet />,
      children: [
        {
          path: "login",
          element: (
            <NoAuth>
              <AuthLayout />
            </NoAuth>
          ),
        },
        {
          path: "register",
          element: (
            <NoAuth>
              <AuthLayout />
            </NoAuth>
          ),
        },
        {
          element: (
            <RequireAuth>
              <Root />
            </RequireAuth>
          ),
          children: [
            {
              index: true,
              element: <Dashboard />,
            },
            {
              path: "currencies",
              element: <Coins/>,
            },
            {
              path: "currencies/:id",
              element: <Coin />,
            },
          ],
        },
      ],
    },
  ], 
  { 
    basename: "/Cryptomatics/" 
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
