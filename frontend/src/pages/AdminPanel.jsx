import React from 'react';
import Settings from './Settings';
import DocumentManage from './DocumentManage';
import NewUserAdmin from './NewUserAdmin';
import UserManagement from './UserManagement';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  FaUsers,
  FaFileAlt,
  FaCog,
  FaUserPlus,
  FaChartLine,
  FaBell,
} from 'react-icons/fa'; // Import icons

const AdminPanel = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="bg-gray-800 text-white w-64 p-4">
        <h2 className="text-2xl font-semibold mb-6 text-center">Admin Panel</h2>
        <nav>
          <Link
            to="/adminpanel/UserManagement"
            className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-gray-700 ${
              location.pathname === '/adminpanel/UserManagement' ? 'bg-gray-700' : ''
            }`}
          >
            <FaUsers />
            <span>User Management</span>
          </Link>
          <Link
            to="/adminpanel/DocumentManage"
            className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-gray-700 ${
              location.pathname === '/adminpanel/DocumentManage' ? 'bg-gray-700' : ''
            }`}
          >
            <FaFileAlt />
            <span>Document Management</span>
          </Link>
          <Link
            to="/adminpanel/Settings"
            className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-gray-700 ${
              location.pathname === '/adminpanel/Settings' ? 'bg-gray-700' : ''
            }`}
          >
            <FaCog />
            <span>Settings</span>
          </Link>
          <Link
            to="/adminpanel/NewUserAdmin"
            className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-gray-700 ${
              location.pathname === '/adminpanel/NewUserAdmin' ? 'bg-gray-700' : ''
            }`}
          >
            <FaUserPlus />
            <span>New User Sign Up</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-4">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Example Dashboard Cards */}
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
              <div className="text-blue-500 text-3xl">
                <FaUsers />
              </div>
              <div>
                <h3 className="font-semibold">Total Users</h3>
                <p className="text-gray-600">150</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
              <div className="text-green-500 text-3xl">
                <FaFileAlt />
              </div>
              <div>
                <h3 className="font-semibold">Uploaded Docs</h3>
                <p className="text-gray-600">320</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
              <div className="text-purple-500 text-3xl">
                <FaChartLine />
              </div>
              <div>
                <h3 className="font-semibold">Recent Activity</h3>
                <p className="text-gray-600">10</p>
              </div>
            </div>
          </div>
        </div>

        {/* Routes */}
        <Routes>
          <Route path="/Settings" element={<Settings />} />
          <Route path="/NewUserAdmin" element={<NewUserAdmin />} />
          <Route path="/DocumentManage" element={<DocumentManage />} />
          <Route path="/UserManagement" element={<UserManagement />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPanel;