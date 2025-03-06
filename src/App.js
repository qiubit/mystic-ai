import React from 'react';
import TarotChat from './components/TarotChat';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>✨ Mystic AI ✨</h1>
        <p>Tarot Readings Powered by Llama-3.3-70B via Together.ai</p>
      </header>
      <main>
        <TarotChat />
      </main>
    </div>
  );
}

export default App;