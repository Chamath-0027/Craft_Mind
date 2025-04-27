import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPost, getComments } from '../services/api';
import PostCard from '../components/PostCard';
import { useUser } from '../contexts/UserContext';

const PostDetailPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { currentUser } = useUser();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!postId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const postData = await getPost(postId);
        const comments = await getComments(postId);
        
        setPost({
          ...postData,
          comments: comments
        });
      } catch (error) {
        console.error('Error fetching post details:', error);
        const errorMsg = error.response?.data?.message || 
                        'Could not load the post. Please try again later.';
        setError(errorMsg);
        setPost(null);
        
        // If post doesn't exist, redirect after a delay
        if (error.response?.status === 404) {
          setTimeout(() => {
            navigate('/', { 
              replace: true,
              state: { message: 'The post you tried to view no longer exists' }
            });
          }, 3000);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchPostDetails();
  }, [postId, navigate]);
  
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-4">
        <div className="animate-pulse p-4 bg-white rounded-lg shadow-md">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
          <div className="h-4 bg-gray-200 rounded mb-6 w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-4">
        <Link to="/" className="text-blue-500 mb-4 inline-block">
          &larr; Back to Home
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-700 font-medium mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-4">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h2 className="text-yellow-700 font-medium mb-2">Post Not Found</h2>
          <p className="text-yellow-600">The requested post could not be found.</p>
          <Link to="/" className="mt-4 inline-block text-blue-500">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto mt-8 p-4">
      <Link to="/" className="text-blue-500 mb-4 inline-block">
        &larr; Back to Home
      </Link>
      
      <PostCard post={post} userId={currentUser?.id} detailed={true} />
    </div>
  );
};

export default PostDetailPage;
