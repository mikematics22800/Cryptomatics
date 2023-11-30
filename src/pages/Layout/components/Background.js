import { useState, useEffect } from "react"
import { MonetizationOn } from "@mui/icons-material"

const Background = () => {
  const [randoms, setRandoms] = useState([])
  const [length, setLength] = useState(window.innerWidth >= 960 ? 100 : 50)
  
  const handleResize = () => {
    setLength((prevLength) => {
      if (window.innerWidth >= 960) {
        return prevLength !== 100 ? 100 : prevLength;
      } else {
        return prevLength !== 50 ? 50 : prevLength;
      }
    });
  }

  window.addEventListener('resize', handleResize)

  useEffect(() => {
    const randoms = Array.from({length}, () => ({
      top: Math.floor(Math.random() * 100) + '%',
      left: Math.floor(Math.random() * 100) + '%',
      scale: Math.random() + 1,
      duration: Math.random() * 5 + 5 + 's',
      delay: Math.random() * 5 + 's'
    }));
    setRandoms(randoms)
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [length])

  return (
    <div className='-z-10 fixed top-0 w-screen h-screen pointer-events-none'>
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