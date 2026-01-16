
🌸 Anime Scene AI BackendLightning-fast anime recognition powered by Gemini AI and Hono. Identify scenes, fetch metadata, and generate AI reviews in milliseconds.⚡ Quick FeaturesPrecision Recognition – Powered by Google Gemini Pro Vision.Rich Metadata – Direct integration with AniList IDs & episode data.Edge-Native – Designed for Cloudflare Workers & Bun.Developer First – Fully typed in TypeScript with CORS enabled.🛠️ Tech StackLayerTechnologyRuntimeNode.js / Bun / Cloudflare WorkersFrameworkHono (Ultra-lightweight)AI EngineGoogle Gemini 1.5MetadataAniList GraphQL API📡 API EndpointsPOST /identify-animeThe primary engine for structured scene data.Request:JSON{
  "image": "base64_or_image_url"
}
Response:JSON{
  "success": true,
  "id": 12345,
  "result": {
    "title": "Anime Title",
    "summary": "Scene context and summary...",
    "episodes": 24,
    "review": "AI-generated scene critique."
  },
  "media": {
    "coverImage": "url",
    "recommendations": ["Anime A", "Anime B"]
  }
}
POST /generateFlexible prompt-based AI analysis.Request:JSON{ "prompt": "Describe the animation style in this image: [URL]" }
🚀 Setup1. Clone & InstallBashgit clone https://github.com/yourusername/anime-scene-ai.git
cd anime-scene-ai && npm install
2. EnvironmentBashecho "GEMINI_API_KEY=your_key_here" > .env
3. LaunchBashnpm run dev
📄 LicenseMIT License — Simple and open.
