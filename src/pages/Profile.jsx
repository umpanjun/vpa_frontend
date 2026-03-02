import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../services/api";
import { Pencil, Save, X, Camera, User, Phone, Tag, Shield, Loader2 } from "lucide-react";
import BottomNav from "../components/BottomNav";
import Swal from "sweetalert2"; // ✅ นำเข้า SweetAlert2

const API = import.meta.env.VITE_API_BASE;

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // ✅ เพิ่มสถานะตอนกำลังบันทึก
  const [editMode, setEditMode] = useState(false);

  // ✅ ฟังก์ชันโหลดข้อมูลโปรไฟล์
  const loadProfile = async () => {
    if (!user?.user_id) return;
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

  useEffect(() => {
    loadProfile();
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      // ✅ รวม Field ที่ต้องการส่ง
      const fields = ["display_name", "first_name", "last_name", "nickname", "phone"];
      fields.forEach((field) => {
        formData.append(field, form[field] || "");
      });
      
      if (file) {
        formData.append("profile_picture", file);
      }

      const res = await axios.put(`/api/users/${user.user_id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200 || res.status === 201) {
        // ✅ ใช้ SweetAlert2 แทน alert แบบเดิม
        await Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'ข้อมูลโปรไฟล์ของคุณถูกอัปเดตแล้ว',
          confirmButtonColor: '#2563eb',
          timer: 2000
        });
        
        await loadProfile(); 
        setEditMode(false);
        setFile(null);
        setPreview(null);
      }
    } catch (err) {
      console.error("บันทึกไม่สำเร็จ:", err);
      const serverMessage = err.response?.data?.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (500)";
      
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: serverMessage,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-2" />
      <p>กำลังโหลดข้อมูล...</p>
    </div>
  );

  const avatarUrl = preview || (form.profile_picture
    ? `${API}${form.profile_picture}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(form.first_name || "U")}&background=random&bold=true`);

  return (
    <div className="min-h-screen bg-gray-50 pb-40 font-sans">
      <div className="p-6 max-w-screen-sm mx-auto">
        
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
            />
            {editMode && (
              <label className="absolute bottom-0 right-0 bg-blue-600 p-2.5 rounded-full cursor-pointer text-white shadow-lg active:scale-90 transition">
                <Camera className="w-5 h-5" />
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            )}
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">{form.display_name || "User"}</h2>
          <p className="text-gray-400 text-sm font-semibold uppercase">{form.role} • {form.username}</p>
        </div>

        {/* Input Card */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-1">
              <User className="w-3 h-3" /> ชื่อที่แสดง
            </label>
            <input
              name="display_name"
              value={form.display_name || ""}
              onChange={handleChange}
              disabled={!editMode}
              className={`w-full px-5 py-3.5 rounded-2xl border transition-all font-semibold outline-none ${
                editMode ? "border-blue-200 bg-blue-50/20 focus:ring-2 focus:ring-blue-100" : "border-gray-50 bg-gray-50 text-gray-500 cursor-not-allowed"
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">ชื่อจริง</label>
              <input
                name="first_name"
                value={form.first_name || ""}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-5 py-3.5 rounded-2xl border transition-all font-semibold outline-none ${
                  editMode ? "border-blue-200 bg-blue-50/20" : "border-gray-50 bg-gray-50 text-gray-500"
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">นามสกุล</label>
              <input
                name="last_name"
                value={form.last_name || ""}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-5 py-3.5 rounded-2xl border transition-all font-semibold outline-none ${
                  editMode ? "border-blue-200 bg-blue-50/20" : "border-gray-50 bg-gray-50 text-gray-500"
                }`}
              />
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-2.5 bg-orange-50 rounded-xl mt-6"><Tag className="w-5 h-5 text-orange-500" /></div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">ชื่อเล่น</label>
              <input
                name="nickname"
                value={form.nickname || ""}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-5 py-3.5 rounded-2xl border font-semibold outline-none transition-all ${
                  editMode ? "border-blue-200 bg-blue-50/20" : "border-gray-50 bg-gray-50 text-gray-500"
                }`}
              />
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-2.5 bg-green-50 rounded-xl mt-6"><Phone className="w-5 h-5 text-green-500" /></div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">เบอร์โทรศัพท์</label>
              <input
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
                disabled={!editMode}
                className={`w-full px-5 py-3.5 rounded-2xl border font-semibold outline-none transition-all ${
                  editMode ? "border-blue-200 bg-blue-50/20" : "border-gray-50 bg-gray-50 text-gray-500"
                }`}
              />
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-2.5 bg-purple-50 rounded-xl mt-6"><Shield className="w-5 h-5 text-purple-500" /></div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">ตำแหน่งงาน</label>
              <div className="w-full px-5 py-4 rounded-2xl bg-gray-100 text-blue-600 font-bold border border-transparent">
                {form.role}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex gap-3 items-center whitespace-nowrap">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Pencil className="w-4 h-4" />
              <span className="font-bold text-sm">แก้ไขโปรไฟล์</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3.5 bg-green-600 text-white rounded-full shadow-xl hover:bg-green-700 active:scale-95 transition-all font-bold text-sm disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
              <button
                onClick={() => { setEditMode(false); setPreview(null); }}
                className="flex items-center gap-2 px-6 py-3.5 bg-white text-gray-600 border border-gray-200 rounded-full shadow-md hover:bg-gray-50 active:scale-95 transition-all font-bold text-sm"
              >
                <X className="w-4 h-4" /> ยกเลิก
              </button>
            </>
          )}
        </div>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}