import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from './routes/Root/Root.jsx';
import Home from './routes/Home/Home.jsx';
import Coin from './routes/Coin/Coin.jsx';

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Root/>,
      children: [
        {
          path: "/",
          element: <Home/>,
        },
        {
          path: "/:id",
          element: <Coin/>,
        },
      ]
    }
  ], 
  { 
    basename: "/Cryptomatics/" 
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />  
  </React.StrictMode>,
)
