import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function WordleGame({ getAuthHeaders }) {
  const [gameState, setGameState] = useState('loading');
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [myResult, setMyResult] = useState(null);
  const [opponentResult, setOpponentResult] = useState(null);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    fetchTodaysPuzzle();
  }, []);

  const fetchTodaysPuzzle = async () => {
    try {
      const response = await axios.get(`${API_URL}/games/wordle/today`, {
        headers: getAuthHeaders(),
      });

      if (response.data.myResult) {
        setMyResult(response.data.myResult);
        setGuesses(response.data.myResult.attempts || []);
        setGameState('completed');
      } else {
        setGameState('playing');
      }

      setOpponentResult(response.data.opponentResult);
      setWinner(response.data.winner);
    } catch (error) {
      console.error('Error fetching puzzle:', error);
      setGameState('error');
    }
  };

  const handleSubmitGuess = async () => {
    if (currentGuess.length !== 5) return;

    const newGuesses = [...guesses, currentGuess.toUpperCase()];
    setGuesses(newGuesses);
    setCurrentGuess('');

    // Check if won or used all attempts
    const won = false; // We don't validate the word on frontend
    const completed = newGuesses.length >= 6;

    if (completed) {
      try {
        await axios.post(`${API_URL}/games/wordle/submit`, {
          guesses: newGuesses.length,
          won,
          attempts: newGuesses
        }, {
          headers: getAuthHeaders(),
        });

        setGameState('completed');
        setMyResult({ guesses: newGuesses.length, won, attempts: newGuesses });
        await fetchTodaysPuzzle();
      } catch (error) {
        console.error('Error submitting:', error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (gameState !== 'playing') return;

    if (e.key === 'Enter') {
      handleSubmitGuess();
    } else if (e.key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + e.key.toUpperCase());
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentGuess, gameState]);

  if (gameState === 'loading') {
    return <div className="game-loading">Loading puzzle...</div>;
  }

  if (gameState === 'error') {
    return <div className="game-error">Error loading puzzle. Please try again.</div>;
  }

  return (
    <div className="wordle-game">
      <h2>Daily Wordle</h2>
      <p className="game-instructions">Guess the 5-letter word in 6 tries!</p>

      <div className="wordle-board">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="wordle-row">
            {[...Array(5)].map((_, j) => {
              const guess = guesses[i];
              const letter = guess ? guess[j] : (i === guesses.length ? currentGuess[j] : '');
              return (
                <div key={j} className="wordle-cell">
                  {letter || ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {gameState === 'playing' && (
        <div className="wordle-input">
          <input
            type="text"
            value={currentGuess}
            onChange={(e) => setCurrentGuess(e.target.value.toUpperCase().slice(0, 5))}
            maxLength={5}
            placeholder="Type your guess..."
            autoFocus
          />
          <button onClick={handleSubmitGuess} disabled={currentGuess.length !== 5}>
            Submit
          </button>
        </div>
      )}

      {gameState === 'completed' && myResult && (
        <div className="game-result">
          <h3>Your Result</h3>
          <p>Completed in {myResult.guesses} guesses</p>

          {opponentResult ? (
            <div className="opponent-result">
              <h3>Opponent's Result</h3>
              <p>Completed in {opponentResult.guesses} guesses</p>

              {winner && (
                <div className={`winner-banner ${winner === 'tie' ? 'tie' : ''}`}>
                  {winner === 'tie' ? '🤝 Tie!' : `🏆 ${winner} Wins!`}
                </div>
              )}
            </div>
          ) : (
            <div className="waiting">⏳ Waiting for opponent...</div>
          )}
        </div>
      )}
    </div>
  );
}

export default WordleGame;
