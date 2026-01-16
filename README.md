# Anveshna Hono API

A Cloudflare Worker API built with Hono framework that provides AI-powered text generation and anime identification services using Google's Gemini AI.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Deployment

```bash
npm run deploy
```

### Type Generation

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```bash
npm run cf-typegen
```

## 📋 Environment Variables

Make sure to set the following environment variable in your Cloudflare Worker:

- `GEMINI_API_KEY` - Your Google Gemini API key

## 🛠 API Endpoints

### 1. Text Generation

**Endpoint:** `POST /generate`

Generates text content using Google Gemini AI.

**Request Body:**
```json
{
  "prompt": "Your text prompt here"
}
```

**Response:**
```json
{
  "response": "Generated text response from Gemini AI"
}
```

**Example:**
```bash
curl -X POST https://your-worker-domain.workers.dev/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a short story about a robot"}'
```

### 2. Anime Identification

**Endpoint:** `POST /identify-anime`

Analyzes an uploaded image to identify anime and provides detailed information including similar recommendations.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with `image` field containing the image file

**Response:**
```json
{
  "success": true,
  "id": 12345,
  "result": {
    "anilist_id": 12345,
    "anime": "Anime Name",
    "overview": "Brief description of the anime",
    "episodes": 24,
    "genres": ["Action", "Adventure"],
    "review": "AI-generated review",
    "confidence": "High/Medium/Low"
  },
  "media": {
    // Detailed anime information from AniList API
  }
}
```

**Error Responses:**
```json
{
  "error": "No image uploaded"
}
```

```json
{
  "success": false,
  "error": "Anime not found"
}
```

**Example:**
```bash
curl -X POST https://your-worker-domain.workers.dev/identify-anime \
  -F "image=@your-anime-image.jpg"
```

## 🔧 Technical Details

### Framework & Dependencies

- **Framework:** [Hono](https://hono.dev/) - Ultra-fast web framework
- **AI Service:** [Google Gemini AI](https://ai.google.dev/) - Advanced AI capabilities
- **Platform:** [Cloudflare Workers](https://workers.cloudflare.com/) - Edge computing platform

### Models Used

- **Text Generation:** `gemini-2.5-flash` - Fast text generation
- **Image Analysis:** `gemini-3-flash-preview` - Advanced image understanding

### CORS Configuration

The API is configured with CORS enabled for all origins with `GET` and `POST` methods allowed.

### External Integrations

- **AniList API:** Used for fetching detailed anime metadata
- **Gogoanime Provider:** Streaming information provider

## 📝 Usage Examples

### JavaScript/TypeScript

```typescript
// Text generation
const response = await fetch('/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'Explain quantum computing' })
});
const data = await response.json();

// Anime identification
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('/identify-anime', {
  method: 'POST',
  body: formData
});
const result = await response.json();
```

## 🚨 Error Handling

The API includes comprehensive error handling:

- **400 Bad Request:** Missing required parameters
- **404 Not Found:** Anime not found in database
- **500 Internal Server Error:** AI processing failures

## 📄 License

This project is part of the Anveshna anime streaming platform ecosystem.
