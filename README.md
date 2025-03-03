# Mystic AI - Tarot Reading App with Llama-3.3 Integration

A tarot reading application that combines interactive tarot card selection with AI-generated readings using Meta's Llama-3.3-70B-Instruct-Turbo model via Together.ai.

## Features

- Interactive chat interface to ask questions
- AI automatically determines the appropriate spread (1, 2, or 3 cards)
- Interactive card shuffling and selection animation
- AI-powered tarot readings generated using Together.ai and Llama-3.3-70B-Instruct-Turbo
- Secure API key handling

## How it Works

1. The user enters their Together.ai API key
2. The user enters a question or topic they want insight on
3. Based on the query, the app determines the most appropriate spread (single card, two-card, or three-card)
4. The user selects cards from the deck
5. The app sends the query and selected cards to the Llama-3.3-70B-Instruct-Turbo model via Together.ai
6. The AI generates a personalized, detailed tarot reading based on the selected cards and the original query

## Project Structure

- `src/components/` - React components
  - `TarotChat.js` - Main chat interface
  - `TarotDeck.js` - Card deck and selection animation
  - `ApiKeyForm.js` - Component for entering Together.ai API key
- `src/data/` - Data files
  - `cards.js` - Tarot card definitions and spread logic
- `src/services/` - API and external service integration
  - `api.js` - Together.ai API integration for Llama-3.3-70B-Instruct-Turbo

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

3. Set up your environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Together.ai API key to `.env.local`

4. Start the development server:
   ```
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Using the App

1. Enter your Together.ai API key when prompted
2. Type your question in the chat input
3. Select cards from the deck when prompted
4. Receive your AI-generated tarot reading!

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

## Security Note

This application handles API keys client-side for demonstration purposes. In a production environment, you should:
- Implement a backend server to securely store and use API keys
- Use environment variables for sensitive information
- Implement proper authentication and authorization