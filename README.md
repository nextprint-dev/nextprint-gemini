# NextPrint Gemini Jersey Designer

AI-powered jersey designer using Google Gemini API. Embedded as a feature in the NextPrint Shopify store.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Run locally:
```bash
npm run dev
```

4. Open http://localhost:3000

## Deploy to Vercel

1. Push to GitHub (new repo: `nextprint-gemini`)
2. Import in Vercel as new project
3. Add environment variable: `GEMINI_API_KEY`
4. Deploy!

## Embed in Shopify

Add this button to your Shopify homepage banner:
```html
<a href="https://design.nextprint.in" target="_blank">Design Your Jersey</a>
```
