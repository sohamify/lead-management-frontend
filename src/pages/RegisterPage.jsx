import React from 'react';
import Register from '../components/Auth/Register';

function RegisterPage({ setIsAuthenticated }) {
  return <Register setIsAuthenticated={setIsAuthenticated} />;
}

export default RegisterPage;