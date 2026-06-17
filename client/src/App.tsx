import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import NotFound from './pages/notfound'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Wallet from "./pages/Wallet"
import PaymentHistory from './pages/PaymentHistory'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/terms"   element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*"         element={<NotFound />} />
        <Route path="/register" element={<Register />} />
        <Route path='/login' element={<Login/>}/>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path='/Wallet' element={<Wallet/>}/>
        <Route path="/payment" element={<PaymentHistory />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App