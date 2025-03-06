import React from 'react';
import TarotChat from './components/TarotChat';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h2 onClick={() => window.location.reload()}>✨ Mystic AI ✨</h2>
      </header>
      <main>
        <TarotChat />
      </main>
    </div>
  );
}

export default App;