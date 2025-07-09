import React, { createContext, useState, useContext } from 'react';

// Create a Context for authentication
export const AuthContext = createContext(null);

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// Define multiple admin accounts
const ADMIN_ACCOUNTS = [
  { email: 'admin1@example.com', password: 'password1' },
  { email: 'admin2@example.com', password: 'password2' },
  { email: 'admin3@example.com', password: 'password3' },
  { email: 'admin4@example.com', password: 'password4' },
  { email: 'admin5@example.com', password: 'password5' },
  { email: 'admin6@example.com', password: 'password6' },
  { email: 'admin7@example.com', password: 'password7' },
  { email: 'admin8@example.com', password: 'password8' },
  { email: 'admin9@example.com', password: 'password9' },
  { email: 'admin10@example.com', password: 'password10' },
  { email: 'admin@example.com', password: 'admin' }, 
];

// AuthProvider component
const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = ({ email, password }) => {
    // Check if the provided credentials match any of the admin accounts
    const isValidAdmin = ADMIN_ACCOUNTS.some(
      (account) => account.email === email && account.password === password
    );

    if (isValidAdmin) {
      setIsAuthenticated(true);
      return { success: true };
    } else {
      return { success: false, message: 'Email atau kata sandi Salah ' };
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