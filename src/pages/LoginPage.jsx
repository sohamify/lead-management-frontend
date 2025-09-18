import React from 'react';
import Login from '../components/Auth/Login';

function LoginPage({ setIsAuthenticated }) {
  return <Login setIsAuthenticated={setIsAuthenticated} />;
}

export default LoginPage;