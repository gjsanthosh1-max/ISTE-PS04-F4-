import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { auth, db } from "@/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const SKILL_OPTIONS = ["First Aid", "Swimming/Rescue", "Driving", "Cooking", "Medical", "Construction", "Communication"]

function ProfileSetup() {
  const [skills, setSkills] = useState([])
  const [bloodGroup, setBloodGroup] = useState("")
  const [locality, setLocality] = useState("")
  const [location, setLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const toggleSkill = (skill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const getLocation = () => {
    setLocating(true)
    setError("")
    if (!navigator.geolocation) {
      setError("Location not supported on this device")
      setLocating(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      (err) => {
        setError("Could not get location: " + err.message)
        setLocating(false)
      }
    )
  }

  const handleSave = async () => {
    if (!location) {
      setError("Please share your location first")
      return
    }
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      skills,
      bloodGroup,
      location,
      locality,
    })
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete your profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-sm text-gray-400 mb-2">Your skills (select all that apply)</p>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    skills.includes(skill)
                      ? "bg-white text-black"
                      : "border-gray-600 text-gray-400"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Locality / Area name</p>
            <Input
              placeholder="e.g. Adyar, Chennai"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
            />
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Blood group (optional)</p>
            <Input
              placeholder="e.g. O+, A-, B+"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            />
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Your location</p>
            <Button type="button" variant="outline" onClick={getLocation} disabled={locating}>
              {locating ? "Getting location..." : location ? "✓ Location captured" : "Share my location"}
            </Button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button onClick={handleSave} className="w-full">
            Save & Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfileSetup