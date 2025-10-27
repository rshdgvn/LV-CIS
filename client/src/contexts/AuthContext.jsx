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

  const getUser = async () => {
    try {
      const res = await fetch(`${APP_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await res.json();
      setUser(data);
      console.log("User:", data);
      return data;
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    if (token) {
      getUser();
    }
  }, [token]);

  const isAdmin = user.role == 'admin'

  return (
    <AuthContext.Provider value={{ token, setToken, user, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
