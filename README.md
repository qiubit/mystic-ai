# Mystic AI - Tarot Reading App with Llama-3.3 Integration

A tarot reading application that combines interactive tarot card selection with AI-generated readings using Meta's Llama-3.3-70B-Instruct-Turbo model via Together.ai.

## Features

- Interactive chat interface to ask questions
- AI automatically determines the appropriate spread (1, 2, or 3 cards)
- Interactive card shuffling and selection animation
- AI-powered tarot readings generated using Together.ai and Llama-3.3-70B-Instruct-Turbo
- Secure server-side API key handling for Vercel deployment

## How it Works

1. The user enters a question or topic they want insight on
2. Based on the query, the app determines the most appropriate spread (single card, two-card, or three-card)
3. The user selects cards from the deck
4. The app sends the query and selected cards to the server-side API endpoint
5. The server securely calls the Llama-3.3-70B-Instruct-Turbo model via Together.ai using the stored API key
6. The AI generates a personalized, detailed tarot reading based on the selected cards and the original query

## Project Structure

- `src/components/` - React components
  - `TarotChat.js` - Main chat interface
  - `TarotDeck.js` - Card deck and selection animation
- `src/data/` - Data files
  - `cards.js` - Tarot card definitions and spread logic
- `src/services/` - API and external service integration
  - `api.js` - Client-side API service that calls the server endpoint
- `api/` - Vercel serverless functions
  - `tarot-reading.js` - Server-side endpoint that securely calls Together.ai API

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
   TOGETHER_API_KEY=your_together_api_key_here
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Using the App

1. Type your question in the chat input
2. Select cards from the deck when prompted
3. Receive your AI-generated tarot reading!

## Technical Details

- **Model Used**: Meta's Llama-3.3-70B-Instruct-Turbo
- **API Provider**: Together.ai
- **Framework**: React
- **API Integration**: axios for HTTP requests

## Next Steps

- Add more tarot card deck options and spreads
- Improve animations and user experience
- Add ability to save and share readings
- Implement user accounts to save API keys securely
- Add more AI model options

## Deployment on Vercel

This app is designed to be deployed on Vercel with server-side API handling.

### Environment Variables Setup

When deploying to Vercel, add the following environment variable:

- `TOGETHER_API_KEY`: Your Together.ai API key

The API key is securely stored on the server side and never exposed to the client browser. The API requests are proxied through a Vercel serverless function in the `/api` directory.