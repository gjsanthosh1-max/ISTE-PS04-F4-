const CRITICAL_WORDS = ["trapped", "bleeding", "unconscious", "child", "drowning", "fire", "collapsed", "critical", "dying", "not breathing"]
const HIGH_WORDS = ["injured", "medical", "elderly", "stuck", "flood", "urgent"]

export function getPriority(message) {
  const text = message.toLowerCase()
  if (CRITICAL_WORDS.some((w) => text.includes(w))) return "critical"
  if (HIGH_WORDS.some((w) => text.includes(w))) return "high"
  return "standard"
}

export const PRIORITY_STYLES = {
  critical: { label: "🔴 Critical", className: "bg-red-600/90 text-white" },
  high: { label: "🟠 High", className: "bg-orange-500/90 text-white" },
  standard: { label: "🟡 Standard", className: "bg-slate-600/80 text-white" },
}