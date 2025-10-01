// src/pages/Login.jsx
import React, { useState } from "react";
import axios from "../api";                // ✅ ใช้ instance เดียวกับโปรเจกต์ (baseURL + withCredentials)
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      // ⛳️ ยิง POST เท่านั้น
      const res = await axios.post("/api/auth/login", {
        username,
        password,
      });

      const { token, user } = res.data || {};

      // ✅ เก็บผ่าน AuthContext ตามสเปก (user, token)
      login(user, token);

      // “จดจำรหัสผ่าน” — ตัวอย่าง: เก็บ username ไว้ (อย่าเก็บ password)
      if (remember) {
        localStorage.setItem("remember_username", username);
      } else {
        localStorage.removeItem("remember_username");
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("ID หรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800">
      {/* Header */}
      <div className="bg-blue-600 px-6 py-8">
        <div className="max-w-4xl mx-auto text-white">
          <h1 className="text-2xl font-bold mb-2">
            บริษัท วี.พี.เอ เอ็นจิเนียริง แอนด์ ซัพพลาย จำกัด
          </h1>
          <p className="text-blue-100 mb-4">
            V.P.A. ENGINEERING AND SUPPLY COMPANY LIMITED
          </p>
          <p className="text-sm text-blue-200">
            รับเหมาก่อสร้าง ขายวัสดุ โรงงาน บ้านพักสำเร็จ คลังสินค้าและงานรับเหมาก่อสร้างอื่นๆ
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="flex justify-center px-4 -mt-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full border-4 border-blue-600 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">VPA</span>
            </div>
          </div>

          <p className="text-center text-gray-600 mb-6">กรุณาล็อกอินเข้าสู่ระบบ</p>

          {/* ❗️ไม่ใช้ onSubmit เพื่อกันเบราว์เซอร์ยิง GET */}
          <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ID / รหัสพนักงาน"
              autoComplete="username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password / รหัสผ่าน"
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />

            <label className="flex items-center select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember((v) => !v)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">จดจำรหัสผ่าน</span>
            </label>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="button"                 // ✅ ป้องกัน form-submit GET
              onClick={handleSubmit}        // ✅ เรียก POST ด้วยมือ
              disabled={loading}
              className={`w-full text-white py-3 rounded-lg transition ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "Login / เข้าสู่ระบบ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
