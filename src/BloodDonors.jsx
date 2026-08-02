import { useState, useEffect } from "react"
import { db } from "@/firebase"
import { collection, getDocs } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

function BloodDonors() {
  const [donors, setDonors] = useState([])
  const [filter, setFilter] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDonors = async () => {
      const snap = await getDocs(collection(db, "users"))
      const list = []
      snap.forEach((d) => {
        const u = d.data()
        if (u.bloodGroup) list.push(u)
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
        <h1 className="text-2xl font-bold mb-1">🩸 Blood Donors</h1>
        <p className="text-sm text-gray-400">{donors.length} registered donors</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("")}
          className={`px-3 py-1 rounded-full text-sm border ${
            filter === "" ? "bg-white text-black" : "border-gray-600 text-gray-400"
          }`}
        >
          All
        </button>
        {BLOOD_GROUPS.map((bg) => (
          <button
            key={bg}
            onClick={() => setFilter(bg)}
            className={`px-3 py-1 rounded-full text-sm border ${
              filter === bg ? "bg-white text-black" : "border-gray-600 text-gray-400"
            }`}
          >
            {bg}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      <div className="space-y-3">
        {filtered.map((donor, i) => (
          <Card key={i}>
            <CardContent className="pt-6 flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">{donor.displayName}</p>
                <p className="text-xs text-gray-400">{donor.email}</p>
              </div>
              <span className="text-lg font-bold text-red-500">{donor.bloodGroup}</span>
            </CardContent>
          </Card>
        ))}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-gray-500">No donors found for this group.</p>
        )}
      </div>
    </div>
  )
}

export default BloodDonors