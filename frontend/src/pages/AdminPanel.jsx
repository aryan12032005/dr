import React, { useState, useEffect } from "react";
import Settings from "./Settings";
import {
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
  FaChartLine,
  FaBell,
  FaChalkboardTeacher,
  FaHome,
} from "react-icons/fa";
import FacultyManage from "./FacultyManage";
import networkRequests from "../request_helper";

const req_client = new networkRequests();

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Sidebar */}
      <aside className="bg-[#1f2937] text-white w-64 p-6 shadow-2xl flex flex-col justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center tracking-wide">
            Admin
          </h2>
          <nav className="space-y-4">
            {[
              { label: "Dashboard", icon: <FaHome />, path: "/adminpanel" },
              {
                label: "User Management",
                icon: <FaUsers />,
                path: "/adminpanel/UserManagement",
              },
              {
                label: "Document Management",
                icon: <FaFileAlt />,
                path: "/adminpanel/DocumentManage",
              },
              {
                label: "Faculty Management",
                icon: <FaChalkboardTeacher />,
                path: "/adminpanel/FacultyManage",
              },
              {
                label: "Settings",
                icon: <FaCog />,
                path: "/adminpanel/Settings",
              },
            ].map(({ label, icon, path }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-4 px-2 py-2 rounded-lg transition-all duration-200 
                  hover:bg-gray-700 hover:shadow-lg active:scale-[0.98] ${
                    location.pathname === path ? "bg-gray-700 shadow-md" : ""
                  }`}
              >
                <span className="text-xl">{icon}</span>
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {location.pathname == "/adminpanel" && (
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-6 text-gray-800">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
              {[
                {
                  icon: <FaUsers />,
                  title: "Total Users",
                  value: totalUsers,
                  color: "text-blue-500",
                  shadow: "hover:shadow-blue-400",
                },
                {
                  icon: <FaFileAlt />,
                  title: "Uploaded Docs",
                  value: totalDocs,
                  color: "text-green-500",
                  shadow: "hover:shadow-green-400",
                },
                {
                  icon: <FaChartLine />,
                  title: "Recent Activity",
                  value: "10",
                  color: "text-purple-500",
                  shadow: "hover:shadow-purple-400",
                },
              ].map(({ icon, title, value, color, shadow }, i) => (
                <div
                  key={i}
                  className={`flex flex-row justify-evenly bg-white p-6 rounded-2xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${shadow}`}
                >
                  <div className={`text-2xl mb-4 ${color}`}>{icon}</div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    {title}
                  </h3>
                  <p className="text-gray-600 text-xl font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Dynamic Routes */}
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
