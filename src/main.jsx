import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/index.css'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom"
import { appTheme } from './styles/muiTheme.js'
import Root from "./layouts/RootLayout.jsx"
import PublicAuthLayout from "./layouts/PublicAuthLayout.jsx"
import Home from "./pages/Home/Home.jsx"
import Coin from "./pages/Coin/Coin.jsx"
import { AuthProvider } from "./auth/AuthProvider.jsx"
import { RequireAuth } from "./auth/RequireAuth.jsx"
import { GuestOnly } from "./auth/GuestOnly.jsx"

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Outlet />,
      children: [
        {
          path: "login",
          element: (
            <GuestOnly>
              <PublicAuthLayout />
            </GuestOnly>
          ),
        },
        {
          path: "register",
          element: (
            <GuestOnly>
              <PublicAuthLayout />
            </GuestOnly>
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
              element: <Home />,
            },
            {
              path: ":id",
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
