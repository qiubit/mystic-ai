// TarotChat.js - Main chat interface component
import React, { useState, useRef, useEffect } from "react";
import TarotDeck from "./TarotDeck";
import { determineSpread } from "../data/cards";
import { generateTarotReading } from "../services/api";

const TarotChat = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to Mystic AI—your portal to hidden insights! Please ask your question now to unlock guidance about your future, relationships, or career. Your destiny awaits!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isWaitingForCards, setIsWaitingForCards] = useState(false);
  const [isGeneratingReading, setIsGeneratingReading] = useState(false);
  const [currentSpreadType, setCurrentSpreadType] = useState(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);

    // Store the query for the reading
    setCurrentQuery(input);
    setInput("");

    // Determine spread type based on query
    const spreadType = determineSpread(input);
    setCurrentSpreadType(spreadType);

    // Add thinking message
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I'm sensing an energy around your question. Let me consult the cards with a ${spreadType.replace(
            "-",
            " "
          )} spread.`,
        },
      ]);

      // Start card selection process
      setIsWaitingForCards(true);
      
      // Force scroll after cards appear
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, 1000);
  };

  // Create ref to track if component is mounted
  const isMountedRef = useRef(true);
  
  // Set up cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleCardsSelected = async (selectedCards) => {
    setIsWaitingForCards(false);
    setIsGeneratingReading(true);

    // Add card display message
    setMessages((prev) => [
      ...prev,
      {
        role: "cards",
        content: selectedCards.map((card) => card.name).join(", "),
        cards: selectedCards,
      },
    ]);

    // Add loading message
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Reading the cards and channeling the energies...",
      },
    ]);

    const abortController = new AbortController();
    
    try {
      // Create a placeholder for the streaming reading
      setMessages((prev) => [
        ...prev.slice(0, prev.length - 1),
        { role: "assistant", content: "" },
      ]);

      // Generate AI reading using Together.ai with streaming callback
      await generateTarotReading(
        selectedCards,
        currentSpreadType,
        currentQuery,
        (token, fullReading) => {
          // Only update if component is still mounted
          if (isMountedRef.current) {
            // Update the message with each new token received
            setMessages((prev) => [
              ...prev.slice(0, prev.length - 1),
              { role: "assistant", content: fullReading },
            ]);
            
            // Auto-scroll as new content arrives
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }
        },
        abortController.signal // Pass the abort controller signal
      );
    } catch (error) {
      console.error("Error generating reading:", error);
      
      // Create a more user-friendly error message based on the error type
      let errorMsg = "I am unable to interpret the cards at this moment. The spiritual connection is unclear.";
      
      if (error.message && error.message.includes("timeout")) {
        errorMsg = "The mystical energies have faded. The connection was lost while channeling your reading.";
      } else if (error.message && error.message.includes("network")) {
        errorMsg = "The cosmic pathways are blocked. I cannot reach beyond the veil to complete your reading.";
      }
      
      setMessages((prev) => [
        ...prev.slice(0, prev.length - 1),
        {
          role: "error",
          content: errorMsg,
        },
      ]);
    } finally {
      setIsGeneratingReading(false);
    }
  };

  return (
    <div className="tarot-chat">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {message.role === "cards" ? (
              <div className="card-spread">
                {message.cards.map((card, i) => (
                  <div key={i} className="spread-card">
                    <img src={card.image} alt={card.name} />
                    <div className="card-name">{card.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="message-content"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {message.content}
              </div>
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
            disabled={isWaitingForCards || isGeneratingReading}
          />
          <button
            type="submit"
            disabled={isWaitingForCards || isGeneratingReading || !input.trim()}
          >
            Ask
          </button>
        </form>
      )}
    </div>
  );
};

export default TarotChat;
