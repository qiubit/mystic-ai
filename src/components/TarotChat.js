// TarotChat.js - Main chat interface component
import React, { useState, useRef, useEffect } from "react";
import TarotDeck from "./TarotDeck";
import { determineSpread } from "../data/cards";
import { generateTarotReading, generateTarotReadingStream } from "../services/api";

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

    // Add loading message that will be updated with streaming content
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Reading the cards and channeling the energies...",
      },
    ]);

    try {
      // Track the accumulated streaming content
      let streamContent = "";
      
      // Generate AI reading using Together.ai with streaming
      const closeStream = await generateTarotReadingStream(
        selectedCards,
        currentSpreadType,
        currentQuery,
        // Handle each chunk of streamed content
        (chunk) => {
          streamContent += chunk;
          // Update the message with the current accumulated content
          setMessages((prev) => [
            ...prev.slice(0, prev.length - 1),
            { role: "assistant", content: streamContent },
          ]);
        },
        // Handle complete formatted reading
        (formattedReading) => {
          // Update with the final formatted reading
          setMessages((prev) => [
            ...prev.slice(0, prev.length - 1),
            { role: "assistant", content: formattedReading },
          ]);
          setIsGeneratingReading(false);
        },
        // Handle errors
        (errorMsg) => {
          console.error("Error generating reading:", errorMsg);
          setMessages((prev) => [
            ...prev.slice(0, prev.length - 1),
            {
              role: "error",
              content: errorMsg || "I am unable to interpret the cards at this moment. The spiritual connection is unclear.",
            },
          ]);
          setIsGeneratingReading(false);
        }
      );
      
      // Return the closeStream function for potential cancellation
      return closeStream;
    } catch (error) {
      console.error("Error initiating reading stream:", error);
      setMessages((prev) => [
        ...prev.slice(0, prev.length - 1),
        {
          role: "error",
          content: "I am unable to interpret the cards at this moment. The spiritual connection is unclear.",
        },
      ]);
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
