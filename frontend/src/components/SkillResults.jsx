import React from 'react';
import { Link } from 'react-router-dom';

const SkillResults = ({ results, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">Quiz Results</h2>
        
        <div className="space-y-6">
          {/* Score Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Correct Answers Card */}
            <div className="bg-facebook-card p-4 rounded-lg border border-facebook-divider">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-facebook-text-primary font-medium">Correct Answers</div>
                  <div className="text-2xl font-bold text-facebook-primary">{results.correctAnswers}</div>
                </div>
                <div className="bg-facebook-hover/10 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          
            {/* Wrong Answers Card */}
            <div className="bg-facebook-card p-4 rounded-lg border border-facebook-divider">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-facebook-text-primary font-medium">Wrong Answers</div>
                  <div className="text-2xl font-bold text-facebook-primary">{results.wrongAnswers}</div>
                </div>
                <div className="bg-facebook-hover/10 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Score Card */}
            <div className="bg-facebook-card p-4 rounded-lg border border-facebook-divider">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-facebook-text-primary font-medium">Total Score</div>
                  <div className="text-3xl font-bold text-facebook-primary">{results.totalScore}</div>
                </div>
                <div className="bg-facebook-hover/10 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Skills Section */}
          <div className="bg-facebook-card p-6 rounded-lg border border-facebook-divider">
            <h3 className="text-xl font-semibold mb-4 text-facebook-text-primary">Recommended Skills:</h3>
            <div className="space-y-4">
              {results.topSkills.map((skill, index) => (
                <div key={index} className="bg-facebook-hover/10 p-4 rounded-lg border border-facebook-divider">
                  <h4 className="font-bold text-lg mb-2 text-facebook-primary">
                    {index + 1}. {skill}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/explore/${skill.toLowerCase()}`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                      Explore {skill}
                    </Link>
                    <Link
                      to={`/tutorials/${skill.toLowerCase()}`}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                    >
                      Learn {skill}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
/*  <div className="bg-facebook-card p-4 rounded-lg border border-facebook-divider">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-facebook-text-primary font-medium">Wrong Answers</div>
                  <div className="text-2xl font-bold text-facebook-primary">{results.wrongAnswers}</div>
                </div>
                <div className="bg-facebook-hover/10 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div> */
export default SkillResults;
