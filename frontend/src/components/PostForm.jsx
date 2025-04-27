import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

const PostForm = ({ onPostCreated, initialData, isEditing, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl ? 
    `http://localhost:8081${initialData.imageUrl}` : '');
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(!!isEditing);
  
  const { currentUser } = useUser();

  // Initialize form when initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      if (initialData.imageUrl) {
        setImagePreview(`http://localhost:8081${initialData.imageUrl}`);
      }
    }
  }, [initialData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('Video size must be less than 100MB');
        return;
      }

      // Create video element to check duration
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = function() {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          setError('Video must be 30 seconds or less');
          return;
        }
        setVideo(file);
        setVideoPreview(URL.createObjectURL(file));
        setError('');
      }

      video.src = URL.createObjectURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !currentUser?.id || isSubmitting) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      let imageUrl = initialData?.imageUrl || '';
      let videoUrl = initialData?.videoUrl || '';

      // Only upload new image if one is selected
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('type', 'image');
        
        const uploadResponse = await axios.post(
          'http://localhost:8081/api/files/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        if (uploadResponse.data?.url) {
          imageUrl = uploadResponse.data.url;
        }
      }

      // Only upload new video if one is selected
      if (video) {
        const formData = new FormData();
        formData.append('file', video);
        formData.append('type', 'video');
        
        const uploadResponse = await axios.post(
          'http://localhost:8081/api/files/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        if (uploadResponse.data?.url) {
          videoUrl = uploadResponse.data.url;
        }
      }

      const postData = {
        userId: currentUser.id,
        title: title.trim(),
        content: content.trim(),
        imageUrl,
        videoUrl,
        createdAt: isEditing ? initialData.createdAt : new Date().toISOString()
      };

      let response;
      if (isEditing && initialData?.id) {
        response = await axios.put(
          `http://localhost:8081/api/posts/${initialData.id}?userId=${currentUser.id}`,
          postData
        );
        
        // When editing is successful
        if (response.data) {
          if (onPostCreated) {
            onPostCreated(response.data);
          }
          if (onCancel) {
            onCancel();
          }
          // Force page refresh after successful edit
          window.location.reload();
        }
      } else {
        response = await axios.post('http://localhost:8081/api/posts', postData);
        
        if (response.data) {
          if (onPostCreated) {
            onPostCreated(response.data);
          }
          
          // Reset form only for new posts
          setTitle('');
          setContent('');
          setImage(null);
          setImagePreview('');
          setVideo(null);
          setVideoPreview('');
          setShowForm(false);
        }
      }
    } catch (error) {
      console.error('Error with post:', error);
      setError(error.response?.data?.message || 'Failed to handle post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditing && onCancel) {
      onCancel();
    } else {
      setShowForm(false);
    }
  };

  if (!showForm && !isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Create New Post
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-lg font-medium mb-4">
        {isEditing ? 'Edit Post' : 'Create a New Post'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter post title"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="What would you like to share?"
            rows="4"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Image (optional)
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg" />
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video (optional, max 30 seconds)
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {videoPreview && (
            <video
              src={videoPreview}
              controls
              className="mt-2 max-h-48 rounded-md"
            />
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className={`px-4 py-2 bg-blue-500 text-white rounded-md ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
