import { Paper } from "@mui/material"
import { Search } from "@mui/icons-material"

const Searchbar = ({setQuery}) => {
  return (
    <Paper className="flex rounded py-1 px-4 text-lg items-center w-64">
      <input className="w-full outline-none" placeholder="Search..." onChange={(e) => {setQuery(e.target.value)}}/>
      <Search sx={{color: "gray"}}/>
    </Paper>
  )
}

export default Searchbar