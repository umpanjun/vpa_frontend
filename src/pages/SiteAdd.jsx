// src/pages/SiteAdd.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ChevronLeft, Upload } from "lucide-react";

const API = import.meta.env.VITE_API_BASE;
axios.defaults.withCredentials = true;

// ——— helpers ———
const toDateInput = (v) => {
  if (!v) return "";
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s.slice(0, 10);
  return d.toISOString().slice(0, 10);
};

export default function SiteAdd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  const STATUS_OPTIONS = useMemo(
    () => ["Planning", "In Progress", "Completed", "On Hold", "Cancelled"],
    []
  );

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // ✅ อัปโหลดรูปไปที่ /api/upload/site-image
  const handleUploadCover = async () => {
    if (!file) return null;
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await axios.post(`${API}/api/upload/site-image`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.url) return res.data.url;
      return null;
    } catch (err) {
      console.error("Upload cover error:", err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const decoded = token ? jwtDecode(token) : {};
      const created_by = decoded?.user_id || null;

      const formEl = e.target;
      const site_name = formEl.site_name.value?.trim();
      const site_address = formEl.site_address.value?.trim();
      const description = formEl.description.value?.trim();
      const status = formEl.status.value;
      const budgetRaw = formEl.budget.value;
      const start_date = toDateInput(formEl.start_date.value);
      const end_dateRaw = formEl.end_date.value;
      const end_date = end_dateRaw ? toDateInput(end_dateRaw) : "";

      if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
        throw new Error("รูปแบบวันที่เริ่มงานไม่ถูกต้อง (ต้องเป็น YYYY-MM-DD)");
      }
      if (end_date && !/^\d{4}-\d{2}-\d{2}$/.test(end_date)) {
        throw new Error("รูปแบบวันที่สิ้นสุดไม่ถูกต้อง (ต้องเป็น YYYY-MM-DD)");
      }
      if (end_date && new Date(end_date) < new Date(start_date)) {
        throw new Error("วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่ม");
      }

      const budget =
        budgetRaw === "" || budgetRaw === null ? "" : String(Number(budgetRaw));

      // ✅ อัปโหลดไฟล์ก่อน ถ้ามี
      let coverUrl = "";
      if (file) {
        const uploaded = await handleUploadCover();
        if (uploaded) coverUrl = uploaded; // เช่น "/uploads/sites/xxxx.webp"
      }

      // ✅ ส่งข้อมูลไปสร้าง site
      await axios.post(
        `${API}/api/sites`,
        {
          site_name,
          site_address,
          description: description || "",
          status,
          start_date,
          end_date: end_date || null,
          budget: budget || null,
          created_by,
          image_url: coverUrl || null, // ใช้ url ที่ backend ส่งกลับมา
        },
        { withCredentials: true }
      );

      alert("บันทึกสำเร็จ");
      navigate("/dashboard");
    } catch (err) {
      console.error("เพิ่มไซต์งานผิดพลาด:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "บันทึกข้อมูลไม่สำเร็จ";
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top Bar */}
      <div className="mx-auto max-w-screen-sm px-4 pt-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100"
        >
          <ChevronLeft className="w-6 h-6 stroke-[3] text-blue-600" />
          <span className="text-lg font-medium text-blue-600">Back</span>
        </button>
        <h1 className="text-2xl font-extrabold text-center flex-1">
          เพิ่มไซต์งานใหม่
        </h1>
        <div className="w-16" />
      </div>

      {/* Form */}
      <div className="max-w-screen-sm mx-auto px-4 mt-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow space-y-4"
        >
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อไซต์งาน
            </label>
            <input
              name="site_name"
              placeholder="ชื่อไซต์งาน"
              required
              className="w-full border rounded-xl px-3 py-2 focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ที่อยู่ไซต์งาน
            </label>
            <input
              name="site_address"
              placeholder="ที่อยู่"
              required
              className="w-full border rounded-xl px-3 py-2 focus:ring focus:ring-blue-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่เริ่ม
              </label>
              <input
                type="date"
                name="start_date"
                required
                className="w-full border rounded-xl px-3 py-2 focus:ring focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่สิ้นสุด (ถ้ามี)
              </label>
              <input
                type="date"
                name="end_date"
                className="w-full border rounded-xl px-3 py-2 focus:ring focus:ring-blue-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              งบประมาณ (บาท)
            </label>
            <input
              type="number"
              name="budget"
              placeholder="กรอกงบประมาณ (ไม่บังคับ)"
              min="0"
              step="0.01"
              className="w-full border rounded-xl px-3 py-2 focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียด
            </label>
            <textarea
              name="description"
              placeholder="รายละเอียดไซต์งาน"
              rows={3}
              className="w-full border rounded-xl px-3 py-2 focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              สถานะ
            </label>
            <select
              name="status"
              defaultValue="Planning"
              className="w-full border rounded-xl px-3 py-2 focus:ring focus:ring-blue-200"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รูปหน้าปกไซต์งาน
            </label>
            <label className="flex items-center gap-2 px-4 py-2 border rounded-xl cursor-pointer hover:bg-gray-50">
              <Upload className="w-4 h-4 text-gray-600" />
              <span>{file ? file.name : "เลือกไฟล์ภาพ"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFile(f || null);
                  if (preview) URL.revokeObjectURL(preview);
                  setPreview(f ? URL.createObjectURL(f) : "");
                }}
              />
            </label>
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="mt-3 w-full h-48 object-cover rounded-xl border"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
          >
            {loading ? "กำลังบันทึก..." : "บันทึกไซต์งาน"}
          </button>
        </form>
      </div>
    </div>
  );
}
