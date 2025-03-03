import React, { useState } from 'react';
import { setApiKey } from '../services/api';

const ApiKeyForm = ({ onApiKeySet }) => {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!key.trim()) {
      setError('Please enter a valid API key');
      return;
    }

    try {
      setApiKey(key);
      setSaved(true);
      setError('');
      if (onApiKeySet) {
        onApiKeySet(true);
      }
    } catch (err) {
      setError('Failed to save API key');
    }
  };

  return (
    <div className="api-key-form">
      <h3>Set Together.ai API Key</h3>
      <p>To use the AI tarot reading functionality, please enter your Together.ai API key.</p>
      <p>You can get one at <a href="https://together.ai" target="_blank" rel="noopener noreferrer">https://together.ai</a></p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter your Together.ai API key"
          className="api-key-input"
        />
        <button type="submit" className="save-key-button">
          Save Key
        </button>
      </form>
      
      {saved && <p className="success-message">API key saved successfully!</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ApiKeyForm;