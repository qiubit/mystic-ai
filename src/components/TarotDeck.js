// TarotDeck.js - Component to handle card shuffling and selection animation
import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from 'next-intl';
import { shuffleCards, tarotCards } from "../data/cards";

const TarotDeck = ({ onCardsSelected, spreadType }) => {
  const t = useTranslations('tarotDeck');

  const [deck, setDeck] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [canSelect, setCanSelect] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const deckRef = useRef(null);

  // Number of cards to select based on spread type
  const cardsToSelect =
    spreadType === "single" ? 1 : spreadType === "two-card" ? 2 : 3;

  // Initialize deck with shuffled cards
  useEffect(() => {
    // Start with all cards shuffled
    const allShuffled = shuffleCards();
    // Use all cards
    setDeck(allShuffled);
    setSelectedCards([]);
  }, [spreadType]);

  // Start shuffling animation
  const startShuffling = () => {
    setIsShuffling(true);
    setCanSelect(false);

    // Shuffle animation
    const shuffleInterval = setInterval(() => {
      const allShuffled = shuffleCards();
      setDeck(allShuffled);
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

  // Handle scroll navigation
  const scrollLeft = () => {
    if (deckRef.current) {
      deckRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (deckRef.current) {
      deckRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const locale = window.location.pathname.split('/')[1];

  return (
    <div className="tarot-deck-container">
      {/* Shuffling button - only show before shuffling starts */}
      {!isShuffling && !canSelect && selectedCards.length === 0 && (
        <button className="shuffle-button" onClick={startShuffling}>
          {t('shuffle')}
        </button>
      )}

      {/* Status message */}
      {isShuffling && <div className="status-message">{t('shuffling')}</div>}
      {canSelect && (
        <div className="status-message">
          {t('selectCards', {
            count: cardsToSelect,
            plural: (locale === 'pl' ? cardsToSelect > 1 ? "y" : "ę" : cardsToSelect > 1 ? "s" : "")
          })}
        </div>
      )}

      {/* Scrollable card deck display */}
      <div className="deck-scroll-container">
        <button className="deck-nav-button deck-prev" onClick={scrollLeft}>
          ←
        </button>
        <div className="card-deck" ref={deckRef}>
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
        <button className="deck-nav-button deck-next" onClick={scrollRight}>
          →
        </button>
      </div>
    </div>
  );
};

export default TarotDeck;
