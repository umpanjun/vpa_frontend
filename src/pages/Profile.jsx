// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../api";
import { Pencil, Save, X, Camera } from "lucide-react";
import BottomNav from "../components/BottomNav";

const API = import.meta.env.VITE_API_BASE;

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  // ✅ role ที่สามารถแก้ไข email, role ได้
  const canManageAll = ["admin", "CEO", "Secretary"].includes(user?.role);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/users/${user.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(res.data.data);
      } catch (err) {
        console.error("โหลดโปรไฟล์ล้มเหลว:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.user_id) loadProfile();
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("first_name", form.first_name || "");
      formData.append("last_name", form.last_name || "");
      formData.append("nickname", form.nickname || "");
      formData.append("phone", form.phone || "");
      if (canManageAll) {
        formData.append("email", form.email || "");
        formData.append("role", form.role || "");
      }
      if (file) formData.append("profile_picture", file);

      const res = await axios.put(`/api/users/${user.user_id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("บันทึกโปรไฟล์สำเร็จ");
      setForm(res.data.data);
      setEditMode(false);
      setFile(null);
    } catch (err) {
      console.error("บันทึกไม่สำเร็จ:", err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  if (loading) return <div className="p-4">กำลังโหลด...</div>;

  // ✅ avatar URL (ใช้ UI Avatar ถ้าไม่มีรูป)
  const avatarUrl = form.profile_picture
    ? `${API}${form.profile_picture}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        `${form.first_name || "U"} ${form.last_name || ""}`
      )}&background=random&bold=true`;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="p-6 max-w-screen-sm mx-auto text-center">
        {/* Avatar */}
        <div className="relative inline-block mb-4">
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-32 h-32 rounded-full border shadow object-cover mx-auto"
          />
          {editMode && (
            <label className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full cursor-pointer text-white">
              <Camera className="w-4 h-4" />
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>

        {/* Name */}
        <h1 className="text-2xl font-bold mb-1">
          {form.first_name} {form.last_name}
        </h1>
        <p className="text-gray-600 mb-4">{form.email}</p>

        {/* Info */}
        <div className="bg-white shadow rounded-xl p-5 space-y-3 text-left">
          {/* Nickname */}
          <div>
            <span className="font-semibold">ชื่อเล่น: </span>
            {editMode ? (
              <input
                type="text"
                name="nickname"
                value={form.nickname || ""}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full"
              />
            ) : (
              <span>{form.nickname || "-"}</span>
            )}
          </div>

          {/* Phone */}
          <div>
            <span className="font-semibold">เบอร์โทร: </span>
            {editMode ? (
              <input
                type="text"
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full"
              />
            ) : (
              <span>{form.phone || "-"}</span>
            )}
          </div>

          {/* Role */}
          <div>
            <span className="font-semibold">บทบาท: </span>
            {editMode && canManageAll ? (
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="border rounded px-2 py-1"
              >
                <option value="admin">Admin</option>
                <option value="CEO">CEO</option>
                <option value="Secretary">Secretary</option>
                <option value="Foreman">Foreman</option>
                <option value="staff">Staff</option>
              </select>
            ) : (
              <span className="text-blue-600 font-semibold">{form.role}</span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-3 justify-center">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" /> แก้ไขโปรไฟล์
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> บันทึก
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-5 py-2 bg-gray-500 text-white rounded-lg flex items-center gap-2"
              >
                <X className="w-4 h-4" /> ยกเลิก
              </button>
            </>
          )}
        </div>
      </div>

      {/* ✅ BottomNav */}
      <BottomNav />
    </div>
  );
}
