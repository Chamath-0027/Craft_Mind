import { useState, useEffect } from 'react';
import { likePost, unlikePost, getLikeCount } from '../services/api';
import useWebSocket from '../hooks/useWebSocket';

const LikeButton = ({ postId, initialLikeCount = 0, userId, onLikeUpdate, compact = false }) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!postId || !userId) return;
      try {
        const response = await getLikeCount(postId, userId);
        setLikeCount(response.likeCount);
        setIsLiked(response.hasLiked);
        setError(null);
      } catch (error) {
        if (error.response?.status === 404) {
          setError('Post not available');
          setLikeCount(0);
          setIsLiked(false);
        }
      }
    };

    checkLikeStatus();
  }, [postId, userId]);

  const handleToggleLike = async () => {
    if (!userId || !postId || loading) return;
    setLoading(true);
    setError(null);

    try {
      const func = isLiked ? unlikePost : likePost;
      const response = await func(postId, userId);
      
      if (response) {
        setIsLiked(!isLiked);
        setLikeCount(response.likeCount || 0);
        if (onLikeUpdate) {
          onLikeUpdate(response.likeCount || 0);
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Post not available');
        setLikeCount(0);
        setIsLiked(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return null;  // Hide the button if post is not available
  }

  return (
    <button 
      onClick={handleToggleLike}
      disabled={loading || !userId}
      className={`flex items-center gap-1 ${isLiked ? 'text-blue-600' : 'text-gray-600'}`}
    >
      <svg 
        className={`w-5 h-5 ${isLiked ? 'fill-current' : 'stroke-current'}`} 
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
      >
        <path d="M14 10h3v11h-3v-11zm-5 0h3v11h-3v-11zm2.5-8c2.5 0 4.5 2 4.5 4.5v3.5h-9v-3.5c0-2.5 2-4.5 4.5-4.5z"/>
      </svg>
      <span>{likeCount}</span>
    </button>
  );
};

export default LikeButton;
