// src/pages/ExpenseFormAdd.jsx
import React, { useEffect, useState } from "react";
import axios from "../api";                       // ✅ ใช้ axios instance กลางของโปรเจกต์
import { useNavigate, useParams } from "react-router-dom";
import { Save, ChevronLeft, Image as ImageIcon } from "lucide-react";
import BottomNav from "../components/BottomNav";

const API = import.meta.env.VITE_API_BASE;

const EXPENSE_TYPES = [
  { value: "Materials", label: "ค่าวัสดุก่อสร้าง" },
  { value: "Labor", label: "ค่าแรงคนงาน" },
  { value: "Equipment", label: "ค่าเช่าอุปกรณ์" },
  { value: "Transportation", label: "ค่าขนส่ง" },
  { value: "Utilities", label: "ค่าสาธารณูปโภค (น้ำ/ไฟ/อื่นๆ)" },
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
    expense_date: "",
    description: "",
    receipt_number: "",
    vendor_name: "",
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // โหลดรายการไซต์ (ใช้ instance กลาง → ส่งคุ้กกี้ให้อัตโนมัติ)
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    setError("");
    setLoading(true);

    try {
      // validate ขั้นพื้นฐาน
      if (!form.site_id) throw new Error("กรุณาเลือกไซต์งาน");
      if (!form.expense_type) throw new Error("กรุณาเลือกประเภทค่าใช้จ่าย");
      if (!form.amount || Number(form.amount) <= 0)
        throw new Error("จำนวนเงินต้องมากกว่า 0");
      if (!form.expense_date) throw new Error("กรุณาเลือกวันที่");

      const fd = new FormData();
      // ปรับวันที่ให้เป็น YYYY-MM-DD ชัดเจน
      const expense_date = toDateInput(form.expense_date);

      Object.entries({
        ...form,
        expense_date,
      }).forEach(([k, v]) => fd.append(k, v ?? ""));

      if (receiptFile) fd.append("receipt_image", receiptFile);

      // ✅ ไม่ต้องตั้ง headers Authorization/Content-Type เอง
      await axios.post(`/api/expenses`, fd);

      navigate(`/sites/${form.site_id}/expenses`);
    } catch (err) {
      console.error("Add expense error:", err);
      const status = err?.response?.status;
      const msg =
        (status === 403 &&
          "คุณไม่มีสิทธิ์เพิ่มบิลในระบบนี้ (ตรวจสอบสิทธิ์ role หรือการเข้าสู่ระบบ)") ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "ไม่สามารถเพิ่มบิลได้ กรุณาลองใหม่";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-screen-sm mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-full"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]" />
            <span className="text-lg font-medium text-blue-600">Back</span>
          </button>
          <h1 className="text-lg font-bold text-center flex-1">เพิ่มบิลใหม่</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-screen-sm mx-auto">
        {/* ไซต์งาน */}
        <div>
          <label className="block text-sm font-medium">ไซต์งาน</label>
          <select
            name="site_id"
            value={form.site_id}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 mt-1"
          >
            <option value="">-- เลือกไซต์งาน --</option>
            {sites.map((site) => (
              <option key={site.site_id} value={site.site_id}>
                {site.site_name}
              </option>
            ))}
          </select>
        </div>

        {/* ประเภทค่าใช้จ่าย */}
        <div>
          <label className="block text-sm font-medium">ประเภทค่าใช้จ่าย</label>
          <select
            name="expense_type"
            value={form.expense_type}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 mt-1"
          >
            <option value="">-- เลือกประเภทค่าใช้จ่าย --</option>
            {EXPENSE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* จำนวนเงิน */}
        <div>
          <label className="block text-sm font-medium">จำนวนเงิน</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 mt-1"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        {/* วันที่ */}
        <div>
          <label className="block text-sm font-medium">วันที่</label>
          <input
            type="date"
            name="expense_date"
            value={form.expense_date}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        {/* เลขที่ใบเสร็จ */}
        <div>
          <label className="block text-sm font-medium">เลขที่ใบเสร็จ</label>
          <input
            type="text"
            name="receipt_number"
            value={form.receipt_number}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1"
            placeholder="เช่น INV-2024-001"
          />
        </div>

        {/* ผู้ขาย */}
        <div>
          <label className="block text-sm font-medium">ชื่อผู้ขาย</label>
          <input
            type="text"
            name="vendor_name"
            value={form.vendor_name}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1"
            placeholder="ชื่อบริษัท/ร้านค้า"
          />
        </div>

        {/* รายละเอียด */}
        <div>
          <label className="block text-sm font-medium">รายละเอียดเพิ่มเติม</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1"
            rows="3"
            placeholder="รายละเอียดค่าใช้จ่าย"
          />
        </div>

        {/* อัปโหลดใบเสร็จ */}
        <div>
          <label className="block text.sm font-medium">อัปโหลดใบเสร็จ</label>
          <input
            type="file"
            accept="image/*"
            onChange={onPickFile}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
          {receiptPreview ? (
            <div className="mt-2">
              <img
                src={receiptPreview}
                alt="receipt preview"
                className="max-h-48 rounded-lg border"
              />
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <ImageIcon className="w-4 h-4" /> รองรับไฟล์ภาพ .jpg .png
            </p>
          )}
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{error}</p>
        )}

        {/* Submit Button ในฟอร์ม (ให้ Enter ได้) */}
        <button
          type="submit"
          disabled={loading}
          className="hidden"   // ปล่อยปุ่มจริงไว้ใน FAB ด้านล่าง
        />
      </form>

      {/* Floating Submit Button */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-full max-w-sm px-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-full shadow-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          <Save className="w-5 h-5" />
          {loading ? "กำลังบันทึก..." : "บันทึกบิล"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ExpenseFormAdd;
