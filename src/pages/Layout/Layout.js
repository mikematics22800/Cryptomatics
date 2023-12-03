import { Outlet } from "react-router-dom"
import Navbar from "./components/Navbar"
import Background from "./components/Background"

const Layout = ({setQuery}) => {
return (
    <>
      <Navbar setQuery={setQuery}/>
      <Background/>
      <Outlet/>
    </> 
  )
}

export default Layout