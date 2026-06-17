import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import NotFound from './pages/notfound'
import Register from './pages/Register'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/terms"   element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*"         element={<NotFound />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App