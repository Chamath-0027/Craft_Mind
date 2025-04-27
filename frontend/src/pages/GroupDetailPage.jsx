import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { useUser } from '../contexts/UserContext';

const GroupDetailPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { currentUser } = useUser();
  
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    isPublic: true  // Match the property name in the backend
  });

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const token = localStorage.getItem('skillshare_token');
        const [groupResponse, postsResponse, membersResponse] = await Promise.all([
          axios.get(`http://localhost:8081/api/groups/${groupId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`http://localhost:8081/api/groups/${groupId}/posts`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`http://localhost:8081/api/groups/${groupId}/members`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        setGroup(groupResponse.data);
        setPosts(postsResponse.data);
        setMembers(membersResponse.data);
        
        // Initialize form with correct field names
        setEditForm({
          name: groupResponse.data.name || '',
          description: groupResponse.data.description || '',
          isPublic: groupResponse.data.isPublic || true  // Match the property name
        });
      } catch (error) {
        console.error('Error fetching group details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  const isOwner = currentUser?.id === group?.ownerId;

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('skillshare_token');
      const response = await axios.put(
        `http://localhost:8081/api/groups/${groupId}?userId=${currentUser.id}`,
        editForm,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setGroup(response.data);
      setIsEditing(false);
      alert('Group updated successfully!');
    } catch (error) {
      console.error('Error updating group:', error);
      alert(error.response?.data?.message || 'Failed to update group');
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('skillshare_token');
      await axios.delete(
        `http://localhost:8081/api/groups/${groupId}?userId=${currentUser.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      alert('Group deleted successfully');
      navigate('/groups');
    } catch (error) {
      console.error('Error deleting group:', error);
      alert(error.response?.data?.message || 'Failed to delete group');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the group?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('skillshare_token');
      await axios.delete(
        `http://localhost:8081/api/groups/${groupId}/members/${memberId}?userId=${currentUser.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setMembers(members.filter(member => member.id !== memberId));
      alert('Member removed from group');
    } catch (error) {
      console.error('Error removing member:', error);
      alert(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleRemovePost = async (postId) => {
    if (!window.confirm('Are you sure you want to remove this post from the group?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('skillshare_token');
      await axios.delete(
        `http://localhost:8081/api/groups/${groupId}/posts/${postId}?userId=${currentUser.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setPosts(posts.filter(post => post.id !== postId));
      alert('Post removed from group');
    } catch (error) {
      console.error('Error removing post:', error);
      alert(error.response?.data?.message || 'Failed to remove post');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2 text-black">{group?.name}</h1>
        <p className="text-gray-700">{group?.description}</p>
        
        {isOwner && (
          <div className="mt-4 flex space-x-3">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="w-full">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded text-black"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded text-black"
                    rows="3"
                  />
                </div>
                
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isPublic}
                    onChange={(e) => setEditForm({...editForm, isPublic: e.target.checked})}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">Public Group</label>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit Group
                </button>
                <button
                  onClick={handleDeleteGroup}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete Group
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {isOwner && !isEditing && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-black">Group Management</h2>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">Members ({members.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {members.map((member) => (
                <div key={member.id} className="flex justify-between items-center p-2 border-b">
                  <div className="text-black">
                    {member.fullName || member.username}
                    {member.id === group.ownerId && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Owner</span>
                    )}
                  </div>
                  {member.id !== group.ownerId && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold my-6 text-white">Posts</h2>
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">No posts have been shared in this group yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map(post => (
            <div key={post.id} className="relative">
              {isOwner && (
                <button
                  onClick={() => handleRemovePost(post.id)}
                  className="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 rounded text-sm"
                >
                  Remove Post
                </button>
              )}
              <PostCard 
                post={post} 
                userId={currentUser?.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupDetailPage;




/*Notification_&_Group


<div className="space-y-2">
          {posts.map(post => (
            <div key={post.id} className="relative">
              {isOwner && (
                <button
                  onClick={() => handleRemovePost(post.id)}
                  className="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 rounded text-sm"
                >*/
