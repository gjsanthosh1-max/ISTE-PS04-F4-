import { getPriority, PRIORITY_STYLES } from "@/lib/priority"
import { useState, useEffect, useRef } from "react"
import { auth, db } from "@/firebase"
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore"
import { getDistanceKm } from "@/lib/distance"
import { saveToQueue, getQueue, clearQueue } from "@/lib/offlineQueue"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import SosMap from "@/SosMap"

function SOS() {
  const [message, setMessage] = useState("")
  const [location, setLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [sosRequests, setSosRequests] = useState([])
  const [nearbyVolunteers, setNearbyVolunteers] = useState({})
  const watchIdRef = useRef(null)

  useEffect(() => {
    const q = query(collection(db, "sos"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSosRequests(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const trySync = async () => {
      const queue = getQueue()
      if (queue.length === 0) return
      for (const item of queue) {
        try {
          await addDoc(collection(db, "sos"), { ...item, createdAt: serverTimestamp() })
        } catch {
          return
        }
      }
      clearQueue()
    }
    window.addEventListener("online", trySync)
    trySync()
    return () => window.removeEventListener("online", trySync)
  }, [])

  const getLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  const sendSOS = async (e) => {
    e.preventDefault()
    if (!location) return alert("Please share your location first")

    const sosData = {
      message,
      location,
      requesterName: auth.currentUser.displayName || auth.currentUser.email,
      requesterEmail: auth.currentUser.email,
      status: "pending",
      assignedVolunteer: null,
      liveVolunteerLocation: null,
      priority: getPriority(message),
    }

    if (!navigator.onLine) {
      saveToQueue(sosData)
      alert("No connection — saved and will send automatically once online.")
      setMessage("")
      return
    }

    try {
      await addDoc(collection(db, "sos"), { ...sosData, createdAt: serverTimestamp() })
      setMessage("")
    } catch {
      saveToQueue(sosData)
      alert("Couldn't reach server — saved to send later.")
      setMessage("")
    }
  }

  const findNearby = async (sos) => {
    const usersSnap = await getDocs(collection(db, "users"))
    const results = []
    usersSnap.forEach((d) => {
      const u = d.data()
      if (u.role === "volunteer" && u.location) {
        const dist = getDistanceKm(sos.location.lat, sos.location.lng, u.location.lat, u.location.lng)
        if (dist <= 10) results.push({ ...u, distance: dist.toFixed(1) })
      }
    })
    results.sort((a, b) => a.distance - b.distance)
    setNearbyVolunteers((prev) => ({ ...prev, [sos.id]: results }))
  }

  // Volunteer accepts a request — becomes assigned, starts sharing live location
  const acceptRequest = async (sosId) => {
    const volunteerName = auth.currentUser.displayName || auth.currentUser.email
    await updateDoc(doc(db, "sos", sosId), {
      status: "on the way",
      assignedVolunteer: volunteerName,
      assignedVolunteerEmail: auth.currentUser.email,
    })

    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          await updateDoc(doc(db, "sos", sosId), {
            liveVolunteerLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          })
        },
        (err) => console.error(err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      )
    }
  }

  const markArrived = async (sosId) => {
    await updateDoc(doc(db, "sos", sosId), { status: "arrived" })
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
  }

  const pending = sosRequests.filter((s) => s.status === "pending")

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">🚨 Emergency Response</h1>
        <p className="text-sm text-slate-400">Nearby volunteers &amp; live tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Nearby volunteers + live map */}
        <div className="lg:col-span-2 space-y-4">
          {sosRequests.length === 0 && (
            <Card className="bg-[#0a1428] border-slate-700">
              <CardContent className="pt-6 text-slate-400 text-sm">No active requests yet.</CardContent>
            </Card>
          )}

          {sosRequests.map((sos) => (
            <Card key={sos.id} className="bg-[#0a1428] border-slate-700">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm text-white">{sos.requesterName}</p>
                    <p className="text-sm text-slate-400">{sos.message}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {sos.priority && (
                      <span className={`text-xs px-2 py-1 rounded-full ${PRIORITY_STYLES[sos.priority].className}`}>
                        {PRIORITY_STYLES[sos.priority].label}
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        sos.status === "pending"
                          ? "bg-amber-600/80 text-white"
                          : sos.status === "on the way"
                          ? "bg-cyan-600/80 text-white"
                          : "bg-emerald-600/80 text-white"
                      }`}
                    >
                      {sos.status}
                    </span>
                  </div>
                </div>

                {sos.assignedVolunteer && (
                  <p className="text-xs text-cyan-400">
                    🚴 Assigned: {sos.assignedVolunteer}
                  </p>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-600 text-slate-200 hover:bg-white/5"
                  onClick={() => findNearby(sos)}
                >
                  Show nearby volunteers &amp; map
                </Button>

                {nearbyVolunteers[sos.id] && (
                  <div className="space-y-2">
                    {nearbyVolunteers[sos.id].length === 0 && (
                      <p className="text-xs text-slate-500">No volunteers within 10km</p>
                    )}
                    {nearbyVolunteers[sos.id].map((v, i) => (
                      <div
                        key={i}
                        className="text-xs bg-[#0f1c38] border border-slate-700 p-2 rounded flex justify-between text-slate-200"
                      >
                        <span>{v.displayName} ({v.skills.join(", ") || "General"})</span>
                        <span className="text-slate-400">{v.distance} km away</span>
                      </div>
                    ))}
                    <SosMap
                      center={[sos.location.lat, sos.location.lng]}
                      sosLocation={sos.location}
                      volunteers={sos.status === "pending" ? nearbyVolunteers[sos.id] : []}
                      liveVolunteerLocation={sos.liveVolunteerLocation}
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  {sos.status === "pending" && sos.requesterEmail !== auth.currentUser.email && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-0"
                      onClick={() => acceptRequest(sos.id)}
                    >
                      Accept &amp; share live location
                    </Button>
                  )}
                  {sos.status === "on the way" && sos.assignedVolunteerEmail === auth.currentUser.email && (
                    <Button size="sm" onClick={() => markArrived(sos.id)}>
                      Mark: Arrived
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* RIGHT: Request help form */}
        <div>
          <Card className="bg-[#0a1428] border-slate-700 sticky top-6">
            <CardHeader>
              <CardTitle className="text-white">Request Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <form onSubmit={sendSOS} className="space-y-3">
                <Input
                  className="bg-[#0f1c38] border-slate-600 text-white placeholder:text-slate-500"
                  placeholder="Describe the emergency..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-600 text-slate-200 hover:bg-white/5"
                  onClick={getLocation}
                  disabled={locating}
                >
                  {locating ? "Getting location..." : location ? "✓ Location captured" : "Share my location"}
                </Button>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Send SOS
                </Button>
              </form>
              <p className="text-xs text-slate-500 pt-2">
                {pending.length} pending request{pending.length !== 1 && "s"} right now
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SOS