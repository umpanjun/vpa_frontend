// src/pages/WorkerFormAdd.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft } from "lucide-react";

const API = import.meta.env.VITE_API_BASE;

const WorkerFormAdd = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    position: "",
    phone: "",
    national_id: "",
    skill_level: "",
    daily_wage: "",
    hire_date: "",
    status: "Active",
    assigned_site: ""
  });

  useEffect(() => {
    // โหลดรายการไซต์งานมาเป็น dropdown
    const loadSites = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/sites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSites(res.data?.data || []);
      } catch (err) {
        console.error("โหลดไซต์งานล้มเหลว:", err);
      }
    };
    loadSites();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/workers`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/workers");
    } catch (err) {
      console.error("Error adding worker", err);
      alert("ไม่สามารถเพิ่มพนักงานได้");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="mx-auto max-w-screen-md px-4 pt-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]" />
                                    <span className="text-lg font-medium text-blue-600">Back</span>
                                  </button>
                                  <h2 className="text-xl font-bold text-center flex-1">เพิ่มพนักงาน</h2>
        <div className="w-16" /> {/* spacer ให้ Title อยู่กลางจริงๆ */}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 max-w-screen-md mx-auto">
          
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow border">
          
          {/* First Name */}
          <div>
            <label className="block font-medium mb-1">ชื่อ</label>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block font-medium mb-1">นามสกุล</label>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block font-medium mb-1">ตำแหน่ง</label>
            <input
              type="text"
              name="position"
              value={form.position}
              onChange={handleChange}
              placeholder="เช่น IT Support"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block font-medium mb-1">โทรศัพท์</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="098xxxxxxx"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* National ID */}
          <div>
            <label className="block font-medium mb-1">บัตรประชาชน</label>
            <input
              type="text"
              name="national_id"
              value={form.national_id}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Skill */}
          <div>
            <label className="block font-medium mb-1">ทักษะ</label>
            <input
              type="text"
              name="skill_level"
              value={form.skill_level}
              onChange={handleChange}
              placeholder="เช่น 1"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Daily Wage */}
          <div>
            <label className="block font-medium mb-1">ค่าจ้างรายวัน (บาท)</label>
            <input
              type="number"
              name="daily_wage"
              value={form.daily_wage}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Hire Date */}
          <div>
            <label className="block font-medium mb-1">วันที่เริ่มงาน</label>
            <input
              type="date"
              name="hire_date"
              value={form.hire_date}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block font-medium mb-1">สถานะ</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Assigned Site */}
          <div>
            <label className="block font-medium mb-1">ไซต์งาน</label>
            <select
              name="assigned_site"
              value={form.assigned_site}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">-- เลือกไซต์งาน --</option>
              {sites.map((s) => (
                <option key={s.site_id} value={s.site_name}>
                  {s.site_name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerFormAdd;
