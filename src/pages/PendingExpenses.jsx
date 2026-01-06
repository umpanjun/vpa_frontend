// src/pages/PendingExpenses.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";
import { ChevronLeft, Upload } from "lucide-react";
import {
  ArrowLeft,
  Check,
  X,
  Filter,
  Image as ImageIcon,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_BASE;

const TYPE_LABEL = {
  Materials: "ค่าวัสดุก่อสร้าง",
  Labor: "ค่าแรงคนงาน",
  Equipment: "ค่าเช่าอุปกรณ์",
  Transportation: "ค่าขนส่ง",
  Utilities: "ค่าสาธารณูปโภค",
  Other: "อื่นๆ",
};

function PendingExpenses() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sites, setSites] = useState([]);
  const [siteId, setSiteId] = useState(""); // "" = ทั้งหมด
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal ปฏิเสธ
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // modal ขยายรูป
  const [previewImage, setPreviewImage] = useState(null);

  const total = useMemo(
    () => items.reduce((s, it) => s + Number(it.amount || 0), 0),
    [items]
  );

  const loadSites = async () => {
    try {
      const res = await axios.get(`/api/sites`);
      setSites(res.data?.data || []);
    } catch (e) {
      console.error("load sites error", e);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const qs = new URLSearchParams({ status: "Pending" });
      if (siteId) qs.set("site_id", siteId);

      const res = await axios.get(`/api/expenses?${qs.toString()}`);
      setItems(res.data?.data || []);
    } catch (e) {
      console.error("load pending expenses error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);
  useEffect(() => {
    loadData();
  }, [siteId]);

  const approve = async (expenseId) => {
    try {
      await axios.put(`/api/expenses/${expenseId}/approve`);
      setItems((prev) => prev.filter((x) => x.expense_id !== expenseId));
    } catch (e) {
      console.error("approve error", e);
      alert("อนุมัติไม่สำเร็จ");
    }
  };

  const reject = async () => {
    if (!rejecting) return;
    try {
      await axios.put(`/api/expenses/${rejecting.expense_id}/reject`, {
        reason: rejectReason,
      });
      setItems((prev) =>
        prev.filter((x) => x.expense_id !== rejecting.expense_id)
      );
      setRejectReason("");
      setRejecting(null);
    } catch (e) {
      console.error("reject error", e);
      alert("ปฏิเสธไม่สำเร็จ");
    }
  };

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-screen-sm px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-blue-600"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]" />
          <span className="text-lg font-medium text-blue-600">Back</span>
        </button>
          
          <h1 className="text-lg font-bold flex-1 text-center">บิลที่รอการอนุมัติ</h1>
          <div className="w-16" /> {/* spacer ให้ Title อยู่กลางจริงๆ */}
        </div>
      </div>

      {/* Filters */}
      <div className="mx-auto max-w-screen-sm px-4 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">กรองตามไซต์งาน</span>
        </div>
        <select
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
          className="w-full border rounded-xl px-3 py-2"
        >
          <option value="">ทั้งหมด</option>
          {sites.map((s) => (
            <option key={s.site_id} value={s.site_id}>
              {s.site_name}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="mx-auto max-w-screen-sm px-4 py-6">
        {loading ? (
          <div className="text-gray-500">กำลังโหลด...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500 text-center bg-gray-50 rounded-xl py-6">
            ไม่มีบิลรออนุมัติ
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((e) => (
              <li
                key={e.expense_id}
                className="border rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-base font-bold text-blue-900">
                      {TYPE_LABEL[e.expense_type] || e.expense_type}
                    </div>
                    <p className="text-sm text-gray-600">
                      ไซต์งาน:{" "}
                      <span className="font-medium">{e.site_name || "-"}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      ผู้ขอ:{" "}
                      <span className="font-medium">
                        {/* ❗❗ การแก้ไข: ใช้ Field ชื่อ 'requested_by_name' แทน 'requested_by_display' */}
                        {e.requested_by_name || "-"} 
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      รายละเอียด:{" "}
                      <span className="font-medium ">
                        {e.description || "-"}
                      </span>
                      
                    </p>
                    
                    
                    <p className="text-xs text-gray-500 ">
                      ส่งคำขอเมื่อ : &nbsp;&nbsp; {" "}
                      {e.created_at
                        ?  new Date(e.created_at).toLocaleDateString("th-TH")
                        : "-"}
                    </p>
                  </div>
                  <div className="text-right">  
                    <div className="text-blue-900 font-bold text-lg">
                      {Number(e.amount).toLocaleString("th-TH", {
                        style: "currency",
                        currency: "THB",
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                </div>

                

                {/* Dates */}
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>
                    วันที่ค่าใช้จ่าย :{" "}
                    {e.expense_date
                      ? new Date(e.expense_date).toLocaleDateString("th-TH")
                      : "-"}
                  </span>
                  {e.vendor_name && <span>ผู้ขาย: {e.vendor_name}</span>}
                </div>

                {/* Receipt button */}
                {e.receipt_image && (
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        setPreviewImage(`${API}${e.receipt_image}`)
                      }
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-blue-600 hover:bg-blue-50"
                    >
                      <ImageIcon className="w-4 h-4" />
                      ดูใบเสร็จ
                    </button>
                  </div>
                )}

                {/* Actions */}
                {/* NOTE: Frontend ใช้ "Secretary" (ขึ้นต้นตัวใหญ่)
                  Backend ใช้ 'secretary' (ตัวเล็ก)
                  ถ้าเกิดปัญหา 403 Forbidden ในการอนุมัติ ให้แก้ไข Role ให้ตรงกัน
                */}
                {["admin", "ceo", "Secretary"].includes(user?.role) && (
                  <div className="flex gap-2 mt-4 justify-end">
                    <button
                      onClick={() => approve(e.expense_id)}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" /> อนุมัติ
                    </button>
                    <button
                      onClick={() => {
                        setRejecting(e);
                        setRejectReason("");
                      }}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      <X className="w-4 h-4" /> ปฏิเสธ
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Total */}
        {items.length > 0 && (
          <div className="mt-5 text-right font-bold text-blue-900">
            รวมยอดที่รออนุมัติ:{" "}
            {total.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
              maximumFractionDigits: 0,
            })}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejecting && (
        <div className="fixed inset-0 bg-black/40 z-20 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-4">
            <div className="font-semibold">ปฏิเสธบิล</div>
            <div className="text-sm text-gray-600 mt-1">
              {TYPE_LABEL[rejecting.expense_type] || rejecting.expense_type} •{" "}
              {Number(rejecting.amount).toLocaleString("th-TH")} บาท
            </div>
            <label className="block text-sm font-medium mt-3">
              เหตุผลในการปฏิเสธ
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              placeholder="ระบุเหตุผล (ถ้ามี)"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setRejecting(null)}
                className="px-4 py-2 rounded-lg border"
              >
                ยกเลิก
              </button>
              <button
                onClick={reject}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/70 z-30 flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="preview"
            className="max-h-[90%] max-w-[90%] rounded-lg shadow-lg"
          />
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default PendingExpenses;