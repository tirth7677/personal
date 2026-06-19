import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import Home from './pages/home'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import NotFound from './pages/notfound'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Wallet from "./pages/Wallet"
import PaymentHistory from './pages/PaymentHistory'
import BcoinsHistory from './pages/Bcoinshistory'
import CreateBounty from './pages/Createbounty'
import MyBounty from './pages/mybounty'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/terms"   element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/register" element={<Register />} />
          <Route path='/login' element={<Login/>}/>

          {/* Public — no auth required */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Protected — requires login, shows modal if not authenticated */}
          <Route path='/Wallet' element={<ProtectedRoute><Wallet/></ProtectedRoute>}/>
          <Route path="/payment" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
          <Route path="/bcoins/history" element={<ProtectedRoute><BcoinsHistory /></ProtectedRoute>} />
          <Route path="/bounty/create" element={<ProtectedRoute><CreateBounty /></ProtectedRoute>} />
          <Route path="/bounty/mine" element={<ProtectedRoute><MyBounty /></ProtectedRoute>} />

          {/* Catch-all must stay LAST */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  )
}

export default App