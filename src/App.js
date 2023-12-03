import { useState } from 'react';
import  { Routes, Route, HashRouter } from 'react-router-dom';
import Layout from './pages/Layout/Layout';
import Home from './pages/Home/Home';
import CryptoId from './pages/CoinId/CoinId';

const App = () => {
  const [query, setQuery] = useState('')

  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<Layout setQuery={setQuery}/>}>
          <Route index element={<Home query={query}/>}/>
          <Route path='/coin/:id' element={<CryptoId/>}/>
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
