// src/pages/AllWorkers.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";   // ✅ import Trash2
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_BASE;
axios.defaults.withCredentials = true;

const Avatar = ({ name = "" }) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold shrink-0">
      {initials || "?"}
    </div>
  );
};

const AllWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = ["admin", "ceo", "secretary"].includes(user?.role);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // ✅ ขอเฉพาะที่ active จาก backend (ถ้ารองรับ)
      const res = await axios.get(`${API}/api/workers?active=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ กันเหนียว: ถ้า backend ยังส่งที่ไม่ active มา ก็กรองฝั่ง client อีกชั้น
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      const onlyActive = list.filter((w) => w.is_active !== false && w.status !== "inactive");
      setWorkers(onlyActive);
    } catch (err) {
      console.error("Failed to fetch workers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // ✅ ลบแบบ hard (ถ้า backend รองรับ ?hard=true) + อัปเดต state และรีเฟรชก็ไม่กลับ
  const handleDelete = async (workerId) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานคนนี้?")) return;
    try {
      setDeletingId(workerId);
      const token = localStorage.getItem("token");

      // ถ้าหลังบ้านรองรับ hard delete ให้ใช้ ?hard=true
      await axios.delete(`${API}/api/workers/${workerId}?hard=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ตัดออกจาก state ทันที
      setWorkers((prev) => prev.filter((w) => w.worker_id !== workerId));
    } catch (err) {
      console.error("Failed to delete worker", err);

      // 🔄 fallback: ถ้า endpoint ไม่รองรับ hard=true ลองลบปกติอีกรอบ
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API}/api/workers/${workerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWorkers((prev) => prev.filter((w) => w.worker_id !== workerId));
      } catch (err2) {
        console.error("Fallback delete failed", err2);
        alert("ไม่สามารถลบพนักงานได้");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="max-w-screen-sm mx-auto px-4 h-14 flex items-center">
          <h2 className="text-base font-bold flex-1 text-center">พนักงานทั้งหมด</h2>
          <div className="w-16" /> {/* spacer ให้ Title อยู่กลางจริงๆ */}
        </div>
      </div>

      {/* List */}
      <div className="max-w-screen-sm mx-auto px-4 py-4 space-y-3">
        {loading && workers.length === 0 && (
          <div className="text-center text-gray-500 py-10">กำลังโหลด...</div>
        )}

        {workers.map((w) => {
          const fullName = `${w.first_name || ""} ${w.last_name || ""}`.trim();
          const displayName = fullName || w.nickname || "ไม่ทราบชื่อ";
          const disabled = deletingId === w.worker_id;

          return (
            <div
              key={w.worker_id}
              onClick={() => navigate(`/workers/${w.worker_id}`)}
              className="group rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
            >
              <div className="p-4 flex items-center gap-3">
                <Avatar name={displayName} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-blue-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {w.position || "พนักงานก่อสร้าง"}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    ไซต์งาน: {Array.isArray(w.assigned_sites) ? w.assigned_sites.join(", ") : (w.assigned_sites || "-")}
                  </p>
                </div>

                {/* ✅ ปุ่มแก้ไข + ลบ */}
                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/workers/${w.worker_id}/edit`);
                      }}
                      className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
                      title="แก้ไขพนักงาน"
                      disabled={disabled}
                    >
                      <Pencil className={`w-4 h-4 ${disabled ? "text-gray-300" : "text-gray-600"}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(w.worker_id);
                      }}
                      className={`p-2 rounded-full hover:bg-red-100 active:bg-red-200 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      title={disabled ? "กำลังลบ..." : "ลบพนักงาน"}
                      disabled={disabled}
                    >
                      <Trash2 className={`w-4 h-4 ${disabled ? "text-red-300" : "text-red-600"}`} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {(!loading && workers.length === 0) && (
          <div className="text-center text-gray-500 py-10">
            ยังไม่มีพนักงานในระบบ
          </div>
        )}
      </div>

      {/* ✅ Floating Add Button เฉพาะ admin/ceo/secretary */}
      {canManage && (
        <button
          onClick={() => navigate("/workers/add")}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition"
          title="เพิ่มพนักงาน"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      <BottomNav active="users" />
    </div>
  );
};

export default AllWorkers;
