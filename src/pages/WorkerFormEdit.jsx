// src/pages/WorkerFormEdit.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ChevronLeft } from "lucide-react";

const API = import.meta.env.VITE_API_BASE;
axios.defaults.withCredentials = true;

const IOSBack = ({ onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 active:opacity-80 transition"
  >
    <ChevronLeft className="w-7 h-7 -ml-1" />
    <span className="text-blue-600 font-medium">Back</span>
  </button>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="block text-sm text-gray-600 mb-1">{label}</span>
    {children}
  </label>
);

const WorkerFormEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/workers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(res.data.data);
      } catch (err) {
        console.error("Error fetching worker", err);
      }
    };
    fetchWorker();
  }, [id]);

  const setVal = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const knownFields = useMemo(
    () =>
      form
        ? [
            { key: "first_name", label: "ชื่อจริง", type: "text" },
            { key: "last_name", label: "นามสกุล", type: "text" },
            { key: "nickname", label: "ชื่อเล่น", type: "text" },
            { key: "position", label: "ตำแหน่ง", type: "text" },
            { key: "phone", label: "เบอร์โทร", type: "tel" },
            { key: "daily_wage", label: "ค่าแรงต่อวัน (บาท)", type: "number", step: "1" },
          ].filter((f) => f.key in form)
        : [],
    [form]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/workers/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(`/workers/${id}`);
    } catch (err) {
      console.error("Error updating worker", err);
      alert("บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <p className="p-4">กำลังโหลดข้อมูล...</p>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="max-w-screen-sm mx-auto px-4 h-14 flex items-center justify-between">
          <IOSBack onClick={() => navigate(-1)} />
          <div className="text-base font-bold">แก้ไขพนักงาน</div>
          <div className="w-[88px]" /> {/* spacer */}
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-4">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-4"
        >
          {knownFields.map((f) => (
            <Field key={f.key} label={f.label}>
              <input
                type={f.type}
                step={f.step}
                value={form[f.key] ?? ""}
                onChange={(e) => setVal(f.key, e.target.value)}
                className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </Field>
          ))}

          {/* เผื่อมีฟิลด์อื่น ๆ ที่อยากแก้—จะเรนเดอร์ต่อท้ายแบบ generic */}
          {Object.keys(form)
            .filter((k) => !knownFields.find((f) => f.key === k))
            .map((k) => (
              <Field key={k} label={k}>
                <input
                  type="text"
                  value={form[k] ?? ""}
                  onChange={(e) => setVal(k, e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                />
              </Field>
            ))}

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-11 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 active:translate-y-px disabled:opacity-60"
            >
              {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-11 px-4 rounded-xl border bg-white hover:bg-gray-50"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerFormEdit;
