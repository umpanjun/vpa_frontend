import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ChevronLeft, Image as ImageIcon, Wallet, Building2, FileText, Calendar, Tag, User } from "lucide-react";
import BottomNav from "../components/BottomNav";
import Swal from "sweetalert2";

const EXPENSE_TYPES = [
  { value: "Materials", label: "ค่าวัสดุก่อสร้าง" },
  { value: "Labor", label: "ค่าแรงคนงาน" },
  { value: "Equipment", label: "ค่าเช่าอุปกรณ์" },
  { value: "Transportation", label: "ค่าขนส่ง" },
  { value: "Utilities", label: "ค่าสาธารณูปโภค" },
  { value: "Other", label: "อื่นๆ" },
];

const toDateInput = (v) => {
  if (!v) return "";
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s.slice(0, 10);
  return d.toISOString().slice(0, 10);
};

const ExpenseFormAdd = () => {
  const navigate = useNavigate();
  const { id: siteId } = useParams();

  const [sites, setSites] = useState([]);
  const [form, setForm] = useState({
    site_id: siteId || "",
    expense_type: "",
    amount: "",
    expense_date: new Date().toISOString().slice(0, 10), // Default วันนี้
    description: "",
    receipt_number: "",
    vendor_name: "",
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await axios.get(`/api/sites`);
        if (!alive) return;
        setSites(res.data.data || []);
      } catch (err) {
        console.error("Load sites error:", err);
      }
    })();
    return () => {
      alive = false;
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    };
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptFile(f);
    setReceiptPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!form.site_id || !form.expense_type || !form.amount || !form.expense_date) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกข้อมูลสำคัญให้ครบทุกช่อง',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries({ ...form, expense_date: toDateInput(form.expense_date) })
        .forEach(([k, v]) => fd.append(k, v ?? ""));
      if (receiptFile) fd.append("receipt_image", receiptFile);

      await axios.post(`/api/expenses`, fd);

      await Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        text: 'เพิ่มรายการค่าใช้จ่ายเรียบร้อยแล้ว',
        showConfirmButton: false,
        timer: 1500
      });

      navigate(siteId ? `/sites/${siteId}/expenses` : "/expenses");
      
    } catch (err) {
      console.error("Add expense error:", err);
      const msg = err?.response?.data?.message || "ไม่สามารถเพิ่มบิลได้ กรุณาลองใหม่";
      Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: msg,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-40 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-screen-sm px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:bg-blue-50 px-2 py-1 rounded-lg transition"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            <span>กลับ</span>
          </button>
          <h2 className="text-xl font-bold text-gray-800">เพิ่มบิลค่าใช้จ่าย</h2>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section: รายละเอียดหลัก (Main Info) */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> ข้อมูลโครงการ
            </h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">เลือกไซต์งาน *</label>
              <div className="relative">
                <select
                  name="site_id"
                  value={form.site_id}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-100 outline-none font-bold text-gray-700 appearance-none transition-all"
                >
                  <option value="">-- กรุณาเลือกไซต์งาน --</option>
                  {sites.map((s) => (
                    <option key={s.site_id} value={s.site_id}>{s.site_name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">ประเภท *</label>
                <select
                    name="expense_type"
                    value={form.expense_type}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-blue-100 outline-none font-semibold text-gray-700 appearance-none text-sm"
                >
                    <option value="">เลือกประเภท</option>
                    {EXPENSE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">วันที่บิล *</label>
                <input
                    type="date"
                    name="expense_date"
                    value={form.expense_date}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-blue-100 outline-none font-semibold text-gray-700 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section: ยอดเงินและรายละเอียด (Amount & Details) */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-sm font-black text-green-600 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> ข้อมูลการเงิน
            </h3>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">จำนวนเงิน (บาท) *</label>
                <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    className="w-full bg-green-50 border-none rounded-2xl px-5 py-4 text-2xl font-black text-green-700 placeholder-green-300 focus:ring-2 focus:ring-green-200 outline-none text-right"
                    min="0"
                    step="0.01"
                />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">เลขที่ใบเสร็จ</label>
                    <input
                        name="receipt_number"
                        value={form.receipt_number}
                        onChange={handleChange}
                        placeholder="INV-XXXX"
                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-green-100 outline-none font-semibold text-sm"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">ชื่อร้านค้า/ผู้ขาย</label>
                    <input
                        name="vendor_name"
                        value={form.vendor_name}
                        onChange={handleChange}
                        placeholder="ชื่อร้านค้า"
                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-green-100 outline-none font-semibold text-sm"
                    />
                </div>
            </div>

            <div className="space-y-1 pt-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">รายละเอียดเพิ่มเติม</label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="ระบุรายละเอียดของสินค้าหรืองานบริการ..."
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-green-100 outline-none font-medium text-gray-600 text-sm resize-none"
                />
            </div>
          </div>

          {/* Section: หลักฐาน (Receipt Image) */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
             <h3 className="text-sm font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> หลักฐานการชำระเงิน
            </h3>
            
            <label className="block w-full cursor-pointer group">
                <div className={`relative w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${receiptPreview ? 'border-orange-300 bg-orange-50' : 'border-gray-300 bg-gray-50 group-hover:bg-gray-100'}`}>
                    {receiptPreview ? (
                        <img src={receiptPreview} alt="Receipt" className="w-full h-full object-contain p-2" />
                    ) : (
                        <div className="text-center p-4">
                            <div className="bg-white p-3 rounded-full shadow-sm inline-block mb-2">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-sm font-bold text-gray-500">แตะเพื่ออัปโหลดรูปใบเสร็จ</p>
                            <p className="text-xs text-gray-400 mt-1">รองรับไฟล์ JPG, PNG</p>
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={onPickFile} className="hidden" />
                </div>
            </label>
          </div>

          {/* Floating Save Button */}
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-screen-sm px-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-[0_10px_25px_rgba(37,99,235,0.4)] hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest border-2 border-white/20 disabled:bg-gray-400 disabled:shadow-none"
            >
              <Save className="w-5 h-5" />
              {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>

        </form>
      </div>

      <BottomNav active="expenses" />
    </div>
  );
};

export default ExpenseFormAdd;