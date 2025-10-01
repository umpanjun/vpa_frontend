// src/pages/WorkerDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_BASE;

export default function WorkerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = ["admin", "ceo", "secretary"].includes(user?.role);

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/workers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (alive) setWorker(res.data?.data || null);
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

  async function handleDelete() {
    if (!window.confirm("คุณต้องการลบพนักงานคนนี้ใช่หรือไม่?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/workers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("ลบพนักงานเรียบร้อยแล้ว");
      navigate("/workers");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("ไม่สามารถลบพนักงานได้");
    }
  }

  if (loading) return <div className="p-4 text-gray-500">กำลังโหลด...</div>;
  if (!worker) return <div className="p-4 text-red-600">ไม่พบข้อมูลพนักงาน</div>;

  const fullName = `${worker.first_name || ""} ${worker.last_name || ""}`.trim();

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Top bar */}
      <div className="mx-auto max-w-md md:max-w-2xl px-4 pt-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]  text-blue-600  " />
            <span className="text-lg font-medium text-blue-600">Back</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-md md:max-w-2xl px-4">
        <h1 className="text-2xl font-extrabold mt-2">
          {fullName || worker.nickname}
        </h1>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 mt-4">
          <div className="space-y-2 text-sm text-gray-700">
            <p><span className="font-semibold">ตำแหน่ง:</span> {worker.position || "พนักงานก่อสร้าง"}</p>
            <p><span className="font-semibold">โทรศัพท์:</span> {worker.phone || "-"}</p>
            <p><span className="font-semibold">บัตรประชาชน:</span> {worker.national_id || "-"}</p>
            <p><span className="font-semibold">ทักษะ:</span> {worker.skill_level || "-"}</p>
            <p><span className="font-semibold">ค่าจ้างรายวัน:</span> {worker.daily_wage || "-"} บาท</p>
            <p><span className="font-semibold">วันที่เริ่มงาน:</span> {worker.hire_date || "-"}</p>
            <p><span className="font-semibold">สถานะ:</span> {worker.status || "-"}</p>
            <p><span className="font-semibold">ไซต์งาน:</span> {worker.assigned_sites?.join(", ") || "-"}</p>
          </div>
        </div>

        {/* Action Buttons → แสดงเฉพาะ admin/ceo/secretary */}
        {canManage && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate(`/workers/${id}/edit`)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              <Pencil className="w-5 h-5" />
              แก้ไข
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
            >
              <Trash2 className="w-5 h-5" />
              ลบ
            </button>
          </div>
        )}
      </div>

      {/* BottomNav */}
      <BottomNav active="users" />
    </div>
  );
}
