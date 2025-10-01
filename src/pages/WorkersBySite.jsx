// src/pages/WorkersBySite.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import axios from "../api";

export default function WorkersBySite() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/site-workers/${id}`);
      setWorkers(res.data?.data || []);
    } catch (e) {
      console.error("โหลดข้อมูลคนงานในไซต์ผิดพลาด:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadAllWorkers = async () => {
    try {
      const res = await axios.get(`/api/workers`);
      setAllWorkers(res.data?.data || []);
    } catch (e) {
      console.error("โหลดข้อมูลคนงานทั้งหมดผิดพลาด:", e);
    }
  };

  const handleAddWorker = async (worker_id) => {
    try {
      await axios.post(`/api/site-workers`, { site_id: id, worker_id });
      setAdding(false);
      await loadWorkers();
    } catch (e) {
      console.error("เพิ่มคนงานผิดพลาด:", e);
    }
  };

  const handleRemoveWorker = async (site_worker_id) => {
    if (!window.confirm("ต้องการลบคนงานออกจากไซต์นี้ใช่หรือไม่?")) return;
    try {
      await axios.delete(`/api/site-workers/${site_worker_id}`);
      await loadWorkers();
    } catch (e) {
      console.error("ลบคนงานผิดพลาด:", e);
    }
  };

  useEffect(() => {
    loadWorkers();
    loadAllWorkers();
  }, [id]);

  const availableWorkers = allWorkers.filter(
    (w) => !workers.some((sw) => sw.worker_id === w.worker_id)
  );

  if (loading) return <div className="p-4">กำลังโหลด...</div>;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Top bar */}
      <div className="mx-auto max-w-md md:max-w-2xl px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
        >
          <ChevronLeft className="w-6 h-6 stroke-[3]  text-blue-600 " />
          <span className="text-lg font-medium text-blue-600">Back</span>
        </button>
      </div>

      <div className="mx-auto max-w-md md:max-w-2xl px-4">
        <h1 className="text-2xl font-extrabold mt-2">คนงานในไซต์</h1>

        <div className="mt-4 bg-white rounded-xl border">
          {workers.length === 0 && (
            <div className="text-gray-500 p-4">ไม่มีคนงานในไซต์นี้</div>
          )}
          <ul className="divide-y">
            {workers.map((w) => (
              <li key={w.site_worker_id} className="flex items-center justify-between py-3 px-4">
                <span>
                  {`${w.first_name || ""} ${w.last_name || ""}${
                    w.nickname ? ` (${w.nickname})` : ""
                  }`.trim()}
                </span>
                <button
                  onClick={() => handleRemoveWorker(w.site_worker_id)}
                  className="text-red-600 hover:underline"
                >
                  ลบ
                </button>
              </li>
            ))}
          </ul>
        </div>

        {adding ? (
          <div className="mt-4 bg-white rounded-xl border">
            <div className="p-4">
              <h2 className="font-semibold mb-2">เลือกคนงานที่จะเพิ่ม</h2>
              {availableWorkers.length === 0 && (
                <div className="text-gray-500">ไม่มีคนงานที่สามารถเพิ่มได้</div>
              )}
              <ul className="divide-y">
                {availableWorkers.map((w) => (
                  <li key={w.worker_id} className="flex items-center justify-between py-3">
                    <span>{`${w.first_name || ""} ${w.last_name || ""}`.trim()}</span>
                    <button
                      onClick={() => handleAddWorker(w.worker_id)}
                      className="text-blue-600 hover:underline"
                    >
                      เพิ่ม
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setAdding(false)}
                className="mt-4 px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <button
              onClick={() => setAdding(true)}
              className="px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
            >
              + เพิ่มคนงาน
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
