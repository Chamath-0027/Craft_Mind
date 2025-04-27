import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs'; // Changed from '@stomp/stompjs'

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useUser();
  const dropdownRef = useRef(null);
  const stompClientRef = useRef(null);
  const navigate = useNavigate();

  // Handle click outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Connect to WebSocket for real-time notifications
  useEffect(() => {
    if (currentUser) {
      const connectWebSocket = () => {
        const socket = new SockJS('http://localhost:8081/ws');
        const client = Stomp.over(socket); // Changed to use standard Stomp
        client.debug = null; // Disable debug logs

        // Add withCredentials option
        socket.withCredentials = true;

        client.connect({}, () => {
          // Subscribe to user-specific notifications
          client.subscribe(`/user/${currentUser.id}/topic/notifications`, (message) => {
            const notification = JSON.parse(message.body);
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
          });
        }, (error) => {
          console.error('WebSocket connection error:', error);
        });

        stompClientRef.current = client;
      };

      connectWebSocket();

      // Clean up function
      return () => {
        if (stompClientRef.current && stompClientRef.current.connected) {
          stompClientRef.current.disconnect();
        }
      };
    }
  }, [currentUser]);

  // Fetch notifications on component mount
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8081/api/notifications/user/${currentUser.id}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!currentUser) return;
    
    try {
      const response = await axios.get(`http://localhost:8081/api/notifications/user/${currentUser.id}/unread/count`);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:8081/api/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAsUnread = async (notificationId) => {
    try {
      await axios.put(`http://localhost:8081/api/notifications/${notificationId}/unread`);
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: false } : n
      ));

      /* setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: false } : n
      )); */
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser || unreadCount === 0) return;
    
    try {
      await axios.put(`http://localhost:8081/api/notifications/user/${currentUser.id}/read-all`);
      
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await axios.delete(`http://localhost:8081/api/notifications/${notificationId}`);
      
      // Update local state
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      setNotifications(updatedNotifications);
      
      // Update unread count if needed
      const wasUnread = notifications.find(n => n.id === notificationId)?.read === false;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if unread
      if (!notification.read) {
        await handleMarkAsRead(notification.id);
      }
      
      if (notification.relatedItemId) {
        // Verify post exists before navigating
        const response = await axios.get(`http://localhost:8081/api/posts/${notification.relatedItemId}`);
        if (response.data) {
          const postId = notification.relatedItemId;
          const commentPosition = notification.metadata?.commentPosition;
          
          navigate(`/post/${postId}`, {
            state: {
              scrollToComment: !!commentPosition,
              commentPosition: parseInt(commentPosition)
            }
          });
          setIsOpen(false);
        }
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
      if (error.response?.status === 404) {
        alert('The referenced post is no longer available');
      } else {
        alert('Could not load the post. Please try again.');
      }
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
    
    if (diffSecs < 60) return `${diffSecs} sec ago`;
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'LIKE': return 'bg-facebook-primary text-white';
      case 'COMMENT': return 'bg-facebook-primary text-white';
      case 'MENTION': return 'bg-facebook-primary text-white';
      case 'FOLLOW': return 'bg-facebook-hover text-white';
      default: return 'bg-facebook-button-secondary text-facebook-text-primary';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MENTION':
        return (
          <div className="p-2 rounded-full bg-facebook-primary text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'COMMENT':
        return (
          <div className="p-2 rounded-full bg-facebook-primary text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
            </svg>
          </div>
        );
      // ...existing code...
    }
  };

  const formatNotificationMessage = (notification) => {
    const message = notification.message;
    const relatedLink = notification.type === 'MENTION' ? 
      `Click to view the comment where you were mentioned` :
      `Click to view the post`;
      
    return (
      <div>
        <div className="font-medium">{notification.title}</div>
        <div className="text-sm text-gray-600">{message}</div>
        <div className="text-xs text-indigo-600 mt-1">{relatedLink}</div>
      </div>
    );
  };
  
  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="relative p-2 text-gray-800 hover:text-gray-600 rounded-full focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="text-sm text-indigo-600 hover:text-indigo-800"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto max-h-96">
            {loading ? (
              <div className="py-8 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p>No notifications yet</p>
              </div>
            ) : (
              <ul>
                {notifications.map(notification => (
                  <li 
                    key={notification.id} 
                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-indigo-50' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {formatNotificationMessage(notification)}
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <div className="relative group">
                          <button className="p-1 rounded-full hover:bg-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          </button>
                          
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                            {notification.read ? (
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsUnread(notification.id);
                                }}
                              >
                                Mark as unread
                              </button>
                            ) : (
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 text-center">
              <button
                className="text-sm text-indigo-600 hover:text-indigo-800"
                onClick={() => navigate('/notifications')}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
