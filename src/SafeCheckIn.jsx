import { useState, useEffect } from "react"
import { auth, db } from "@/firebase"
import { doc, setDoc, collection, query, onSnapshot } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function SafeCheckIn() {
  const [myStatus, setMyStatus] = useState(null)
  const [allCheckins, setAllCheckins] = useState([])

  useEffect(() => {
    const q = query(collection(db, "safety_checkins"))
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setAllCheckins(list)
      const mine = list.find((c) => c.id === auth.currentUser.uid)
      if (mine) setMyStatus(mine.status)
    })
    return unsubscribe
  }, [])

  const markSafe = async () => {
    await setDoc(doc(db, "safety_checkins", auth.currentUser.uid), {
      name: auth.currentUser.displayName || auth.currentUser.email,
      status: "safe",
      updatedAt: new Date().toISOString(),
    })
    setMyStatus("safe")
  }

  const safeCount = allCheckins.filter((c) => c.status === "safe").length

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <Card className="bg-[#0a1428] border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">✅ Safety Check-In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-400 text-sm">
            If you're safe during a disaster, let your coordinators and family know instantly.
          </p>
          {myStatus === "safe" ? (
            <div className="bg-emerald-600/20 border border-emerald-600 rounded-lg p-4 text-center">
              <p className="text-emerald-400 font-semibold">✅ You're marked as Safe</p>
            </div>
          ) : (
            <Button
              onClick={markSafe}
              className="w-full bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white border-0"
              size="lg"
            >
              I'm Safe — Notify Everyone
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#0a1428] border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-base">{safeCount} people checked in as safe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {allCheckins.filter((c) => c.status === "safe").map((c) => (
            <div key={c.id} className="text-sm text-slate-300 bg-[#0f1c38] px-3 py-2 rounded">
              ✅ {c.name}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default SafeCheckIn