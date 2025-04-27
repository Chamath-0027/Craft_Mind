import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
/*const ScoreDashboard = ({ userId, showHistory = false }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState('');*/ 

const ScoreDashboard = ({ userId, showHistory = false }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState('');

  const fetchAssessments = async () => {
    try {
      const endpoint = showHistory 
        ? `http://localhost:8081/api/skills/history/${userId}`
        : `http://localhost:8081/api/skills/latest/${userId}`;
      console.log("Fetching from endpoint:", endpoint);
      
      const response = await axios.get(endpoint);
      console.log("Assessment data received:", response.data);
      
      // For the history endpoint, the data should already be an array
      // For latest endpoint, wrap single result in array
      const assessments = showHistory ? response.data : [response.data];
      
      // Validate and process the assessment data
      const validAssessments = assessments.filter(assessment => {
        return assessment && assessment.scores && Object.keys(assessment.scores).length > 0;
      });

      setAssessments(validAssessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAssessments();
    }
  }, [userId, showHistory]);

  const handleSkillSelect = async (skill) => {
    try {
      await axios.post(`http://localhost:8081/api/skills/select-favorite`, {
        userId,
        skill
      });
      setSelectedSkill(skill);
    } catch (err) {
      console.error('Failed to select favorite skill:', err);
    }
  };
//SkillCard//
  const renderSkillCard = (skill, score) => (
    <div className="bg-white p-4 rounded-lg shadow">
      <h4 className="font-semibold text-lg mb-2">{skill}</h4>
      <div className="text-sm text-gray-600">Score: {score}</div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => handleSkillSelect(skill)}
          className={`px-3 py-1 rounded ${
            selectedSkill === skill
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-100 text-indigo-700'
          }`}
        >
          Select
        </button>
        <Link
          to={`/explore/${skill.toLowerCase()}`}
          className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
        >
          Explore
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return <div className="text-center py-4">Loading assessment data...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {assessments.length === 0 && !loading && !error && (
        <div className="bg-facebook-card p-4 rounded-lg border border-facebook-divider">
          <p className="text-facebook-text-secondary">No assessment data found. Try taking the quiz again.</p>
        </div>
      )}
      
      {assessments.map((assessment, index) => (
        <div key={index} className="bg-facebook-card rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-facebook-primary">
              Quiz Assessment Results
            </h3>
            <span className="text-sm text-facebook-text-secondary">
              {new Date(assessment.completedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Overall Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-facebook-hover/10 p-4 rounded-lg border border-facebook-divider">
              <div className="text-facebook-text-primary font-medium">Total Score</div>
              <div className="text-3xl font-bold text-facebook-primary">
                {assessment.totalScore}
                <span className="text-sm font-normal ml-2 text-facebook-text-secondary">points</span>
              </div>
            </div>
            
            <div className="bg-facebook-hover/10 p-4 rounded-lg border border-facebook-divider">
              <div className="text-facebook-text-primary font-medium">Correct Answers</div>
              <div className="text-3xl font-bold text-facebook-primary">{assessment.correctAnswers}</div>
            </div>

            <div className="bg-facebook-hover/10 p-4 rounded-lg border border-facebook-divider">
              <div className="text-facebook-text-primary font-medium">Wrong Answers</div>
              <div className="text-3xl font-bold text-facebook-primary">{assessment.wrongAnswers}</div>
            </div>
          </div>

          {/* Category-wise Scores */}
          <div className="mt-6">
            <h4 className="font-medium text-facebook-text-primary mb-4">Category Performance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(assessment.scores || {}).map(([category, score]) => (
                <div key={category} className="bg-facebook-hover/10 p-4 rounded-lg border border-facebook-divider">
                  <div className="font-medium text-facebook-text-primary">{category}</div>
                  <div className="text-2xl font-bold text-facebook-primary">
                    {score} <span className="text-sm font-normal text-facebook-text-secondary">points</span>
                  </div>
                  <div className="text-sm text-facebook-text-secondary">
                    {assessment.categoryStats?.[category] || 0} correct answers
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Skills Section */}
          {assessment.topSkills && assessment.topSkills.length > 0 && (
            <div>
              <h4 className="font-medium text-facebook-text-primary mb-3">Recommended Skills</h4>
              <div className="flex flex-wrap gap-2">
                {assessment.topSkills.map((skill, idx) => (
                  <div key={idx} className="flex gap-2">
                    <button
                      onClick={() => handleSkillSelect(skill)}
                      className={`px-4 py-2 rounded-full transition ${
                        selectedSkill === skill
                          ? 'bg-facebook-primary text-white'
                          : 'bg-facebook-hover/10 text-facebook-text-primary hover:bg-facebook-hover/20'
                      }`}
                    >
                      {skill}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ScoreDashboard;
