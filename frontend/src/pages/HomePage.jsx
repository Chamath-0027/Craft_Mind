import { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard';
import PostForm from '../components/PostForm';
import { useUser } from '../contexts/UserContext';
import LoadingIndicator from '../components/LoadingIndicator';
import SkillQuiz from '../components/SkillQuiz';
import ScoreDashboard from '../components/ScoreDashboard';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  
  const { currentUser, loading: userLoading } = useUser();
  
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const postsRes = await axios.get('http://localhost:8081/api/posts');
        setPosts(postsRes.data);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, []);
  
  const handlePostCreated = (newPost) => {
    // Add the new post to the beginning of the list
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handlePostUpdated = (updatedPost) => {
    // Update the post in the list
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  const handlePostDeleted = (postId) => {
    // Remove the post from the list
    setPosts(prevPosts => 
      prevPosts.filter(post => post.id !== postId)
    );
  };

  const handleQuizComplete = (results) => {
    setQuizResults(results);
    setShowQuiz(false);
  };
  
  if (userLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-4">
        <LoadingIndicator message="Loading posts..." />
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto mt-8 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-facebook-text-primary">Skillshare Feed</h1>
        {currentUser && !showQuiz && !quizResults && (
          <button
            onClick={() => setShowQuiz(true)}
            className="px-6 py-3 bg-facebook-primary hover:bg-facebook-hover text-white rounded-lg transition duration-300"
          >
            Find Your Best Skill
          </button>
        )}
      </div>

      {showQuiz ? (
        <div className="mb-8">
          <SkillQuiz 
            onComplete={handleQuizComplete} 
          />
        </div>
      ) : null}

      {quizResults && (
        <div className="mb-8">
          <ScoreDashboard userId={currentUser?.id} showHistory={false} />
        </div>
      )}
      
      {currentUser && <PostForm onPostCreated={handlePostCreated} />}
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      
      <h2 className="text-xl font-medium mb-4 text-white">Recent Posts</h2>
      
      {posts.length === 0 ? (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600 text-white">No posts available. Be the first to create one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id}>
              <PostCard 
                post={post} 
                userId={currentUser?.id}
                onDelete={handlePostDeleted}
                onUpdate={handlePostUpdated}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
/*const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  
  const { currentUser, loading: userLoading } = useUser();
  
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const postsRes = await axios.get('http://localhost:8081/api/posts');
        setPosts(postsRes.data);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, []);
  
  const handlePostCreated = (newPost) => {
    // Add the new post to the beginning of the list
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handlePostUpdated = (updatedPost) => {
    // Update the post in the list
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };*/
export default HomePage;
