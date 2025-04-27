import { useState, useEffect } from 'react';
import axios from 'axios';
import AchievementCard from '../components/AchievementCard';
import AchievementForm from '../components/AchievementForm';
import { useUser } from '../contexts/UserContext';

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useUser();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('skillshare_token');
      const response = await axios.get('http://localhost:8081/api/achievements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAchievements(response.data);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleAchievementCreated = (newAchievement) => {
    setAchievements(prev => [newAchievement, ...prev]);
  };

  const handleAchievementDeleted = (achievementId) => {
    setAchievements(prev => prev.filter(a => a.id !== achievementId));
  };

  const handleAchievementUpdated = (updatedAchievement) => {
    setAchievements(prev => 
      prev.map(a => a.id === updatedAchievement.id ? updatedAchievement : a)
    );
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Achievements</h1>
      </div>

      {currentUser && <AchievementForm onAchievementCreated={handleAchievementCreated} />}

      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {achievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            onDelete={handleAchievementDeleted}
            onUpdate={handleAchievementUpdated}
          />
        ))}
      </div>
    </div>
  );
};

export default AchievementsPage;
