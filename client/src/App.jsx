import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import PostInternship from './pages/PostInternship';
import Tracking from './pages/Tracking';
import Admin from './pages/Admin';
import InternshipDetails from './pages/InternshipDetails';
import Footer from './components/Footer';

// Protected Route Component
const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/internships/:id" element={<InternshipDetails />} />
          
          {/* Protected Routes */}
          <Route path="/post" element={
            <PrivateRoute>
              <PostInternship />
            </PrivateRoute>
          } />
          <Route path="/tracking" element={
            <PrivateRoute>
              <Tracking />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute adminOnly={true}>
              <Admin />
            </PrivateRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
