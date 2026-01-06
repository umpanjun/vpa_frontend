// src/pages/UserFormEdit.jsx
import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import BottomNav from "../components/BottomNav";

const API = import.meta.env.VITE_API_BASE;
axios.defaults.withCredentials = true;

const roles = ["admin", "ceo", "secretary", "foreman", "staff"];

const UserFormEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(res.data.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/users/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว");
      navigate("/users/manage");
    } catch (err) {
      console.error("Failed to update user", err);
      alert("ไม่สามารถอัปเดตผู้ใช้ได้");
    }
  };

  if (loading) return <div className="p-4">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top bar */}
      <div className="mx-auto max-w-screen-sm px-4 pt-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="w-6 h-6 stroke-[3]" />
          <span className="text-lg font-medium text-blue-600">Back</span>
        </button>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-4">
        <h2 className="text-xl font-bold mb-4">แก้ไขข้อมูลผู้ใช้</h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded-xl shadow space-y-3"
        >
          <input type="text" name="username" value={form.username || ""} onChange={handleChange} placeholder="Username" className="w-full border rounded-lg px-3 py-2" />
          <input type="email" name="email" value={form.email || ""} onChange={handleChange} placeholder="Email" className="w-full border rounded-lg px-3 py-2" />
          <input type="text" name="phone" value={form.phone || ""} onChange={handleChange} placeholder="Phone" className="w-full border rounded-lg px-3 py-2" />
          <input type="text" name="display_name" value={form.display_name || ""} onChange={handleChange} placeholder="Display Name" className="w-full border rounded-lg px-3 py-2" />
          <input type="text" name="first_name" value={form.first_name || ""} onChange={handleChange} placeholder="First Name" className="w-full border rounded-lg px-3 py-2" />
          <input type="text" name="last_name" value={form.last_name || ""} onChange={handleChange} placeholder="Last Name" className="w-full border rounded-lg px-3 py-2" />
          <input type="text" name="nickname" value={form.nickname || ""} onChange={handleChange} placeholder="Nickname" className="w-full border rounded-lg px-3 py-2" />
          <input type="text" name="profile_picture" value={form.profile_picture || ""} onChange={handleChange} placeholder="Profile Picture URL" className="w-full border rounded-lg px-3 py-2" />

          <select name="role" value={form.role || "staff"} onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_active" checked={form.is_active || false} onChange={handleChange} />
            Active
          </label>

          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
            บันทึกการแก้ไข
          </button>
        </form>
      </div>

      <BottomNav active="users" />
    </div>
  );
};

export default UserFormEdit;
