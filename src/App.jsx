import Chat from "@/Chat"
import { db } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import { NotificationProvider, useNotifications } from "@/lib/NotificationSystem"
import { useLocation } from "react-router-dom"
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
      if (currentUser) {
        const redirect = sessionStorage.getItem("postAuthRedirect")
        if (redirect) {
          sessionStorage.removeItem("postAuthRedirect")
          navigate(redirect)
        }
      }
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
      <Route path="/signin" element={<Auth startMode="login" onLogin={() => {}} />} />
      <Route path="/join" element={<Auth startMode="signup" onLogin={() => {}} />} />

      {user ? (
        <>
          <Route path="/sos" element={<Shell user={user}><SOS /></Shell>} />
          <Route path="/coordinator" element={<Shell user={user}><CoordinatorDashboard /></Shell>} />
          <Route path="/blood" element={<Shell user={user}><BloodDonors /></Shell>} />
          <Route path="/profile" element={<Shell user={user}><ProfileSetup /></Shell>} />
          <Route path="/safe" element={<Shell user={user}><SafeCheckIn /></Shell>} />
          <Route path="/chat/:otherUid" element={<Shell user={user}><Chat /></Shell>} />
        </>
      ) : (
        <Route path="/sos" element={<Navigate to="/signin" />} />
      )}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function Shell({ user, children }) {
  const { unreadCount, clearUnread } = useNotifications()
  const location = useLocation()
  const [role, setRole] = useState(null)

  useEffect(() => {
    if (location.pathname === "/sos") clearUnread()
  }, [location.pathname])

  useEffect(() => {
    const loadRole = async () => {
      const snap = await getDoc(doc(db, "users", user.uid))
      if (snap.exists()) setRole(snap.data().role)
    }
    loadRole()
  }, [user.uid])

  const handleLogout = async () => {
    await signOut(auth)
    window.location.href = "/"
  }

  const navLink = "text-sm px-3 py-1.5 rounded-full text-slate-300 hover:text-cyan-300 hover:bg-white/5 transition-colors relative"

  return (
    <div className="min-h-screen bg-[#050b18] text-white relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/40 via-[#050b18] to-cyan-950/20 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="border-b border-slate-800 bg-[#050b18]/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex flex-wrap justify-between items-center gap-2 max-w-4xl mx-auto py-3 px-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="UYIR" className="h-9 w-9 rounded-full object-cover" />
            <span className="font-semibold tracking-wide hidden sm:inline">UYIR</span>
          </div>
          <div className="flex gap-1 flex-wrap justify-center order-3 sm:order-none w-full sm:w-auto">
            <Link to="/sos" className={navLink}>
              SOS
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>
            {role === "coordinator" && (
              <Link to="/coordinator" className={navLink}>Coordinator</Link>
            )}
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
      <div className="page-fade relative z-10">{children}</div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AppShell />
      </NotificationProvider>
    </BrowserRouter>
  )
}

export default App