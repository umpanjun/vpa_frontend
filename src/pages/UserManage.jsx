// src/pages/UserManage.jsx
import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Pencil,
  User as UserIcon,
  ChevronLeft,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import Swal from "sweetalert2"; // ✅ 1. นำเข้า SweetAlert2

const API = import.meta.env.VITE_API_BASE;
axios.defaults.withCredentials = true;

const UserManage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id, username) => {
    // ✅ 2. เปลี่ยนเป็น SweetAlert2 แบบยืนยันการลบ
    Swal.fire({
      title: 'ยืนยันการลบผู้ใช้?',
      text: `คุณต้องการลบผู้ใช้ "${username}" ใช่หรือไม่? ข้อมูลนี้ไม่สามารถกู้คืนได้`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
      borderRadius: '20px'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${API}/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          setUsers((prev) => prev.filter((u) => u.user_id !== id));
          
          Swal.fire({
            icon: 'success',
            title: 'ลบเรียบร้อย',
            showConfirmButton: false,
            timer: 1500
          });
        } catch (err) {
          console.error("Failed to delete user", err);
          Swal.fire('ผิดพลาด', 'ไม่สามารถลบผู้ใช้ได้', 'error');
        }
      }
    });
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="bg-red-50 p-4 rounded-2xl mb-4 text-red-600">
           <UserIcon className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">เข้าถึงไม่ได้</h2>
        <p className="text-gray-500">คุณไม่มีสิทธิ์เข้าถึงหน้าจัดการผู้ใช้</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* ✅ 3. Top bar ปรับหัวข้อให้อยู่กึ่งกลางเป๊ะ */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-screen-sm px-4 h-16 flex items-center relative">
          
          
          {/* หัวข้อกึ่งกลางหน้าจอ */}
          <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-black text-gray-800 whitespace-nowrap">
            จัดการบัญชีผู้ใช้
          </h2>
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-6">
        <div className="space-y-4">
          {users.map((u) => (
            <div
              key={u.user_id}
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-inner">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{u.display_name || u.username}</p>
                  <p className="text-xs text-gray-500 truncate mb-1.5">{u.email}</p>
                  
                  {/* Badge แยกตามสิทธิ์ */}
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 
                    u.role === 'CEO' ? 'bg-red-100 text-red-600' :
                    u.role === 'Foreman' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {u.role}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 border-l pl-3 ml-2">
                <button
                  onClick={() => navigate(`/users/${u.user_id}/edit`)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition"
                  title="แก้ไข"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                {/* ห้ามแอดมินลบตัวเอง หรือลบแอดมินคนอื่น (Optional) */}
                {u.role !== "admin" && (
                  <button
                    onClick={() => handleDelete(u.user_id, u.username)}
                    className="p-2 text-gray-400 hover:text-red-600 transition"
                    title="ลบ"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 text-gray-400">
              <UserIcon className="w-16 h-16 mx-auto mb-4 opacity-10" />
              <p className="font-bold">ไม่พบรายชื่อผู้ใช้ในระบบ</p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ 4. Floating Action Button สไตล์แคปซูลกึ่งกลาง */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => navigate("/users/add")}
          className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 text-white font-black shadow-[0_12px_30px_rgba(37,99,235,0.4)] hover:bg-blue-700 active:scale-95 transition-all border-2 border-white/20 whitespace-nowrap"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>เพิ่มบัญชีผู้ใช้งาน</span>
        </button>
      </div>

      <BottomNav active="users" />
    </div>
  );
};

export default UserManage;