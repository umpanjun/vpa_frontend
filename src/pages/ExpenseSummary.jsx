// src/pages/ExpenseSummary.jsx
import React, { useEffect, useState } from "react";
import axios from "../services/api"; // ❗ ใช้อ้างอิง API instance แทน axios ธรรมดา
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, FileDown, FileText, AlertTriangle } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ตรวจสอบว่า API ถูกตั้งค่าอย่างถูกต้อง
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
  const { user } = useAuth();
  const [sites, setSites] = useState([]);
  const [siteId, setSiteId] = useState("all");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 

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
        <p className="text-gray-600 text-sm mb-6"></p>
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
        const res = await axios.get(`/api/sites`); // ❗ ใช้ axios instance ที่ถูก import
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
      if (!siteId || (siteId !== "all" && sites.length === 0)) return;

      setLoading(true);
      setError(null);
      setData([]);
      setTotal(0);

      try {
        if (siteId === "all") {
          // รวมทุกไซต์
          if (sites.length === 0) {
            setLoading(false);
            return;
          }

          // สร้าง Promise สำหรับเรียก API ทุกไซต์
          const fetchPromises = sites.map((s) =>
            axios.get(`/api/expenses/summary`, {
              params: {
                site_id: s.site_id,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
              },
            }).catch(e => {
                console.error(`Error fetching summary for site ${s.site_id}:`, e);
                return { data: { data: [] } }; 
            })
          );

          const allResults = await Promise.all(fetchPromises);

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
          // รายไซต์เดียว
          const res = await axios.get(`/api/expenses/summary`, {
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
        setError("ไม่สามารถโหลดข้อมูลสรุปค่าใช้จ่ายได้ โปรดตรวจสอบการเชื่อมต่อ API (404/500)");
      } finally {
        setLoading(false);
      }
    };
    
    // ตรวจสอบเงื่อนไขที่เหมาะสมในการเรียก fetchData
    if (siteId === "all" && sites.length > 0) fetchData();
    if (siteId !== "all") fetchData();

  }, [siteId, startDate, endDate, sites]);


  // Renderer สำหรับ Pie Chart Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, payload: { percent } } = payload[0];
      const percentValue = (percent * 100).toFixed(1);
      return (
        <div className="bg-white/90 border border-gray-300 p-2 text-sm rounded shadow-lg">
          <p className="font-semibold text-blue-800">{name}</p>
          <p className="text-gray-700">{Number(value).toLocaleString("th-TH")} บาท</p>
          <p className="text-gray-500">({percentValue}%)</p>
        </div>
      );
    }
    return null;
  };

  // ❗❗ [ฟังก์ชันใหม่] จัดการการดาวน์โหลดรายงานสรุป
  const handleExportSummary = async () => {
    // 🚨 API Endpoint ที่ต้องสร้างใน Backend
    const url = `/api/reports/expense-summary-export`;
    
    // เตรียม Params สำหรับส่ง Site ID และช่วงเวลา
    const params = {
        site_id: siteId === "all" ? undefined : siteId,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
    };

    try {
      const res = await axios.get(url, {
        params,
        responseType: "blob", // ตั้งค่าให้รับ response เป็น Binary (Blob)
      });

      // ดึงชื่อไฟล์จาก Header หรือตั้งชื่อเอง
      const contentDisposition = res.headers["content-disposition"];
      let filename = `Expense_Summary_${siteId}_${new Date().toLocaleDateString("th-TH")}.xlsx`;
      
      if (contentDisposition) {
        const matches = /filename="([^"]+)"/i.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }
      
      // สร้าง URL ชั่วคราวสำหรับ Blob และสั่งดาวน์โหลด
      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);

      alert(`กำลังดาวน์โหลดไฟล์ ${filename}`);
    } catch (e) {
      console.error("Export summary error:", e);

      // หาก GET ล้มเหลว (เช่น 500) ให้ทดลอง retry ด้วย POST (บาง backend อาจคาดหวัง POST)
      try {
        const postBody = {};
        Object.keys(params).forEach((k) => {
          if (params[k] !== undefined) postBody[k] = params[k];
        });

        const postRes = await axios.post(url, postBody, {
          responseType: "blob",
        });

        // ถ้า POST สำเร็จ ให้ดาวน์โหลดไฟล์แบบเดียวกับ GET
        const contentDisposition = postRes.headers["content-disposition"];
        let filename = `Expense_Summary_${siteId}_${new Date().toLocaleDateString("th-TH")}.xlsx`;
        if (contentDisposition) {
          const matches = /filename="([^"]+)"/i.exec(contentDisposition);
          if (matches && matches[1]) filename = matches[1];
        }

        const blob = new Blob([postRes.data], { type: postRes.headers["content-type"] });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);

        alert(`กำลังดาวน์โหลดไฟล์ ${filename}`);
        return;
      } catch (postErr) {
        console.error("POST retry error:", postErr);
        // ถ้า POST ก็ยังล้มเหลว ให้ fallback ไปอ่านข้อความตอบกลับจากเซิร์ฟเวอร์ (text/json/html)
      }

      try {
        const query = new URLSearchParams();
        Object.keys(params).forEach((k) => {
          if (params[k] !== undefined) query.append(k, params[k]);
        });
        const fullUrl = `${API}${url.startsWith("/") ? "" : "/"}${url}${
          query.toString() ? `?${query.toString()}` : ""
        }`;

        const fetchRes = await fetch(fullUrl, {
          method: "GET",
          credentials: "include",
        });

        const text = await fetchRes.text();
        console.error("Server response text:", text.slice(0, 200));

        alert(
          `ไม่สามารถสร้างไฟล์รายงาน (status ${fetchRes.status}). ตัวอย่างข้อความตอบกลับ: ${text
            .replace(/\n/g, " ")
            .slice(0, 200)}...`
        );
      } catch (innerErr) {
        console.error("Fallback fetch error:", innerErr);
        alert(
          "ไม่สามารถสร้างไฟล์รายงานได้ กรุณาตรวจสอบการตั้งค่า API Backend"
        );
      }
    }
  };


  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-screen-sm px-4 py-4 flex items-center justify-center">
          <h1 className="text-md font-bold text-blue-900">
            รายละเอียดค่าใช้จ่าย
          </h1>
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

        {/* Site Select + ปุ่มขวา */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium">เลือกไซต์งาน</label>
            <button
              onClick={() => {
                if (siteId && siteId !== "all") {
                  navigate(`/sites/${siteId}/expenses`);
                } else {
                  navigate("/expenses");
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-300 text-blue-700 hover:bg-blue-50 hover:shadow-sm transition text-xs sm:text-sm"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>ดูประวัติบิล</span>
            </button>

          </div>

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

        {/* Chart Area: แสดง Loading/Error/No Data */}
        <div className="h-60 sm:h-72 mb-6 flex items-center justify-center border rounded-lg bg-gray-50">
            {loading ? (
                <div className="text-center text-gray-500">
                    <svg className="animate-spin h-5 w-5 text-gray-500 mx-auto mb-2" viewBox="0 0 24 24">...</svg>
                    กำลังโหลดข้อมูล...
                </div>
            ) : error ? (
                <div className="text-red-500 text-center p-4">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-semibold">{error}</p>
                </div>
            ) : data.length === 0 && total === 0 ? (
                <p className="text-gray-500">ไม่พบรายการค่าใช้จ่ายที่อนุมัติในช่วงเวลานี้</p>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                        paddingAngle={5}
                    >
                        {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            )}
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
          <button
            // ❗❗ การแก้ไข: เชื่อมกับฟังก์ชัน handleExportSummary
            onClick={handleExportSummary}
            disabled={total === 0}
            title={total === 0 ? "ไม่มีข้อมูลให้ดาวน์โหลด" : "ดาวน์โหลดเอกสาร"}
            className={
              "flex items-center justify-center gap-2 px-3 py-2 border rounded-xl shadow-sm text-sm " +
              (total === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50")
            }
          >
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