'use client';

import { Box, LinearProgress } from '@mui/material';
import { useEffect, useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 3 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Timer countdown
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      handleSubmit(); // Auto-submit when time is up
    }
    return () => clearInterval(timer);
  }, [timeLeft, timerActive]);
  // Reset timer when questions change
  useEffect(() => {
    if (questions.length > 0) {
      setTimeLeft(60); // Reset to 3 minutes
      setTimerActive(true); // Start timer
    }
  }
  , [questions]);
  // Reset timer when file changes
  useEffect(() => {
    if (file) {
      setTimeLeft(60); // Reset to 3 minutes
      setTimerActive(true); // Start timer
    }
  }
  , [file]);
  // Reset timer when text changes
  useEffect(() => {
    if (text) {
      setTimeLeft(60); // Reset to 3 minutes
      setTimerActive(true); // Start timer
    }
  }
  , [text]);
  // Reset timer when answers are submitted
  useEffect(() => {
    if (submitted) {
      setTimeLeft(60); // Reset to 3 minutes
      setTimerActive(false); // Stop timer
    }
  }
  , [submitted]);
  // Reset timer when answers are shown
  useEffect(() => {
    if (showAnswers) {
      setTimeLeft(60); // Reset to 3 minutes
      setTimerActive(false); // Stop timer
    }
  }
  , [showAnswers]);
  // Reset timer when modal is closed
  useEffect(() => {
    if (!showModal) {
      setTimeLeft(60); // Reset to 3 minutes
      setTimerActive(false); // Stop timer
    }
  }
  , [showModal]);
  // Reset timer when text is cleared
  useEffect(() => {
    if (!text) {
      setTimeLeft(60); // Reset to 3 minutes
      setTimerActive(false); // Stop timer
    }
  }
  , [text]);
  // Reset timer when file is cleared
  useEffect(() => {
    if (!file) {
      setTimeLeft(60); // Reset to 3 minutes
      setTimerActive(false); // Stop timer
    }
  }
  , [file]);

  const handleGenerate = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('text', text);
    if (file) formData.append('file', file);
  
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });
  
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setQuestions(data);
      } else if (Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else {
        console.error('Unexpected response:', data);
        setQuestions([]);
      }
  
      setSelectedAnswers({});
      setShowAnswers(false);
      setShowModal(false);
      setTimeLeft(60); // reset timer
      setTimerActive(true); // start timer
    } catch (err) {
      console.error('Error generating questions:', err);
      setQuestions([]);
    }
  
    setLoading(false);
  };

  
  const handleAnswerSelect = (questionIndex, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-questions.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = () => {
    setShowModal(true);
    setTimerActive(false);
    setTimeLeft(0);
    setSubmitted(true);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setShowAnswers(false);
    setShowModal(false);
    setTimeLeft(60);
    setTimerActive(true);
  };
  

  const score = questions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.answer ? 1 : 0);
  }, 0);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  const handleReset = () => {
    setText('');
    setFile(null);
    setQuestions([]);
    setSelectedAnswers({});
    setSubmitted(false);
    setShowAnswers(false);
    setShowModal(false);
    setTimeLeft(60);
    setTimerActive(false);
  };
  

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 relative text-gray-800">
        {submitted && (
          <div className="absolute top-4 right-4 bg-purple-600 text-white font-bold px-4 py-2 rounded-lg shadow-lg z-50">
            Score: {score} / {questions.length}
          </div>
        )}

      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-md space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">AI Quiz Generator</h1>
        

        {
          file === null && text.trim().length < 100 && (
            <div>
              <p className="text-sm text-gray-600 text-center">
          Generate quiz questions from text or a file. Answer them and check your score!
        </p>
        <p className="text-sm text-gray-600 text-center">
          <span className="font-semibold">Note:</span> You can upload a PDF, DOCX, or TXT file.
        </p>
        <p className="text-sm text-gray-600 text-center">
          <span className="font-semibold">Tip:</span> For best results, provide at least 100 characters of text. Also, if you have a file containing lots of text,
          please divide it into smaller chunks and upload them separately, else the AI may not be able to process it.
        </p>
        <p className="text-sm text-gray-600 text-center">
          <span className="font-semibold">Warning:</span> The timer starts when you generate questions.
        </p>
        <p className="text-sm text-gray-600 text-center">
          <span className="font-semibold">Caution:</span> The timer will stop when you submit your answers.
        </p>
            </div>
          )
        }

        <textarea
          className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="6"
          placeholder="Enter text to generate questions..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
        />

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleGenerate}
            disabled={(text.trim().length < 100 && !file) || loading}
            className={`flex-1 py-3 rounded-md text-white font-semibold transition ${
              (text.trim().length < 100 && !file) || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Generating...' : 'Generate Questions'}
          </button>

          {questions.length > 0 && (
            <>
              <button
                onClick={handleGenerate}
                className="py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md"
              >
                🔄 Regenerate
              </button>

              <button
                onClick={handleDownload}
                className="py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md"
              >
                📥 Download JSON
              </button>

              <button
                onClick={handleReset}
                className="py-3 px-4 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded-md"
              >
                ♻️ Reset
              </button>

            </>
          )}
        </div>

        {questions.length > 0 && (
          <div className="space-y-6">
            {/* <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700 ">
                Progress: {answeredCount} / {questions.length}
              </p>
              <p className="text-sm font-semibold text-red-600">
                Time left: {formatTime(timeLeft)}
              </p>
            </div>

            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div> */}

    <Box sx={{ position: 'sticky', top: 20, zIndex: 40, bgcolor: 'white', p: 2, boxShadow: 2, borderRadius: 2, mb: 2 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14 }}>Progress: {answeredCount} / {questions.length}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'red' }}>Time left: {formatTime(timeLeft)}</span>
      </div>
      <LinearProgress variant="determinate" value={progressPercent} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
    </Box>

            {questions.map((q, index) => {
              const selected = selectedAnswers[index];
              const isCorrect = selected === q.answer;
              return (
                <div key={index} className="bg-gray-50 border p-4 rounded-lg shadow-sm">
                  <p className="font-medium text-gray-800 mb-2">
                    {index + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((option, i) => {
                      const isSelected = selected === option;
                      const showCorrect =
                        showAnswers && option === q.answer ? 'border-green-500 bg-green-100' : '';
                      const isWrong =
                        showAnswers && isSelected && option !== q.answer
                          ? 'border-red-500 bg-red-100'
                          : '';
                      return (
                        <label
                          key={i}
                          className={`block p-2 border rounded-md cursor-pointer text-gray-800 ${
                            isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                          } ${showCorrect} ${isWrong}`}
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            disabled={submitted}
                            value={option}
                            checked={isSelected}
                            onChange={() => handleAnswerSelect(index, option)}
                            className="mr-2"
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg mt-4"
            >
              ✅ Submit
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold text-gray-800">🎉 Your Score</h2>
            <p className="text-lg text-gray-800">
              You got <strong>{score}</strong> out of <strong>{questions.length}</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={() => {
                  setShowAnswers(true)
                  setShowModal(false);
                }
                }
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Show Correct Answers
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Retry
              </button>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 text-sm text-gray-500 underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
