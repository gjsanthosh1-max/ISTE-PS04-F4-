import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { db, auth } from "@/firebase"
import { collection, getDocs } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

function BloodDonors() {
  const navigate = useNavigate()
  const [donors, setDonors] = useState([])
  const [filter, setFilter] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDonors = async () => {
      const snap = await getDocs(collection(db, "users"))
      const list = []
      snap.forEach((d) => {
        const u = d.data()
        if (u.bloodGroup && d.id !== auth.currentUser.uid) list.push({ ...u, uid: d.id })
      })
      setDonors(list)
      setLoading(false)
    }
    fetchDonors()
  }, [])

  const filtered = filter
    ? donors.filter((d) => d.bloodGroup.toUpperCase() === filter)
    : donors

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1 text-white">🩸 Blood Donors</h1>
        <p className="text-sm text-slate-400">{donors.length} registered donors</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("")}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            filter === "" ? "bg-white text-black border-white" : "border-slate-600 text-slate-400 hover:bg-white/5"
          }`}
        >
          All
        </button>
        {BLOOD_GROUPS.map((bg) => (
          <button
            key={bg}
            onClick={() => setFilter(bg)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              filter === bg ? "bg-white text-black border-white" : "border-slate-600 text-slate-400 hover:bg-white/5"
            }`}
          >
            {bg}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}

      <div className="space-y-3">
        {filtered.map((donor, i) => (
          <Card key={i} className="bg-[#0a1428] border-slate-700">
            <CardContent className="pt-6 flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm text-white">{donor.displayName}</p>
                <p className="text-xs text-slate-400">{donor.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-red-400">{donor.bloodGroup}</span>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-0 h-8 text-xs px-3"
                  onClick={() => navigate(`/chat/${donor.uid}`)}
                >
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-slate-500">No donors found for this group.</p>
        )}
      </div>
    </div>
  )
}

export default BloodDonors