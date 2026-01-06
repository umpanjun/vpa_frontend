// src/components/ExpenseTimeline.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, CheckCircle, Edit3, XCircle } from "lucide-react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";
axios.defaults.withCredentials = true;

export default function ExpenseTimeline({ expenseId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!expenseId) return;
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API}/api/expenses/${expenseId}/logs`);
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [expenseId]);

  if (loading) return <p className="text-gray-500 px-4">กำลังโหลดประวัติ...</p>;
  if (!logs.length)
    return (
      <p className="text-gray-400 px-4 text-sm">ยังไม่มีประวัติการดำเนินการ</p>
    );

  // ฟังก์ชันเลือกไอคอน/สีตาม action
  const getIcon = (action) => {
    if (action.includes("CREATE")) return <CheckCircle className="w-5 h-5 text-blue-600" />;
    if (action.includes("APPROVE")) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (action.includes("UPDATE")) return <Edit3 className="w-5 h-5 text-yellow-500" />;
    if (action.includes("REJECT")) return <XCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="mt-6 bg-white rounded-3xl shadow-md p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-blue-600" />
        <h2 className="text-base font-semibold text-blue-900">
          ประวัติการดำเนินการ
        </h2>
      </div>

      <div className="relative border-l-2 border-blue-100 ml-3 pl-5 space-y-5">
        {logs.map((log, index) => (
          <div key={index} className="relative">
            <div className="absolute -left-[33px] top-0 bg-white rounded-full p-1 shadow-sm">
              {getIcon(log.action || "")}
            </div>
            <div className="bg-blue-50 hover:bg-blue-100 transition-all rounded-xl px-4 py-3 shadow-sm">
              <p className="text-sm text-gray-800 leading-snug">{log.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(log.created_at).toLocaleString("th-TH", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
