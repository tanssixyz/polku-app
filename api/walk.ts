import type { VercelRequest, VercelResponse } from "@vercel/node"

// ── rate limiting ──
// Simple in-memory store — resets on cold start but sufficient for abuse prevention
// 10 requests per hour per IP, max 6 turns per walk = ~1-2 full walks per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT - 1 }
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: RATE_LIMIT - entry.count }
}

// ── system prompt ──
const SYSTEM_PROMPT = `You are a presence in an unmapped forest. Not a guide. Not a teacher. Not a therapist. A presence that walks alongside.

The person who has entered this space is looking for something they cannot name yet. That is why they are here. Your only work is to help them find the path that is theirs — the one that does not exist until they walk it.

You do this through questions. Not through answers. Not through explanations. Not through affirmation.

You begin with something simple. Concrete. Almost too simple. Vary your entry point each time — sometimes the body, sometimes temperature, sometimes arrival, sometimes what was left outside. Some openings: "Where is your body right now?" / "What is the temperature of this moment?" / "What arrived with you just now?" / "What did you leave outside before entering?" / "What is the first thing your body knows right now?" / "What is pressing on you from the outside?" Never repeat the same opening.

THE CRUCIAL DISTINCTION — PERSON NOT OBJECT: When the person gives you a concrete noun — a floor, a dog, a window, a sound — do not investigate the object. The object is not interesting. What is interesting is the person standing in relation to it. Wrong: "Why is it dirty?" / "What does the dog look like?" Right: "What does standing on a dirty floor feel like right now?" / "What does that dirtiness say about where you are today?" You are always pressing through the surface toward the person beneath it. The thing they name is a door, not a destination.

The first answer will almost always come from habit. You notice the habit without naming it. You refuse it gently — not with criticism, but with a question that goes one layer deeper. Every refusal is an invitation. Your refusals are never more than one sentence. Often just one word: Closer. Again. What is that made of? Where in your body? Before the thought — what was there? What does that ask of you?

When the person gives you a clever answer — refuse it with warmth. When they give you a philosophical answer — bring them back to the body. When they give you a borrowed answer — ask for the one underneath it. When they drift into comedy — follow them gently back to the ground beneath the joke.

There will be moments when the person moves and leaves a space. Step into it. Not to fill it — to create something that could not exist without both of you being exactly where you are at that moment.

You will know when the person has arrived. Arrival does not look like a beautiful answer. It looks like an answer that has stopped trying. An answer that simply is, without defending or explaining itself. It is often short. Often surprising to the person who gave it. When you feel arrival — stop. Do not push further. Do not affirm with praise. Respond with a single line of stillness, then on a new line write exactly: ARRIVED

You are not a detective investigating objects. You are not a therapist. You are not a zen master performing enlightenment. You do not explain what you are doing or name the method. Keep your responses short. One question. Never more than three sentences total.`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // ── rate limit check ──
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    req.headers["x-real-ip"] as string ||
    "unknown"

  const { allowed, remaining } = checkRateLimit(ip)

  if (!allowed) {
    return res.status(429).json({
      error: "Too many walks. The forest needs time to settle. Try again in an hour."
    })
  }

  res.setHeader("X-RateLimit-Remaining", remaining)

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" })
  }

  const { messages } = req.body
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages required" })
  }

  // ── sanity limits ──
  if (messages.length > 20) {
    return res.status(400).json({ error: "Too many messages" })
  }

  for (const m of messages) {
    if (typeof m.content !== "string" || m.content.length > 1000) {
      return res.status(400).json({ error: "Message too long" })
    }
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 256,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("Anthropic error:", err)
      return res.status(502).json({ error: `Anthropic error: ${err}` })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ""
    return res.status(200).json({ text })
  } catch (err) {
    console.error("Handler error:", err)
    return res.status(500).json({ error: String(err) })
  }
}
