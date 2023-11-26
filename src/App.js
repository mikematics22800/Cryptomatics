import  { Routes, Route, HashRouter } from 'react-router-dom';
import Layout from './pages/Layout/Layout';
import Home from './pages/Home';
import Crypto from './pages/Crypto/Crypto';
import CryptoId from './pages/Crypto/CryptoId/CryptoId';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<Layout/>}>
          <Route index element={<Home/>}/>
          <Route path='/crypto' element={<Crypto/>}/>
          <Route path='/crypto/coin/:id' element={<CryptoId/>}/>
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
