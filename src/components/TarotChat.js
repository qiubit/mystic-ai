// TarotChat.js - Main chat interface component
import React, { useState, useRef, useEffect } from "react";
import TarotDeck from "./TarotDeck";
import { determineSpread } from "../data/cards";
import { useTarotReading } from "../services/api";
import icebreakers from "../data/icebreakers";

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
  const [currentSpreadType, setCurrentSpreadType] = useState(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [isGeneratingReading, setIsGeneratingReading] = useState(false);
  const [isReadingComplete, setIsReadingComplete] = useState(false);
  const [randomIcebreaker, setRandomIcebreaker] = useState(null);
  const messagesEndRef = useRef(null);

  const { generateReading, reading } = useTarotReading(() => {
    setIsGeneratingReading(false);
    setIsReadingComplete(true);
  });

  // Get random icebreaker from each category
  const getIcebreakerSuggestions = () => {
    return icebreakers.map((category) => {
      const randomIndex = Math.floor(Math.random() * category.questions.length);
      return {
        category: category.category,
        emoji: category.emoji,
        question: category.questions[randomIndex],
      };
    });
  };

  // Update icebreaker suggestions when input form is shown
  useEffect(() => {
    if (!isWaitingForCards && !isGeneratingReading) {
      setRandomIcebreaker(getIcebreakerSuggestions());
    }
  }, [isWaitingForCards, isGeneratingReading]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleIcebreakerClick = (question) => {
    setInput(question);
    // Focus and highlight the input field
    const inputEl = document.querySelector(".chat-input-form input");
    if (inputEl) {
      inputEl.focus();
      inputEl.select();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Reset reading completion state
    setIsReadingComplete(false);

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

    try {
      // Generate AI reading using the new hook
      await generateReading(selectedCards, currentSpreadType, currentQuery);

      // Update the loading message with the actual reading
      setMessages((prev) => [
        ...prev.slice(0, prev.length - 1),
        { role: "assistant", content: reading },
      ]);

      setIsGeneratingReading(true);
    } catch (error) {
      console.error("Error generating reading:", error);
      setMessages((prev) => [
        ...prev.slice(0, prev.length - 1),
        {
          role: "error",
          content:
            "I am unable to interpret the cards at this moment. The spiritual connection is unclear.",
        },
      ]);
    }
  };

  useEffect(() => {
    if (isGeneratingReading) {
      setMessages((prev) => [
        ...prev.slice(0, prev.length - 1),
        { role: "assistant", content: reading },
      ]);
    }
  }, [isGeneratingReading, reading]);

  return (
    <div className="tarot-chat">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {message.role === "cards" ? (
              <div className="card-spread">
                {message.cards.map((card, i) => (
                  <div key={i} className="spread-card">
                    <img src={card.imageFlux} alt={card.name} />
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
        <div className="chat-controls">
          {isReadingComplete && messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
            <div className="reading-actions">
              <button
                className="download-reading"
                onClick={async () => {
                  alert("Download functionality coming soon!");
                  const response = await fetch("/api/tarotSummary", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ reading }),
                  });
                  const json = await response.json();
                  console.log(json);
                }}
              >
                Download Reading as an Image
              </button>
              <button
                className="new-reading"
                onClick={() => {
                  setIsGeneratingReading(false);
                  setIsReadingComplete(false);
                  setCurrentSpreadType(null);
                }}
              >
                Get another reading
              </button>
            </div>
          )}
          {(!isReadingComplete && (!isGeneratingReading || (isGeneratingReading && currentSpreadType === null))) && randomIcebreaker && (
            <div className="icebreaker-suggestions">
              {randomIcebreaker.map((suggestion, index) => (
                <div
                  key={index}
                  className="icebreaker-suggestion"
                  onClick={() => handleIcebreakerClick(suggestion.question)}
                  title={suggestion.question}
                >
                  <span className="suggestion-emoji">{suggestion.emoji}</span>
                  <span className="suggestion-question">
                    {suggestion.question}
                  </span>
                </div>
              ))}
            </div>
          )}
          {(!isReadingComplete && (!isGeneratingReading || (isGeneratingReading && currentSpreadType === null))) && (
            <form onSubmit={handleSubmit} className="chat-input-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the cards..."
                disabled={isWaitingForCards || (isGeneratingReading && currentSpreadType !== null)}
              />
              <button
                type="submit"
                disabled={
                  isWaitingForCards || (isGeneratingReading && currentSpreadType !== null) || !input.trim()
                }
              >
                Ask
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default TarotChat;
