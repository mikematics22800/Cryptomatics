import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { IconButton } from "@mui/material"
import { Menu } from "@mui/icons-material"
import logo from "../../../images/logo.svg"

const Navbar = () => {
  const path = useLocation().pathname;
  const [dropDown, setDropDown] = useState(false)

  return (
    <nav className="bg-blue-950 font-bold text-white text-xl flex fixed top-0 h-20 z-10 px-5 sm:px-10 justify-between items-center w-screen">
      <div className="flex justify-center">
        <img src={logo} className="w-16"/>
      </div>
      <div className="hidden w-64 justify-between sm:flex">
        <Link to="/">
          <h1 className={`${path == '/' && 'text-[aqua]'} hover:text-[aqua]`}>Home</h1>
        </Link>
        <Link to="crypto">
          <h1 className={`${path.includes('crypto') && 'text-[aqua]'} hover:text-[aqua]`}>Crypto</h1>
        </Link>
      </div>
      <div className="sm:hidden">
        <IconButton color="inherit" onClick={() => {(dropDown === false) ? setDropDown(true) : setDropDown(false)}}>
          <Menu className="!text-5xl"/>
        </IconButton>
      </div>
      {dropDown &&
        <div onClick={() => {setDropDown(false)}}  className={`text-xl text-white font-bold fixed right-0 bg-blue-900 sm:hidden z-10 w-48 ${path == '/crypto' ? ('top-36') : ('top-20')}`}>
          <Link to="/">
            <h1 className={`py-4 pl-4 ${path == '/' && 'text-[aqua]'} hover:!text-[aqua]`}>Home</h1>
          </Link>
          <Link to="crypto">
            <h1 className={`py-4 pl-4 ${path.includes('crypto') && 'text-[aqua]'} hover:!text-[aqua]`}>Crypto</h1>
          </Link>
        </div>
      }
    </nav>
  )
}

export default Navbar