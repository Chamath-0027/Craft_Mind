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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Profile Card */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-3xl border border-blue-100">
          {/* Profile Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 opacity-95"></div>
            <div className="relative px-8 py-12">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-blue-600 border-4 border-white shadow-lg transform transition-transform duration-300 hover:scale-105">
                    {currentUser?.fullName?.[0]?.toUpperCase() || currentUser?.username?.[0]?.toUpperCase()}
                  </div>
                  {currentUser?.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                      <span className="material-icons text-white text-sm">verified</span>
                    </div>
                  )}
                </div>
                <div className="text-white">
                  <h1 className="text-4xl font-bold mb-2">{currentUser?.fullName || currentUser?.username}</h1>
                  <p className="text-white/90 text-lg">@{currentUser?.username}</p>
                  {currentUser?.role === 'INSTRUCTOR' && (
                    <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                      {currentUser?.role}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl ${
                message.type === 'error' 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-blue-900" htmlFor="username">
                    Username
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border-2 border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-blue-50 disabled:text-blue-500"
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isEditing || isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-blue-900" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border-2 border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-blue-50 disabled:text-blue-500"
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing || isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-blue-900" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg border-2 border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-blue-50 disabled:text-blue-500"
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing || isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-blue-900">
                  Role
                </label>
                <div className="px-4 py-3 rounded-lg bg-blue-50 text-blue-600 border-2 border-blue-100">
                  {currentUser?.role}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-blue-900" htmlFor="bio">
                  Bio
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg border-2 border-blue-100 bg-blue-50/50 text-blue-900 placeholder-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all duration-200 resize-none disabled:bg-blue-50/30 disabled:text-blue-600/70 disabled:cursor-not-allowed"
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="3"
                  placeholder="Share something about yourself..."
                />
              </div>

              {currentUser?.role === 'INSTRUCTOR' && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-blue-900">
                    Specializations
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border-2 border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    value={formData.specializations.join(', ')}
                    onChange={(e) => handleSpecializationsChange(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      className="px-6 py-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all duration-200 font-medium"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          fullName: currentUser.fullName || '',
                          email: currentUser.email || '',
                          username: currentUser.username || '',
                          bio: currentUser.bio || '',
                          specializations: currentUser.specializations || [],
                          role: currentUser.role || 'LEARNER'
                        });
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 font-medium ${
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
                    className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 font-medium"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Stats Bar */}
          <div className="flex justify-center space-x-16 py-8 border-t border-blue-100">
            <button
              onClick={() => setShowFollowers(true)}
              className="group flex flex-col items-center transition-all duration-300 hover:scale-105 focus:outline-none"
            >
              <div className="relative">
                <span className="text-4xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                  {followerCount}
                </span>
              </div>
              <span className="mt-2 text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                Followers
              </span>
            </button>
            <div className="w-px h-12 bg-blue-100 self-center"></div>
            <button
              onClick={() => setShowFollowing(true)}
              className="group flex flex-col items-center transition-all duration-300 hover:scale-105 focus:outline-none"
            >
              <div className="relative">
                <span className="text-4xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                  {followingCount}
                </span>
              </div>
              <span className="mt-2 text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                Following
              </span>
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-blue-100">
          <div className="flex border-b border-blue-100">
            {['posts', 'achievements', 'skills'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-sm font-medium transition-all duration-200 focus:outline-none ${
                  activeTab === tab 
                    ? 'border-b-2 border-blue-600 text-blue-600' 
                    : 'text-blue-500 hover:text-blue-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-8">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Modals */}
      {(showFollowers || showFollowing) && (
        <div className="fixed inset-0 bg-blue-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all duration-300 border border-blue-100">
            <div className="p-6 border-b border-blue-100 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-blue-900">
                {showFollowers ? 'Followers' : 'Following'}
              </h3>
              <button 
                onClick={() => {
                  setShowFollowers(false);
                  setShowFollowing(false);
                }}
                className="text-blue-400 hover:text-blue-600 transition-colors duration-200 focus:outline-none"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {(showFollowers ? followers : following).length > 0 ? (
                (showFollowers ? followers : following).map(user => (
                  <div key={user.id} className="flex items-center justify-between py-4 border-b border-blue-100 last:border-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                        {user.fullName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">{user.username}</p>
                        <p className="text-sm text-blue-600">{user.fullName}</p>
                      </div>
                    </div>
                    <FollowButton 
                      userId={user.id} 
                      followerId={currentUser.id} 
                      onRefreshCounts={refreshFollowCounts}
                    />
                  </div>
                ))
              ) : (
                <p className="text-center text-blue-600 py-4">
                  {showFollowers ? 'No followers yet' : 'Not following anyone yet'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;