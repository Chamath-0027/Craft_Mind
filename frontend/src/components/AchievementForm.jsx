import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';  //////ddsdsdsdsdsdskkk///

const AchievementForm = ({ onAchievementCreated, initialData, isEditing, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl ? 
    `http://localhost:8081${initialData.imageUrl}` : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(!!isEditing);
  const [category, setCategory] = useState(initialData?.category || '');
  const categories = ['Technical', 'Professional', 'Academic', 'Personal', 'Other'];
  
  const { currentUser } = useUser();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('skillshare_token');
      let achievement = {
        userId: currentUser.id,
        title,
        description,
        videoUrl,
        category,
        imageUrl: initialData?.imageUrl // Preserve existing imageUrl
      };

      // Default headers configuration
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      // Add auth token if available
      if (token) {
        config.headers['Authorization'] = token;
      }

      let response;
      
      if (image) {
        const formData = new FormData();
        formData.append('file', image);

        const uploadResponse = await axios.post(
          'http://localhost:8081/api/files/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': token ? `Bearer ${token}` : ''
            }
          }
        );

        if (uploadResponse.data?.url) {
          achievement.imageUrl = uploadResponse.data.url;
        } else {
          throw new Error('Invalid upload response');
        }
      }

      if (isEditing) {
        response = await axios.put(
          `http://localhost:8081/api/achievements/${initialData.id}?userId=${currentUser.id}`,
          achievement,
          config
        );
      } else {
        response = await axios.post('http://localhost:8081/api/achievements', achievement, config);
      }

      if (response.data && onAchievementCreated) {
        onAchievementCreated(response.data);
        if (!isEditing) {
          setTitle('');
          setDescription('');
          setVideoUrl('');
          setImage(null);
          setImagePreview('');
          setShowForm(false);
        } else if (onCancel) {
          onCancel();
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Please log in to share achievements');
      } else {
        setError(error.response?.data?.message || 'Failed to save achievement');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm && !isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
        >
          Share New Achievement
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-lg font-medium mb-4">
        {isEditing ? 'Edit Achievement' : 'Share New Achievement'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="4"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-2 max-h-48 rounded-md"
            />
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video URL (optional)
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel || (() => setShowForm(false))}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Share Achievement')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AchievementForm;
