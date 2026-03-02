import React, { useState, useEffect } from "react";
import axios from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, UploadCloud, Building, Calendar, DollarSign, Save } from "lucide-react";
import BottomNav from "../components/BottomNav";
import Swal from "sweetalert2";

const IncomeFormAdd = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sites, setSites] = useState([]);
  
  const [formData, setFormData] = useState({
    site_id: "",
    custom_company_name: "",
    amount: "",
    check_date: "",
    transfer_date: "",
    slip_image: null,
  });
  
  const [isCustom, setIsCustom] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // โหลดรายชื่อ Site
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await axios.get(`/api/sites`);
        setSites(res.data?.data || []);
      } catch (err) {
        console.error("Error fetching sites", err);
      }
    };
    fetchSites();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "site_id") {
      if (value === "custom") {
        setIsCustom(true);
        setFormData({ ...formData, site_id: "", custom_company_name: "" });
      } else {
        setIsCustom(false);
        setFormData({ ...formData, site_id: value, custom_company_name: "" });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, slip_image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.amount || formData.amount <= 0) {
      Swal.fire("แจ้งเตือน", "กรุณาระบุจำนวนเงินให้ถูกต้อง", "warning");
      setLoading(false);
      return;
    }

    if (!isCustom && !formData.site_id) {
       Swal.fire("แจ้งเตือน", "กรุณาเลือกไซต์งานหรือระบุชื่อบริษัท", "warning");
       setLoading(false);
       return;
    }

    if (isCustom && !formData.custom_company_name) {
       Swal.fire("แจ้งเตือน", "กรุณาระบุชื่อบริษัทที่โอน", "warning");
       setLoading(false);
       return;
    }

    try {
      const data = new FormData();
      if (!isCustom) data.append("site_id", formData.site_id);
      if (isCustom) data.append("custom_company_name", formData.custom_company_name);
      
      data.append("amount", formData.amount);
      if (formData.check_date) data.append("check_date", formData.check_date);
      if (formData.transfer_date) data.append("transfer_date", formData.transfer_date);
      if (formData.slip_image) data.append("slip_image", formData.slip_image);

      await axios.post("/api/incomes", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        text: "บันทึกข้อมูลรายรับเรียบร้อยแล้ว",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate("/incomes/summary");
      });

    } catch (error) {
      console.error("Error submitting income:", error);
      Swal.fire("ข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans text-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-screen-sm px-4 h-16 flex items-center relative">
          <button 
            onClick={() => navigate("/incomes/summary")}
            className="absolute left-4 p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="w-full text-center text-lg font-black uppercase tracking-tight">บันทึกรายรับใหม่</h1>
        </div>
      </div>

      <div className="mx-auto max-w-screen-sm px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card: แหล่งที่มา */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-black text-gray-700 uppercase tracking-widest border-b border-gray-50 pb-3">
              <Building className="w-4 h-4 text-green-500" /> ข้อมูลแหล่งที่มา
            </h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">เลือกไซต์งาน / บริษัท</label>
              <select
                name="site_id"
                value={isCustom ? "custom" : formData.site_id}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-100"
              >
                <option value="">-- เลือกรายการ --</option>
                {sites.map((s) => (
                  <option key={s.site_id} value={s.site_id}>{s.site_name}</option>
                ))}
                <option value="custom" className="text-green-600 font-bold">➕ กำหนดชื่อบริษัทเอง...</option>
              </select>
            </div>

            {isCustom && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">ระบุชื่อบริษัทที่โอน</label>
                <input
                  type="text"
                  name="custom_company_name"
                  value={formData.custom_company_name}
                  onChange={handleChange}
                  placeholder="เช่น บจก. เอบีซี"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-100"
                />
              </div>
            )}
          </div>

          {/* Card: จำนวนเงินและวันที่ */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
             <h3 className="flex items-center gap-2 text-sm font-black text-gray-700 uppercase tracking-widest border-b border-gray-50 pb-3">
              <DollarSign className="w-4 h-4 text-green-500" /> รายละเอียดจำนวนเงิน
            </h3>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">จำนวนเงิน (บาท)</label>
              <div className="relative">
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-5 pr-12 py-3.5 font-black text-xl text-green-600 outline-none focus:ring-2 focus:ring-green-100 placeholder-gray-300"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">฿</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> วันที่รับเช็ค (ถ้ามี)
                </label>
                <input
                  type="date"
                  name="check_date"
                  value={formData.check_date}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> วันที่โอน (ถ้ามี)
                </label>
                <input
                  type="date"
                  name="transfer_date"
                  value={formData.transfer_date}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>
          </div>

          {/* Card: อัปโหลดสลิป */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-black text-gray-700 uppercase tracking-widest border-b border-gray-50 pb-3">
              <UploadCloud className="w-4 h-4 text-green-500" /> แนบหลักฐาน
            </h3>
            
            <label className="block w-full border-2 border-dashed border-gray-200 hover:border-green-400 bg-gray-50 hover:bg-green-50 rounded-3xl p-6 text-center cursor-pointer transition-colors group">
              {previewImage ? (
                <div className="relative w-full h-40">
                  <img src={previewImage} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full">เปลี่ยนรูปภาพ</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-green-500">
                  <UploadCloud className="w-10 h-10" />
                  <span className="text-xs font-bold uppercase tracking-widest">คลิกเพื่ออัปโหลดสลิป/เช็ค</span>
                </div>
              )}
              <input type="file" name="slip_image" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-white font-black uppercase tracking-widest shadow-lg transition-all ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 shadow-green-200 hover:bg-green-700 hover:-translate-y-1"
              }`}
            >
              {loading ? "กำลังบันทึก..." : (
                <>
                  <Save className="w-5 h-5" /> บันทึกข้อมูลรายรับ
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <BottomNav active="incomes" />
    </div>
  );
};

export default IncomeFormAdd;