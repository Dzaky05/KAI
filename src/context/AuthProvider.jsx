// src/context/AuthProvider.jsx
import { createContext, useContext, useState } from 'react';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext); // custom hook untuk akses context

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = ({ email, password }) => {
    if (email === 'admin@example.com' && password === 'admin') {
      setIsAuthenticated(true);
      return { success: true };
    } else {
      return { success: false, message: 'Invalid email or password' };
    }
  };

  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
