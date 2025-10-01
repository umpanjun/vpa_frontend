// Frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../api"; // ✅ ใช้ instance axios ที่มี API_BASE

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // โหลด user ตอน mount (จาก localStorage + sync จาก backend)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && storedUser !== "undefined") {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);

        // ✅ ถ้ามี token ไปโหลดข้อมูลสดจาก backend
        if (token) {
          axios
            .get(`/api/users/${parsed.user_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
              if (res.data?.data) {
                setUser(res.data.data);
                localStorage.setItem("user", JSON.stringify(res.data.data));
              }
            })
            .catch((err) => {
              console.error("โหลด user สดไม่สำเร็จ:", err);
            });
        }
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
