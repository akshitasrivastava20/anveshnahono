🌸 Anime Scene Recognition AI BackendA lightweight, serverless-ready backend service that identifies anime scenes from images or descriptions. By leveraging Google Gemini Pro Vision, it provides metadata including summaries, episode counts, and ratings.✨ FeaturesScene Recognition: Identify anime titles from screenshots or text descriptions.Rich Metadata: Returns AniList IDs, episode counts, summaries, and reviews.Edge-Ready: Built with Hono for ultra-fast deployment on Cloudflare Workers.CORS Enabled: Ready for immediate integration with your React/Vue/Next.js frontend.🛠️ Tech StackComponentTechnologyRuntimeNode.js / Bun / Cloudflare WorkersFrameworkHonoAI ModelGoogle Gemini AILanguageTypeScriptAPI ReferenceAniList API (Integrated)🚀 Getting StartedPrerequisitesNode.js installedA Gemini API KeyInstallationClone the repository:Bashgit clone https://github.com/yourusername/anime-scene-ai.git
cd anime-scene-ai
Install dependencies:Bashnpm install
Configure environment variables (.env):Code snippetGEMINI_API_KEY=your_key_here
Start development server:Bashnpm run dev
📡 API Endpoints1. POST /generateGenerates a raw AI-powered analysis of a scene description or image URL.Request Body:JSON{
  "prompt": "Description of the scene or Image URL"
}
2. POST /identify-animeThe primary endpoint for structured data.Request Body:JSON{
  "image": "base64_string_or_url"
}
Response Preview:JSON{
  "success": true,
  "id": 12345,
  "result": {
    "title": "Anime Name",
    "summary": "A brief overview...",
    "episodes": 24,
    "review": "Short AI-generated review"
  },
  "media": {
    "coverImage": "...",
    "recommendations": [...]
  }
}
📄 LicenseThis project is licensed under the MIT License - see the LICENSE file for details.
