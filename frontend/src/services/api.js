import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to handle errors globally
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

// Like endpoints
export const likePost = async (postId, userId) => {
  const response = await api.post(`/posts/${postId}/like`, null, {
    params: { userId }
  });
  return response.data;
};

export const unlikePost = async (postId, userId) => {
  const response = await api.delete(`/posts/${postId}/like`, {
    params: { userId }
  });
  return response.data;
};

export const getLikeCount = async (postId, userId) => {
  const response = await api.get(`/posts/${postId}/likes`, {
    params: { userId }
  });
  return response.data;
};

// Comment endpoints
export const getComments = async (postId) => {
  const response = await api.get(`/posts/${postId}/comments`);
  return response.data;
};

export const addComment = async (postId, userId, text) => {
  const response = await api.post(`/posts/${postId}/comments`, 
    { text },
    { params: { userId } }
  );
  return response.data;
};

export const editComment = async (commentId, userId, text) => {
  try {
    const response = await api.put(`/comments/${commentId}`, { text }, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error editing comment:', error);
    throw error;
  }
};

export const deleteComment = async (commentId, userId) => {
  try {
    const response = await api.delete(`/comments/${commentId}`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Get post details
export const getPost = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting post details:', error);
    throw error;
  }
};

// Get user details
export const getUser = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user details:', error);
    throw error;
  }
};

// Search users (for @mentions)
export const searchUsers = async (query) => {
  try {
    const response = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};
