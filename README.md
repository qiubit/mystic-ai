# Mystic AI - Tarot Reading App with Llama-3.3 Integration

A tarot reading application that combines interactive tarot card selection with AI-generated readings using Meta's Llama-3.3-70B-Instruct-Turbo model via Together.ai.

## Features

- Interactive chat interface to ask questions
- AI automatically determines the appropriate spread (1, 2, or 3 cards)
- Interactive card shuffling and selection animation
- AI-powered tarot readings generated using Together.ai and Llama-3.3-70B-Instruct-Turbo
- Secure server-side API key handling for Vercel deployment
- Post-reading experience with options to download or generate a new reading
- Internationalization support (English and Polish)
- Shareable reading results
- Reading history and retrieval

## How it Works

1. The user enters a question or topic they want insight on
2. Based on the query, the app determines the most appropriate spread (single card, two-card, or three-card)
3. The user selects cards from the deck
4. The app sends the query and selected cards to the server-side API endpoint
5. The server securely calls the Llama-3.3-70B-Instruct-Turbo model via Together.ai using the stored API key
6. The AI generates a personalized, detailed tarot reading based on the selected cards and the original query
7. Users can share their reading results via a unique URL

## Project Structure

- `src/components/` - React components
  - `TarotChat.js` - Main chat interface
  - `TarotDeck.js` - Card deck and selection animation
  - `TarotSummary.js` - Summary of readings
- `src/data/` - Data files
  - `cards.js` - Tarot card definitions and spread logic
  - `icebreakers.js` - Suggested questions for users
- `src/services/` - API and external service integration
  - `api.js` - Client-side API service that calls the server endpoint
- `src/app/` - Next.js app structure
  - `[locale]/` - Internationalization routing
  - `api/tarotReading/` - Server-side endpoint that securely calls Together.ai API
  - `api/fetchReading/` - Endpoint for retrieving saved readings
  - `api/tarotShare/` - Endpoint for sharing readings
  - `api/tarotSummary/` - Endpoint for generating reading summaries
- `src/i18n/` - Internationalization configuration
- `src/locales/` - Translation files for different languages

## Getting Started

1. Get a Together.ai API key:
   - Sign up at [Together.ai](https://together.ai)
   - Create an API key in your account dashboard

2. Clone the repository and install dependencies:
   ```
   git clone <repository-url>
   cd mystic-ai
   npm install
   ```

3. For local development, you can use a `.env.local` file:
   ```
   BLOB_READ_WRITE_TOKEN=<your vercel blob write token here>
   NEXT_PUBLIC_POSTHOG_HOST=<your posthog host here>
   NEXT_PUBLIC_POSTHOG_KEY=<your posthog key here>
   TOGETHER_AI_API_KEY=<your together ai api key here>
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Using the App

1. Type your question in the chat input
2. Select cards from the deck when prompted
3. Receive your AI-generated tarot reading!
4. Download your reading, share it, or generate a new one

## Technical Details

- **Model Used**: Meta's Llama-3.3-70B-Instruct-Turbo
- **API Provider**: Together.ai
- **Framework**: Next.js 15
- **API Integration**: AI SDK for stream handling
- **Streaming**: Real-time response streaming with word-level chunking
- **Internationalization**: next-intl with support for English and Polish
- **Analytics**: PostHog integration for usage tracking

## Next Steps

- Add more tarot card deck options and spreads
- Improve animations and user experience
- Implement user accounts to save reading history
- Add more AI model options
- Expand language support

## Deployment on Vercel

This app is designed to be deployed on Vercel with server-side API handling.

### Environment Variables Setup

When deploying to Vercel, add the following environment variable:

- `TOGETHER_AI_API_KEY`: Your Together.ai API key
- `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob Storage Write Token
- `NEXT_PUBLIC_POSTHOG_HOST`: Your PostHog Host
- `NEXT_PUBLIC_POSTHOG_KEY=`: Your PostHog Public Key


The API key is securely stored on the server side and never exposed to the client browser. The API requests are proxied through a Next.js API route in the `/app/api` directory.
