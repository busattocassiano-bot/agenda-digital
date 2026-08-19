import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('auth_token') === 'simulated_token_123';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('registeredUsers');
    return saved ? JSON.parse(saved) : [];
  });

  const register = (email, password, name) => {
    // Check if email already exists
    if (registeredUsers.find(u => u.email === email)) {
      return false; // Email already in use
    }
    
    const newUser = { email, password, name };
    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    return true;
  };

  const login = (email, password) => {
    // Check if credentials match any registered user
    const user = registeredUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      localStorage.setItem('auth_token', 'simulated_token_123');
      localStorage.setItem('current_user', JSON.stringify(user));
      return true;
    }
    
    return false; // Invalid credentials
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  };

  const updateUser = (updatedData) => {
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedData };
      setCurrentUser(newUser);
      localStorage.setItem('current_user', JSON.stringify(newUser));

      // Also update in registeredUsers
      const updatedList = registeredUsers.map(u => u.email === currentUser.email ? newUser : u);
      setRegisteredUsers(updatedList);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedList));
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
