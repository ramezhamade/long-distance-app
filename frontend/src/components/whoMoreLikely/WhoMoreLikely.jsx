import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function WhoMoreLikely({ getAuthHeaders, playerName }) {
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [myAnswer, setMyAnswer] = useState(null);
  const [opponentAnswer, setOpponentAnswer] = useState(null);
  const [bothAnswered, setBothAnswered] = useState(false);
  const [allAnswered, setAllAnswered] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (playerName) {
      fetchNextQuestion();
      fetchHistory();
    }
  }, [playerName]);

  const fetchNextQuestion = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching question from:', `${API_URL}/who-more-likely/next`);
      const response = await axios.get(`${API_URL}/who-more-likely/next`, {
        headers: getAuthHeaders(),
      });
      console.log('Question data:', response.data);

      if (response.data.allAnswered) {
        setAllAnswered(true);
      } else {
        setCurrentQuestion(response.data.question);
        setMyAnswer(response.data.myAnswer);
        setOpponentAnswer(response.data.opponentAnswer);
        setBothAnswered(response.data.bothAnswered);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/who-more-likely/history`, {
        headers: getAuthHeaders(),
      });
      // Filter to only show disagreements
      const disagreements = response.data.filter(item => item.disagreed);
      setHistory(disagreements);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleAnswer = async (answer) => {
    try {
      await axios.post(`${API_URL}/who-more-likely/answer`, {
        questionId: currentQuestion.id,
        answer
      }, {
        headers: getAuthHeaders(),
      });

      setMyAnswer(answer);
      // Fetch again to check if opponent also answered
      await fetchNextQuestion();
      await fetchHistory(); // Refresh history
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleNext = () => {
    fetchNextQuestion();
  };

  if (loading) {
    return <div className="game-loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="game-error">
        <p>Error loading questions</p>
        <button onClick={fetchNextQuestion} className="retry-btn">Retry</button>
        <p style={{fontSize: '0.8rem', marginTop: '1rem'}}>Error: {error}</p>
      </div>
    );
  }

  if (allAnswered) {
    return (
      <div className="who-more-likely">
        <h2>Who's More Likely To</h2>
        <div className="all-answered">
          <h3>🎉 You've answered all questions!</h3>
          <p>More questions coming soon...</p>
        </div>
        
        {history.length > 0 && (
          <div className="history-section">
            <h3>Questions You Disagreed On ({history.length})</h3>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.question.id} className="history-item">
                  <div className={`category-badge ${item.question.category}`}>
                    {item.question.category}
                  </div>
                  <p className="history-question">{item.question.text}</p>
                  <div className="history-answers">
                    <span className="history-answer">Ramez: <strong>{item.responses.Ramez}</strong></span>
                    <span className="vs">vs</span>
                    <span className="history-answer">Layan: <strong>{item.responses.Layan}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="game-loading">Loading question...</div>;
  }

  if (!playerName) {
    return <div className="game-error">Please select a player first</div>;
  }

  const otherPlayer = playerName === 'Ramez' ? 'Layan' : 'Ramez';

  return (
    <div className="who-more-likely">
      <h2>Who's More Likely To</h2>

      <div className="question-card">
        <div className={`category-badge ${currentQuestion.category}`}>
          {currentQuestion.category}
        </div>

        <h3 className="question-text">{currentQuestion.text}</h3>

        {!myAnswer ? (
          <div className="answer-buttons">
            <button
              className="answer-btn player1"
              onClick={() => handleAnswer('Ramez')}
            >
              Ramez
            </button>
            <button
              className="answer-btn player2"
              onClick={() => handleAnswer('Layan')}
            >
              Layan
            </button>
          </div>
        ) : (
          <div className="answer-result">
            <p className="my-answer">
              You picked: <strong>{myAnswer}</strong>
            </p>

            {bothAnswered ? (
              <div className="comparison">
                <p className="opponent-answer">
                  {otherPlayer} picked: <strong>{opponentAnswer}</strong>
                </p>

                {myAnswer === opponentAnswer ? (
                  <div className="result-message agree">
                    <span className="result-icon">🤝</span>
                    <p>You both agree!</p>
                  </div>
                ) : (
                  <div className="result-message disagree">
                    <span className="result-icon">🤔</span>
                    <p>You disagree!</p>
                  </div>
                )}

                <button className="next-btn" onClick={handleNext}>
                  Next Question →
                </button>
              </div>
            ) : (
              <div className="waiting-opponent">
                <p>⏳ Waiting for {otherPlayer} to answer...</p>
                <button className="next-btn" onClick={handleNext}>
                  Skip to Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="history-section">
          <button 
            className="toggle-history-btn" 
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? '▼' : '▶'} Questions You Disagreed On ({history.length})
          </button>
          
          {showHistory && (
            <div className="history-list">
              {history.map((item) => (
                <div key={item.question.id} className="history-item">
                  <div className={`category-badge ${item.question.category}`}>
                    {item.question.category}
                  </div>
                  <p className="history-question">{item.question.text}</p>
                  <div className="history-answers">
                    <span className="history-answer">Ramez: <strong>{item.responses.Ramez}</strong></span>
                    <span className="vs">vs</span>
                    <span className="history-answer">Layan: <strong>{item.responses.Layan}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WhoMoreLikely;
