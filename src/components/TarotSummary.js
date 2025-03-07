// TarotSummary.js - Component to render a tarot reading summary from JSON
import React from "react";

const TarotSummary = ({ data }) => {
  if (!data || !data.cards) {
    return <div className="summary-loading">No reading data available</div>;
  }

  console.log(data);

  return (
    <div className="container">
      <a href="/" style={{ textDecoration: "none" }}>
        <h1 className="mystic-logo">✨ MysticAI Tarot Reading ✨</h1>
      </a>
      <div className="subtitle">{data.query || "Your Tarot Reading"}</div>

      <div className="summary-cards">
        {data.cards.map((card, index) => (
          <div className="summary-card" key={index}>
            <div className="card-image">
              <img src={card.image} alt={card.title} />
            </div>
            <div className="card-content">
              <div className="card-title">{card.title}</div>
              <div className="card-desc">{card.content}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="summary-message">{data.summary}</div>

      <div className="summary-footer">
        <a href="/" style={{ textDecoration: "none" }}>
          <div className="logo">MysticAI</div>
        </a>
        <a href="/" style={{ textDecoration: "none" }}>
          <button className="cta">Get Your Reading Today</button>
        </a>
      </div>

      {/* Stars background effect */}
      {Array.from({ length: 50 }).map((_, i) => {
        const size = Math.random() * 2 + 1;
        return (
          <div
            key={i}
            className="star"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        );
      })}
    </div>
  );
};

export default TarotSummary;
