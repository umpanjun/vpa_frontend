// src/pages/AllWorkers.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_BASE;
axios.defaults.withCredentials = true;

// -----------------------------------------------------------------
// 🛠️ 1. Custom Confirmation Modal Component (อย่างง่าย)
// -----------------------------------------------------------------
const DeleteConfirmModal = ({ workerName, onConfirm, onClose, disabled }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-sm mx-4 p-6 w-full">
        <h3 className="text-lg font-bold text-gray-800 mb-2">ยืนยันการลบพนักงาน</h3>
        <p className="text-gray-600 mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานชื่อ: <strong>{workerName}</strong>?</p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
            disabled={disabled}
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-md text-white ${disabled ? "bg-red-300" : "bg-red-600 hover:bg-red-700"} transition`}
            disabled={disabled}
          >
            {disabled ? 'กำลังดำเนินการ...' : 'ยืนยันการลบ'}
          </button>
        </div>
      </div>
    </div>
  );
};
// -----------------------------------------------------------------

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
  
  // 🛠️ 2. State ใหม่สำหรับจัดการ Modal: เก็บข้อมูลพนักงานที่ต้องการลบ
  const [confirmModalData, setConfirmModalData] = useState(null); // { workerId: number, name: string }

  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = ["admin", "ceo", "secretary"].includes(user?.role);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/api/workers?active=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  // 🛠️ 3. ฟังก์ชันใหม่: เปิด Modal แทน window.confirm
  const handleConfirmDelete = (workerId, displayName) => {
    setConfirmModalData({ workerId, name: displayName });
  };
  
  // 🛠️ 4. ฟังก์ชันหลัก: การลบจริง (ถูกเรียกจาก Modal)
  const handleDelete = async (workerId) => {
    // ปิด Modal ก่อน
    setConfirmModalData(null); 
    
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
                      // 🛠️ 5. แก้ไข: เรียกฟังก์ชันเปิด Modal
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmDelete(w.worker_id, displayName);
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

      {/* 🛠️ 6. แสดง Modal เมื่อ State มีค่า */}
      {confirmModalData && (
        <DeleteConfirmModal
          workerName={confirmModalData.name}
          onConfirm={() => handleDelete(confirmModalData.workerId)}
          onClose={() => setConfirmModalData(null)}
          disabled={deletingId === confirmModalData.workerId}
        />
      )}
    </div>
  );
};

export default AllWorkers;