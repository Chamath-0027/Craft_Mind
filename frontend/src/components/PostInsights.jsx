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
      } catch (error) {
        console.error('Error fetching insights:', error);
        setError('Failed to load insights');
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

  if (loading) return <div className="text-center py-4">Loading insights...</div>;
  if (error) return <div className="text-red-500 py-4">{error}</div>;
  if (!insights) return null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-4">Post Insights</h3>
      <div className="grid grid-cols-2 gap-4">
        <InsightCard label="Views" value={insights.views} />
        <InsightCard label="Unique Viewers" value={insights.uniqueViewers} />
        <InsightCard label="Engagement Rate" value={`${insights.engagementRate.toFixed(1)}%`} />
        <InsightCard label="Total Interactions" value={insights.likeCount + insights.commentCount} />
      </div>
    </div>
  );
};

const InsightCard = ({ label, value }) => (
  <div className="bg-white p-3 rounded-md shadow-sm">
    <p className="text-sm text-gray-600">{label}</p>
    <p className="text-xl font-bold text-gray-900">{value}</p>
  </div>
);



export default PostInsights;


