import React from 'react';
import TarotChat from './components/TarotChat';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>✨ Mystic AI ✨</h1>
        <p>Tarot Readings Powered by AI</p>
      </header>
      <main>
        <TarotChat />
      </main>
      <footer>
        <p>Created for hackathon purposes. Card images are placeholders.</p>
      </footer>
    </div>
  );
}

export default App;