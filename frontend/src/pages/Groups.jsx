import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUser();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    isPublic: true
  });

  useEffect(() => {
    fetchGroups();
    if (currentUser) {
      fetchUserGroups();
    }
  }, [currentUser]);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('skillshare_token');
      const response = await axios.get('http://localhost:8081/api/groups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data) {
        setGroups(response.data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGroups = async () => {
    if (!currentUser) return;
    try {
      const token = localStorage.getItem('skillshare_token');
      const response = await axios.get(`http://localhost:8081/api/groups/user/${currentUser.id}/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data) {
        console.log("User's groups:", response.data);
        setUserGroups(response.data);
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
      alert('Error loading your groups. Please refresh the page.');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('skillshare_token');
      const response = await axios.post(
        'http://localhost:8081/api/groups',
        {
          ...newGroup,
          ownerId: currentUser.id
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data) {
        setShowCreateForm(false);
        fetchGroups();
        // Show success message
        alert('Group created successfully!');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert(error.response?.data?.message || 'Failed to create group. Please try again.');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const token = localStorage.getItem('skillshare_token');
      const response = await axios.post(
        `http://localhost:8081/api/groups/${groupId}/join?userId=${currentUser.id}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // If successful, add the group to userGroups immediately
      if (response.data) {
        // Find the joined group in the groups array
        const joinedGroup = groups.find(g => g.id === groupId);
        if (joinedGroup) {
          setUserGroups(prevGroups => [...prevGroups, joinedGroup]);
        }
      }
      
      // Then refresh both lists from server
      fetchGroups();
      fetchUserGroups();
      
    } catch (error) {
      console.error('Error joining group:', error);
      alert(error.response?.data?.message || 'Failed to join group. Please try again.');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      const token = localStorage.getItem('skillshare_token');
      await axios.delete(
        `http://localhost:8081/api/groups/${groupId}/leave?userId=${currentUser.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update both groups and userGroups state immediately without waiting for the fetch
      setUserGroups(prevGroups => prevGroups.filter(g => g.id !== groupId));
      
      // Then refresh from server
      fetchGroups();
      fetchUserGroups();
      
    } catch (error) {
      console.error('Error leaving group:', error);
      alert(error.response?.data?.message || 'Failed to leave group. Please try again.');
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Please log in to view groups</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-facebook-primary text-white px-4 py-2 rounded-md hover:bg-facebook-hover"
        >
          Create Group
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-facebook-primary"></div>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center text-gray-600 py-8">
          <p>No groups found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div key={group.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <Link to={`/groups/${group.id}`}>
                <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
              </Link>
              <p className="text-gray-600 mb-4">{group.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {group.memberCount} members
                </span>
                
                {/* Check if user is a member or owner of this group */}
                {group.ownerId === currentUser.id ? (
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded">Owner</span>
                ) : userGroups.some(g => g.id === group.id) ? (
                  <button
                    onClick={() => handleLeaveGroup(group.id)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                  >
                    Leave
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="px-4 py-2 bg-facebook-primary text-white rounded hover:bg-facebook-hover"
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <input
                type="text"
                placeholder="Group Name"
                className="w-full mb-4 p-2 border rounded"
                value={newGroup.name}
                onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
              />
              <textarea
                placeholder="Description"
                className="w-full mb-4 p-2 border rounded"
                value={newGroup.description}
                onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
              />
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={newGroup.isPublic}
                  onChange={(e) => setNewGroup({...newGroup, isPublic: e.target.checked})}
                  className="mr-2"
                />
                <label>Public Group</label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-facebook-primary text-white rounded hover:bg-facebook-hover"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;



