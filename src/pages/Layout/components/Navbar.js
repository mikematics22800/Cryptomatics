import { useLocation, Link } from "react-router-dom"
import Searchbar from "./Searchbar"
import { ArrowCircleLeft } from "@mui/icons-material";

const Navbar = ({setQuery}) => {
  const path = useLocation().pathname;

  return (
    <nav className="bg-blue-950 flex fixed top-0 h-20 z-50 justify-center items-center w-screen">
      <div className={`${path == '/' ? 'flex' : 'hidden'}`}>
        <Searchbar setQuery={setQuery}/>
      </div>
      <div className={`${path != '/' ? 'flex' : 'hidden'}`}>
        <div className="flex justify-start pl-5 w-screen text-white">
          <Link to='/'>
            <ArrowCircleLeft className="!text-6xl rounded-full"/>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar