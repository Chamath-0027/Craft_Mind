import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUser } from '../services/api';
import { useUser } from '../contexts/UserContext';
import AchievementForm from './AchievementForm';
import axios from 'axios';

const AchievementCard = ({ achievement, onDelete, onUpdate, simplified = false }) => {
  const [authorName, setAuthorName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { currentUser } = useUser();
  const isOwner = currentUser?.id === achievement.userId;

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const userData = await getUser(achievement.userId);
        setAuthorName(userData.fullName || userData.username);
      } catch (error) {
        console.error('Error fetching achievement author:', error);
      }
    };
    
    if (achievement.userId) {
      fetchAuthor();
    }
  }, [achievement.userId]);

  const handleDelete = async () => {
    if (!isOwner || !currentUser) return;
    
    const confirmDelete = window.confirm('Are you sure you want to delete this achievement?');
    if (!confirmDelete) return;
    
    try {
      await axios.delete(`http://localhost:8081/api/achievements/${achievement.id}?userId=${currentUser.id}`);
      if (onDelete) {
        onDelete(achievement.id);
      }
    } catch (error) {
      console.error('Error deleting achievement:', error);
    }
  };

  const handleUpdate = (updatedAchievement) => {
    if (onUpdate) {
      onUpdate(updatedAchievement);
    }
    setIsEditing(false);
  };

  const getVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      {isEditing ? (
        <AchievementForm
          initialData={achievement}
          isEditing={true}
          onAchievementCreated={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="flex justify-between mb-3">
            <div>
              <h3 className="font-medium text-xl text-black">{achievement.title}</h3>
              <p className="text-sm text-gray-500">
                Achieved by {authorName} • {new Date(achievement.createdAt).toLocaleDateString()}
              </p>
            </div>
            {!simplified && isOwner && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-500 hover:text-blue-700"
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
          
          <div className="prose max-w-none">
            {achievement.imageUrl && (
              <img
                src={`http://localhost:8081${achievement.imageUrl}`}
                alt="Achievement"
                className="w-full h-auto rounded-lg mb-4 max-h-96 object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', e.target.src);
                  e.target.style.display = 'none';
                }}
              />
            )}
            {achievement.videoUrl && getVideoId(achievement.videoUrl) && (
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <iframe
                  src={`https://www.youtube.com/embed/${getVideoId(achievement.videoUrl)}`}
                  className="w-full h-64 rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            <p className="text-black whitespace-pre-wrap">{achievement.description}</p>
            <div className="mt-4">
              <Link 
                to={`/achievements/${achievement.id}`} 
                className="text-blue-500 hover:text-blue-700"
              >
                {simplified ? "View Details & Interact" : "View Details"}
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AchievementCard;
