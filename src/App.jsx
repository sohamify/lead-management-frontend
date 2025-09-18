import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LeadsPage from './pages/LeadsPage';
import LeadForm from './components/Leads/LeadForm';
import api from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        await api.get('/auth/me');
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error.response?.status, error.response?.data);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/leads" /> : <LoginPage setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/leads" /> : <RegisterPage setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/leads"
          element={
            isAuthenticated ? (
              <LeadsPage setIsAuthenticated={setIsAuthenticated} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/leads/create"
          element={isAuthenticated ? <LeadForm /> : <Navigate to="/login" />}
        />
        <Route
          path="/leads/edit/:id"
          element={isAuthenticated ? <LeadForm /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/leads" />} />
      </Routes>
    </Router>
  );
}

export default App;