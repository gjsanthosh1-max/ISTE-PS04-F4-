import { useState, useEffect } from "react"
import { db, auth } from "@/firebase"
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

function Feed() {
  const [text, setText] = useState("")
  const [posts, setPosts] = useState([])
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
    return unsubscribe
  }, [])

  const handlePost = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setPosting(true)

    await addDoc(collection(db, "posts"), {
      text,
      authorName: auth.currentUser.displayName || auth.currentUser.email,
      authorEmail: auth.currentUser.email,
      createdAt: serverTimestamp(),
    })

    setText("")
    setPosting(false)
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-3">
          <form onSubmit={handlePost} className="space-y-3">
            <Input
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button type="submit" disabled={posting} className="w-full">
              {posting ? "Posting..." : "Post"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="pt-6">
            <p className="font-semibold text-sm mb-1">{post.authorName}</p>
            <p>{post.text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default Feed