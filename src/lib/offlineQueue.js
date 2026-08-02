const QUEUE_KEY = "sos_offline_queue"

export function saveToQueue(sosData) {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")
  queue.push(sosData)
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function getQueue() {
  return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")
}

export function clearQueue() {
  localStorage.setItem(QUEUE_KEY, "[]")
}