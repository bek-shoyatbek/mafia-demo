import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // In a real app, this would be an API call
      const savedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const user = savedUsers.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        throw new Error("Invalid username or password");
      }

      const userWithoutPassword = {
        id: user.id,
        username: user.username,
      };

      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username, password) => {
    try {
      // In a real app, this would be an API call
      const savedUsers = JSON.parse(localStorage.getItem("users") || "[]");

      // Check if username already exists
      if (savedUsers.some((user) => user.username === username)) {
        throw new Error("Username already exists");
      }

      const newUser = {
        id: `user_${Date.now()}`,
        username,
        password,
      };

      savedUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(savedUsers));

      const userWithoutPassword = {
        id: newUser.id,
        username: newUser.username,
      };

      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
