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
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
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
          {isReadingComplete &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "assistant" && (
              <div className="reading-actions">
                <button
                  className={`download-reading ${
                    isGeneratingSummary ? "loading" : ""
                  }`}
                  disabled={isGeneratingSummary}
                  onClick={async () => {
                    try {
                      setIsGeneratingSummary(true);
                      const response = await fetch("/api/tarotSummary", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ reading }),
                      });
                      const data = await response.json();

                      // Generate HTML for the new window
                      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MysticAI Tarot Reading</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      color: #fff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .container {
      width: 90%;
      max-width: 800px;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 0 40px rgba(138, 43, 226, 0.5);
      position: relative;
      z-index: 1;
      overflow: hidden;
    }

    .container::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath fill='%23ffffff10' d='M11 18l-10 30L45 80l44-40-10-20-28 10z'/%3E%3C/svg%3E") repeat;
      z-index: -1;
      opacity: 0.05;
    }

    h1 {
      text-align: center;
      margin-top: 0;
      background: linear-gradient(90deg, #f8bbd0, #b39ddb, #90caf9);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 28px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .subtitle {
      text-align: center;
      font-size: 14px;
      color: #d8c6ff;
      letter-spacing: 3px;
      margin-bottom: 40px;
    }

    .cards {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }

    @media (max-width: 600px) {
      .cards {
        flex-direction: column;
        align-items: center;
        gap: 30px;
      }
    }

    .card {
      flex: 0 0 30%;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    .card-image {
      width: 150px;
      height: 250px;
      background-color: #150e2d;
      border-radius: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 15px;
      position: relative;
      box-shadow: 0 7px 15px rgba(0, 0, 0, 0.4);
      overflow: hidden;
      transform: rotate(0deg);
      transition: transform 0.3s ease;
    }

    .card:nth-child(1) .card-image {
      transform: rotate(-5deg);
      background: linear-gradient(to bottom, #151626, #000114);
    }

    .card:nth-child(2) .card-image {
      transform: rotate(0deg);
      background: linear-gradient(to bottom, #25182e, #160a26);
    }

    .card:nth-child(3) .card-image {
      transform: rotate(5deg);
      background: linear-gradient(to bottom, #2c0d0d, #1a0505);
    }

    .card-content {
      text-align: center;
    }

    .card-title {
      font-weight: bold;
      margin-bottom: 10px;
      font-size: 18px;
      color: #f5da9c;
    }

    .card-desc {
      font-size: 14px;
      line-height: 1.4;
      color: #e0e0e0;
      max-width: 200px;
    }

    .card-image img {
      max-width: 90%;
      max-height: 90%;
      opacity: 0.8;
    }

    .message {
      text-align: center;
      padding: 20px;
      font-size: 18px;
      font-style: italic;
      color: #f5da9c;
    }

    .star {
      position: absolute;
      background-color: white;
      border-radius: 50%;
      z-index: -1;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 30px;
      padding-top: 15px;
    }

    .logo {
      font-size: 14px;
      font-weight: bold;
      color: #b39ddb;
    }

    .cta {
      background: linear-gradient(90deg, #9c27b0, #673ab7);
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 20px;
      font-size: 12px;
      cursor: pointer;
    }

    .emoji {
      font-size: 22px;
      margin-right: 5px;
      vertical-align: middle;
    }

    .card-symbol {
      font-size: 60px;
      opacity: 0.6;
    }

    .card:nth-child(1) .card-symbol {
      color: #cddc39;
    }

    .card:nth-child(2) .card-symbol {
      color: #5c6bc0;
    }

    .card:nth-child(3) .card-symbol {
      color: #ef5350;
    }

    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>✨ MysticAI Tarot Reading ✨</h1>
    <div class="subtitle">${currentQuery}</div>

    <div class="cards">
      ${data.cards
        .map(
          (card, index) => `
      <div class="card">
        <div class="card-image">
          <img src="${
            card.title.includes("Past")
              ? messages.find((m) => m.role === "cards")?.cards[0]?.imageFlux
              : card.title.includes("Present")
              ? messages.find((m) => m.role === "cards")?.cards[1]?.imageFlux
              : messages.find((m) => m.role === "cards")?.cards[2]?.imageFlux
          }"/>
        </div>
        <div class="card-content">
          <div class="card-title">${card.title}</div>
          <div class="card-desc">${card.content}</div>
        </div>
      </div>
      `
        )
        .join("")}
    </div>

    <div class="message">
      ${data.summary}
    </div>

    <div class="footer">
      <div class="logo">MysticAI</div>
      <button class="cta" onclick="window.close()">Close Window</button>
    </div>
  </div>

  <script>
    // Create stars in the background
    function createStars() {
      const container = document.querySelector('.container');
      for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Random size between 1-3px
        const size = Math.random() * 2 + 1;
        star.style.width = \`\${size}px\`;
        star.style.height = \`\${size}px\`;

        // Random position
        star.style.top = \`\${Math.random() * 100}%\`;
        star.style.left = \`\${Math.random() * 100}%\`;

        // Random opacity
        star.style.opacity = Math.random() * 0.8 + 0.2;

        container.appendChild(star);
      }
    }

    createStars();
  </script>
</body>
</html>`;
                      const shareResponse = await fetch("/api/tarotShare", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ html }),
                      });
                      const shareData = await shareResponse.json();
                      const uuid = shareData.uuid;
                      window.open(`/readings/${uuid}`, "_blank");
                    } catch (error) {
                      console.error("Error generating summary:", error);
                    } finally {
                      setIsGeneratingSummary(false);
                    }
                  }}
                >
                  {isGeneratingSummary
                    ? "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Generating..."
                    : "Download Reading as an Image"}
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
          {!isReadingComplete &&
            (!isGeneratingReading ||
              (isGeneratingReading && currentSpreadType === null)) &&
            randomIcebreaker && (
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
          {!isReadingComplete &&
            (!isGeneratingReading ||
              (isGeneratingReading && currentSpreadType === null)) && (
              <form onSubmit={handleSubmit} className="chat-input-form">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask the cards..."
                  disabled={
                    isWaitingForCards ||
                    (isGeneratingReading && currentSpreadType !== null)
                  }
                />
                <button
                  type="submit"
                  disabled={
                    isWaitingForCards ||
                    (isGeneratingReading && currentSpreadType !== null) ||
                    !input.trim()
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
