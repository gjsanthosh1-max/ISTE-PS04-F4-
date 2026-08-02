import { useState } from "react"
import { auth, db } from "@/firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

function Auth({ onLogin, startMode = "signup" }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [role, setRole] = useState("volunteer")
  const [isSignUp, setIsSignUp] = useState(startMode === "signup")
  const [error, setError] = useState("")

  const inputStyle = "bg-[#0a1428] border-slate-600 text-white placeholder:text-slate-500"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(cred.user, { displayName })
        await setDoc(doc(db, "users", cred.user.uid), {
          displayName,
          email,
          role,
          skills: [],
          bloodGroup: "",
          location: null,
          createdAt: new Date().toISOString(),
        })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      onLogin()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#050b18] flex items-center justify-center px-4 relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      >
        <source src="/logo-spin.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-[#050b18]/40 via-[#050b18]/50 to-[#050b18]/80" />

        <Card className="w-full max-w-[380px] relative z-10 bg-[#0a1428]/95 border-slate-700 backdrop-blur-sm text-white [&_*]:text-white">        <CardHeader>
          <CardTitle className="text-white">{isSignUp ? "Create an account" : "Welcome back"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <Input
                  className={inputStyle}
                  type="text"
                  placeholder="Full name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("volunteer")}
                    className={`flex-1 py-2 rounded-md text-sm border ${
                      role === "volunteer" ? "bg-white text-black" : "border-slate-600 text-slate-400"
                    }`}
                  >
                    I'm a Volunteer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("coordinator")}
                    className={`flex-1 py-2 rounded-md text-sm border ${
                      role === "coordinator" ? "bg-white text-black" : "border-slate-600 text-slate-400"
                    }`}
                  >
                    I'm a Coordinator
                  </button>
                </div>
              </>
            )}
            <Input
              className={inputStyle}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              className={inputStyle}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-0">
              {isSignUp ? "Sign Up" : "Log In"}
            </Button>
          </form>
          <p className="text-sm text-slate-400 mt-4 text-center">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button className="underline text-cyan-400" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? "Log In" : "Sign Up"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Auth