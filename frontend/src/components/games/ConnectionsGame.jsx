import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function ConnectionsGame({ getAuthHeaders }) {
  const [gameState, setGameState] = useState('loading');
  const [groups, setGroups] = useState([]);
  const [words, setWords] = useState([]);
  const [selected, setSelected] = useState([]);
  const [solved, setSolved] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [myResult, setMyResult] = useState(null);
  const [opponentResult, setOpponentResult] = useState(null);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTodaysPuzzle();
  }, []);

  const fetchTodaysPuzzle = async () => {
    try {
      const response = await axios.get(`${API_URL}/games/connections/today`, {
        headers: getAuthHeaders(),
      });

      setGroups(response.data.groups);

      if (response.data.myResult) {
        setMyResult(response.data.myResult);
        setMistakes(response.data.myResult.mistakes);
        setGameState('completed');
      } else {
        const allWords = response.data.groups.flatMap(g => g.words);
        setWords(shuffleArray(allWords));
        setGameState('playing');
      }

      setOpponentResult(response.data.opponentResult);
      setWinner(response.data.winner);
    } catch (error) {
      console.error('Error fetching puzzle:', error);
      if (error.response?.status === 400 && error.response?.data?.message) {
        setMessage(error.response.data.message);
        setGameState('no_more_puzzles');
      } else {
        setGameState('error');
      }
    }
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const toggleWord = (word) => {
    if (solved.some(g => g.words.includes(word))) return;

    if (selected.includes(word)) {
      setSelected(selected.filter(w => w !== word));
    } else if (selected.length < 4) {
      setSelected([...selected, word]);
    }
  };

  const handleSubmit = () => {
    if (selected.length !== 4) return;

    const matchedGroup = groups.find(g =>
      selected.every(w => g.words.includes(w)) && g.words.every(w => selected.includes(w))
    );

    if (matchedGroup) {
      setSolved([...solved, matchedGroup]);
      setWords(words.filter(w => !selected.includes(w)));
      setSelected([]);

      if (solved.length + 1 === groups.length) {
        completeGame();
      }
    } else {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setSelected([]);

      if (newMistakes >= 4) {
        completeGame(true);
      }
    }
  };

  const completeGame = async (failed = false) => {
    try {
      await axios.post(`${API_URL}/games/connections/submit`, {
        mistakes: failed ? 4 : mistakes,
        completed: !failed
      }, {
        headers: getAuthHeaders(),
      });

      setGameState('completed');
      setMyResult({ mistakes: failed ? 4 : mistakes, completed: !failed });
      await fetchTodaysPuzzle();
    } catch (error) {
      console.error('Error submitting:', error);
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
    <div className="connections-game">
      <h2>Daily Connections</h2>
      <p className="game-instructions">Find 4 groups of 4 related words!</p>

      <div className="mistakes-counter">
        Mistakes: {mistakes}/4 {[...Array(4)].map((_, i) => (
          <span key={i} className={i < mistakes ? 'mistake-dot filled' : 'mistake-dot'}>●</span>
        ))}
      </div>

      {solved.length > 0 && (
        <div className="solved-groups">
          {solved.map((group, i) => (
            <div key={i} className={`solved-group difficulty-${group.difficulty}`}>
              <div className="group-category">{group.category}</div>
              <div className="group-words">{group.words.join(', ')}</div>
            </div>
          ))}
        </div>
      )}

      {gameState === 'playing' && (
        <>
          <div className="connections-grid">
            {words.map((word, i) => (
              <button
                key={i}
                className={`connection-word ${selected.includes(word) ? 'selected' : ''}`}
                onClick={() => toggleWord(word)}
              >
                {word}
              </button>
            ))}
          </div>

          <div className="connections-actions">
            <button onClick={() => setSelected([])}>Clear</button>
            <button
              onClick={() => setWords(shuffleArray(words))}
            >
              Shuffle
            </button>
            <button
              onClick={handleSubmit}
              disabled={selected.length !== 4}
              className="submit-btn"
            >
              Submit
            </button>
          </div>
        </>
      )}

      {gameState === 'completed' && myResult && (
        <div className="game-result">
          <h3>Your Result</h3>
          <p>Mistakes: {myResult.mistakes}/4</p>
          <p>{myResult.completed ? '✅ Completed!' : '❌ Failed'}</p>

          {opponentResult ? (
            <div className="opponent-result">
              <h3>Opponent's Result</h3>
              <p>Mistakes: {opponentResult.mistakes}/4</p>
              <p>{opponentResult.completed ? '✅ Completed!' : '❌ Failed'}</p>

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

export default ConnectionsGame;
