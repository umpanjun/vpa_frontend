import React, { useState } from "react";
import axios from "../services/api";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import BottomNav from "../components/BottomNav";

const API = import.meta.env.VITE_API_BASE;
axios.defaults.withCredentials = true;

const roles = ["admin", "CEO", "Secretary", "Foreman","audit"];


const UserFormAdd = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "staff",
    display_name: "",
    first_name: "",
    last_name: "",
    nickname: "",
    profile_picture: "",
    is_active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/users`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("สร้างผู้ใช้ใหม่เรียบร้อย");
      navigate("/users/manage");
    } catch (err) {
      console.error("❌ Failed to create user", err.response?.data || err);
      alert("ไม่สามารถสร้างผู้ใช้ได้: " + (err.response?.data?.message || ""));
    }
  };

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
          <h2 className="text-xl font-bold text-center flex-1">เพิ่มผู้ใช้ใหม่</h2>
        <div className="w-16" /> {/* spacer ให้ Title อยู่กลางจริงๆ */}
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-4">
        
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded-xl shadow space-y-3"
        >
          <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2" />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2" />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2" />
          <input type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
          <input type="text" name="display_name" placeholder="Display Name" value={form.display_name} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
          <input type="text" name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
          <input type="text" name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
          <input type="text" name="nickname" placeholder="Nickname" value={form.nickname} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
          <input type="text" name="profile_picture" placeholder="Profile Picture URL" value={form.profile_picture} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />

          <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
            Active
          </label>

          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
            สร้างผู้ใช้
          </button>
        </form>
      </div>

      <BottomNav active="users" />
    </div>
  );
};

export default UserFormAdd;
