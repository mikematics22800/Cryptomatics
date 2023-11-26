import { useState, useEffect } from "react"
import { MonetizationOn } from "@mui/icons-material"

const Background = () => {
  const [randoms, setRandoms] = useState([])

  useEffect(() => {
    const randoms = Array.from({ length: 100 }, () => ({
      top: Math.floor(Math.random() * 100) + '%',
      left: Math.floor(Math.random() * 100) + '%',
      scale: Math.random() + 1,
      duration: Math.random() * 5 + 5 + 's',
      delay: Math.random() * 5 + 's'
    }));
    setRandoms(randoms)
  }, [])

  return (
    <div className='-z-10 fixed top-0 w-[1920px] h-screen pointer-events-none'>
      <div className='gradient'/>
        <div className='opacity-10'>
          {randoms.map((random, i) => {
            return (
              <div 
                className='text-[blue] absolute opacity-0' 
                style={{ 
                  top: random.top, 
                  left: random.left, 
                  transform:`scale(${random.scale})`, 
                  animation: `animate ${random.duration} linear infinite`,               
                  animationDelay: random.delay,
                }} 
                key={i}
              >
                <MonetizationOn/>
              </div>
            )
          })}
        </div>
    </div> 
  )
}

export default Background