import SafeCheckIn from "@/SafeCheckIn"
import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from "react-router-dom"
import { auth } from "@/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import Auth from "@/Auth"
import Landing from "@/Landing"
import ProfileSetup from "@/ProfileSetup"
import SOS from "@/SOS"
import CoordinatorDashboard from "@/CoordinatorDashboard"
import BloodDonors from "@/BloodDonors"
import { Button } from "@/components/ui/button"

function AppShell() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<Auth startMode="login" onLogin={() => navigate("/sos")} />} />
      <Route path="/join" element={<Auth startMode="signup" onLogin={() => navigate("/profile")} />} />

      {user ? (
        <>
          <Route path="/sos" element={<Shell user={user}><SOS /></Shell>} />
          <Route path="/coordinator" element={<Shell user={user}><CoordinatorDashboard /></Shell>} />
          <Route path="/blood" element={<Shell user={user}><BloodDonors /></Shell>} />
          <Route path="/profile" element={<Shell user={user}><ProfileSetup /></Shell>} />
          <Route path="/safe" element={<Shell user={user}><SafeCheckIn /></Shell>} />
        </>
      ) : (
        <Route path="/sos" element={<Navigate to="/signin" />} />
      )}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function Shell({ user, children }) {
  const handleLogout = async () => {
    await signOut(auth)
    window.location.href = "/"
  }

  const navLink = "text-sm px-3 py-1.5 rounded-full text-slate-300 hover:text-cyan-300 hover:bg-white/5 transition-colors"

  return (
    <div className="min-h-screen bg-[#050b18] text-white">
      <div className="border-b border-slate-800 bg-[#050b18]/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex justify-between items-center max-w-4xl mx-auto py-3 px-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="UYIR" className="h-9 w-9 rounded-full object-cover" />
            <span className="font-semibold tracking-wide hidden sm:inline">UYIR</span>
          </div>
          <div className="flex gap-1">
            <Link to="/sos" className={navLink}>SOS</Link>
            <Link to="/coordinator" className={navLink}>Coordinator</Link>
            <Link to="/blood" className={navLink}>Blood</Link>
            <Link to="/safe" className={navLink}>I'm Safe</Link>
            <Link to="/profile" className={navLink}>Profile</Link>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-200 hover:bg-white/5"
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </div>
      <div className="page-fade">{children}</div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App