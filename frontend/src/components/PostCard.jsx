import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LikeButton from './LikeButton';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import useWebSocket from '../hooks/useWebSocket';
import { getUser, getComments } from '../services/api';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import PostForm from './PostForm'; // Add this import
import FollowButton from './FollowButton';
import PostInsights from './PostInsights';

const PostCard = ({ post: initialPost, userId, detailed = false, onDelete, onUpdate }) => {
  const { currentUser } = useUser();
  const [post, setPost] = useState(initialPost);
  const [authorName, setAuthorName] = useState('');
  const [showComments, setShowComments] = useState(detailed);
  const [isEditing, setIsEditing] = useState(false);
  const isOwner = currentUser?.id === post.userId;
  const [comments, setComments] = useState(initialPost.comments || []);
  const [showShareModal, setShowShareModal] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();
  
  // Use WebSocket for real-time updates
  const { connected, likeCount: wsLikeCount, comments: wsComments } = useWebSocket(post.id);
  
  // Local state for likes and comments
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount || 0);
  
  // Update like count from WebSocket
  useEffect(() => {
    if (connected && wsLikeCount > 0) {
      setLocalLikeCount(wsLikeCount);
    }
  }, [connected, wsLikeCount]);
  
  // Fetch author name
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const userData = await getUser(post.userId);
        setAuthorName(userData.fullName || userData.username);
      } catch (error) {
        console.error('Error fetching post author:', error);
      }
    };
    
    if (post.userId) {
      fetchAuthor();
    }
  }, [post.userId]);
  
  // Update local state for comments when websocket sends new data
  useEffect(() => {
    if (wsComments && wsComments.length > 0) {
      const newComment = wsComments[wsComments.length - 1];
      setComments(prevComments => {
        const commentExists = prevComments.some(comment => comment.id === newComment.id);
        if (!commentExists) {
          return [...prevComments, newComment];
        }
        return prevComments;
      });
    }
  }, [wsComments]);

  // Check initial like status and count
  useEffect(() => {
    let isSubscribed = true;
    const checkLikeStatus = async () => {
      if (!userId || !post.id) return;
      
      try {
        const response = await axios.get(
          `http://localhost:8081/api/posts/${post.id}/likes`,
          { 
            params: { userId },
            timeout: 5000
          }
        );
        
        if (isSubscribed && response.data) {
          setIsLiked(response.data.hasLiked || false);
          setLocalLikeCount(response.data.likeCount || 0);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
        if (error.response?.status === 500) {
          console.log('Like status check failed, using default state');
        }
      }
    };

    checkLikeStatus();
    
    return () => {
      isSubscribed = false;
    };
  }, [post.id, userId]);

  // Handle new comment added
  const handleCommentAdded = (newComment) => {
    setComments(prevComments => {
      const commentExists = prevComments.some(comment => comment.id === newComment.id);
      if (!commentExists) {
        return [...prevComments, newComment];
      }
      return prevComments;
    });
    setShowComments(true);
  };
  
  // Toggle comments section and fetch comments if needed
  const toggleComments = async () => {
    if (!detailed && !showComments) {
      try {
        const response = await getComments(post.id);
        if (response) {
          setComments(response);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          // Post was deleted or unavailable
          setComments([]);
          if (onDelete) {
            onDelete(post.id); // Remove post from list if it's no longer available
          }
        } else {
          console.error('Error fetching comments:', error);
        }
      }
    }
    setShowComments(prev => !prev);
  };

  const renderVideo = () => {
    if (!post.videoUrl) return null;

    return (
      <div className="w-full mb-4 overflow-hidden rounded-lg">
        <video
          src={`http://localhost:8081${post.videoUrl}`}
          controls
          className="w-full"
        />
      </div>
    );
  };

  const handleDelete = async () => {
    if (!isOwner || !currentUser) return;
    
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;
    
    try {
      const response = await axios.delete(`http://localhost:8081/api/posts/${post.id}?userId=${currentUser.id}`);
      if (onDelete) {
        onDelete(post.id);
      } else {
        alert(response.data.message || 'Post deleted successfully');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(error.response?.data?.message || 'Failed to delete post. Please try again.');
    }
  };

  const handleUpdate = async (updatedPost) => {
    try {
      if (onUpdate) {
        onUpdate(updatedPost);
      } else {
        window.location.reload();
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating post:', error);
      alert(error.response?.data?.message || 'Failed to update post. Please try again.');
    }
  };

  // Record view when post is loaded
  useEffect(() => {
    const recordView = async () => {
      if (userId && post.id) {
        try {
          await axios.post(`http://localhost:8081/api/posts/${post.id}/views?viewerId=${userId}`);
        } catch (error) {
          console.error('Error recording view:', error);
        }
      }
    };

    recordView();
  }, [post.id, userId]);

  const handleShareToGroup = async (groupId) => {
    try {
      const token = localStorage.getItem('skillshare_token');
      await axios.post(
        `http://localhost:8081/api/groups/${groupId}/posts?userId=${currentUser.id}`,
        { postId: post.id },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setShowShareModal(false);
      alert('Post shared successfully!');
    } catch (error) {
      console.error('Error sharing post:', error);
      // Display a more detailed error message
      const errorMessage = error.response?.data?.message || 'Failed to share post';
      alert(errorMessage);
    }
  };

  const handleLikeToggle = async () => {
    if (!userId) return;
    
    const previousLikeState = isLiked;
    const previousCount = localLikeCount;
    
    try {
      setIsLiked(!isLiked);
      setLocalLikeCount(prev => isLiked ? prev - 1 : prev + 1);

      const endpoint = `http://localhost:8081/api/posts/${post.id}/like?userId=${userId}`;
      const response = await (isLiked ? 
        axios.delete(endpoint) : 
        axios.post(endpoint)
      );

      // Update the like count from the response
      if (response.data && typeof response.data.likeCount === 'number') {
        setLocalLikeCount(response.data.likeCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic updates on error
      setIsLiked(previousLikeState);
      setLocalLikeCount(previousCount);
      
      if (error.response?.status !== 500) {
        const errorMessage = error.response?.data?.message || 'Failed to update like status';
        console.warn(errorMessage);
      }
    }
  };

  // Update this effect to correctly fetch user groups when the modal opens
  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!currentUser) return;
      try {
        const token = localStorage.getItem('skillshare_token');
        // Use this endpoint to get ALL groups (both joined and owned)
        const response = await axios.get(
          `http://localhost:8081/api/groups/user/${currentUser.id}/all`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('Fetched all user groups:', response.data);
        setUserGroups(response.data);
      } catch (error) {
        console.error('Error fetching user groups:', error);
      }
    };
    
    if (showShareModal) {
      fetchUserGroups();
    }
  }, [currentUser, showShareModal]);

  // Share modal with increased contrast and black text for better visibility
  const renderShareModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-black">Share to Group</h2>
        {userGroups.length === 0 ? (
          <p className="text-black font-medium">You haven't joined any groups yet.</p>
        ) : (
          <div className="space-y-4">
            {userGroups.map((group) => (
              <div
                key={group.id}
                className="p-4 border rounded-lg hover:bg-gray-100 cursor-pointer bg-gray-50"
                onClick={() => handleShareToGroup(group.id)}
              >
                <h3 className="font-bold text-black text-lg">{group.name}</h3>
                <p className="text-sm text-black font-medium">{group.description}</p>
                {group.ownerId === currentUser?.id && (
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    You own this group
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => setShowShareModal(false)}
          className="mt-4 px-4 py-2 text-black font-medium hover:bg-gray-100 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 text-gray-800 border border-facebook-divider max-w-2xl mx-auto">
      {isEditing ? (
        <PostForm
          initialData={post}
          isEditing={true}
          onPostCreated={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="flex justify-between mb-3">
            <div className="flex items-center">
              <div>
                <h3 className="font-medium text-black">{post.title}</h3>
                <p className="text-sm text-gray-500 ml-2">
                  Posted by {authorName || 'Anonymous'} • 
                  {post.createdAt && new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {userId && userId !== post.userId && (
                <FollowButton userId={post.userId} followerId={userId} />
              )}
              {isOwner && currentUser && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-facebook-primary hover:text-facebook-hover"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Post insights for owner */}
          {isOwner && (
            <div className="mb-4">
              <PostInsights postId={post.id} />
            </div>
          )}

          {/* Post content */}
          <div className="mb-4">
            {post.imageUrl && (
              <img 
                src={`http://localhost:8081${post.imageUrl}`} 
                alt="Post content"
                className="w-full h-auto rounded-lg mb-4 max-h-96 object-cover"
              />
            )}
            {renderVideo()}
            <p className="text-black">{post.content}</p>
          </div>
          
          {/* Post actions */}
          <div className="flex justify-between items-center border-t border-b border-gray-200 py-2 my-2">
            {/* Like button with heart icon */}
            <button
              onClick={handleLikeToggle}
              className="inline-flex items-center gap-2 px-3 py-1 text-black hover:text-facebook-primary transition-colors text-sm font-medium"
            >
              <span className={`material-icons text-base ${isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-600`}>
                {isLiked ? 'favorite' : 'favorite_border'}
              </span>
              {localLikeCount} {localLikeCount === 1 ? 'Like' : 'Likes'}
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1 text-black hover:text-facebook-primary transition-colors text-sm font-medium"
            >
              <span className="material-icons text-base text-black">share</span>
              Share
            </button>
            {!detailed && (
              <button
                onClick={toggleComments}
                className="inline-flex items-center gap-2 px-3 py-1 text-black hover:text-facebook-primary transition-colors text-sm font-medium"
              >
                <span className="material-icons text-base text-black">comment</span>
                {showComments ? 'Hide Comments' : 'Show Comments'}
              </button>
            )}
            
            {!detailed && (
              <Link
                to={`/post/${post.id}`}
                className="text-facebook-primary hover:text-facebook-hover transition-colors text-sm"
              >
                View Details
              </Link>
            )}
          </div>
          
          {/* Comments section */}
          {showComments && (
            <div className="mt-4">
              <CommentForm
                postId={post.id}
                userId={userId}
                onCommentAdded={handleCommentAdded}
              />
              
              <CommentList
                postId={post.id}
                userId={userId}
                initialComments={comments}
              />
            </div>
          )}

          {showShareModal && renderShareModal()}
        </>
      )}
    </div>
  );
};

export default PostCard;


/*import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LikeButton from './LikeButton';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import useWebSocket from '../hooks/useWebSocket';
import { getUser, getComments } from '../services/api';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import PostForm from './PostForm'; // Add this import
import FollowButton from './FollowButton';
import PostInsights from './PostInsights';

const PostCard = ({ post: initialPost, userId, detailed = false, onDelete, onUpdate }) => {
  const { currentUser } = useUser();
  const [post, setPost] = useState(initialPost);
  const [authorName, setAuthorName] = useState('');
  const [showComments, setShowComments] = useState(detailed);
  const [isEditing, setIsEditing] = useState(false);
  const isOwner = currentUser?.id === post.userId;
  const [comments, setComments] = useState(initialPost.comments || []);
  const [showShareModal, setShowShareModal] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();
  
  // Use WebSocket for real-time updates
  const { connected, likeCount: wsLikeCount, comments: wsComments } = useWebSocket(post.id);
  
  // Local state for likes and comments
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount || 0);
  
  // Update like count from WebSocket
  useEffect(() => {
    if (connected && wsLikeCount > 0) {
      setLocalLikeCount(wsLikeCount);
    }
  }, [connected, wsLikeCount]);
  
  // Fetch author name
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const userData = await getUser(post.userId);
        setAuthorName(userData.fullName || userData.username);
      } catch (error) {
        console.error('Error fetching post author:', error);
      }
    };
    
    if (post.userId) {
      fetchAuthor();
    }
  }, [post.userId]);
  
  // Update local state for comments when websocket sends new data
  useEffect(() => {
    if (wsComments && wsComments.length > 0) {
      const newComment = wsComments[wsComments.length - 1];
      setComments(prevComments => {
        const commentExists = prevComments.some(comment => comment.id === newComment.id);
        if (!commentExists) {
          return [...prevComments, newComment];
        }
        return prevComments;
      });
    }
  }, [wsComments]);

  // Check initial like status and count
  useEffect(() => {
    let isSubscribed = true;
    const checkLikeStatus = async () => {
      if (!userId || !post.id) return;
      
      try {
        const response = await axios.get(
          `http://localhost:8081/api/posts/${post.id}/likes`,
          { 
            params: { userId },
            timeout: 5000
          }
        );
        
        if (isSubscribed && response.data) {
          setIsLiked(response.data.hasLiked || false);
          setLocalLikeCount(response.data.likeCount || 0);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
        if (error.response?.status === 500) {
          console.log('Like status check failed, using default state');
        }
      }
    };

    checkLikeStatus();
    
    return () => {
      isSubscribed = false;
    };
  }, [post.id, userId]);

  // Handle new comment added
  const handleCommentAdded = (newComment) => {
    setComments(prevComments => {
      const commentExists = prevComments.some(comment => comment.id === newComment.id);
      if (!commentExists) {
        return [...prevComments, newComment];
      }
      return prevComments;
    });
    setShowComments(true);
  };
  
  // Toggle comments section and fetch comments if needed
  const toggleComments = async () => {
    if (!detailed && !showComments) {
      try {
        const response = await getComments(post.id);
        if (response) {
          setComments(response);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          // Post was deleted or unavailable
          setComments([]);
          if (onDelete) {
            onDelete(post.id); // Remove post from list if it's no longer available
          }
        } else {
          console.error('Error fetching comments:', error);
        }
      }
    }
    setShowComments(prev => !prev);
  };

  const renderVideo = () => {
    if (!post.videoUrl) return null;

    return (
      <div className="w-full mb-4 overflow-hidden rounded-lg">
        <video
          src={`http://localhost:8081${post.videoUrl}`}
          controls
          className="w-full"
        />
      </div>
    );
  };

  const handleDelete = async () => {
    if (!isOwner || !currentUser) return;
    
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;
    
    try {
      const response = await axios.delete(`http://localhost:8081/api/posts/${post.id}?userId=${currentUser.id}`);
      if (onDelete) {
        onDelete(post.id);
      } else {
        alert(response.data.message || 'Post deleted successfully');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(error.response?.data?.message || 'Failed to delete post. Please try again.');
    }
  };

  const handleUpdate = async (updatedPost) => {
    try {
      if (onUpdate) {
        onUpdate(updatedPost);
      } else {
        window.location.reload();
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating post:', error);
      alert(error.response?.data?.message || 'Failed to update post. Please try again.');
    }
  };

  // Record view when post is loaded
  useEffect(() => {
    const recordView = async () => {
      if (userId && post.id) {
        try {
          await axios.post(`http://localhost:8081/api/posts/${post.id}/views?viewerId=${userId}`);
        } catch (error) {
          console.error('Error recording view:', error);
        }
      }
    };

    recordView(); */