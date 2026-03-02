import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ChevronLeft, Upload, DollarSign, Link2, Calendar } from "lucide-react";
import Swal from "sweetalert2"; // Added SweetAlert for better UX

const API = import.meta.env.VITE_API_BASE;
axios.defaults.withCredentials = true;

const toDateInput = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

export default function SiteAdd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const STATUS_OPTIONS = useMemo(
    () => ["Planning", "In Progress", "Completed", "On Hold", "Cancelled"],
    []
  );

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleUploadCover = async () => {
    if (!file) return null;
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await axios.post(`${API}/api/upload/site-image`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.url || null;
    } catch (err) {
      console.error("Upload cover error:", err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const decoded = token ? jwtDecode(token) : {};
      const created_by = decoded?.user_id || null;

      const formEl = e.target;
      
      const payload = {
        site_name: formEl.site_name?.value?.trim(),
        site_address: formEl.site_address?.value?.trim(),
        description: formEl.description?.value?.trim() || null,
        status: formEl.status?.value,
        start_date: toDateInput(formEl.start_date?.value),
        end_date: toDateInput(formEl.end_date?.value),
        budget: formEl.budget?.value ? parseFloat(formEl.budget.value) : null,
        map_link: formEl.map_link?.value?.trim() || null,
        created_by: created_by,
        image_url: null, 
      };

      if (!payload.site_name || !payload.site_address) {
        throw new Error("กรุณากรอกชื่อและที่อยู่ไซต์งานให้ครบถ้วน");
      }

      if (!payload.start_date) {
        throw new Error("กรุณาระบุวันที่เริ่มงาน");
      }

      if (file) {
        const uploaded = await handleUploadCover();
        if (uploaded) payload.image_url = uploaded;
      }

      await axios.post(`${API}/api/sites`, payload);

      await Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        text: 'เพิ่มไซต์งานใหม่เรียบร้อยแล้ว',
        timer: 1500,
        showConfirmButton: false
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Add Site Error:", err);
      const msg = err.response?.data?.message || err.message || "บันทึกไม่สำเร็จ";
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: msg,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-screen-sm px-4 h-16 flex items-center justify-between">
            <button 
                onClick={() => navigate(-1)} 
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition"
            >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">เพิ่มไซต์งานใหม่</h1>
            <div className="w-10" />
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 mt-6 pb-10">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
          
          {/* Section: General Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">ชื่อไซต์งาน *</label>
              <input 
                name="site_name" 
                required 
                placeholder="เช่น โครงการก่อสร้าง A"
                className="w-full border-none rounded-2xl px-5 py-3.5 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 transition font-semibold text-gray-700" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">ที่อยู่ไซต์งาน *</label>
              <textarea 
                name="site_address" 
                required 
                rows={3} 
                placeholder="ระบุที่ตั้งโดยสังเขป..."
                className="w-full border-none rounded-2xl px-5 py-3.5 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 transition font-medium text-gray-600 resize-none" 
              />
            </div>
          </div>

          {/* Section: Budget & Link (Styled Group) */}
          <div className="p-5 bg-blue-50/50 rounded-[2rem] border border-blue-100 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase ml-1 mb-1">
                <DollarSign className="w-3.5 h-3.5" /> งบประมาณ (Budget)
              </label>
              <input 
                type="number" 
                name="budget" 
                step="0.01" 
                placeholder="0.00" 
                className="w-full border-none rounded-xl px-4 py-3 outline-none bg-white font-bold text-blue-900 placeholder-blue-200 focus:ring-2 focus:ring-blue-200" 
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase ml-1 mb-1">
                <Link2 className="w-3.5 h-3.5" /> Google Maps Link
              </label>
              <input 
                type="url" 
                name="map_link" 
                placeholder="https://goo.gl/maps/..." 
                className="w-full border-none rounded-xl px-4 py-3 outline-none bg-white font-medium text-blue-600 placeholder-blue-200 focus:ring-2 focus:ring-blue-200" 
              />
            </div>
          </div>

          {/* Section: Dates (Fixed Layout for Mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase ml-1 mb-1">
                <Calendar className="w-3 h-3" /> วันที่เริ่มงาน *
              </label>
              <input 
                type="date" 
                name="start_date" 
                required 
                className="w-full border-none rounded-2xl px-4 py-3.5 outline-none bg-gray-50 font-semibold text-gray-700 focus:ring-2 focus:ring-blue-100 min-w-0" 
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase ml-1 mb-1">
                <Calendar className="w-3 h-3" /> วันที่สิ้นสุด
              </label>
              <input 
                type="date" 
                name="end_date" 
                className="w-full border-none rounded-2xl px-4 py-3.5 outline-none bg-gray-50 font-semibold text-gray-700 focus:ring-2 focus:ring-blue-100 min-w-0" 
              />
            </div>
          </div>

          {/* Section: Status & Description */}
          <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">สถานะโครงการ</label>
                <div className="relative">
                    <select name="status" className="w-full border-none rounded-2xl px-5 py-3.5 outline-none bg-gray-50 font-bold text-blue-600 appearance-none focus:ring-2 focus:ring-blue-100">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-1">รายละเอียดเพิ่มเติม</label>
                <textarea 
                    name="description" 
                    rows={3} 
                    placeholder="บันทึกข้อความ..."
                    className="w-full border-none rounded-2xl px-5 py-3.5 outline-none bg-gray-50 font-medium text-gray-600 resize-none focus:ring-2 focus:ring-blue-100" 
                />
            </div>
          </div>

          {/* Section: Image Upload */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-2">รูปหน้าปกไซต์งาน</label>
            <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${preview ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
              {preview ? (
                  <img src={preview} className="w-full h-full object-cover rounded-[2rem]" alt="preview" />
              ) : (
                  <>
                    <div className="bg-white p-3 rounded-full shadow-sm mb-2">
                        <Upload className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-xs text-gray-500 font-bold">แตะเพื่ออัปโหลดรูปภาพ</span>
                    <span className="text-[10px] text-gray-400 mt-1">JPG, PNG (Max 5MB)</span>
                  </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                setFile(f || null);
                if (preview) URL.revokeObjectURL(preview);
                setPreview(f ? URL.createObjectURL(f) : "");
              }} />
            </label>
            {preview && (
                <button 
                    type="button" 
                    onClick={() => { setFile(null); setPreview(""); }}
                    className="mt-2 text-xs text-red-500 font-bold underline w-full text-center"
                >
                    ลบรูปภาพ
                </button>
            )}
          </div>

          <div className="pt-4">
            <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider ${loading ? "opacity-70 cursor-wait" : "hover:bg-blue-700"}`}
            >
                {loading ? "กำลังบันทึก..." : "สร้างไซต์งาน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}