import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

const Navigation = () => {
  const { currentUser, logout } = useUser();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <nav className="bg-facebook-card border-b border-facebook-divider shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="font-bold text-xl text-facebook-primary">CraftMind</Link>
          </div>
          
          {currentUser ? (
            <div className="flex items-center">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-facebook-text-primary hover:text-facebook-primary transition duration-300">Home</Link>
                <Link to="/groups" className="text-facebook-text-primary hover:text-facebook-primary transition duration-300">Groups</Link>
                <Link to="/achievements" className="text-facebook-text-primary hover:text-facebook-primary transition duration-300">Achievements</Link>
                <Link to="/profile" className="text-facebook-text-primary hover:text-facebook-primary transition duration-300">Profile</Link>
                
            
                
                
                
                {/* Add NotificationBell here */}
                <NotificationBell />
                


              
                
                <div className="relative">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none text-facebook-text-primary hover:text-facebook-primary transition duration-300"
                  >
                    <span className="font-medium text-black">{currentUser.fullName || currentUser.username}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link 
                        to="/profile" 
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Profile
                      </Link>
                      <Link 
                        to="/notifications" 
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        All Notifications
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mobile Navigation */}
              <div className="md:hidden flex items-center space-x-2">
                {/* Add NotificationBell for mobile */}
                <NotificationBell />
                
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center p-2 rounded-md hover:bg-indigo-700 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 left-0 mt-[43px] top-0 bg-white shadow-md py-2 z-10 text-gray-800">
                    <Link 
                      to="/" 
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Home
                    </Link>
                    <Link 
                      to="/groups" 
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Groups
                    </Link>
                    <Link 
                      to="/achievements" 
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Achievements
                    </Link>
                    <Link 
                      to="/profile" 
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/notifications" 
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Notifications
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-x-4">
              <Link 
                to="/login" 
                className="py-2 px-4 rounded hover:bg-gray-800 transition duration-300"
              >
                Log In
              </Link>
              <Link 
                to="/register" 
                className="py-2 px-4 bg-white text-black font-medium rounded hover:bg-gray-100 transition duration-300"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

/* <div className="relative">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none text-facebook-text-primary hover:text-facebook-primary transition duration-300"
                  >
                    <span className="font-high text-white">{currentUser.fullName || currentUser.username}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button> */
