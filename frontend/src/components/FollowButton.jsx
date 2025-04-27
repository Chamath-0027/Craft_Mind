import { useState, useEffect } from 'react';
import axios from 'axios';

const FollowButton = ({ userId, followerId, onRefreshCounts }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFollowStatus();
  }, [userId, followerId]);

  const checkFollowStatus = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8081/api/users/${userId}/follow-status?followerId=${followerId}`
      );
      setIsFollowing(response.data.following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleToggleFollow = async () => {
    if (!followerId || loading) return;

    setLoading(true);
    try {
      if (isFollowing) {
        await axios.delete(
          `http://localhost:8081/api/users/${userId}/unfollow?followerId=${followerId}`
        );
        setIsFollowing(false);
      } else {
        await axios.post(
          `http://localhost:8081/api/users/${userId}/follow?followerId=${followerId}`
        );
        setIsFollowing(true);
      }
      // Call the refresh callback
      if (onRefreshCounts) {
        onRefreshCounts();
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading || userId === followerId}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        isFollowing
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton;
