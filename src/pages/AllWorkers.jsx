// src/pages/AllWorkers.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Pencil, Trash2, MapPin, Briefcase, ChevronRight } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_BASE;
axios.defaults.withCredentials = true;

// -----------------------------------------------------------------
// 🛠️ 1. Custom Confirmation Modal (UI Improved)
// -----------------------------------------------------------------
const DeleteConfirmModal = ({ workerName, onConfirm, onClose, disabled }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการลบพนักงาน</h3>
          <p className="text-gray-500">
            คุณแน่ใจหรือไม่ว่าต้องการลบพนักงาน <span className="text-gray-900 font-semibold italic">"{workerName}"</span>? 
            การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>
        </div>
        <div className="flex border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 border-r transition"
            disabled={disabled}
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-4 text-sm font-bold transition ${
              disabled ? "text-red-300 bg-red-50" : "text-red-600 hover:bg-red-50"
            }`}
            disabled={disabled}
          >
            {disabled ? 'กำลังลบ...' : 'ยืนยันการลบ'}
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
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-base font-bold shrink-0 shadow-inner">
      {initials || <Users className="w-6 h-6" />}
    </div>
  );
};

const AllWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmModalData, setConfirmModalData] = useState(null);

  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = ["admin", "CEO", "Secretary"].includes(user?.role);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/workers?active=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setWorkers(list.filter((w) => w.is_active !== false && w.status !== "inactive"));
    } catch (err) {
      console.error("Failed to fetch workers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleConfirmDelete = (workerId, displayName) => {
    setConfirmModalData({ workerId, name: displayName });
  };
  
  const handleDelete = async (workerId) => {
    setConfirmModalData(null); 
    try {
      setDeletingId(workerId);
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/workers/${workerId}?hard=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkers((prev) => prev.filter((w) => w.worker_id !== workerId));
    } catch (err) {
      console.error("Failed to delete worker", err);
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API}/api/workers/${workerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWorkers((prev) => prev.filter((w) => w.worker_id !== workerId));
      } catch (err2) {
        alert("ไม่สามารถลบพนักงานได้");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-screen-sm mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
               <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 leading-none">พนักงานทั้งหมด</h2>
              <p className="text-xs text-gray-500 font-medium">จำนวน {workers.length} คน</p>
            </div>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="max-w-screen-sm mx-auto px-4 py-6 space-y-4">
        {loading && workers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          workers.map((w) => {
            const fullName = `${w.first_name || ""} ${w.last_name || ""}`.trim();
            const displayName = fullName || w.nickname || "ไม่ทราบชื่อ";
            const disabled = deletingId === w.worker_id;

            return (
              <div
                key={w.worker_id}
                onClick={() => navigate(`/workers/${w.worker_id}`)}
                className={`relative bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all duration-200 overflow-hidden ${disabled ? 'opacity-50' : ''}`}
              >
                <div className="p-4 flex items-center gap-4">
                  <Avatar name={displayName} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900 truncate">{displayName}</p>
                      {w.nickname && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md font-bold uppercase tracking-tight">
                          {w.nickname}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium italic">
                        <Briefcase className="w-3 h-3 shrink-0" />
                        <span className="truncate">{w.position || "ทั่วไป"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                           {Array.isArray(w.assigned_sites) ? w.assigned_sites.join(", ") : (w.assigned_sites || "ยังไม่มีไซต์งาน")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {canManage ? (
                    <div className="flex flex-col gap-1 border-l pl-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/workers/${w.worker_id}/edit`);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition"
                        disabled={disabled}
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmDelete(w.worker_id, displayName);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 transition"
                        disabled={disabled}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              </div>
            );
          })
        )}

        {!loading && workers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400">
             <Users className="w-12 h-12 mb-3 opacity-20" />
             <p className="font-bold">ยังไม่มีข้อมูลพนักงาน</p>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      {canManage && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center z-40 pointer-events-none">
          <button
            onClick={() => navigate("/workers/add")}
            className="pointer-events-auto flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-bold shadow-[0_8px_25px_rgba(37,99,235,0.4)] hover:bg-blue-700 active:scale-95 transition-all border-2 border-white"
          >
            <span className="text-xl">+</span>
            เพิ่มพนักงาน
          </button>
        </div>
      )}

      <BottomNav active="users" />

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