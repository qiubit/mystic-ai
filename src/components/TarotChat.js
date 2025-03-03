// TarotChat.js - Main chat interface component
import React, { useState, useRef, useEffect } from 'react';
import TarotDeck from './TarotDeck';
import { determineSpread, generateReading } from '../data/cards';

const TarotChat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to Mystic AI. What would you like to know about your future, relationships, or career?' }
  ]);
  const [input, setInput] = useState('');
  const [isWaitingForCards, setIsWaitingForCards] = useState(false);
  const [currentSpreadType, setCurrentSpreadType] = useState(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    
    // Store the query for the reading
    setCurrentQuery(input);
    setInput('');

    // Determine spread type based on query
    const spreadType = determineSpread(input);
    setCurrentSpreadType(spreadType);
    
    // Add thinking message
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I'm sensing an energy around your question. Let me consult the cards with a ${spreadType.replace('-', ' ')} spread.` 
      }]);
      
      // Start card selection process
      setIsWaitingForCards(true);
    }, 1000);
  };

  const handleCardsSelected = (selectedCards) => {
    setIsWaitingForCards(false);
    
    // Add card display message
    setMessages(prev => [...prev, { 
      role: 'cards', 
      content: selectedCards.map(card => card.name).join(', '),
      cards: selectedCards 
    }]);
    
    // Generate and add reading
    setTimeout(() => {
      const reading = generateReading(selectedCards, currentSpreadType, currentQuery);
      setMessages(prev => [...prev, { role: 'assistant', content: reading }]);
    }, 1500);
  };

  return (
    <div className="tarot-chat">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {message.role === 'cards' ? (
              <div className="card-spread">
                {message.cards.map((card, i) => (
                  <div key={i} className="spread-card">
                    <img src={card.image} alt={card.name} />
                    <div className="card-name">{card.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="message-content">{message.content}</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {isWaitingForCards ? (
        <TarotDeck 
          spreadType={currentSpreadType} 
          onCardsSelected={handleCardsSelected} 
        />
      ) : (
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the cards..."
            disabled={isWaitingForCards}
          />
          <button type="submit" disabled={isWaitingForCards || !input.trim()}>
            Ask
          </button>
        </form>
      )}
    </div>
  );
};

export default TarotChat;