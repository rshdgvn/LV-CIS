import React, { createContext, useContext, useState, useEffect } from "react";
import { APP_URL } from "@/lib/config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState({
    id: null,
    name: "",
    username: "",
    email: "",
    role: "",
    created_at: "",
    updated_at: "",
    email_verified_at: null,
  });
  const [loading, setLoading] = useState(true);

  const getUser = async (authToken = token) => {
    if (!authToken) {
      setLoading(false)
      return null;
    }

    try {
      const res = await fetch(`${APP_URL}/user`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user");

      const data = await res.json();
      setUser((prev) => ({ ...prev, ...data }));
      return data;
    } catch (error) {
      setToken(null);
      localStorage.removeItem("token");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, [token]);

  const isAdmin = user.role === "admin" && !!user.id;
  const isValidUser = !!user.id;

  return (
    <AuthContext.Provider
      value={{ token, setToken, user, isAdmin, isValidUser, loading, getUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
