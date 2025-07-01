import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('lms_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Get users from localStorage (includes admin-created users)
    const storedUsers = localStorage.getItem('lms_users');
    let allUsers = [];
    
    if (storedUsers) {
      allUsers = JSON.parse(storedUsers);
    } else {
      // Default users if no stored users exist
      allUsers = [
        { id: 1, email: 'admin@edu.com', password: 'admin123', role: 'admin', name: 'Admin User' },
        { id: 2, email: 'student@edu.com', password: 'student123', role: 'student', name: 'John Doe' },
        { id: 3, email: 'jane@edu.com', password: 'jane123', role: 'student', name: 'Jane Smith' }
      ];
      // Store default users
      localStorage.setItem('lms_users', JSON.stringify(allUsers));
    }

    const foundUser = allUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('lms_user', JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    } else {
      return { success: false, error: 'Invalid email or password' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lms_user');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};