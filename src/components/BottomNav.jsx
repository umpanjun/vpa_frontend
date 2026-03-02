// src/components/BottomNav.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, PieChart, Users, User, ShieldCheck, FileSearch, TrendingUp } from "lucide-react"; // เพิ่ม TrendingUp สำหรับรายรับ
import { useAuth } from "../context/AuthContext";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); 
  const role = user?.role;

  // รายการเมนูทั้งหมด
  const allItems = [
    { path: "/dashboard", label: "หน้าหลัก", icon: <Home className="w-5 h-5" />, roles: ["admin", "CEO", "Secretary", "audit", "Foreman"] },
    
    // ✅ เมนูรายรับ (Incomes) เพิ่มเข้ามาใหม่
    { path: "/incomes/summary", label: "รายรับ", icon: <TrendingUp className="w-5 h-5" />, roles: ["admin", "CEO", "Secretary"] },
    
    { path: "/expenses/summary", label: "รวมจ่าย", icon: <PieChart className="w-5 h-5" />, roles: ["admin", "CEO", "Secretary"] },
    
    // ✅ Audit Logs (เฉพาะ role audit เท่านั้นที่เห็น)
    { path: "/audit", label: "Audit logs", icon: <FileSearch className="w-5 h-5" />, roles: ["audit"] },
    
    { path: "/users/manage", label: "จัดการผู้ใช้", icon: <ShieldCheck className="w-5 h-5" />, roles: ["admin"] }, 
    { path: "/workers", label: "พนักงาน", icon: <Users className="w-5 h-5" />, roles: ["admin", "CEO", "audit", "Foreman", "Secretary"] },
    { path: "/profile", label: "โปรไฟล์", icon: <User className="w-5 h-5" />, roles: ["admin", "CEO", "Foreman", "audit", "Secretary"] },
  ];

  // กรองเมนูตามสิทธิ์ (ถ้าใครไม่มีสิทธิ์ ปุ่มจะหายไปเลย)
  const navItems = allItems.filter(item => item.roles.includes(role));

  if (!role || navItems.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-lg z-50">
      <div 
        className="mx-auto max-w-md md:max-w-2xl grid py-2"
        style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-1 py-2 rounded-2xl transition ${
                isActive
                  // ถ้าต้องการให้ปุ่มรายรับเป็นสีเขียวตอน Active สามารถเพิ่มเงื่อนไขเช็ค item.path ได้ครับ
                  // แต่นี่ผมคงสีฟ้าไว้ให้กลืนกับปุ่มอื่นๆ ใน Nav ก่อน
                  ? "text-blue-600 bg-blue-50 shadow-sm"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              {item.icon}
              <span className="text-[10px] sm:text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;