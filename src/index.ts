import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from '@google/genai'
import { streamText } from 'hono/streaming'

/* -------------------- Types -------------------- */
type Env = {
  GEMINI_API_KEY: string
  CHAT_HISTORY: KVNamespace
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
  const { prompt, sessionId } = await c.req.json();
  const kvKey = `history:${sessionId}`;

  if (!sessionId) return c.json({ error: "sessionId is required" }, 400);


  // const ai = new GoogleGenAI({
  //   apiKey: c.env.GEMINI_API_KEY,
  // })

 return streamText(c, async (stream) => {
    // In @google/genai, generateContentStream is called directly on models
   const raw = await c.env.CHAT_HISTORY.get(kvKey);
      let history = raw? JSON.parse(raw) : [];
   
   
      const currentContents = [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ];
      const ai = new GoogleGenAI({
        apiKey: c.env.GEMINI_API_KEY,
       })

    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash", // or "gemini-3-flash-preview"
      contents: currentContents,
      config: {
        systemInstruction: " Your are Pippo.",
      },
    });

    let fullResponseText="";

    
    for await (const chunk of response) {
      // Use chunk.text to get the string content
      
      if (chunk.text) {
        fullResponseText+=chunk.text;
        await stream.write(chunk.text);
      }
    }


    const updatedHistory = [
        ...currentContents,
        { role: 'model', parts: [{ text: fullResponseText }] }
      ].slice(-10); // Keep last 10 messages so the prompt doesn't get too big

      // Use c.executionCtx.waitUntil to ensure the save finishes
      c.executionCtx.waitUntil(
        c.env.CHAT_HISTORY.put(kvKey, JSON.stringify(updatedHistory), { expirationTtl: 86400 })
      );
   
  });
});








/** IMAGE → ANIME IDENTIFICATION */

app.post('/identify-anime', async (c) => {
  console.log("ALL HEADERS:", Object.fromEntries(c.req.raw.headers));
  try {
    const contentType = c.req.header("content-type") || ""

    if (!contentType.includes("multipart/form-data")) {
      return c.json({ error: "Content-Type must be multipart/form-data" }, 400)
    }

    const formData = await c.req.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return c.json({ error: 'No image uploaded' }, 400)
    }

    const ai = new GoogleGenAI({
      apiKey: c.env.GEMINI_API_KEY,
    })

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
You are an anime expert assistant.

Identify the anime.
Return strictly valid JSON with:
anilist_id, anime, overview, episodes, genres, review, confidence
`,
      ]),
    })

    const data = extractGeminiJSON(response)

    const id = data.anilist_id

    if (!id) {
      return c.json({ success: false, error: 'Anime not found' }, 404)
    }

    const mediaRes = await fetch(
      `https://anveshna-backend-v2.vercel.app/meta/anilist/data/${id}?provider=gogoanime`
    )

    if (!mediaRes.ok) {
      return c.json({ success: false, error: 'Media not found' }, 404)
    }

    const media = await mediaRes.json()

    return c.json({
      success: true,
      id,
      result: data,
      media,
    })

  } catch (error) {
    console.error("ERROR:", error)
    return c.json({ error: 'Anime identification failed' }, 500)
  }
})


app.post('/recommendation',async(c)=>{
  const {prompt}=await c.req.json();
  const ai = new GoogleGenAI({
    apiKey: c.env.GEMINI_API_KEY,
  })

  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", // Flash is faster/cheaper for simple ID lookups
    config:{
    systemInstruction: "You are a database. Return ONLY the integer AniList ID for the anime mentioned. No text, no markdown."
  },
    contents: prompt,
  });

  const rawText = response.text || '';
  const id = rawText.replace(/[^0-9]/g, '');
 if (!id) {
      return c.json({ success: false, error: 'Anime not found' }, 404)
    }

    const mediaRes = await fetch(
      `https://anveshna-backend-v2.vercel.app/meta/anilist/data/${id}?provider=gogoanime`
    )

    if (!mediaRes.ok) {
      return c.json({ success: false, error: 'Media not found' }, 404)
    }

    const media = await mediaRes.json() as any ;
   
     
     return c.json({
      success: true,
      id:id,
      recommendation:media.recommendations || []
    })





})

export default app
