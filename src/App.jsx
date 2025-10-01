import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SiteDetail from "./pages/SiteDetail";
import ExpensesReport from "./pages/ExpensesReport";
import WorkersBySite from "./pages/WorkersBySite";
import AllWorkers from "./pages/AllWorkers";
import WorkerDetail from "./pages/WorkerDetail";
import WorkerFormAdd from "./pages/WorkerFormAdd";
import WorkerFormEdit from "./pages/WorkerFormEdit";
import SiteAdd from "./pages/SiteAdd";
import SiteEdit from "./pages/SiteEdit";
import SiteProgressEdit from "./pages/SiteProgressEdit";

// ✅ หน้าใหม่
import ExpenseSummary from "./pages/ExpenseSummary";
import ExpenseFormAdd from "./pages/ExpenseFormAdd";   // <--- ฟอร์มเพิ่มบิล
import Profile from "./pages/Profile";                 // ✅ โปรไฟล์
import PendingExpenses from "./pages/PendingExpenses";

// ✅ Admin manage users
import UserManage from "./pages/UserManage";
import UserFormEdit from "./pages/UserFormEdit";       // ✅ เพิ่มไฟล์แก้ไขผู้ใช้
import UserFormAdd from "./pages/UserFormAdd";
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Site detail & related */}
          <Route path="/sites/:id" element={<SiteDetail />} />
          <Route path="/sites/:id/expenses" element={<ExpensesReport />} />
          <Route path="/sites/:id/expenses/add" element={<ExpenseFormAdd />} /> 
          <Route path="/sites/:id/workers" element={<WorkersBySite />} />
          <Route path="/sites/add" element={<SiteAdd />} />
          <Route path="/sites/:id/edit" element={<SiteEdit />} />
          <Route path="/sites/:id/progress/edit" element={<SiteProgressEdit />} />

          {/* Workers */}
          <Route path="/workers" element={<AllWorkers />} />
          <Route path="/workers/add" element={<WorkerFormAdd />} />
          <Route path="/workers/:id" element={<WorkerDetail />} />
          <Route path="/workers/:id/edit" element={<WorkerFormEdit />} />

          {/* Expense Summary */}
          <Route path="/expenses/summary" element={<ExpenseSummary />} />
          <Route path="/expenses/pending" element={<PendingExpenses />} />

          {/* Profile */}
          <Route path="/profile" element={<Profile />} />

          {/* ✅ Admin Manage Users */}
          <Route path="/users/manage" element={<UserManage />} />
          <Route path="/users/:id/edit" element={<UserFormEdit />} /> {/* ✅ route ใหม่ */}
          <Route path="/users/add" element={<UserFormAdd />} />
          {/* Fallback */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
