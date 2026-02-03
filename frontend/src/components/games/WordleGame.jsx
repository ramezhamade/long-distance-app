import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
console.log('[Wordle] API_URL configured as:', API_URL);

function WordleGame({ getAuthHeaders }) {
  const [gameState, setGameState] = useState('loading');
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [targetWord, setTargetWord] = useState('');
  const [validWords, setValidWords] = useState([]);
  const [myResult, setMyResult] = useState(null);
  const [opponentResult, setOpponentResult] = useState(null);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTodaysPuzzle();
  }, []);

  const fetchTodaysPuzzle = async () => {
    console.log('[Wordle Frontend] Fetching from:', `${API_URL}/games/wordle/today`);
    try {
      const response = await axios.get(`${API_URL}/games/wordle/today`, {
        headers: getAuthHeaders(),
      });
      console.log('[Wordle Frontend] Response:', response.data);

      setTargetWord(response.data.word);
      setValidWords(response.data.validWords || []);

      if (response.data.myResult) {
        setMyResult(response.data.myResult);
        setGuesses(response.data.myResult.attempts || []);
        const evals = (response.data.myResult.attempts || []).map(guess =>
          evaluateGuess(guess, response.data.word)
        );
        setEvaluations(evals);
        setGameState('completed');
      } else {
        setGameState('playing');
      }

      setOpponentResult(response.data.opponentResult);
      setWinner(response.data.winner);
    } catch (error) {
      console.error('[Wordle Frontend] Error fetching puzzle:', error);
      console.error('[Wordle Frontend] Error response:', error.response);
      console.error('[Wordle Frontend] Error message:', error.message);
      if (error.response?.status === 400 && error.response?.data?.message) {
        setMessage(error.response.data.message);
        setGameState('no_more_puzzles');
      } else {
        setGameState('error');
      }
    }
  };

  const evaluateGuess = (guess, word) => {
    const result = Array(5).fill('absent');
    const wordLetters = word.split('');
    const guessLetters = guess.split('');
    const letterCounts = {};

    wordLetters.forEach(letter => {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    });

    guessLetters.forEach((letter, i) => {
      if (letter === wordLetters[i]) {
        result[i] = 'correct';
        letterCounts[letter]--;
      }
    });

    guessLetters.forEach((letter, i) => {
      if (result[i] === 'absent' && letterCounts[letter] > 0) {
        result[i] = 'present';
        letterCounts[letter]--;
      }
    });

    return result;
  };

  const handleSubmitGuess = async () => {
    if (currentGuess.length !== 5) {
      setMessage('Word must be 5 letters');
      return;
    }

    const upperGuess = currentGuess.toUpperCase();

    // Allow any 5-letter word as a guess

    const evaluation = evaluateGuess(upperGuess, targetWord);
    const newGuesses = [...guesses, upperGuess];
    const newEvaluations = [...evaluations, evaluation];

    setGuesses(newGuesses);
    setEvaluations(newEvaluations);
    setCurrentGuess('');
    setMessage('');

    const won = upperGuess === targetWord;
    const isGameOver = won || newGuesses.length >= 6;

    if (won) {
      setMessage('🎉 You won!');
    } else if (newGuesses.length >= 6) {
      setMessage(`Game Over! The word was ${targetWord}`);
    }

    if (isGameOver) {
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

  const handleKeyDown = (e) => {
    if (gameState !== 'playing') return;

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitGuess();
    }
  };

  if (gameState === 'loading') {
    return <div className="game-loading">Loading puzzle...</div>;
  }

  if (gameState === 'error') {
    return <div className="game-error">Error loading puzzle. Please try again.</div>;
  }

  if (gameState === 'no_more_puzzles') {
    return (
      <div className="game-complete">
        <h2>🎉 Congratulations!</h2>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div className="wordle-game">
      <h2>🟩 Daily Wordle</h2>
      <p className="game-instructions">Guess the 5-letter word in 6 tries!</p>

      {message && <div className="wordle-message">{message}</div>}

      <div className="wordle-board">
        {[...Array(6)].map((_, rowIndex) => (
          <div key={rowIndex} className="wordle-row">
            {[...Array(5)].map((_, colIndex) => {
              const guess = guesses[rowIndex];
              const evaluation = evaluations[rowIndex];
              const isCurrentRow = rowIndex === guesses.length && gameState === 'playing';
              const letter = guess
                ? guess[colIndex]
                : (isCurrentRow ? currentGuess[colIndex] : '');

              const cellClass = guess && evaluation
                ? `wordle-cell ${evaluation[colIndex]}`
                : 'wordle-cell';

              return (
                <div key={colIndex} className={cellClass}>
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
            onChange={(e) => {
              setCurrentGuess(e.target.value.toUpperCase().slice(0, 5));
              setMessage('');
            }}
            onKeyDown={handleKeyDown}
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
          <p>{myResult.won ? '🎉 Won' : '😔 Lost'} in {myResult.guesses} guesses</p>

          {opponentResult ? (
            <div className="opponent-result">
              <h3>Opponent's Result</h3>
              <p>{opponentResult.won ? '🎉 Won' : '😔 Lost'} in {opponentResult.guesses} guesses</p>

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
