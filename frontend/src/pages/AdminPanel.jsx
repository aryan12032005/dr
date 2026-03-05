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
  FaChalkboardTeacher,
  FaHome,
  FaBars,
  FaTimes,
  FaTrashAlt,
  FaTags,
  FaBuilding,
  FaUserPlus,
  FaCloudUploadAlt,
  FaSearch,
  FaBell,
  FaSignOutAlt,
  FaUsersCog
} from "react-icons/fa";
import FacultyManage from "./FacultyManage";
import DeletedDocuments from "./DeletedDocuments";
import DepartmentsList from "./DepartmentsList";
import CategoriesList from "./CategoriesList";
import CategoryManagement from "./CategoryManagement";
import NewUserAdmin from "./NewUserAdmin";
import PendingUploads from "./PendingUploads";
import GroupsManagement from "./GroupsManagement";
import networkRequests from "../request_helper";

const req_client = new networkRequests();

const AdminPanel = ({ userStatus }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);

  const fetch_details = async () => {
    req_client.reload_tokens();
    const header = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq("total_details/", "GET", header);
    if (result && result.ok) {
      const data = await result.json();
      setTotalUsers(data.total_users || 0);
      setTotalDocs(data.total_docs || 0);
    }
  };

  useEffect(() => {
    fetch_details();
  }, []);

  const menuItems = [
    { label: "Dashboard", icon: <FaHome />, path: "/adminpanel" },
    { label: "User Management", icon: <FaUsers />, path: "/adminpanel/UserManagement" },
    { label: "Document Manager", icon: <FaFileAlt />, path: "/adminpanel/DocumentManage" },
    { label: "Pending Uploads", icon: <FaCloudUploadAlt />, path: "/adminpanel/PendingUploads" },
    { label: "Delete Requests", icon: <FaTrashAlt />, path: "/adminpanel/DocumentDeleteRequests" },
    { label: "Faculty Management", icon: <FaChalkboardTeacher />, path: "/adminpanel/FacultyManage" },
    { label: "Groups", icon: <FaUsersCog />, path: "/adminpanel/groups" },
    { label: "Departments", icon: <FaBuilding />, path: "/adminpanel/departments" },
    { label: "Categories", icon: <FaTags />, path: "/adminpanel/categories" },
    { label: "Settings", icon: <FaCog />, path: "/adminpanel/Settings" },
  ];

  const quickActions = [
    { label: "Document Manager", icon: <FaFileAlt />, path: "/adminpanel/DocumentManage", color: "from-blue-500 to-blue-600" },
    { label: "Manage Groups", icon: <FaUsersCog />, path: "/adminpanel/groups", color: "from-indigo-500 to-indigo-600" },
    { label: "View Categories", icon: <FaTags />, path: "/adminpanel/categories", color: "from-purple-500 to-purple-600" },
    { label: "View Departments", icon: <FaBuilding />, path: "/adminpanel/departments", color: "from-orange-500 to-orange-600" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col shadow-2xl`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-slate-900 text-xl" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Admin Panel</h2>
                  <p className="text-xs text-slate-400">Management Dashboard</p>
                </div>
              </div>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map(({ label, icon, path }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                ${location.pathname === path 
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 shadow-lg shadow-yellow-500/30' 
                  : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                }`}
            >
              <span className={`text-xl ${location.pathname === path ? 'text-slate-900' : 'text-yellow-400 group-hover:text-yellow-300'}`}>
                {icon}
              </span>
              {sidebarOpen && <span className="font-medium">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-slate-700">
            <Link 
              to="/logout"
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <FaSignOutAlt className="text-xl" />
              <span className="font-medium">Logout</span>
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {location.pathname === "/adminpanel" ? "Dashboard" : 
               menuItems.find(item => item.path === location.pathname)?.label || "Admin Panel"}
            </h1>
            <p className="text-sm text-gray-500">Welcome back, Administrator</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FaBell className="text-gray-600 text-xl" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-slate-900 font-bold">A</span>
              </div>
              <div className="hidden md:block">
                <p className="font-medium text-gray-800">Admin</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {location.pathname === "/adminpanel" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Total Users</p>
                      <h3 className="text-3xl font-bold text-gray-800 mt-1">{totalUsers}</h3>
                      <p className="text-green-500 text-sm mt-2">Active users</p>
                    </div>
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <FaUsers className="text-2xl text-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Total Documents</p>
                      <h3 className="text-3xl font-bold text-gray-800 mt-1">{totalDocs}</h3>
                      <p className="text-green-500 text-sm mt-2">Uploaded files</p>
                    </div>
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                      <FaFileAlt className="text-2xl text-green-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Faculty Members</p>
                      <h3 className="text-3xl font-bold text-gray-800 mt-1">--</h3>
                      <p className="text-gray-400 text-sm mt-2">Active contributors</p>
                    </div>
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                      <FaChalkboardTeacher className="text-2xl text-purple-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Pending Requests</p>
                      <h3 className="text-3xl font-bold text-gray-800 mt-1">--</h3>
                      <p className="text-orange-500 text-sm mt-2">Requires attention</p>
                    </div>
                    <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                      <FaTrashAlt className="text-2xl text-orange-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map(({ label, icon, path, color }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`bg-gradient-to-r ${color} p-5 rounded-xl text-white flex items-center gap-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
                    >
                      <span className="text-2xl">{icon}</span>
                      <span className="font-medium">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Dynamic Routes */}
          <Routes>
            <Route path="/Settings" element={<Settings />} />
            <Route path="/DocumentManage" element={<DocumentManage userStatus={userStatus} />} />
            <Route path="/DocumentDeleteRequests" element={<DeletedDocuments />} />
            <Route path="/PendingUploads" element={<PendingUploads />} />
            <Route path="/UserManagement" element={<UserManagement />} />
            <Route path="/FacultyManage" element={<FacultyManage />} />
            <Route path="/departments" element={<DepartmentsList />} />
            <Route path="/categories" element={<CategoriesList />} />
            <Route path="/category-management" element={<CategoryManagement />} />
            <Route path="/NewUser" element={<NewUserAdmin />} />
            <Route path="/groups" element={<GroupsManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
