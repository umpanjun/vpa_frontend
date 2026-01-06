// src/pages/ExpenseDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft } from "lucide-react";
import ExpenseTimeline from "../components/ExpenseTimeline";
import BottomNav from "../components/BottomNav";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";
axios.defaults.withCredentials = true;

export default function ExpenseDetail() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/api/expenses`, {
        params: siteId ? { site_id: siteId } : {},
      })
      .then((res) => setExpenses(res.data.data || []))
      .catch((err) => console.error("Error fetching expenses", err));
  }, [siteId]);

  if (!expenses.length) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
          <div className="max-w-screen-sm mx-auto flex items-center px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-lg font-semibold text-blue-900">
              รายละเอียดบิล
            </h1>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center text-gray-500">
          ยังไม่มีข้อมูลบิลในขณะนี้
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-screen-sm mx-auto flex items-center px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-blue-900">
            ประวัติรายละเอียดบิล {siteId ? `ของไซต์ #${siteId}` : "ทั้งหมด"}
          </h1>
        </div>
      </div>

      {/* Page Container */}
      <div className="mx-auto max-w-screen-sm px-4 mt-4">
        {expenses.map((exp) => (
          <div
            key={exp.expense_id}
            className="bg-white rounded-3xl shadow-[0_8px_24px_-10px_rgba(0,0,0,0.15)] 
                       p-4 mb-5 border border-gray-100"
          >
            <p className="text-gray-800 font-semibold">
              ประเภท:{" "}
              <span className="text-blue-700">{exp.expense_type}</span>
            </p>
            <p className="text-gray-800">
              จำนวนเงิน:{" "}
              <span className="font-bold text-green-700">
                {Number(exp.amount).toLocaleString()} บาท
              </span>
            </p>
            <p className="text-gray-700 text-sm mt-1">
              สถานะ:{" "}
              <span
                className={`font-semibold ${
                  exp.status === "Approved"
                    ? "text-green-600"
                    : exp.status === "Pending"
                    ? "text-orange-600"
                    : "text-red-600"
                }`}
              >
                {exp.status}
              </span>
            </p>
            <p className="text-gray-700 text-sm mt-1">
              ไซต์งาน: <span className="text-blue-800">{exp.site_name}</span>
            </p>

            <hr className="my-2" />

            <p className="text-gray-600 text-sm">
              <b>ผู้สร้างบิล:</b> {exp.requested_by_name || "-"} <br />
              <b>วันที่ขอ:</b>{" "}
              {exp.created_at
                ? new Date(exp.created_at).toLocaleString("th-TH")
                : "-"}
            </p>

            <p className="text-gray-600 text-sm mt-1">
              <b>ผู้อนุมัติ:</b> {exp.approved_by_name || "-"} <br />
              <b>วันที่อนุมัติ:</b>{" "}
              {exp.approved_at
                ? new Date(exp.approved_at).toLocaleString("th-TH")
                : "-"}
            </p>

            {exp.description && (
              <p className="text-gray-600 text-sm mt-2 italic">
                หมายเหตุ: {exp.description}
              </p>
            )}

            {/* ✅ Timeline */}
            <div className="mt-3">
              <ExpenseTimeline expenseId={exp.expense_id} />
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
