// TarotDeck.js - Component to handle card shuffling and selection animation
import React, { useState, useEffect } from "react";
import { shuffleCards } from "../data/cards";

const TarotDeck = ({ onCardsSelected, spreadType }) => {
  const [deck, setDeck] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [canSelect, setCanSelect] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);

  // Number of cards to display for selection
  const cardsToShow = 18;

  // Number of cards to select based on spread type
  const cardsToSelect =
    spreadType === "single" ? 1 : spreadType === "two-card" ? 2 : 3;

  // Initialize deck with shuffled cards
  useEffect(() => {
    // Start with all cards shuffled
    const allShuffled = shuffleCards();
    // Only show the number of cards we want to display
    setDeck(allShuffled.slice(0, cardsToShow));
    setSelectedCards([]);
  }, [spreadType]);

  // Start shuffling animation
  const startShuffling = () => {
    setIsShuffling(true);
    setCanSelect(false);

    // Shuffle animation
    const shuffleInterval = setInterval(() => {
      const allShuffled = shuffleCards();
      setDeck(allShuffled.slice(0, cardsToShow));
    }, 100);

    // Stop shuffling after 2 seconds
    setTimeout(() => {
      clearInterval(shuffleInterval);
      setIsShuffling(false);
      setCanSelect(true);
    }, 2000);
  };

  // Handle card selection
  const handleCardClick = (card) => {
    if (!canSelect || selectedCards.length >= cardsToSelect) return;

    const newSelectedCards = [...selectedCards, card];
    setSelectedCards(newSelectedCards);

    // When all cards are selected, notify parent component
    if (newSelectedCards.length === cardsToSelect) {
      setTimeout(() => {
        onCardsSelected(newSelectedCards);
      }, 1000);
    }
  };

  return (
    <div className="tarot-deck-container">
      {/* Shuffling button */}
      {!isShuffling && selectedCards.length === 0 && (
        <button className="shuffle-button" onClick={startShuffling}>
          Shuffle the Deck
        </button>
      )}

      {/* Status message */}
      {isShuffling && <div className="status-message">Shuffling cards...</div>}
      {canSelect && (
        <div className="status-message">
          Select {cardsToSelect} card{cardsToSelect > 1 ? "s" : ""} from the{" "}
          {cardsToShow} presented
        </div>
      )}

      {/* Card deck display */}
      <div className="card-deck">
        {deck.map((card) => (
          <div
            key={card.id}
            className={`card ${isShuffling ? "shuffling" : ""} ${
              selectedCards.includes(card) ? "selected" : ""
            }`}
            onClick={() => handleCardClick(card)}
          >
            {selectedCards.includes(card) ? (
              <img src={card.imageFlux} alt={card.name} />
            ) : (
              <div className="card-back" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TarotDeck;
