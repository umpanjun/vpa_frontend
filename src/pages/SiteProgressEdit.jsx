// src/pages/SiteProgressEdit.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, Image as ImageIcon } from "lucide-react";
import axios from "../api";

export default function SiteProgressEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    overall: "",
    structure: "",
    electrical: "",
    plumbing: "",
    image_url: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");

  const numberOrEmpty = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : "";
  };

  // คำนวณ overall จาก 3 รายการ (เฉลี่ย)
  useEffect(() => {
    const s = Number(form.structure || 0);
    const e = Number(form.electrical || 0);
    const p = Number(form.plumbing || 0);
    const hasAny = [form.structure, form.electrical, form.plumbing].some(
      (x) => x !== "" && x !== null && x !== undefined
    );
    const avg = hasAny ? Math.round((s + e + p) / 3) : "";
    setForm((prev) => ({ ...prev, overall: avg }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.structure, form.electrical, form.plumbing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // เก็บเฉพาะตัวเลข 0-100
    const v = value === "" ? "" : Math.max(0, Math.min(100, Number(value)));
    setForm({ ...form, [name]: v });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setImageFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return null;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("image", imageFile);
      const res = await axios.post("/api/upload/site-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.url) return res.data.url; // ✅ ใช้ url แทน filename
      return null;
    } catch (err) {
      console.error("Upload error", err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let uploadedUrl = form.image_url;

      if (imageFile) {
        const url = await handleImageUpload();
        if (url) uploadedUrl = url;
      }

      await axios.post(`/api/sites/${id}/progress`, {
        ...form,
        overall: numberOrEmpty(form.overall),
        structure: numberOrEmpty(form.structure),
        electrical: numberOrEmpty(form.electrical),
        plumbing: numberOrEmpty(form.plumbing),
        image_url: uploadedUrl || null, // ✅ เก็บ url เต็ม เช่น /uploads/sites/xxx.webp
      });

      navigate(`/sites/${id}`);
    } catch (err) {
      console.error("Update progress error", err);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Top bar */}
      <div className="mx-auto max-w-md md:max-w-2xl px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
        >
          <ChevronLeft className="w-6 h-6 stroke-[3]" />
          <span className="text-lg font-medium text-blue-600">Back</span>
        </button>
      </div>

      <div className="mx-auto max-w-md md:max-w-2xl px-4">
        <h1 className="text-2xl font-extrabold mt-2">อัปเดทความคืบหน้า</h1>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                งานโครงสร้าง (%)
              </label>
              <input
                type="number"
                name="structure"
                value={form.structure}
                onChange={handleChange}
                placeholder="0 - 100"
                className="border rounded-xl p-2 w-full"
                min={0}
                max={100}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                งานระบบไฟ (%)
              </label>
              <input
                type="number"
                name="electrical"
                value={form.electrical}
                onChange={handleChange}
                placeholder="0 - 100"
                className="border rounded-xl p-2 w-full"
                min={0}
                max={100}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                งานระบบน้ำ (%)
              </label>
              <input
                type="number"
                name="plumbing"
                value={form.plumbing}
                onChange={handleChange}
                placeholder="0 - 100"
                className="border rounded-xl p-2 w-full"
                min={0}
                max={100}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                เปอร์เซ็นรวม (คำนวณอัตโนมัติ)
              </label>
              <input
                type="number"
                name="overall"
                value={form.overall}
                readOnly
                className="border rounded-xl p-2 w-full bg-gray-50"
              />
            </div>
          </div>

          {/* Upload */}
          <div className="rounded-xl border p-4">
            <label className="block text-sm text-gray-600 mb-2">
              อัปโหลดภาพปกล่าสุดของไซต์
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-full border cursor-pointer hover:bg-gray-50">
                <Upload className="w-4 h-4" />
                เลือกรูปภาพ
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {uploading && (
                <span className="text-blue-600 text-sm">กำลังอัปโหลด...</span>
              )}
            </div>
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="mt-3 w-full h-48 object-cover rounded-lg"
              />
            ) : form.image_url ? (
              <div className="mt-3 flex items-center gap-2 text-gray-600">
                <ImageIcon className="w-4 h-4" /> {form.image_url}
              </div>
            ) : null}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-green-500 text-white hover:bg-green-600"
            >
              บันทึก
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-full border hover:bg-gray-50"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
