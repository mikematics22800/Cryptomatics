import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from './routes/Root/Root.jsx';
import Home from './routes/Home/Home.jsx';
import Coin from './routes/Coin/Coin.jsx';
import Error from './routes/Error.jsx';

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Root/>,
      errorElement: <Error/>,
      children: [
        {
          path: "/",
          element: <Home/>,
          errorElement: <Error/>
        },
        {
          path: "/:id",
          element: <Coin/>,
          errorElement: <Error/>
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
