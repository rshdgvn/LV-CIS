import React, { createContext, useContext, useState, useEffect } from "react";

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
      const res = await fetch("http://127.0.0.1:8000/api/user", {
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

  return (
    <AuthContext.Provider value={{ token, setToken, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
