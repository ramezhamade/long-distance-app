import { useState } from 'react';

function PlayerSelector({ onSelectPlayer, onClose }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const handleSelect = (playerName) => {
    setSelectedPlayer(playerName);
    localStorage.setItem('playerName', playerName);
    onSelectPlayer(playerName);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content player-selector">
        <h2>Who are you?</h2>
        <p>Select your profile to continue</p>
        <div className="player-buttons">
          <button
            className="player-button ramez"
            onClick={() => handleSelect('Ramez')}
          >
            <span className="player-emoji">👨</span>
            <span className="player-name">Ramez</span>
          </button>
          <button
            className="player-button layan"
            onClick={() => handleSelect('Layan')}
          >
            <span className="player-emoji">👩</span>
            <span className="player-name">Layan</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlayerSelector;
