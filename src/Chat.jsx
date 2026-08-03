
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { auth, db } from "@/firebase"
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join("_")
}

function Chat() {
  const { otherUid } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [otherUser, setOtherUser] = useState(null)
  const bottomRef = useRef(null)

  const chatId = getChatId(auth.currentUser.uid, otherUid)

  useEffect(() => {
    const loadOtherUser = async () => {
      const snap = await getDoc(doc(db, "users", otherUid))
      if (snap.exists()) setOtherUser(snap.data())
    }
    loadOtherUser()
  }, [otherUid])

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt", "asc")
    )
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsubscribe
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    await addDoc(collection(db, "messages"), {
      chatId,
      senderUid: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || auth.currentUser.email,
      receiverUid: otherUid,
      text,
      createdAt: serverTimestamp(),
    })
    setText("")
  }

  return (
    <div className="max-w-xl mx-auto py-6 px-4 flex flex-col h-[calc(100vh-80px)]">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-300">
          ← Back
        </Button>
        <div>
          <p className="font-semibold text-white text-sm">{otherUser?.displayName || "..."}</p>
          <p className="text-xs text-slate-500">{otherUser?.bloodGroup && `🩸 ${otherUser.bloodGroup}`}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500 text-center mt-8">
            Say hello — start the conversation.
          </p>
        )}
        {messages.map((m) => {
          const isMe = m.senderUid === auth.currentUser.uid
          return (
            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  isMe
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-br-sm"
                    : "bg-[#0f1c38] text-slate-200 border border-slate-700 rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 pt-2 border-t border-slate-800">
        <Input
          className="bg-[#0f1c38] border-slate-600 text-white placeholder:text-slate-500"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white border-0">
          Send
        </Button>
      </form>
    </div>
  )
}

export default Chat