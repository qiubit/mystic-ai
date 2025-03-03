# Mystic AI - Tarot Reading App

A hackathon project that combines AI chat capabilities with interactive tarot card readings.

## Features

- Interactive chat interface to ask questions
- AI automatically determines the appropriate spread (1, 2, or 3 cards)
- Interactive card shuffling and selection animation
- Tarot readings generated based on the cards selected

## How it Works

1. The user enters a question or topic they want insight on
2. Based on the query, the AI determines the most appropriate spread (single card, two-card, or three-card)
3. The deck is shuffled with animation
4. The user selects cards from the deck
5. The AI generates a reading based on the selected cards and the original query

## Project Structure

- `src/components/` - React components
  - `TarotChat.js` - Main chat interface
  - `TarotDeck.js` - Card deck and selection animation
- `src/data/` - Data files
  - `cards.js` - Tarot card definitions and reading logic

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Next Steps

- Integrate with actual AI API for more sophisticated readings
- Add more detailed tarot card information and images
- Improve animations and user experience
- Add ability to save and share readings

## Note

This is a hackathon project with placeholder content. For a production app, you would need:
1. Real tarot card images
2. More comprehensive card meanings and interpretations
3. Integration with a language model API for dynamic readings
4. User authentication and history storage