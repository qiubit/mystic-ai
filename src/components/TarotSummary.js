// TarotSummary.js - Component to render a tarot reading summary from JSON
import React from "react";

const TarotSummary = ({ data }) => {
  if (!data || !data.cards) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-white bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
        No reading data available
      </div>
    );
  }

  console.log(data);

  return (
    <div
      className="relative w-full md:w-11/12 max-w-4xl mx-auto my-8 p-8 bg-black/40 backdrop-blur-lg rounded-2xl shadow-lg shadow-purple-800/50 overflow-hidden z-10
                    before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27 viewBox=%270 0 100 100%27%3E%3Cpath fill=%27%23ffffff10%27 d=%27M11 18l-10 30L45 80l44-40-10-20-28 10z%27/%3E%3C/svg%3E')] before:opacity-5 before:-z-10"
    >
      <a href="/" className="no-underline">
        <h1 className="text-center font-black mt-0 text-2xl md:text-3xl bg-gradient-to-r from-[#f8bbd0] via-[#b39ddb] to-[#90caf9] bg-clip-text text-transparent uppercase tracking-wider mb-4">
          ✨ MysticAI Tarot Reading ✨
        </h1>
      </a>
      <div className="text-center text-sm text-[#d8c6ff] tracking-widest mb-10">
        {data.query || "Your Tarot Reading"}
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-2 mb-8">
        {data.cards.map((card, index) => (
          <div
            key={index}
            className="flex flex-col items-center relative md:w-1/3"
          >
            <div
              className={`w-36 h-60 flex justify-center items-center mb-4 rounded-lg shadow-lg shadow-black/40 overflow-hidden
                            ${
                              index === 0
                                ? "bg-gradient-to-b from-[#151626] to-[#000114] -rotate-3"
                                : index === 1
                                ? "bg-gradient-to-b from-[#25182e] to-[#160a26] rotate-0"
                                : "bg-gradient-to-b from-[#2c0d0d] to-[#1a0505] rotate-3"
                            }
                            transition-transform duration-300`}
            >
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full max-w-[90%] max-h-[90%] object-cover rounded opacity-80"
              />
            </div>
            <div className="text-center">
              <div className="font-bold mb-2 text-lg text-[#f5da9c] px-4 mt-4">
                {card.title}
              </div>
              <div className="text-sm leading-relaxed text-center text-gray-200 px-8">
                {card.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center p-5 text-lg italic text-[#f5da9c]">
        {data.summary}
      </div>

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-purple-900/30">
        <a href="/" className="no-underline">
          <div className="text-sm font-bold text-[#b39ddb] hover:underline">
            MysticAI
          </div>
        </a>
        <a href="/" className="no-underline">
          <button className="bg-gradient-to-r from-[#9c27b0] to-[#673ab7] text-white border-none py-2 px-4 rounded-full text-xs cursor-pointer hover:shadow-lg hover:shadow-purple-500/20 transition-shadow">
            Get Your Reading Today
          </button>
        </a>
      </div>

      {/* Stars background effect */}
      {Array.from({ length: 50 }).map((_, i) => {
        const size = Math.random() * 2 + 1;
        return (
          <div
            key={i}
            className="absolute rounded-full bg-white -z-10"
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
