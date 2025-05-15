import { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import axios from 'axios';

const PostInsights = ({ postId }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { connected, insights: wsInsights } = useWebSocket(postId);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8081/api/posts/${postId}/insights`);
        setInsights(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching insights:', error);
        setError('Failed to load insights. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [postId]);

  useEffect(() => {
    if (wsInsights) {
      setInsights(wsInsights);
    }
  }, [wsInsights]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 h-20 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 flex items-center">
          <span className="material-icons mr-2">error_outline</span>
          {error}
        </p>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <span className="material-icons mr-2 text-blue-600">insights</span>
        Post Insights
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <InsightCard 
          label="Views" 
          value={insights.views} 
          icon="visibility"
        />
        <InsightCard 
          label="Unique Viewers" 
          value={insights.uniqueViewers}
          icon="people"
        />
        <InsightCard 
          label="Engagement Rate" 
          value={`${insights.engagementRate.toFixed(1)}%`}
          icon="trending_up"
        />
        <InsightCard 
          label="Total Interactions" 
          value={insights.likeCount + insights.commentCount}
          icon="favorite"
        />
      </div>
    </div>
  );
};

const InsightCard = ({ label, value, icon }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <span className="material-icons text-gray-400 text-lg">{icon}</span>
    </div>
    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
  </div>
);

export default PostInsights;


/* 
import { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import axios from 'axios';

const PostInsights = ({ postId }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { connected, insights: wsInsights } = useWebSocket(postId);

const InsightCard = ({ label, value }) => (
  <div className="bg-white p-3 rounded-md shadow-sm">
    <p className="text-sm text-gray-600">{label}</p>
    <p className="text-xl font-bold text-gray-900">{value}</p>
  </div>
);



export default PostInsights;


