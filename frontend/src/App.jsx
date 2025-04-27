import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import Navigation from './components/Navigation';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage'; // Import the NotificationsPage
import AchievementsPage from './pages/AchievementsPage'; // Import the AchievementsPage
import Groups from './pages/Groups'; // Import the Groups page
import GroupDetailPage from './pages/GroupDetailPage'; // Import the GroupDetailPage
import { useUser } from './contexts/UserContext';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useUser();
  
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      <Route path="/post/:postId" element={
        <ProtectedRoute>
          <PostDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={ // Add route for notifications
        <ProtectedRoute>
          <NotificationsPage />
        </ProtectedRoute>
      } />
      <Route path="/achievements" element={ // Add route for achievements
        <ProtectedRoute>
          <AchievementsPage />
        </ProtectedRoute>
      } />
      <Route path="/groups" element={ // Add route for groups
        <ProtectedRoute>
          <Groups />
        </ProtectedRoute>
      } />
      <Route path="/groups/:groupId" element={ 
        <ProtectedRoute>
          <GroupDetailPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-facebook-dark">
          <Navigation />
          
          <main className="text-facebook-text-primary">
            <AppRoutes />
          </main>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
