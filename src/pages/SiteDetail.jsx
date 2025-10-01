// src/pages/SiteDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Pencil, MapPin } from "lucide-react";
import axios from "../api";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/AuthContext";   // ✅ ดึง role มาจาก AuthContext

const API = import.meta.env.VITE_API_BASE;

const TYPE_LABEL = {
  Materials: "ค่าวัสดุก่อสร้าง",
  Labor: "ค่าแรงคนงาน",
  Equipment: "ค่าเช่าอุปกรณ์",
  Transportation: "ค่าขนส่ง",
  Utilities: "ค่าสาธารณูปโภค",
  Other: "อื่นๆ",
};

function ProgressBar({ value }) {
  const v = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div className="w-full h-3 bg-gray-200 rounded-full">
      <div
        className="h-3 bg-blue-500 rounded-full transition-all"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

function MoneyBox({ label, amount }) {
  const formatted =
    typeof amount === "number"
      ? amount.toLocaleString("th-TH", {
          style: "currency",
          currency: "THB",
          maximumFractionDigits: 0,
        })
      : "—";
  return (
    <div className="flex items-center justify-between border rounded-xl px-4 py-3 bg-white">
      <div className="text-gray-700 text-sm">{label}</div>
      <div className="font-semibold text-blue-900 text-sm">{formatted}</div>
    </div>
  );
}

// ✅ แปลง image_url จาก DB → src พร้อมใช้งาน (เหมือนใน Dashboard)
const resolveSiteImage = (image_url) => {
  if (!image_url) return "https://picsum.photos/800/400?blur=2";
  const url = String(image_url);
  if (/^https?:\/\//i.test(url)) return url;            // URL เต็ม
  if (url.startsWith("/uploads")) return `${API}${url}`; // พาธเริ่ม /uploads
  return `${API}/uploads/sites/${url}`;                  // ชื่อไฟล์ล้วน
};


export default function SiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();   // ✅ ดึง role ของ user
  const role = user?.role;

  const [site, setSite] = useState(null);
  const [progress, setProgress] = useState({ overall: 0, breakdown: {} });
  const [latestExpenses, setLatestExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        const [siteRes, progRes, expListRes, expSumRes] = await Promise.all([
          axios.get(`/api/sites/${id}`),
          axios.get(`/api/sites/${id}/progress`),
          axios.get(`/api/expenses?site_id=${id}`),
          axios.get(`/api/expenses/summary?site_id=${id}`),
        ]);

        if (!alive) return;
        setSite(siteRes.data?.data || null);
        setProgress(progRes.data?.data || { overall: 0, breakdown: {} });
        setLatestExpenses(expListRes.data?.data || []);
        setExpenseSummary(expSumRes.data?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <div className="p-4 text-gray-500">กำลังโหลด...</div>;
  if (!site) return <div className="p-4 text-red-600">ไม่พบข้อมูลไซต์</div>;

  const cover = resolveSiteImage(site.image_url);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Top bar */}
      <div className="mx-auto max-w-md md:max-w-2xl px-4 pt-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]  text-blue-600  " />
            <span className="text-lg font-medium text-blue-600">Back</span>
          </button>

          <div className="ml-auto flex items-center gap-2">
            {site.map_link && (
              <button
                onClick={() => window.open(site.map_link, "_blank")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-green-100 text-green-700"
              >
                <MapPin className="w-4 h-4" />
                แผนที่
              </button>
            )}

            {/* ✅ ปุ่มแก้ไขไซต์งาน: แสดงเฉพาะ CEO และ Admin */}
            {(role === "CEO" || role === "admin") && (
              <button
                onClick={() => navigate(`/sites/${id}/edit`)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-blue-600 text-white"
              >
                <Pencil className="w-4 h-4" />
                แก้ไข
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md md:max-w-2xl px-4">
        {/* Title */}
        <h1 className="text-2xl font-extrabold mt-2">{site.site_name}</h1>

        {/* Cover */}
        <div className="rounded-2xl overflow-hidden mt-4 border">
          <img src={cover} alt={site.site_name} className="w-full h-48 object-cover" />
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="text-gray-700 font-semibold mb-2">ความคืบหน้าโครงการ</div>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>รวม</span>
              <span>{progress.overall || 0}%</span>
            </div>
            <ProgressBar value={progress.overall} />
          </div>
          {/* Breakdown */}
          {progress.breakdown && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>โครงสร้าง</span>
                  <span>{progress.breakdown.structure || 0}%</span>
                </div>
                <ProgressBar value={progress.breakdown.structure} />
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>ระบบไฟ</span>
                  <span>{progress.breakdown.electrical || 0}%</span>
                </div>
                <ProgressBar value={progress.breakdown.electrical} />
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>ระบบน้ำ</span>
                  <span>{progress.breakdown.plumbing || 0}%</span>
                </div>
                <ProgressBar value={progress.breakdown.plumbing} />
              </div>
            </div>
          )}
        </div>

        {/* ✅ แสดงสรุปค่าใช้จ่าย + ค่าใช้จ่ายล่าสุด */}
        {(role === "CEO" || role === "admin" || role === "Secretary") && (
          <>
            {expenseSummary.length > 0 && (
              <div className="mt-6">
                <div className="text-gray-700 font-semibold mb-3">สรุปค่าใช้จ่าย</div>
                <div className="grid gap-3">
                  {expenseSummary.map((sum) => (
                    <MoneyBox
                      key={sum.expense_type}
                      label={TYPE_LABEL[sum.expense_type] || sum.expense_type}
                      amount={Number(sum.total_amount)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="text-gray-700 font-semibold mb-3">ค่าใช้จ่ายล่าสุด</div>
              <div className="grid gap-3">
                {latestExpenses.length === 0 && (
                  <div className="text-gray-500">ยังไม่มีรายการค่าใช้จ่าย</div>
                )}
                {latestExpenses.slice(0, 2).map((e) => (
                  <MoneyBox
                    key={e.expense_id}
                    label={TYPE_LABEL[e.expense_type] || e.expense_type}
                    amount={Number(e.amount)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Quick actions */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            className="rounded-2xl shadow p-4 text-center bg-white border hover:bg-gray-50"
            onClick={() => navigate(`/sites/${id}/expenses`)}
          >
            <div className="text-3xl">💳</div>
            <div className="mt-1 font-semibold">ดูค่าใช้จ่าย</div>
          </button>
          <button
            className="rounded-2xl shadow p-4 text-center bg-white border hover:bg-gray-50"
            onClick={() => navigate(`/sites/${id}/workers`)}
          >
            <div className="text-3xl">👷</div>
            <div className="mt-1 font-semibold">พนักงาน</div>
          </button>
        </div>
      </div>

      {/* ✅ Floating Action Button (เฉพาะ CEO/Admin/Foreman เท่านั้น) */}
      {(role === "CEO" || role === "admin" || role === "Foreman") && (
        <button
          onClick={() => navigate(`/sites/${id}/progress/edit`)}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-purple-600 text-white shadow-lg flex items-center justify-center hover:bg-purple-700 active:scale-95 transition"
          title="แก้ไขความคืบหน้า"
        >
          <Pencil className="w-6 h-6" />
        </button>
      )}

      <BottomNav active="home" />
    </div>
  );
}
