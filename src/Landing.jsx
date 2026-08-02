import { db } from "@/firebase"
import { collection, getCountFromServer } from "firebase/firestore"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

const QUOTES = [
  { text: "You must not lose faith in humanity. Humanity is an ocean; if a few drops are dirty, the ocean does not become dirty.", author: "Mahatma Gandhi" },
  { text: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
  { text: "Difficulties in your life do not come to destroy you, but to help you realize your hidden potential and power.", author: "Dr. A.P.J. Abdul Kalam" },
  { text: "When troubles come, try to understand the relevance of your sufferings. Adversity always presents opportunities.", author: "Dr. A.P.J. Abdul Kalam" },
]

const IMAGES = [
  "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587582423116-ec07293f0395?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541560052-5e137f229371?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497491757550-b8be3a35fa48?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80&auto=format&fit=crop",
]

const TRANSLATIONS = {
  en: {
    title: "UYIR — Disaster Response Network",
    subtitle: "Connecting volunteers, coordinators, and those in need — instantly, even offline.",
    join: "Join as Volunteer",
    signin: "Sign In",
    registered: "Registered",
    handled: "Requests Handled",
  },
  ta: {
    title: "உயிர் — பேரிடர் மீட்பு வலையமைப்பு",
    subtitle: "தன்னார்வலர்கள், ஒருங்கிணைப்பாளர்கள் மற்றும் தேவைப்படுவோரை உடனடியாக இணைக்கிறோம் — இணையம் இல்லாமலும்.",
    join: "தன்னார்வலராக சேரவும்",
    signin: "உள்நுழைய",
    registered: "பதிவு செய்யப்பட்டோர்",
    handled: "கையாளப்பட்ட கோரிக்கைகள்",
  },
}

function Landing() {
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [stats, setStats] = useState({ volunteers: 0, resolved: 0, active: 0 })
  const [lang, setLang] = useState("en")
  const t = TRANSLATIONS[lang]

  useEffect(() => {
    const loadStats = async () => {
      try {
        const usersSnap = await getCountFromServer(collection(db, "users"))
        const sosSnap = await getCountFromServer(collection(db, "sos"))
        setStats({
          volunteers: usersSnap.data().count,
          resolved: sosSnap.data().count,
          active: 0,
        })
      } catch (err) {
        console.error(err)
      }
    }
    loadStats()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#050b18] text-white relative overflow-hidden flex flex-col">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-4 relative z-20">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="UYIR" className="h-16 w-16 rounded-full object-cover" />
          <span className="text-xl font-semibold tracking-wide text-white">UYIR</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "en" ? "ta" : "en")}
            className="text-xs px-3 py-1.5 rounded-full border border-slate-600 text-slate-300 hover:bg-white/5"
          >
            {lang === "en" ? "தமிழ்" : "English"}
          </button>
          <Link to="/signin">
            <Button variant="ghost" className="text-cyan-300 hover:text-cyan-200 hover:bg-white/5">
              {t.signin}
            </Button>
          </Link>
          <Link to="/join">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-0">
              {t.join}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Scrolling image strip */}
      <div className="relative w-full h-[60vh] overflow-hidden mt-2">
        <div className="flex animate-scroll gap-4 absolute top-0 left-0 h-full">
          {[...IMAGES, ...IMAGES].map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Disaster relief"
              className="h-full w-[380px] object-cover flex-shrink-0 rounded-none bg-[#0a1428]"
              onError={(e) => { e.target.style.display = "none" }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050b18]/10 via-[#050b18]/20 to-[#050b18]" />
        <div className="absolute inset-0 bg-blue-950/20" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 -mt-16 relative z-10 space-y-8 pb-16">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-base md:text-lg">
            {t.subtitle}
          </p>
        </div>

        <div className="flex gap-8 md:gap-12 justify-center flex-wrap">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-cyan-400">{stats.volunteers}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">{t.registered}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-cyan-400">{stats.resolved}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wide">{t.handled}</p>
          </div>
        </div>

        <div className="min-h-[110px] max-w-xl mx-auto transition-opacity duration-700">
          <p className="text-lg md:text-xl italic text-slate-200 leading-relaxed">
            "{QUOTES[quoteIndex].text}"
          </p>
          <p className="text-sm text-cyan-400 mt-3 tracking-wide">— {QUOTES[quoteIndex].author}</p>
        </div>

        <div className="flex gap-4">
          <Link to="/join">
            <Button size="lg" className="px-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-0">
              {t.join}
            </Button>
          </Link>
          <Link to="/signin">
            <Button size="lg" variant="outline" className="px-8 border-slate-600 text-slate-200 hover:bg-white/5">
              {t.signin}
            </Button>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
          width: max-content;
        }
      `}</style>
    </div>
  )
}

export default Landing