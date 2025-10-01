// src/pages/SiteEdit.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios, { API_BASE_URL } from "../api";
import { ChevronLeft } from "lucide-react";
import BottomNav from "../components/BottomNav";

const toDateInput = (v) => {
  if (!v) return "";
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s.slice(0, 10);
  return d.toISOString().slice(0, 10);
};

const resolveSiteImage = (image_url) => {
  if (!image_url) return "";
  const url = String(image_url);
  if (/^https?:\/\//i.test(url)) return url;              // URL เต็ม
  if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`; // พาธจากเซิร์ฟเวอร์
  return `${API_BASE_URL}/uploads/sites/${url}`;          // ชื่อไฟล์ล้วน
};

const STATUS_OPTIONS = [
  "Planning",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
];

export default function SiteEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/sites/${id}`).then((res) => {
      const d = res.data.data || {};
      setForm({
        ...d,
        start_date: toDateInput(d.start_date),
        end_date: toDateInput(d.end_date),
      });
      setLoading(false);
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // เก็บ number เป็น string ได้ แต่กัน NaN เล็กน้อย
    if (type === "number") {
      setForm({ ...form, [name]: value });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // แปลง "" เป็น null + กันวันที่เป็น YYYY-MM-DD
      const cleanForm = Object.fromEntries(
        Object.entries({
          ...form,
          start_date: toDateInput(form.start_date),
          end_date: toDateInput(form.end_date),
        }).map(([k, v]) => [k, v === "" ? null : v])
      );
      await axios.put(`/api/sites/${id}`, cleanForm);
      navigate(`/sites/${id}`);
    } catch (err) {
      console.error("บันทึกข้อมูลไซต์ผิดพลาด:", err);
      alert(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "บันทึกข้อมูลไซต์ผิดพลาด"
      );
    }
  };

  const handleDelete = async () => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบไซต์งานนี้?")) {
      try {
        await axios.delete(`/api/sites/${id}`);
        navigate("/sites");
      } catch (err) {
        console.error("ลบไซต์ผิดพลาด:", err);
        alert(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "ลบไซต์ผิดพลาด"
        );
      }
    }
  };

  if (loading) return <div className="p-4">กำลังโหลด...</div>;

  const previewSrc = resolveSiteImage(form.image_url);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header + Back Button */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="max-w-screen-sm mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 text-blue-600 hover:bg-gray-200 active:translate-y-px"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]" />
            <span className="text-lg font-medium text-blue-600">Back</span>
          </button>
          <h1 className="ml-2 text-base font-bold">แก้ไขข้อมูลไซต์</h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-screen-sm mx-auto px-4 py-4">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white p-5 rounded-2xl shadow"
        >
          {/* Site Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ชื่อไซต์
            </label>
            <input
              type="text"
              name="site_name"
              value={form.site_name || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ที่อยู่ไซต์
            </label>
            <textarea
              name="site_address"
              value={form.site_address || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              rows={3}
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                วันที่เริ่ม
              </label>
              <input
                type="date"
                name="start_date"
                value={form.start_date || ""}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                name="end_date"
                value={form.end_date || ""}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              คำอธิบาย
            </label>
            <textarea
              name="description"
              value={form.description || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              rows={3}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              สถานะ
            </label>
            <select
              name="status"
              value={form.status || "Planning"}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              งบประมาณ
            </label>
            <input
              type="number"
              name="budget"
              value={form.budget ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              min="0"
              step="0.01"
              placeholder="เช่น 1000000"
            />
          </div>

          {/* Map Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ลิงก์ Google Maps
            </label>
            <input
              type="text"
              name="map_link"
              value={form.map_link || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              placeholder="https://maps.google.com/..."
            />
          </div>

          {/* Cover Image (string) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ชื่อไฟล์/ลิงก์รูปปก
            </label>
            <input
              type="text"
              name="image_url"
              value={form.image_url || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              placeholder="เช่น site_123.jpg หรือ /uploads/sites/site_123.jpg หรือ URL เต็ม"
            />
            {previewSrc && (
              <img
                src={previewSrc}
                alt="site cover"
                className="w-full h-40 object-cover mt-3 rounded-xl border"
              />
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:translate-y-px shadow"
          >
            บันทึกการเปลี่ยนแปลง
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 active:translate-y-px shadow mt-3"
          >
            ลบไซต์งาน
          </button>
        </form>
      </div>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
