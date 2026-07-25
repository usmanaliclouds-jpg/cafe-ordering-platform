import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("cafe_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("cafe_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem("cafe_token", token);
    else localStorage.removeItem("cafe_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("cafe_user", JSON.stringify(user));
    else localStorage.removeItem("cafe_user");
  }, [user]);

  function login(authResponse) {
    setToken(authResponse.token);
    setUser(authResponse.user);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
