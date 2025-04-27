import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import ScoreDashboard from '../components/ScoreDashboard';
import FollowButton from '../components/FollowButton';
import AchievementCard from '../components/AchievementCard';
import PostCard from '../components/PostCard';  // Add this import
import AchievementForm from '../components/AchievementForm';  // Add this import

const ProfilePage = () => {
  const { currentUser, updateUser } = useUser();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    bio: '',
    specializations: [],
    role: ''  // Add role to formData
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [achievementsByCategory, setAchievementsByCategory] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('posts');
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        username: currentUser.username || '',
        bio: currentUser.bio || '',
        specializations: currentUser.specializations || [],
        role: currentUser.role || 'LEARNER'  // Set role from currentUser
      });
      
      // Fetch user's posts
      const fetchUserPosts = async () => {
        try {
          setIsLoading(true);
          const response = await axios.get(`http://localhost:8081/api/posts/user/${currentUser.id}`);
          if (response.data) {
            setUserPosts(response.data);
          }
        } catch (error) {
          console.error('Error fetching user posts:', error);
          setMessage({ 
            type: 'error', 
            text: 'Failed to load posts. Please try again.' 
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUserPosts();
      fetchFollowStats();
      fetchAchievementCategories();
    }
  }, [currentUser]);
  
  const fetchFollowStats = async () => {
    try {
      const [followersRes, followingRes, countsRes] = await Promise.all([
        axios.get(`http://localhost:8081/api/users/${currentUser.id}/followers`),
        axios.get(`http://localhost:8081/api/users/${currentUser.id}/following`),
        axios.get(`http://localhost:8081/api/users/${currentUser.id}/counts`)
      ]);
      
      setFollowers(followersRes.data);
      setFollowing(followingRes.data);
      setFollowerCount(countsRes.data.followers);
      setFollowingCount(countsRes.data.following);
    } catch (error) {
      console.error('Error fetching follow stats:', error);
    }
  };

  const refreshFollowCounts = async () => {
    try {
      const countsRes = await axios.get(`http://localhost:8081/api/users/${currentUser.id}/counts`);
      setFollowerCount(countsRes.data.followers);
      setFollowingCount(countsRes.data.following);
      fetchFollowStats(); // Refresh the full lists too
    } catch (error) {
      console.error('Error refreshing counts:', error);
    }
  };

  const fetchAchievementCategories = async () => {
    try {
      // First fetch the categories
      const categoriesRes = await axios.get(`http://localhost:8081/api/users/${currentUser.id}/achievements/categories`);
      
      if (!Array.isArray(categoriesRes.data)) {
        console.error('Categories response is not an array:', categoriesRes.data);
        return;
      }

      // Ensure we have unique categories
      const uniqueCategories = [...new Set(categoriesRes.data)].filter(Boolean);
      setCategories(uniqueCategories);

      // Then fetch achievements for each category in parallel
      const allPromises = uniqueCategories.map(async (category) => {
        const response = await axios.get(
          `http://localhost:8081/api/users/${currentUser.id}/achievements/category/${category}`
        );
        return { category, achievements: response.data };
      });

      // Also fetch all achievements
      const allAchievementsRes = await axios.get(
        `http://localhost:8081/api/users/${currentUser.id}/achievements/latest`
      );
      setAchievements(allAchievementsRes.data);

      // Wait for all category requests to complete
      const categoryResults = await Promise.all(allPromises);
      
      // Build the category map
      const achievementsMap = {};
      categoryResults.forEach(({ category, achievements }) => {
        achievementsMap[category] = achievements;
      });

      setAchievementsByCategory(achievementsMap);

    } catch (error) {
      console.error('Error fetching achievement categories:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load achievements. Please try again.' 
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Call API to update user profile
      const response = await axios.put(`http://localhost:8081/api/users/${currentUser.id}`, formData);
      
      // Update local state
      updateUser({
        ...currentUser,
        ...response.data,
      });
      
      setMessage({ 
        type: 'success', 
        text: 'Profile updated successfully!' 
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update profile' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUserContent();
    }
  }, [currentUser]);

  // Add these handlers
  const handlePostDeleted = (postId) => {
    setUserPosts(prev => prev.filter(post => post.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setUserPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const handleAchievementCreated = (newAchievement) => {
    // Update all achievements list
    setAchievements(prev => [newAchievement, ...prev]);

    if (newAchievement.category) {
      // Add to category map
      setAchievementsByCategory(prev => {
        const updated = { ...prev };
        if (!updated[newAchievement.category]) {
          updated[newAchievement.category] = [];
        }
        updated[newAchievement.category] = [
          newAchievement,
          ...(updated[newAchievement.category] || [])
        ];
        return updated;
      });

      // Update categories list if it's a new category
      setCategories(prev => {
        if (!prev.includes(newAchievement.category)) {
          return [...prev, newAchievement.category];
        }
        return prev;
      });
    }
  };

  const fetchUserContent = async () => {
    setIsLoading(true);
    try {
      const [postsRes] = await Promise.all([
        axios.get(`http://localhost:8081/api/posts/user/${currentUser.id}`)
      ]);

      setUserPosts(postsRes.data);
      await fetchAchievementCategories(); // Fetch achievements separately
    } catch (error) {
      console.error('Error fetching user content:', error);
      setMessage({ type: 'error', text: 'Failed to load content' });
    } finally {
      setIsLoading(false);
    }
  };

  const getVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleSpecializationsChange = (value) => {
    setFormData({
      ...formData,
      specializations: value.split(',').map(s => s.trim()).filter(s => s)
    });
  };

  const handleAchievementDeleted = async (achievementId) => {
    try {
      // Update the achievements list
      setAchievements(prev => prev.filter(a => a.id !== achievementId));
      
      // Update achievements by category
      setAchievementsByCategory(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(category => {
          updated[category] = updated[category].filter(a => a.id !== achievementId);
        });
        return updated;
      });
    } catch (error) {
      console.error('Error handling achievement deletion:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update achievements list'
      });
    }
  };

  const handleAchievementUpdated = async (updatedAchievement) => {
    try {
      // Update the achievements list
      setAchievements(prev => 
        prev.map(a => a.id === updatedAchievement.id ? updatedAchievement : a)
      );
      
      // Update achievements by category
      setAchievementsByCategory(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(category => {
          updated[category] = updated[category].map(a => 
            a.id === updatedAchievement.id ? updatedAchievement : a
          );
        });
        return updated;
      });
    } catch (error) {
      console.error('Error handling achievement update:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update achievement'
      });
    }
  };

  const renderTabs = () => (
    <div className="flex border-b border-gray-200 mb-4">
      <button
        onClick={() => setActiveTab('posts')}
        className={`px-6 py-3 ${
          activeTab === 'posts' 
            ? 'border-b-2 border-blue-500 text-blue-500' 
            : 'text-gray-500'
        }`}
      >
        My Posts
      </button>
      <button
        onClick={() => setActiveTab('achievements')}
        className={`px-6 py-3 ${
          activeTab === 'achievements' 
            ? 'border-b-2 border-blue-500 text-blue-500' 
            : 'text-gray-500'
        }`}
      >
        My Achievements
      </button>
      <button
        onClick={() => setActiveTab('skills')}
        className={`px-6 py-3 ${
          activeTab === 'skills' 
            ? 'border-b-2 border-blue-500 text-blue-500' 
            : 'text-gray-500'
        }`}
      >
        My Skills
      </button>
    </div>
  );

  const renderContent = () => {
    if (isLoading) return <div className="text-center py-4">Loading...</div>;

    switch(activeTab) {
      case 'posts':
        return (
          <div className="space-y-4">
            {userPosts.map(post => (
              <PostCard 
                key={post.id} 
                post={post}
                userId={currentUser?.id}
                onDelete={handlePostDeleted}
                onUpdate={handlePostUpdated}
              />
            ))}
          </div>
        );
      case 'achievements':
        return (
          <div>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  selectedCategory === 'all' 
                    ? 'bg-facebook-primary text-white' 
                    : 'bg-facebook-card text-facebook-text-primary'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    selectedCategory === category 
                      ? 'bg-facebook-primary text-white' 
                      : 'bg-facebook-card text-facebook-text-primary'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <AchievementForm onAchievementCreated={handleAchievementCreated} />
            <div className="mt-4 space-y-4">
              {selectedCategory === 'all' ? (
                achievements.length > 0 ? (
                  achievements.map(achievement => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      onDelete={handleAchievementDeleted}
                      onUpdate={handleAchievementUpdated}
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-500">No achievements yet</p>
                )
              ) : (
                (achievementsByCategory[selectedCategory]?.length > 0 ? (
                  achievementsByCategory[selectedCategory].map(achievement => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      onDelete={handleAchievementDeleted}
                      onUpdate={handleAchievementUpdated}
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-500">No achievements in this category</p>
                ))
              )}
            </div>
          </div>
        );
      case 'skills':
        return <ScoreDashboard userId={currentUser?.id} showHistory={true} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="bg-gray-100 shadow-lg rounded-lg overflow-hidden mb-8 text-gray-800 border border-gray-200">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-8 text-white relative">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-facebook-card rounded-full flex items-center justify-center text-facebook-primary text-2xl font-bold border-4 border-white">
              {currentUser?.fullName?.[0]?.toUpperCase() || currentUser?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{currentUser?.fullName || currentUser?.username}</h1>
              <p className="text-white/80">@{currentUser?.username}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {currentUser?.role === 'INSTRUCTOR' && currentUser?.isVerified && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Verified Instructor
            </div>
          )}
          {message.text && (
            <div className={`mb-4 p-3 rounded ${
              message.type === 'error' 
                ? 'bg-red-100 text-red-700 border border-red-400' 
                : 'bg-green-100 text-green-700 border border-green-400'
            }`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="username">
                  Username
                </label>
                <input
                  className="appearance-none border-2 border-gray-300 bg-white rounded w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-600"
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!isEditing || isLoading}
                />
              </div>
              
              <div>
                <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="appearance-none border-2 border-gray-300 bg-white rounded w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-600"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing || isLoading}
                />
              </div>
              
              <div>
                <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  className="appearance-none border-2 border-gray-300 bg-white rounded w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-600"
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing || isLoading}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-800 text-sm font-bold mb-2">
                Role
              </label>
              <input
                className="appearance-none border-2 border-gray-300 bg-white rounded w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:border-indigo-500 disabled:bg-gray-100"
                value={currentUser?.role}
                disabled
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-800 text-sm font-bold mb-2" htmlFor="bio">
                Bio
              </label>
              <textarea
                className="appearance-none border-2 border-gray-300 bg-white rounded w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:border-indigo-500"
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                rows="3"
              />
            </div>

            {currentUser?.role === 'INSTRUCTOR' && (
              <div className="mb-4">
                <label className="block text-gray-800 text-sm font-bold mb-2">
                  Specializations
                </label>
                <input
                  type="text"
                  className="appearance-none border-2 border-gray-300 bg-white rounded w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:border-indigo-500"
                  value={formData.specializations.join(', ')}
                  onChange={(e) => handleSpecializationsChange(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            )}
            
            <div className="mt-8 flex justify-end">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="mr-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form to original values
                      setFormData({
                        fullName: currentUser.fullName || '',
                        email: currentUser.email || '',
                        username: currentUser.username || '',
                        bio: currentUser.bio || '',
                        specializations: currentUser.specializations || [],
                        role: currentUser.role || 'LEARNER'  // Reset role from currentUser
                      });
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="flex justify-center space-x-8 py-4 border-t bg-gray-50">
          <button
            onClick={() => setShowFollowers(true)}
            className="text-green-700 hover:text-green-800 flex flex-col items-center"
          >
            <span className="text-2xl font-bold">{followerCount}</span>
            <span className="text-sm">Followers</span>
          </button>
          <button
            onClick={() => setShowFollowing(true)}
            className="text-green-700 hover:text-green-800 flex flex-col items-center"
          >
            <span className="text-2xl font-bold">{followingCount}</span>
            <span className="text-sm">Following</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mt-8">
        {renderTabs()}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-black rounded-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Followers</h3>
              <button 
                onClick={() => setShowFollowers(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {followers.length > 0 ? (
                followers.map(user => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.fullName}</p>
                    </div>
                    <FollowButton userId={user.id} followerId={currentUser.id} onRefreshCounts={refreshFollowCounts} />
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No followers yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-black rounded-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Following</h3>
              <button 
                onClick={() => setShowFollowing(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {following.length > 0 ? (
                following.map(user => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.fullName}</p>
                    </div>
                    <FollowButton 
                      userId={user.id} 
                      followerId={currentUser.id} 
                      onRefreshCounts={refreshFollowCounts}
                    />
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Not following anyone yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
