import { useState, useEffect } from "react"
import { db } from "@/firebase"
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SosMap from "@/SosMap"

function CoordinatorDashboard() {
  const [sosRequests, setSosRequests] = useState([])

  useEffect(() => {
    const q = query(collection(db, "sos"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSosRequests(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsubscribe
  }, [])

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "sos", id), { status })
  }

  const pending = sosRequests.filter((s) => s.status === "pending")
  const active = sosRequests.filter((s) => s.status === "on the way")
  const resolved = sosRequests.filter((s) => s.status === "arrived")

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">🧭 Coordinator Dashboard</h1>
        <p className="text-sm text-gray-400">
          {pending.length} pending &middot; {active.length} in progress &middot; {resolved.length} resolved
        </p>
      </div>

      <Section title="🔴 Pending — needs volunteer" items={pending} onUpdate={updateStatus} />
      <Section title="🟡 In progress" items={active} onUpdate={updateStatus} />
      <Section title="🟢 Resolved" items={resolved} onUpdate={updateStatus} />
    </div>
  )
}

function Section({ title, items, onUpdate }) {
  if (items.length === 0) return null
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {items.map((sos) => (
        <Card key={sos.id}>
          <CardContent className="pt-6 space-y-2">
            <p className="font-semibold text-sm">{sos.requesterName}</p>
            <p className="text-sm text-gray-400">{sos.message}</p>
            <SosMap center={[sos.location.lat, sos.location.lng]} sosLocation={sos.location} />
            <div className="flex gap-2 pt-1">
              {sos.status === "pending" && (
                <Button size="sm" onClick={() => onUpdate(sos.id, "on the way")}>
                  Dispatch volunteer
                </Button>
              )}
              {sos.status === "on the way" && (
                <Button size="sm" onClick={() => onUpdate(sos.id, "arrived")}>
                  Mark resolved
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default CoordinatorDashboard