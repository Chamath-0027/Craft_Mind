import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create context
const UserContext = createContext();

// Create provider component
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try to get from localStorage
        const savedUser = localStorage.getItem('skillshare_user');
        
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Initialize or get device ID
  useEffect(() => {
    const savedDeviceId = localStorage.getItem('skillshare_device_id');
    if (!savedDeviceId) {
      const newDeviceId = crypto.randomUUID();
      localStorage.setItem('skillshare_device_id', newDeviceId);
    }
  }, []);

  // Check for existing user session on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('skillshare_user');
    const storedToken = localStorage.getItem('skillshare_token');
    
    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      
      // Modified: Use token directly without Bearer prefix
      axios.defaults.headers.common['Authorization'] = storedToken;
    } else {
      setCurrentUser(null);
      // Clear any existing auth headers when no user is logged in
      delete axios.defaults.headers.common['Authorization'];
    }
    
    // No matter what, make sure we're not in a loading state
    setLoading(false);
  }, []);

  // Function to register user
  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:8081/api/auth/register', userData);
      const user = response.data;
      setCurrentUser(user);
      localStorage.setItem('skillshare_user', JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };
  
  // Function to login user
  const login = async (credentials) => {
    try {
      const deviceId = localStorage.getItem('skillshare_device_id');
      const response = await axios.post('http://localhost:8081/api/auth/login', 
        credentials,
        {
          headers: {
            'X-Device-ID': deviceId,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const { user, token } = response.data;
      
      // Store auth data
      setCurrentUser(user);
      localStorage.setItem('skillshare_user', JSON.stringify(user));
      localStorage.setItem('skillshare_token', token);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid credentials'
      };
    }
  };

  // Function to update user
  const updateUser = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('skillshare_user', JSON.stringify(userData));
  };
  
  // Function to logout
  const logout = async () => {
    try {
      const token = localStorage.getItem('skillshare_token');
      if (token) {
        await axios.post('http://localhost:8081/api/auth/logout', {}, {
          headers: { 'Authorization': token }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setCurrentUser(null);
    localStorage.removeItem('skillshare_user');
    localStorage.removeItem('skillshare_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      loading, 
      register,
      login,
      updateUser, 
      logout 
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Create custom hook for using user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
