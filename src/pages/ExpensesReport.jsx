// src/pages/ExpensesReport.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../services/api";
// ❗ การแก้ไข 1: เพิ่ม Icon Download
import { ChevronLeft, Plus, AlertTriangle, Download } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/AuthContext"; 

const TYPE_LABEL = {
  Materials: "ค่าวัสดุก่อสร้าง",
  Labor: "ค่าแรงคนงาน",
  Equipment: "ค่าเช่าอุปกรณ์",
  Transportation: "ค่าขนส่ง",
  Utilities: "ค่าสาธารณูปโภค",
  Other: "อื่นๆ",
};

export default function ExpensesReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expRes, sumRes, siteRes] = await Promise.all([
        axios.get(`/api/expenses?site_id=${id}`),
        axios.get(`/api/expenses/summary?site_id=${id}`),
        axios.get(`/api/sites/${id}`),
      ]);
      setExpenses(expRes.data?.data || []);
      setSummary(sumRes.data?.data || []);
      setSite(siteRes.data?.data || null);
    } catch (e) {
      console.error("โหลดข้อมูลค่าใช้จ่ายผิดพลาด:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // โหลดข้อมูลเมื่อไม่ใช่ role Foreman (เพราะ Foreman ไม่มีสิทธิ์ดู)
    if (user?.role !== "Foreman") {
      loadData();
    } else {
      setLoading(false);
    }
  }, [id, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = expenses.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
  
  // ❗ การแก้ไข 2: เพิ่มฟังก์ชัน Export
  const handleExport = async () => {
    try {
      // 🚨 สมมติว่า Backend มี API สำหรับ Export รายงาน Excel
      const url = `/api/expenses/${id}/export/excel`;
      
      const res = await axios.get(url, {
        responseType: 'blob', // ตั้งค่าให้รับ response เป็น Binary (Blob)
      });

      // ดึงชื่อไฟล์จาก Header (ถ้ามี) หรือตั้งชื่อเอง
      const contentDisposition = res.headers['content-disposition'];
      let filename = `Expenses_Report_${site?.site_name || id}_${new Date().toLocaleDateString('th-TH')}.xlsx`;
      
      if (contentDisposition) {
        const matches = /filename="([^"]+)"/i.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }
      
      // สร้าง URL ชั่วคราวสำหรับ Blob และสั่งดาวน์โหลด
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);

      alert(`กำลังดาวน์โหลดไฟล์ ${filename}`);
    } catch (e) {
      console.error("Export error:", e);
      alert("ไม่สามารถสร้างไฟล์รายงานได้ กรุณาตรวจสอบการตั้งค่า API Backend");
    }
  };


  if (loading) return <div className="p-4">กำลังโหลด...</div>;

  return (
    <div className="min-h-screen bg-white pb-28 ">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-screen-sm mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]  text-blue-600   " />
            <span className="text-lg font-medium text-blue-600">Back</span>
          </button>

          <h1 className="text-lg font-bold flex-1 text-center">รายงานค่าใช้จ่าย</h1>
          
          {/* ❗ การแก้ไข 3: เพิ่มปุ่มดาวน์โหลด */}
          {user?.role !== "Foreman" && (
            <button
              onClick={handleExport} // เรียกฟังก์ชันดาวน์โหลด
              className="px-2 py-1 rounded-full text-blue-600 hover:bg-gray-100 transition"
              title="ดาวน์โหลดรายงาน"
            >
              <Download className="w-6 h-6" />
            </button>
          )}

        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-screen-sm px-4 py-6 space-y-8">
        {/* Site Info */}
        {site && (
          <div className="mb-2">
            <h2 className="text-xl font-bold text-blue-900">
              {site.site_name}
            </h2>
            {site.site_address && (
              <p className="text-gray-500 text-sm">{site.site_address}</p>
            )}
          </div>
        )}

        {/* 🚫 Foreman → ไม่เห็นข้อมูลรายจ่าย */}
        {user?.role === "Foreman" ? (
          <div className="flex flex-col items-center text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-lg font-bold text-red-600 mb-2">
              คุณไม่มีสิทธิ์ดูรายละเอียดค่าใช้จ่าย
            </h2>
            <p className="text-gray-600 text-sm">
              แต่คุณสามารถเพิ่มบิลค่าใช้จ่ายเพื่อส่งคำขออนุมัติได้
            </p>
          </div>
        ) : (
          <>
            {/* Note */}
            <p className="text-xs text-gray-500 italic">
              * แสดงเฉพาะบิลที่อนุมัติแล้ว
            </p>

            {/* Summary by type */}
            <div>
              <h2 className="font-semibold mb-3 mt-2 text-gray-700">
                สรุปตามประเภท
              </h2>
              {summary.length === 0 ? (
                <div className="text-gray-500 text-center py-4 bg-gray-50 rounded-xl">
                  ไม่มีข้อมูล
                </div>
              ) : (
                <ul className="divide-y rounded-xl border bg-white shadow-sm">
                  {summary.map((s) => (
                    <li
                      key={s.expense_type}
                      className="flex justify-between py-3 px-4 text-sm"
                    >
                      <span className="font-medium">
                        {TYPE_LABEL[s.expense_type] || s.expense_type}
                      </span>
                      <span className="text-blue-900 font-semibold">
                        {Number(s.total_amount).toLocaleString("th-TH", {
                          style: "currency",
                          currency: "THB",
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Expense List */}
            <div>
              <h2 className="font-semibold mb-3 text-gray-700">ทุกรายการ</h2>
              {expenses.length === 0 ? (
                <div className="text-gray-500 text-center py-4 bg-gray-50 rounded-xl">
                  ไม่มีรายการค่าใช้จ่าย
                </div>
              ) : (
                <ul className="space-y-3">
                  {expenses.map((e) => (
                    <li
                      key={e.expense_id}
                      className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {TYPE_LABEL[e.expense_type] || e.expense_type}
                        </span>
                        <span className="text-sm text-gray-500">
                          {e.expense_date
                            ? new Date(e.expense_date).toLocaleDateString("th-TH")
                            : "-"}
                        </span>
                      </div>
                      <p className="text-gray-600">{e.description || "-"}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-500 text-sm">
                          {e.vendor_name ? `ผู้ขาย: ${e.vendor_name}` : ""}
                        </span>
                        <span className="font-bold text-blue-900">
                          {Number(e.amount).toLocaleString("th-TH", {
                            style: "currency",
                            currency: "THB",
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                      <p className="text-xs mt-1">
                        สถานะ:{" "}
                        <span
                          className={
                            e.status === "Approved"
                              ? "text-green-600"
                              : e.status === "Rejected"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }
                        >
                          {e.status}
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 font-bold text-right text-lg text-blue-900">
                รวมทั้งหมด:{" "}
                {total.toLocaleString("th-TH", {
                  style: "currency",
                  currency: "THB",
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ✅ ปุ่มเพิ่มบิล (อยู่ตรงกลางล่างสุด) */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => navigate(`/sites/${id}/expenses/add`)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition"
        >
          <Plus className="w-5 h-5" />
          เพิ่มบิลค่าใช้จ่าย
        </button>
      </div>

      <BottomNav active="expenses" />
    </div>
  );
}