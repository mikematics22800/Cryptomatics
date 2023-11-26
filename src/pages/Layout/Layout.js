import { Outlet } from "react-router-dom"
import Navbar from "./components/Navbar"
import Background from "./components/Background"

const Layout = () => {
return (
    <>
      <Navbar/>
      <Background/>
      <Outlet/>
    </> 
  )
}

export default Layout