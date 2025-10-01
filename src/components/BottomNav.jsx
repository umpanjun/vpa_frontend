// src/components/BottomNav.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, PieChart, Users, User } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "หน้าหลัก", icon: <Home className="w-5 h-5" /> },
    { path: "/expenses/summary", label: "ค่าใช้จ่ายรวม", icon: <PieChart className="w-5 h-5" /> },
    { path: "/workers", label: "พนักงาน", icon: <Users className="w-5 h-5" /> },
    { path: "/profile", label: "โปรไฟล์", icon: <User className="w-5 h-5" /> }, // ✅ เปลี่ยนจาก /users → /profile
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-lg">
      <div className="mx-auto max-w-md md:max-w-2xl grid grid-cols-4 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition ${
                isActive
                  ? "text-blue-600 bg-blue-50 shadow-sm"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
