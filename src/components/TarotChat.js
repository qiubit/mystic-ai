// TarotChat.js - Main chat interface component
import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from 'next-intl';
import TarotDeck from "./TarotDeck";
import { determineSpread } from "../data/cards";
import { useTarotReading } from "../services/api";
import icebreakers from "../data/icebreakers";

const TarotChat = () => {
  const t = useTranslations('tarotChat');

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: t('welcome'),
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

  const locale = window.location.pathname.split('/')[1];

  const { generateReading, reading } = useTarotReading(locale, () => {
    setIsGeneratingReading(false);
    setIsReadingComplete(true);
  });

  // Get random icebreaker from each category
  const getIcebreakerSuggestions = () => {
    return icebreakers.map((category) => {
      const randomIndex = Math.floor(Math.random() * category.questions[locale].length);
      return {
        category: category.category,
        emoji: category.emoji,
        question: category.questions[locale][randomIndex],
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
          content: t('consultCards'),
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
        content: t('reading'),
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
          content: t('errorReading'),
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
                        body: JSON.stringify({ reading, locale }),
                      });
                      const summaryData = await response.json();

                      // Add card images to the data
                      const cardsWithImages = summaryData.cards.map(
                        (card, index) => {
                          let imageUrl = "";
                          if (index === 0) {
                            imageUrl = messages
                              .slice()
                              .reverse()
                              .find((m) => m.role === "cards")
                              ?.cards[0]?.imageFlux;
                          } else if (index === 1) {
                            imageUrl = messages
                              .slice()
                              .reverse()
                              .find((m) => m.role === "cards")
                              ?.cards[1]?.imageFlux;
                          } else {
                            imageUrl = messages
                              .slice()
                              .reverse()
                              .find((m) => m.role === "cards")
                              ?.cards[2]?.imageFlux;
                          }
                          return {
                            ...card,
                            image: imageUrl,
                          };
                        }
                      );

                      // Prepare complete data for sharing
                      const readingData = {
                        ...summaryData,
                        cards: cardsWithImages,
                        query: currentQuery,
                      };

                      // Share the reading data
                      const shareResponse = await fetch("/api/tarotShare", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ data: readingData }),
                      });

                      const shareData = await shareResponse.json();
                      const uuid = shareData.uuid;

                      window.location.replace(`/${locale}/readings/${uuid}`);
                    } catch (error) {
                      console.error("Error generating summary:", error);
                    } finally {
                      setIsGeneratingSummary(false);
                    }
                  }}
                >
                  {isGeneratingSummary
                    ? `\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0${t('generating')}`
                    : t('getSummary')}
                </button>
                <button
                  className="new-reading"
                  onClick={() => {
                    setIsGeneratingReading(false);
                    setIsReadingComplete(false);
                    setCurrentSpreadType(null);
                  }}
                >
                  {t('getAnotherReading')}
                </button>
              </div>
            )}
          {!isReadingComplete &&
            (!isGeneratingReading ||
              (isGeneratingReading && currentSpreadType === null)) &&
            randomIcebreaker && (
              <div className="icebreaker-container">
                <button
                  id="icebreaker-prev-btn"
                  className="icebreaker-nav-button icebreaker-prev hidden"
                  onClick={(e) => {
                    e.preventDefault();
                    const container = document.querySelector(
                      ".icebreaker-suggestions"
                    );
                    container.scrollBy({ left: -300, behavior: "smooth" });
                  }}
                >
                  &#10094;
                </button>
                <div
                  className="icebreaker-suggestions"
                  onScroll={(e) => {
                    const container = e.target;
                    const leftBtn = document.getElementById(
                      "icebreaker-prev-btn"
                    );
                    const rightBtn = document.getElementById(
                      "icebreaker-next-btn"
                    );

                    // Show/hide left button based on scroll position
                    if (leftBtn != null) {
                      if (container.scrollLeft <= 10) {
                        leftBtn.classList.add("hidden");
                      } else {
                        leftBtn.classList.remove("hidden");
                      }
                    }

                    // Show/hide right button based on scroll position
                    const isAtEnd =
                      container.scrollWidth - container.clientWidth <=
                      container.scrollLeft + 10;
                    if (rightBtn != null) {
                      if (isAtEnd) {
                        rightBtn.classList.add("hidden");
                      } else {
                        rightBtn.classList.remove("hidden");
                      }
                    }
                  }}
                  ref={(el) => {
                    // Initialize button visibility on mount
                    if (el) {
                      setTimeout(() => {
                        const rightBtn = document.getElementById(
                          "icebreaker-next-btn"
                        );
                        const isAtEnd =
                          el.scrollWidth - el.clientWidth <= el.scrollLeft + 10;
                        if (rightBtn != null) {
                          if (isAtEnd) {
                            rightBtn.classList.add("hidden");
                          } else {
                            rightBtn.classList.remove("hidden");
                          }
                        }
                      }, 300);
                    }
                  }}
                >
                  {randomIcebreaker.map((suggestion, index) => (
                    <div
                      key={index}
                      className="icebreaker-suggestion"
                      onClick={() => handleIcebreakerClick(suggestion.question)}
                      title={suggestion.question}
                    >
                      <span className="suggestion-emoji">
                        {suggestion.emoji}
                      </span>
                      <span className="suggestion-question">
                        {suggestion.question}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  id="icebreaker-next-btn"
                  className="icebreaker-nav-button icebreaker-next"
                  onClick={(e) => {
                    e.preventDefault();
                    const container = document.querySelector(
                      ".icebreaker-suggestions"
                    );
                    container.scrollBy({ left: 300, behavior: "smooth" });
                  }}
                >
                  &#10095;
                </button>
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
                  placeholder={t('askPlaceholder')}
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
                  {t('askButton')}
                </button>
              </form>
            )}
        </div>
      )}
    </div>
  );
};

export default TarotChat;
