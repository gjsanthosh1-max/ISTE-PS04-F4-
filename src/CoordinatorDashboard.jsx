import { useState, useEffect } from "react"
import { db } from "@/firebase"
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDocs } from "firebase/firestore"
import { getDistanceKm } from "@/lib/distance"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SosMap from "@/SosMap"

function CoordinatorDashboard() {
  const [sosRequests, setSosRequests] = useState([])
  const [nearbyVolunteers, setNearbyVolunteers] = useState({})
  const [volunteers, setVolunteers] = useState([])

  useEffect(() => {
    const q = query(collection(db, "sos"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSosRequests(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const loadVolunteers = async () => {
      const snap = await getDocs(collection(db, "users"))
      const list = []
      snap.forEach((d) => {
        const u = d.data()
        if (u.role === "volunteer") list.push(u)
      })
      setVolunteers(list)
    }
    loadVolunteers()
  }, [])

  const findNearby = async (sos) => {
    const usersSnap = await getDocs(collection(db, "users"))
    const results = []
    usersSnap.forEach((d) => {
      const u = d.data()
      if (u.role === "volunteer" && u.location) {
        const dist = getDistanceKm(sos.location.lat, sos.location.lng, u.location.lat, u.location.lng)
        if (dist <= 15) results.push({ ...u, distance: dist.toFixed(1) })
      }
    })
    results.sort((a, b) => a.distance - b.distance)
    setNearbyVolunteers((prev) => ({ ...prev, [sos.id]: results }))
  }

  const assignVolunteer = async (sosId, volunteer) => {
    await updateDoc(doc(db, "sos", sosId), {
      status: "on the way",
      assignedVolunteer: volunteer.displayName,
      assignedVolunteerEmail: volunteer.email,
      assignedBy: "coordinator",
    })
  }

  const markResolved = async (id) => {
    await updateDoc(doc(db, "sos", id), { status: "arrived" })
  }

  const pending = sosRequests.filter((s) => s.status === "pending")
  const active = sosRequests.filter((s) => s.status === "on the way")
  const resolved = sosRequests.filter((s) => s.status === "arrived")
  const busyEmails = new Set(active.map((s) => s.assignedVolunteerEmail))

  // Group volunteers by locality
  const grouped = {}
  volunteers.forEach((v) => {
    const key = v.locality?.trim() || "Unassigned Locality"
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(v)
  })

  const completedCountFor = (email) =>
    resolved.filter((s) => s.assignedVolunteerEmail === email).length

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">🧭 Coordinator Dashboard</h1>
        <p className="text-sm text-slate-400">
          {pending.length} pending &middot; {active.length} in progress &middot; {resolved.length} resolved
        </p>
      </div>

      {/* TEAM BY LOCALITY */}
      <div className="space-y-5">
        <h2 className="text-lg font-semibold">👥 Team by Locality — {volunteers.length} Volunteers</h2>
        {Object.entries(grouped).map(([locality, members]) => (
          <div key={locality} className="space-y-2">
            <p className="text-sm font-semibold text-cyan-400">📍 {locality} ({members.length})</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {members.map((v, i) => {
                const isBusy = busyEmails.has(v.email)
                const completed = completedCountFor(v.email)
                return (
                  <Card key={i} className="bg-[#0a1428] border-slate-700">
                    <CardContent className="pt-4 pb-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-white">{v.displayName}</p>
                        <p className="text-xs text-slate-400">
                          {v.skills?.length ? v.skills.join(", ") : "No skills listed"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">✅ {completed} completed</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                          isBusy ? "bg-cyan-600/80 text-white" : "bg-emerald-600/70 text-white"
                        }`}
                      >
                        {isBusy ? "Active" : "Available"}
                      </span>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
        {volunteers.length === 0 && (
          <p className="text-sm text-slate-500">No volunteers registered yet.</p>
        )}
      </div>

      {/* PENDING */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">🔴 Pending — assign a volunteer</h2>
          {pending.map((sos) => (
            <Card key={sos.id} className="bg-[#0a1428] border-slate-700">
              <CardContent className="pt-6 space-y-3">
                <p className="font-semibold text-sm text-white">{sos.requesterName}</p>
                <p className="text-sm text-slate-400">{sos.message}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-200 hover:bg-white/5"
                  onClick={() => findNearby(sos)}
                >
                  Find nearby volunteers
                </Button>
                {nearbyVolunteers[sos.id] && (
                  <div className="space-y-2">
                    {nearbyVolunteers[sos.id].length === 0 && (
                      <p className="text-xs text-slate-500">No volunteers within 15km</p>
                    )}
                    {nearbyVolunteers[sos.id].map((v, i) => (
                      <div key={i} className="text-xs bg-[#0f1c38] border border-slate-700 p-2 rounded flex justify-between items-center">
                        <span className="text-slate-200">
                          {v.displayName} ({v.skills?.join(", ") || "General"}) — {v.distance} km
                        </span>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-0 h-7 text-xs px-3"
                          onClick={() => assignVolunteer(sos.id, v)}
                        >
                          Assign
                        </Button>
                      </div>
                    ))}
                    <SosMap
                      center={[sos.location.lat, sos.location.lng]}
                      sosLocation={sos.location}
                      volunteers={nearbyVolunteers[sos.id]}
                      height="220px"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* IN PROGRESS */}
      {active.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">🟡 In progress</h2>
          {active.map((sos) => (
            <Card key={sos.id} className="bg-[#0a1428] border-slate-700">
              <CardContent className="pt-6 space-y-2">
                <p className="font-semibold text-sm text-white">{sos.requesterName}</p>
                <p className="text-sm text-slate-400">{sos.message}</p>
                {sos.assignedVolunteer && (
                  <p className="text-xs text-cyan-400">🚴 Assigned to: {sos.assignedVolunteer}</p>
                )}
                <SosMap
                  center={[sos.location.lat, sos.location.lng]}
                  sosLocation={sos.location}
                  liveVolunteerLocation={sos.liveVolunteerLocation}
                  height="220px"
                />
                <Button size="sm" onClick={() => markResolved(sos.id)}>Mark resolved</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* RESOLVED */}
      {resolved.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">🟢 Resolved</h2>
          {resolved.map((sos) => (
            <Card key={sos.id} className="bg-[#0a1428] border-slate-700">
              <CardContent className="pt-6">
                <p className="font-semibold text-sm text-white">{sos.requesterName}</p>
                <p className="text-sm text-slate-400">{sos.message}</p>
                {sos.assignedVolunteer && (
                  <p className="text-xs text-emerald-400 mt-1">Helped by: {sos.assignedVolunteer}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default CoordinatorDashboard