import { createContext, useContext, useEffect, useRef, useState } from "react"
import { db } from "@/firebase"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const knownIds = useRef(new Set())
  const isFirstLoad = useRef(true)

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const q = query(collection(db, "sos"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data()
          const id = change.doc.id
          if (!isFirstLoad.current && !knownIds.current.has(id) && data.status === "pending") {
            setUnreadCount((c) => c + 1)
            playAlertSound()
            if (typeof Notification !== "undefined" && Notification.permission === "granted") {
              new Notification("🚨 New Emergency Request", {
                body: data.message || "Someone needs help nearby",
                icon: "/logo.png",
              })
            }
          }
          knownIds.current.add(id)
        }
      })
      isFirstLoad.current = false
    })
    return unsubscribe
  }, [])

  const clearUnread = () => setUnreadCount(0)

  return (
    <NotificationContext.Provider value={{ unreadCount, clearUnread }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}

function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.frequency.value = 880
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.3)
  } catch (e) {}
}