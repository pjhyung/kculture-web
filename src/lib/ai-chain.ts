export interface AIResponse {
  content: string
  model: string
}

interface TestOverride {
  gemini?: (prompt: string) => Promise<AIResponse>
  groq?: (prompt: string) => Promise<AIResponse>
  cloudflare?: (prompt: string) => Promise<AIResponse>
  fallbackContent?: string
}

interface FallbackOptions {
  _testOverride?: TestOverride
}

async function callGemini(prompt: string): Promise<AIResponse> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(prompt)
  return {
    content: result.response.text(),
    model: 'gemini-2.0-flash',
  }
}

async function callGroq(prompt: string): Promise<AIResponse> {
  const Groq = (await import('groq-sdk')).default
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
  })
  return {
    content: completion.choices[0].message.content ?? '',
    model: 'groq-llama-3.3',
  }
}

async function callCloudflareAI(prompt: string): Promise<AIResponse> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.3-70b-instruct-fp8-fast`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
      }),
    }
  )
  if (!response.ok) throw new Error(`Cloudflare AI error: ${response.status}`)
  const data = await response.json()
  if (!data.result?.response) throw new Error('Cloudflare AI: empty response')
  return {
    content: data.result.response,
    model: 'cloudflare-llama-3.3',
  }
}

const CACHE_FALLBACK = `We're experiencing high traffic right now. Here's a curated introduction to Korean culture: Korea is a land of vibrant contrasts — ancient palaces stand beside ultramodern skyscrapers, while thousand-year-old traditions coexist with the global phenomenon of K-pop and K-drama. Explore our archive to discover more about the culture that has captivated the world.`

export async function generateWithFallback(
  prompt: string,
  options?: FallbackOptions
): Promise<AIResponse> {
  const override = options?._testOverride

  const models = [
    override?.groq ?? callGroq,
    override?.gemini ?? callGemini,
    override?.cloudflare ?? callCloudflareAI,
  ]

  for (const callModel of models) {
    try {
      const result = await callModel(prompt)
      if (result.content) return result
    } catch (err) {
      console.error(`[AI Chain] ${callModel.name} failed:`, err)
      continue
    }
  }

  return {
    content: override?.fallbackContent ?? CACHE_FALLBACK,
    model: 'cache',
  }
}
