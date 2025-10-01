// src/pages/UserManage.jsx
import React, { useEffect, useState } from "react";
import axios from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Pencil,
  User as UserIcon,
  ChevronLeft,
} from "lucide-react";
import BottomNav from "../components/BottomNav";

const API = import.meta.env.VITE_API_BASE;
axios.defaults.withCredentials = true;

const UserManage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u.user_id !== id));
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("ไม่สามารถลบผู้ใช้ได้");
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-6 text-center text-red-600">
        คุณไม่มีสิทธิ์เข้าถึงหน้านี้
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ✅ Top bar */}
      <div className="mx-auto max-w-screen-sm px-4 pt-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="w-6 h-6 stroke-[3] text-blue-600" />
          <span className="text-lg font-medium text-blue-600">Back</span>
        </button>
         <h2 className="text-xl font-bold  text-center flex-1 ">จัดการบัญชีผู้ใช้</h2>
<div className="w-16" /> {/* spacer ให้ Title อยู่กลางจริงๆ */}
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-4">
       
        {/* รายการผู้ใช้ */}
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.user_id}
              className="flex items-center justify-between p-4 bg-white rounded-2xl shadow hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900">{u.username}</p>
                  <p className="text-sm text-gray-600">{u.email}</p>
                  <p className="text-xs text-gray-500">
                    Role: {u.role} | Status: {u.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* ปุ่มแก้ไข */}
                <button
                  onClick={() => navigate(`/users/${u.user_id}/edit`)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  title="แก้ไขผู้ใช้"
                >
                  <Pencil className="w-5 h-5 text-gray-600" />
                </button>
                {/* ปุ่มลบ */}
                {u.role !== "admin" && (
                  <button
                    onClick={() => handleDelete(u.user_id)}
                    className="p-2 rounded-full hover:bg-red-100"
                    title="ลบผู้ใช้"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              ยังไม่มีผู้ใช้ในระบบ
            </div>
          )}
        </div>
      </div>

      {/* ✅ Floating Add Button (เฉพาะ admin) */}
      <button
        onClick={() => navigate("/users/add")}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition"
        title="เพิ่มผู้ใช้"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* ✅ Navbar */}
      <BottomNav active="users" />
    </div>
  );
};

export default UserManage;
