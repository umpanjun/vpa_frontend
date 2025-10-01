// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "../api";
import { useAuth } from "../context/AuthContext";
import {
  User as UserIcon,
  ChevronRight,
  MapPin,
  LogOut,
  Users as UsersIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

const API = import.meta.env.VITE_API_BASE;
axios.defaults.withCredentials = true;

// ✅ แปลง image_url จาก DB → src พร้อมใช้งาน
const resolveSiteImage = (image_url) => {
  if (!image_url) return "https://picsum.photos/800/400?blur=2";

  const url = String(image_url);

  // ถ้า backend ส่งมาเป็น URL เต็ม
  if (/^https?:\/\//i.test(url)) return url;

  // ถ้า backend ส่งมาเป็น path เช่น "/uploads/sites/xxx.webp"
  if (url.startsWith("/uploads")) return `${API}${url}`;

  // ถ้า backend ส่งมาเป็นชื่อไฟล์ เช่น "xxx.webp"
  return `${API}/uploads/sites/${url}`;
};

const Dashboard = () => {
  const { logout } = useAuth();
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/dashboard`);
        setData(res.data);
      } catch (err) {
        console.error("Fetch dashboard error", err);
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          handleLogout();
        }
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    if (typeof logout === "function") logout();
    navigate("/login", { replace: true });
  };

  if (!data) return <p className="p-4">กำลังโหลดข้อมูล...</p>;

  const role = data.user?.role;

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-screen-sm px-4 py-4 flex items-center gap-3">
          <UserIcon className="w-6 h-6 text-black" />
          <span className="text-md font-semibold">
            ยินดีต้อนรับคุณ {data.user?.display_name || data.user?.first_name}
          </span>
          <button
            onClick={handleLogout}
            className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Page Container */}
      <div className="mx-auto max-w-screen-sm px-4">
        {/* Section Title */}
        <div className="mb-3">
          <div className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium">
            ไซต์งานที่เกี่ยวข้องกับคุณ
          </div>
        </div>

        {/* Site Cards */}
        {data.sites?.length > 0 ? (
          data.sites.map((site) => (
            <div
              key={site.site_id}
              onClick={() => navigate(`/sites/${site.site_id}`)}
              className="mb-6 bg-white rounded-3xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.15)]
                         overflow-hidden border border-gray-100 cursor-pointer transition
                         hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.2)]"
            >
              {/* Cover */}
              <div className="relative w-full aspect-[16/9]">
                <img
                  src={resolveSiteImage(site.image_url)}
                  alt={site.site_name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Info */}
              <div className="p-4">
                <h3
                  className="text-blue-900 font-bold leading-tight"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/sites/${site.site_id}`);
                  }}
                >
                  {site.site_name}
                </h3>
                {site.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {site.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  สถานะ:{" "}
                  <span
                    className={
                      site.status === "In Progress"
                        ? "text-green-600"
                        : "text-gray-600"
                    }
                  >
                    {site.status}
                  </span>
                </p>
              </div>

              {/* Footer Buttons */}
              <div
                className="flex items-center justify-between p-4 border-t"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => navigate(`/sites/${site.site_id}`)}
                  className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-300
                             text-gray-700 hover:bg-gray-100 transition"
                >
                  รายละเอียดเพิ่มเติม
                  <ChevronRight className="w-4 h-4" />
                </button>

                {site.map_link && (
                  <button
                    onClick={() => window.open(site.map_link, "_blank")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                               bg-green-100 text-green-700 hover:bg-green-200 transition"
                    title="เปิดแผนที่"
                  >
                    <MapPin className="w-4 h-4" />
                    แผนที่
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">ไม่มีไซต์งาน</p>
        )}

        {/* Add Project → admin/ceo เท่านั้น */}
        {["admin", "CEO"].includes(role) && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate("/sites/add")}
              className="px-5 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition shadow-sm"
            >
              + เพิ่มไซต์งาน
            </button>
          </div>
        )}

        {/* Manage Users → admin เท่านั้น */}
        {role === "admin" && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => navigate("/users/manage")}
              className="px-5 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition shadow-sm flex items-center gap-2"
            >
              <UsersIcon className="w-4 h-4" />
              จัดการบัญชีผู้ใช้
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
