import { MonetizationOn } from "@mui/icons-material"

const Background = () => {
  const randoms = Array.from({length: 100}, () => ({
    top: Math.floor(Math.random() * 100) + '%',
    left: Math.floor(Math.random() * 100) + '%',
    scale: Math.random() + 1,
    duration: Math.random() * 5 + 5 + 's',
    delay: Math.random() * 5 + 's'
  }));

  return (
    <div id="background">
      {randoms.map((random, i) => {
        return (
          <div
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
  )
}

export default Background