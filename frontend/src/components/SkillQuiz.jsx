import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

const SkillQuiz = ({ onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUser();
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.get('http://localhost:8081/api/skills/quiz');
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setQuestions(response.data);
      } else {
        throw new Error('No questions available');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(error.response?.data?.message || 'Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  /*  const handleAnswer = (answer) => {
    // Use the question ID as the key instead of the current question index
    const questionId = questions[currentQuestion].id;
    setAnswers({ ...answers, [questionId]: answer });
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuizs();
    }
  };*/ 
  const handleAnswer = (answer) => {
    // Use the question ID as the key instead of the current question index
    const questionId = questions[currentQuestion].id;
    setAnswers({ ...answers, [questionId]: answer });
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `http://localhost:8081/api/skills/assess?userId=${currentUser.id}`,
        answers
      );
      // Log the response data to verify the scores
      console.log('Quiz submission response:', response.data);
      onComplete(response.data);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white/30 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-facebook-primary border-t-transparent"></div>
          <span className="ml-2 text-black">Loading quiz questions...</span>
        </div>
      </div>
    );
  }

  if (error || !questions.length) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white/30 backdrop-blur-md rounded-lg shadow-lg border border-white/20">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'No questions available'}</p>
          <button 
            onClick={fetchQuestions}
            className="px-6 py-2 bg-facebook-primary text-white rounded hover:bg-facebook-hover transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[#ffffff] backdrop-blur-md rounded-lg shadow-lg border border-white/20">
      <div className="mb-8">
        <div className="text-sm text-black mb-2">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        <div className="h-2 bg-facebook-hover/10 rounded">
          <div 
            className="h-2 bg-facebook-primary rounded"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6 text-black">{questions[currentQuestion]?.question}</h2>

      <div className="space-y-4">
        {questions[currentQuestion]?.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className="w-full p-4 text-left border border-facebook-divider rounded-lg text-black hover:bg-facebook-hover/10 transition-colors"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SkillQuiz;
