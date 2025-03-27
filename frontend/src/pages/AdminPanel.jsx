import React, { useState, useEffect } from "react";
import Settings from "./Settings";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import DocumentManage from "./DocumentManage";
import UserManagement from "./UserManagement";
import {
  FaUsers,
  FaFileAlt,
  FaCog,
  FaUserPlus,
  FaChartLine,
  FaBell,
  FaChalkboardTeacher,
  FaHome,
} from "react-icons/fa";
import FacultyManage from "./FacultyManage";
import Demo from "./DemoGroups";
import networkRequests from "../request_helper";

const req_client = new networkRequests();

const AdminPanel = () => {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);

  const fetch_details = async () => {
    req_client.reload_tokens();
    const header = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq("total_details/", "GET", header);
    if (result.ok) {
      const data = await result.json();
      setTotalUsers(data.total_users);
      setTotalDocs(data.total_docs);
    }
  };

  useEffect(() => {
    fetch_details();
  }, [navigate]);
  const location = useLocation();

  // Check if we're on the main admin panel route
  const isDashboardVisible = location.pathname === "/adminpanel";

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="bg-gray-800 text-white w-64 p-4">
        <h2 className="text-2xl font-semibold mb-6 text-center">Admin Panel</h2>
        <nav>
          {/* Add a link to the dashboard */}
          <Link
            to="/adminpanel"
            className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-gray-700 ${
              location.pathname === "/adminpanel" ? "bg-gray-700" : ""
            }`}
          >
            <FaHome />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/adminpanel/UserManagement"
            className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-gray-700 ${
              location.pathname === "/adminpanel/UserManagement"
                ? "bg-gray-700"
                : ""
            }`}
          >
            <FaUsers />
            <span>User Management</span>
          </Link>
          <Link
            to="/adminpanel/DocumentManage"
            className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-gray-700 ${
              location.pathname === "/adminpanel/DocumentManage"
                ? "bg-gray-700"
                : ""
            }`}
          >
            <FaFileAlt />
            <span>Document Management</span>
          </Link>
          <Link
            to="/adminpanel/FacultyManage"
            className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-gray-700 ${
              location.pathname === "/adminpanel/FacultyManage"
                ? "bg-gray-700"
                : ""
            }`}
          >
            <FaChalkboardTeacher />
            <span>Faculty Management</span>
          </Link>
          <Link
            to="/adminpanel/Settings"
            className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-gray-700 ${
              location.pathname === "/adminpanel/Settings" ? "bg-gray-700" : ""
            }`}
          >
            <FaCog />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Conditionally render dashboard only when on /adminpanel */}
        {isDashboardVisible && (
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
                  <p className="text-gray-600">{totalUsers}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
                <div className="text-green-500 text-3xl">
                  <FaFileAlt />
                </div>
                <div>
                  <h3 className="font-semibold">Uploaded Docs</h3>
                  <p className="text-gray-600">{totalDocs}</p>
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
        )}

        {/* Routes */}
        <Routes>
          <Route path="/Settings" element={<Settings />} />
          <Route path="/DocumentManage" element={<DocumentManage />} />
          <Route path="/UserManagement" element={<UserManagement />} />
          <Route path="/FacultyManage" element={<FacultyManage />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPanel;
