import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from '@google/genai'

/* -------------------- Types -------------------- */
type Env = {
  GEMINI_API_KEY: string
}

/* -------------------- App -------------------- */
const app = new Hono<{ Bindings: Env }>()

/* -------------------- Middleware -------------------- */
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST'],
  })
)

/* -------------------- Utils -------------------- */
function extractGeminiJSON(response: any) {
  const rawText =
    typeof response.text === 'function'
      ? response.text()
      : response?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!rawText) {
    throw new Error('Empty Gemini response')
  }

  const cleaned = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()

  return JSON.parse(cleaned)
}

/* -------------------- Routes -------------------- */

/** TEXT GENERATION */
app.post('/generate', async (c) => {
  const { prompt } = await c.req.json()

  const ai = new GoogleGenAI({
    apiKey: c.env.GEMINI_API_KEY,
  })

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  })

  const text =response.text;
  return c.json({ response: text })
})


/** IMAGE → ANIME IDENTIFICATION */
app.post('/identify-anime', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return c.json({ error: 'No image uploaded' }, 400)
    }

    const ai = new GoogleGenAI({
      apiKey: c.env.GEMINI_API_KEY,
    })

    /* Upload image to Gemini (File is already a Blob) */
    const uploadedFile = await ai.files.upload({
      file,
      config: { mimeType: file.type },
    })

    if (!uploadedFile.uri || !uploadedFile.mimeType) {
      throw new Error('Gemini file upload failed')
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: createUserContent([
        createPartFromUri(
          uploadedFile.uri,
          uploadedFile.mimeType
        ),
        `
You are an anime expert assistant for an anime streaming platform.

Analyze the uploaded image and do the following:

1. Identify the anime shown in the image.
2. If you are not confident, clearly say "Unknown anime".

Return strictly valid JSON with keys:
anilist_id,
anime, overview, episodes, genres, review, confidence

If identified, suggest 2 similar anime titles.
`,
      ]),
    })

    const data = extractGeminiJSON(response)
    

    /* AniList fetch */
    interface AniListSearchResponse {
      results?: { id: number }[]
    }

const id = data.anilist_id;

if (!id) {
  return c.json({ success: false, error: 'Anime not found' }, 404)
}

const mediaRes = await fetch(
  `http://anveshna-backend-v2.vercel.app/meta/anilist/data/${id}?provider=gogoanime`
)

if (!mediaRes.ok) {
  return c.json({ success: false, error: 'Media not found for provider' }, 404)
}

const media = await mediaRes.json()


    return c.json({
      success: true,
      id:id,
      result: data,
      media,
    })
  } catch (error) {
    console.error(error)
    return c.json(
      { error: 'Anime identification failed' },
      500
    )
  }
})

export default app
