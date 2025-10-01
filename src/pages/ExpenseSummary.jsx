// src/pages/ExpenseSummary.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, FileDown, FileText, AlertTriangle } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ ใช้ AuthContext

const API = import.meta.env.VITE_API_BASE;

const COLORS = ["#16a34a", "#2563eb", "#f97316", "#eab308", "#06b6d4"];

const TYPE_LABEL = {
  Materials: "ค่าวัสดุก่อสร้าง",
  Labor: "ค่าแรงคนงาน",
  Equipment: "ค่าเช่าอุปกรณ์",
  Transportation: "ค่าขนส่ง",
  Utilities: "ค่าสาธารณูปโภค",
  Other: "อื่นๆ",
};

const ExpenseSummary = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ ได้ role ของ user
  const [sites, setSites] = useState([]);
  const [siteId, setSiteId] = useState("all"); // ✅ default = ทั้งหมด
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 🚫 Foreman ไม่ให้เข้า
  if (user?.role === "Foreman") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-lg font-bold text-red-600 mb-2">
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          กลับไปหน้าหลัก
        </button>
      </div>
    );
  }

  // โหลดรายชื่อไซต์
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await axios.get(`${API}/api/sites`);
        setSites(res.data?.data || []);
      } catch (err) {
        console.error("Error fetching sites", err);
      }
    };
    fetchSites();
  }, []);

  // โหลดสรุปค่าใช้จ่าย
  useEffect(() => {
    const fetchData = async () => {
      if (!siteId) return;
      try {
        if (siteId === "all") {
          // ✅ รวมทุกไซต์
          const allResults = await Promise.all(
            sites.map((s) =>
              axios.get(`${API}/api/expenses/summary`, {
                params: {
                  site_id: s.site_id,
                  start_date: startDate || undefined,
                  end_date: endDate || undefined,
                },
              })
            )
          );

          const map = new Map();
          allResults.forEach((res) => {
            (res.data?.data || []).forEach((row) => {
              const key = TYPE_LABEL[row.expense_type] || row.expense_type;
              const val = parseFloat(row.total_amount || 0);
              map.set(key, (map.get(key) || 0) + val);
            });
          });

          const merged = Array.from(map.entries()).map(([name, value], i) => ({
            name,
            value,
            color: COLORS[i % COLORS.length],
          }));
          setData(merged);
          setTotal(merged.reduce((sum, d) => sum + d.value, 0));
        } else {
          // ✅ รายไซต์เดียว
          const res = await axios.get(`${API}/api/expenses/summary`, {
            params: {
              site_id: siteId,
              start_date: startDate || undefined,
              end_date: endDate || undefined,
            },
          });

          const mapped = (res.data?.data || []).map((d, i) => ({
            name: TYPE_LABEL[d.expense_type] || d.expense_type,
            value: parseFloat(d.total_amount || 0),
            color: COLORS[i % COLORS.length],
          }));
          setData(mapped);
          setTotal(mapped.reduce((sum, d) => sum + d.value, 0));
        }
      } catch (err) {
        console.error("Error fetching expenses summary", err);
      }
    };
    if (sites.length > 0) fetchData();
  }, [siteId, startDate, endDate, sites]);

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-screen-sm px-4 py-4 flex items-center gap-3">
          <span className="text-md font-bold ml-2 flex-1 text-center">รายละเอียดค่าใช้จ่าย</span>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-screen-sm px-4 py-6">
        <h2 className="text-xl font-bold mb-1 text-blue-900">
          V.P.A. Engineering & Supply Co., Ltd.
        </h2>

        <p className="text-xs text-gray-500 italic mb-3">
          * แสดงเฉพาะบิลที่อนุมัติแล้ว
        </p>

        {/* Site Select */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-1">เลือกไซต์งาน</label>
          <select
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm"
          >
            <option value="all">ทั้งหมด</option>
            {sites.map((s) => (
              <option key={s.site_id} value={s.site_id}>
                {s.site_name}
              </option>
            ))}
          </select>
        </div>

        {/* Chart */}
        <div className="h-60 sm:h-72 mb-6">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => `${Number(v).toLocaleString("th-TH")} บาท`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Date Range */}
        <div className="flex justify-between items-center mb-4 text-xs sm:text-sm gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>ตั้งแต่</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-lg px-2 py-1 w-full"
            />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <span>ถึง</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-lg px-2 py-1 w-full"
            />
          </div>
        </div>

        {/* Expense List */}
        <ul className="space-y-2 mb-6">
          {data.map((item, idx) => (
            <li
              key={idx}
              className="flex justify-between border-b pb-1 text-gray-700 text-sm"
            >
              <span className="flex items-center gap-2 truncate">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                {item.name}
              </span>
              <span className="font-semibold text-blue-900 text-xs sm:text-sm whitespace-nowrap">
                {item.value.toLocaleString("th-TH")} บาท
              </span>
            </li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 px-3 py-2 border rounded-xl shadow-sm hover:bg-gray-50 text-sm">
            <FileDown className="w-5 h-5 text-blue-600" />
            ดาวน์โหลดเอกสาร
          </button>
          <button
            onClick={() => navigate("/expenses/pending")}
            className="flex items-center justify-center gap-2 px-3 py-2 border rounded-xl shadow-sm hover:bg-gray-50 text-sm"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            บิลที่รอการอนุมัติ
          </button>
        </div>

        {/* Total */}
        <div className="mt-6 text-right font-bold text-blue-900 text-lg">
          รวมทั้งหมด:{" "}
          {total.toLocaleString("th-TH", {
            style: "currency",
            currency: "THB",
            maximumFractionDigits: 0,
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ExpenseSummary;
