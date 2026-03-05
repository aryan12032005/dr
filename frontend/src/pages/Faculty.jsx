import React, { useState, useEffect, useRef } from "react";
import Groups from "./Groups";
import { Link, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import RequestedDocument from "./RequestedDocument";
import { FaUsers, FaFileAlt, FaHome, FaTimes, FaChartLine, FaClipboardList, FaUserFriends, FaUpload, FaUser, FaCog, FaSignOutAlt, FaBars, FaBell, FaSearch, FaDownload, FaTrash, FaEye, FaFilter, FaCalendarAlt, FaTags, FaBuilding, FaLock, FaUnlock, FaFolder, FaEdit, FaSave, FaTable, FaSortUp, FaSortDown } from "react-icons/fa";
import networkRequests from "../request_helper";
import { saveAs } from "file-saver";

const req_client = new networkRequests();

// Icon Components (same as DocUpload)
const UploadIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const VideoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Faculty Dashboard Component
const FacultyDashboard = () => {
  const [stats, setStats] = useState({
    totalGroups: 0,
    pendingRequests: 0,
    pendingUploads: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    await req_client.reload_tokens();
    const headers = { Authorization: `Bearer ${req_client.accessToken}` };
    
    try {
      // Get groups count
      const groupsRes = await req_client.fetchReq("get_groups/", "GET", headers);
      if (groupsRes.ok) {
        const data = await groupsRes.json();
        setStats(prev => ({ ...prev, totalGroups: data.groups?.length || 0 }));
      }
      
      // Get pending requests
      const user = JSON.parse(sessionStorage.getItem("user"));
      const reqRes = await req_client.fetchReq(`get_requests/?fac_id=${user?._id}`, "GET", headers);
      if (reqRes.ok) {
        const data = await reqRes.json();
        setStats(prev => ({ ...prev, pendingRequests: data.requests?.length || 0 }));
      }

      // Get pending uploads
      const uploadsRes = await req_client.fetchReq("get_my_pending_uploads/", "GET", headers);
      if (uploadsRes.ok) {
        const data = await uploadsRes.json();
        const pending = (data.pending_uploads || []).filter(u => u.status === 'pending');
        setStats(prev => ({ ...prev, pendingUploads: pending.length }));
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Faculty Portal</h1>
        <p className="text-blue-100">Manage your groups, documents and requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FaUserFriends className="text-blue-600 text-2xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Groups</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalGroups}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <FaClipboardList className="text-amber-600 text-2xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Doc Requests</p>
              <p className="text-3xl font-bold text-gray-800">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FaUpload className="text-purple-600 text-2xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending Uploads</p>
              <p className="text-3xl font-bold text-gray-800">{stats.pendingUploads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <FaChartLine className="text-green-600 text-2xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Status</p>
              <p className="text-xl font-bold text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/facultypanel/groups" className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            <FaUsers className="text-blue-600 text-xl" />
            <div>
              <p className="font-medium text-gray-800">Manage Groups</p>
              <p className="text-sm text-gray-500">Create and manage member groups</p>
            </div>
          </Link>
          <Link to="/facultypanel/requested-docs" className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
            <FaFileAlt className="text-amber-600 text-xl" />
            <div>
              <p className="font-medium text-gray-800">Document Requests</p>
              <p className="text-sm text-gray-500">Review and approve document requests</p>
            </div>
          </Link>
          <Link to="/facultypanel/upload-doc" className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
            <FaUpload className="text-purple-600 text-xl" />
            <div>
              <p className="font-medium text-gray-800">Upload Document</p>
              <p className="text-sm text-gray-500">Submit documents for admin approval</p>
            </div>
          </Link>
          <Link to="/facultypanel/my-documents" className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
            <FaFolder className="text-green-600 text-xl" />
            <div>
              <p className="font-medium text-gray-800">My Documents</p>
              <p className="text-sm text-gray-500">Manage and search your documents</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Faculty Document Manager Component - Search and Manage Documents
const FacultyDocumentManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [viewingDocument, setViewDocument] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [editingDocId, setEditingDocId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', isPublic: true, category: '' });
  const [allDepartments, setAllDepartments] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'createDate', direction: 'desc' });
  const [searchMode, setSearchMode] = useState('my'); // 'my' or 'all'

  useEffect(() => {
    fetchMyDocuments();
    getAllDepartments();
    getAllCategories();
  }, []);

  const getAllDepartments = async () => {
    await req_client.reload_tokens();
    const headers = { "Content-Type": "application/json" };
    const result = await req_client.fetchReq("get_department/", "GET", headers);
    if (result && result.ok) {
      const data = await result.json();
      setAllDepartments(data.departments || []);
    }
  };

  const getAllCategories = async () => {
    await req_client.reload_tokens();
    const headers = { Authorization: `Bearer ${req_client.accessToken}` };
    const result = await req_client.fetchReq("get_categories/", "GET", headers);
    if (result && result.ok) {
      const data = await result.json();
      setAllCategories(data.categories || []);
    }
  };

  const fetchMyDocuments = async () => {
    setLoading(true);
    await req_client.reload_tokens();
    const headers = { Authorization: `Bearer ${req_client.accessToken}` };
    const user = JSON.parse(sessionStorage.getItem("user"));
    
    const result = await req_client.fetchReq(`get_faculty_doc/?fac_id=${user?.id || user?._id}`, "GET", headers);
    if (result && result.ok) {
      const data = await result.json();
      setDocuments(data.documents || []);
      setFilteredDocuments(data.documents || []);
    } else {
      setDocuments([]);
      setFilteredDocuments([]);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (searchMode === 'my') {
      // Search within my documents only
      if (!searchTerm.trim()) {
        setFilteredDocuments(documents);
        return;
      }
      const filtered = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDocuments(filtered);
    } else {
      // Search all documents
      setLoading(true);
      await req_client.reload_tokens();
      const headers = { Authorization: `Bearer ${req_client.accessToken}` };
      
      let query = `search_document/?start_c=0&end_c=50`;
      if (searchTerm.trim()) {
        query += `&querry=${encodeURIComponent(searchTerm)}`;
      }
      
      const result = await req_client.fetchReq(query, "GET", headers);
      if (result) {
        const data = await result.json();
        const docs = (data.documents || []).map(doc => ({
          id: doc._id || doc.id,
          title: doc.title || '',
          docType: doc.docType || '',
          category: doc.category || '',
          department: doc.department || '',
          createDate: doc.createDate || doc.date || '',
          isPublic: doc.isPublic || 'true',
          authors: doc.authors || '',
          isOwn: false
        }));
        setFilteredDocuments(docs);
      } else {
        setFilteredDocuments([]);
      }
      setLoading(false);
    }
  };

  const switchSearchMode = (mode) => {
    setSearchMode(mode);
    setSearchTerm('');
    if (mode === 'my') {
      setFilteredDocuments(documents);
    } else {
      setFilteredDocuments([]);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const sorted = [...filteredDocuments].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredDocuments(sorted);
  };

  const openDocument = async (doc_id) => {
    await req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json"
    };
    
    const result = await req_client.fetchReq(`get_document/?doc_id=${doc_id}`, "GET", headers);
    if (result && result.ok) {
      const data = await result.json();
      const department = allDepartments.find(d => d.dep_code === data.document.department);
      data.document.departmentName = department?.dep_name || data.document.department;
      setViewDocument(data.document);
      setIsModalOpen(true);
    } else {
      alert("Error fetching document details");
    }
  };

  const downloadDocument = async (doc_id) => {
    await req_client.reload_tokens();
    const headers = { Authorization: `Bearer ${req_client.accessToken}` };
    
    const result = await req_client.fetchReq(`download_doc/?doc_id=${doc_id}`, "GET", headers);
    if (result && result.ok) {
      const contentType = result.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await result.json();
        alert(data.message);
      } else {
        const contentDisposition = result.headers.get("Content-Disposition");
        let filename = "download.zip";
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+?)"/);
          if (match && match.length > 1) filename = match[1];
        }
        saveAs(await result.blob(), filename);
      }
    } else {
      alert("Error downloading document");
    }
  };

  const startEdit = (doc) => {
    setEditingDocId(doc.id);
    setEditForm({
      title: doc.title,
      isPublic: doc.isPublic === 'true' || doc.isPublic === true,
      category: doc.category || ''
    });
  };

  const cancelEdit = () => {
    setEditingDocId(null);
    setEditForm({ title: '', isPublic: true, category: '' });
  };

  const saveEdit = async (doc_id) => {
    await req_client.reload_tokens();
    const headers = { Authorization: `Bearer ${req_client.accessToken}` };
    
    const formData = new FormData();
    formData.append('title', editForm.title);
    formData.append('isPublic', editForm.isPublic);
    formData.append('category', editForm.category);
    
    const result = await req_client.fetchReq(`update_document/?doc_id=${doc_id}`, "POST", headers, formData);
    if (result && result.ok) {
      alert("Document updated successfully");
      setEditingDocId(null);
      fetchMyDocuments();
    } else {
      alert("Error updating document");
    }
  };

  const requestDelete = async (doc_id) => {
    if (!deleteReason.trim()) {
      alert("Please provide a reason for deletion");
      return;
    }
    
    await req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json"
    };
    
    const result = await req_client.fetchReq(
      `delete_document/?doc_id=${doc_id}`,
      "DELETE",
      headers,
      JSON.stringify({ reason: deleteReason })
    );
    
    if (result && result.ok) {
      const data = await result.json();
      alert(data.message || "Delete request submitted to admin for approval");
      setDeleteDocId(null);
      setDeleteReason("");
      fetchMyDocuments();
    } else {
      const error = await result.json();
      alert(error.message || "Error requesting deletion");
    }
  };

  const getDocTypeColor = (type) => {
    const colors = {
      pdf: 'bg-red-100 text-red-700',
      imgs: 'bg-purple-100 text-purple-700',
      link: 'bg-blue-100 text-blue-700',
      mp4: 'bg-green-100 text-green-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <FaSortUp className="inline ml-1" /> : <FaSortDown className="inline ml-1" />;
  };

  const Modal = ({ onClose, children }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors z-10"
        >
          <FaTimes className="text-lg" />
        </button>
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
            <FaTable className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{searchMode === 'my' ? 'My Documents' : 'All Documents'}</h1>
            <p className="text-gray-500">{searchMode === 'my' ? 'Manage your uploaded documents' : 'Search all public documents'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            to="/facultypanel/upload-doc"
            className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-medium flex items-center gap-2"
          >
            <FaUpload /> Upload New
          </Link>
          <button
            onClick={fetchMyDocuments}
            className="px-4 py-2.5 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Search Mode Toggle */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => switchSearchMode('my')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              searchMode === 'my' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaFolder className="inline mr-2" /> My Documents
          </button>
          <button
            onClick={() => switchSearchMode('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              searchMode === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaSearch className="inline mr-2" /> Search All Documents
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, category, or department..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2"
          >
            <FaSearch /> Search
          </button>
          {searchTerm && (
            <button
              onClick={() => { 
                setSearchTerm(''); 
                if (searchMode === 'my') {
                  setFilteredDocuments(documents);
                } else {
                  setFilteredDocuments([]);
                }
              }}
              className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
            >
              Clear
            </button>
          )}
        </div>
        <p className="mt-3 text-sm text-gray-500">
          {searchMode === 'my' 
            ? `Showing ${filteredDocuments.length} of ${documents.length} documents`
            : `Found ${filteredDocuments.length} documents`}
        </p>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your documents...</p>
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 cursor-pointer hover:text-green-600" onClick={() => handleSort('title')}>
                    Title <SortIcon columnKey="title" />
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 cursor-pointer hover:text-green-600" onClick={() => handleSort('docType')}>
                    Type <SortIcon columnKey="docType" />
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 cursor-pointer hover:text-green-600" onClick={() => handleSort('category')}>
                    Category <SortIcon columnKey="category" />
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 cursor-pointer hover:text-green-600" onClick={() => handleSort('department')}>
                    Department <SortIcon columnKey="department" />
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 cursor-pointer hover:text-green-600" onClick={() => handleSort('createDate')}>
                    Date <SortIcon columnKey="createDate" />
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDocuments.map((doc, index) => (
                  <React.Fragment key={doc.id}>
                    <tr className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-6 py-4">
                        {editingDocId === doc.id ? (
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                            className="w-full px-3 py-2 border-2 border-green-300 rounded-lg focus:border-green-500 outline-none"
                          />
                        ) : (
                          <span className="font-medium text-gray-800">{doc.title}</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDocTypeColor(doc.docType)}`}>
                          {doc.docType?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {editingDocId === doc.id ? (
                          <select
                            value={editForm.category}
                            onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))}
                            className="px-3 py-2 border-2 border-green-300 rounded-lg focus:border-green-500 outline-none"
                          >
                            <option value="">Select</option>
                            {allCategories.map(cat => (
                              <option key={cat.code} value={cat.code}>{cat.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-600">{doc.category || '-'}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-600">{doc.department || '-'}</td>
                      <td className="px-4 py-4 text-gray-500 text-sm">{doc.createDate}</td>
                      <td className="px-4 py-4">
                        {editingDocId === doc.id ? (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.isPublic}
                              onChange={(e) => setEditForm(f => ({ ...f, isPublic: e.target.checked }))}
                              className="w-4 h-4 text-green-500 rounded"
                            />
                            <span className="text-sm">Public</span>
                          </label>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            doc.isPublic === 'true' || doc.isPublic === true
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {doc.isPublic === 'true' || doc.isPublic === true ? <FaUnlock className="text-xs" /> : <FaLock className="text-xs" />}
                            {doc.isPublic === 'true' || doc.isPublic === true ? 'Public' : 'Private'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {editingDocId === doc.id ? (
                            <>
                              <button
                                onClick={() => saveEdit(doc.id)}
                                className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                title="Save"
                              >
                                <FaSave />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                title="Cancel"
                              >
                                <FaTimes />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => openDocument(doc.id)}
                                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                title="View"
                              >
                                <FaEye />
                              </button>
                              {searchMode === 'my' && (
                                <button
                                  onClick={() => startEdit(doc)}
                                  className="p-2 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors"
                                  title="Edit"
                                >
                                  <FaEdit />
                                </button>
                              )}
                              <button
                                onClick={() => downloadDocument(doc.id)}
                                className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                title="Download"
                              >
                                <FaDownload />
                              </button>
                              {searchMode === 'my' && (
                                <button
                                  onClick={() => setDeleteDocId(doc.id)}
                                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                  title="Request Deletion"
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {/* Delete Confirmation Row */}
                    {deleteDocId === doc.id && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 bg-red-50">
                          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FaTrash className="text-red-500" />
                                <span className="font-bold text-red-700">Request Deletion</span>
                              </div>
                              <p className="text-sm text-red-600 mb-2">This will send a request to admin for approval.</p>
                              <input
                                type="text"
                                placeholder="Enter reason for deletion..."
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-red-200 rounded-lg focus:border-red-400 outline-none"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => requestDelete(doc.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                              >
                                Submit Request
                              </button>
                              <button
                                onClick={() => { setDeleteDocId(null); setDeleteReason(""); }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FaFolder className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No documents found</h3>
            <p className="text-gray-400 mb-4">You haven't uploaded any documents yet.</p>
            <Link
              to="/facultypanel/upload-doc"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all"
            >
              <FaUpload /> Upload Your First Document
            </Link>
          </div>
        )}
      </div>

      {/* View Document Modal */}
      {isModalOpen && viewingDocument && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{viewingDocument?.title}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <FaTags className="text-blue-500 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="font-semibold text-gray-700">{viewingDocument?.category || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <FaFileAlt className="text-green-500 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Document Type</p>
                  <p className="font-semibold text-gray-700">{viewingDocument?.docType?.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                <FaBuilding className="text-purple-500 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-semibold text-gray-700">{viewingDocument?.departmentName || viewingDocument?.department || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
                <FaUsers className="text-amber-500 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Authors</p>
                  <p className="font-semibold text-gray-700">{viewingDocument?.authors || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <FaCalendarAlt className="text-gray-400" />
                Uploaded: {viewingDocument?.createDate}
              </span>
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                viewingDocument?.isPublic === "true" || viewingDocument?.isPublic === true
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {viewingDocument?.isPublic === "true" || viewingDocument?.isPublic === true ? <FaUnlock /> : <FaLock />}
                {viewingDocument?.isPublic === "true" || viewingDocument?.isPublic === true ? "Public" : "Private"}
              </span>
            </div>

            {/* Document Preview */}
            <div className="rounded-xl overflow-hidden border border-gray-200">
              {viewingDocument?.cover && viewingDocument?.coverType?.includes("pdf") ? (
                <iframe
                  src={`data:application/pdf;base64,${viewingDocument?.cover}`}
                  className="w-full min-h-[60vh]"
                />
              ) : viewingDocument?.coverType?.includes("link") ? (
                <div className="p-6 text-center bg-gray-50">
                  <p className="text-gray-600 mb-2">Cover Link:</p>
                  <a href={viewingDocument?.coverLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                    {viewingDocument?.coverLink}
                  </a>
                </div>
              ) : viewingDocument?.cover ? (
                <img src={`data:${viewingDocument?.coverType};base64,${viewingDocument?.cover}`} className="w-full max-h-[60vh] object-contain" alt={viewingDocument?.title} />
              ) : (
                <div className="p-12 text-center bg-gray-50">
                  <FaFileAlt className="text-5xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No preview available</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => downloadDocument(viewingDocument?.id)} className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-medium flex items-center gap-2">
                <FaDownload /> Download
              </button>
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Faculty Upload Document Component - Same style as Admin DocUpload
const FacultyUploadDoc = () => {
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [dragActive, setDragActive] = useState({ cover: false, document: false });

  const [coverAcceptType, setCoverAcceptType] = useState("");
  const [documentAcceptType, setDocumentAcceptType] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [coverType, setCoverType] = useState("");
  const [coverLink, setCoverLink] = useState("");
  const [documentLink, setDocumentLink] = useState("");
  const [Cover, setCover] = useState(null);
  const [documentFile, setDocument] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("other");
  const [subject, setSubject] = useState("other");
  const [title, setTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [authorsList, setAuthorList] = useState([]);
  const [accessionNumber, setAccessionNumber] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const coverInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const [allCategories, setAllCategories] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    getAllDepartments();
    getAllCategories();
  }, []);

  useEffect(() => {
    if (coverType === "img") {
      setCoverAcceptType("image/*");
    } else if (coverType === "link") {
      setCoverAcceptType("link");
    } else if (coverType === "pdf") {
      setCoverAcceptType(".pdf");
    }
    setCover(null);
  }, [coverType]);

  useEffect(() => {
    if (documentType === "pdf") {
      setDocumentAcceptType(".pdf");
    } else if (documentType === "imgs") {
      setDocumentAcceptType("image/*");
    } else if (documentType === "link") {
      setDocumentAcceptType("link");
    } else if (documentType === "mp4") {
      setDocumentAcceptType(".mp4");
    } else if (documentType === "*") {
      setDocumentAcceptType("*");
    }
    setDocument(null);
  }, [documentType]);

  const getAllDepartments = async () => {
    await req_client.reload_tokens();
    const headers = { Authorization: `Bearer ${req_client.accessToken}` };
    const result = await req_client.fetchReq("get_department/", "GET", headers);
    const resultJson = await result.json();
    if (result.ok) {
      setAllDepartments(resultJson.departments);
    }
  };

  const getAllCategories = async () => {
    await req_client.reload_tokens();
    const headers = { Authorization: `Bearer ${req_client.accessToken}` };
    const result = await req_client.fetchReq("get_categories/", "GET", headers);
    const resultJson = await result.json();
    if (result.ok) {
      setAllCategories(resultJson.categories);
    }
  };

  const searchSubjects = async (department) => {
    setSubject("other");
    await req_client.reload_tokens();
    const headers = { Authorization: `Bearer ${req_client.accessToken}` };
    const result = await req_client.fetchReq(`get_department/?dep_code=${department}`, "GET", headers);
    const resultJson = await result.json();
    if (result.ok && resultJson.subjects) {
      // Convert subjects object to array format
      // subjects is an object like { "Category": ["Subject1", "Subject2"] }
      const subjectsArray = [];
      Object.entries(resultJson.subjects).forEach(([category, subjectsList]) => {
        if (Array.isArray(subjectsList)) {
          subjectsList.forEach(subjectName => {
            subjectsArray.push({ code: subjectName, name: subjectName, category });
          });
        }
      });
      setSubjects(subjectsArray);
    } else {
      setSubjects([]);
    }
  };

  const toggleUploadOptions = () => {
    setShowUploadOptions(!showUploadOptions);
    setActiveStep(1);
  };

  const handleCoverChange = (event) => {
    setCover(event.target.files);
  };

  const handleDocumentChange = (event) => {
    setDocument(event.target.files);
  };

  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive({ ...dragActive, [type]: true });
    } else if (e.type === "dragleave") {
      setDragActive({ ...dragActive, [type]: false });
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({ ...dragActive, [type]: false });
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (type === "cover") {
        setCover(e.dataTransfer.files);
      } else {
        setDocument(e.dataTransfer.files);
      }
    }
  };

  const removeAuthor = (author) => {
    setAuthorList(authorsList.filter((a) => a !== author));
  };

  const addAuthor = () => {
    if (newAuthor.trim() !== "" && !authorsList.includes(newAuthor.trim())) {
      setAuthorList([...authorsList, newAuthor.trim()]);
      setNewAuthor("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAuthor();
    }
  };

  const handleUpload = async () => {
    const data = new FormData();
    data.append("title", title);
    data.append("coverType", coverType);
    data.append("documentType", documentType);
    data.append("isPublic", isPublic);
    if (Cover && Cover.length > 0 && coverType !== "link") {
      data.append("cover", Cover[0]);
    } else {
      data.append("coverLink", coverLink);
    }

    if (documentFile && documentFile.length > 0 && documentType !== "link") {
      Array.from(documentFile).forEach((doc) => {
        data.append("documents", doc);
      });
    } else {
      data.append("documentLink", documentLink);
    }
    data.append("category", category);
    data.append("department", department);
    data.append("subject", subject);
    data.append("authors", authorsList);
    data.append("accessionNumber", accessionNumber);

    if (!title) {
      alert("Please fill in the title field.");
      return false;
    }
    if (!category) {
      alert("Please select a category.");
      return false;
    }

    setIsUploading(true);
    await req_client.reload_tokens();
    const headers = { Authorization: `Bearer ${req_client.accessToken}` };
    const response = await req_client.fetchReq("submit_document_for_approval/", "POST", headers, data);
    setIsUploading(false);

    if (response.ok) {
      alert("Document submitted for admin approval!");
      setTitle("");
      setCover(null);
      setCoverLink("");
      setDocument(null);
      setDocumentLink("");
      setDepartment("other");
      setSubject("other");
      setCoverType("");
      setDocumentType("");
      setAuthorList([]);
      setAccessionNumber("");
      setCategory("");
      setShowUploadOptions(false);
    } else {
      const resultJson = await response.json();
      alert(resultJson.message || "Error submitting document");
    }
  };

  const steps = [
    { id: 1, title: "Files", description: "Upload cover & document" },
    { id: 2, title: "Details", description: "Title & classification" },
    { id: 3, title: "Authors", description: "Add contributors" },
  ];

  const canProceedToStep2 = coverType && documentType;
  const canProceedToStep3 = title && category;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Upload</h1>
          <p className="text-gray-600">Upload and manage your documents and papers</p>
        </div>

        {/* Main Upload Card */}
        {!showUploadOptions ? (
          <div
            onClick={toggleUploadOptions}
            className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 group shadow-sm"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors text-blue-600">
              <UploadIcon />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Click to Upload New Document
            </h2>
            <p className="text-gray-500 text-sm">
              Supports PDF, Images, Videos, and Links
            </p>
          </div>
        ) : (
          <div className="bg-white backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
            {/* Progress Steps */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between max-w-xl mx-auto">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center cursor-pointer ${
                        activeStep >= step.id ? "text-blue-600" : "text-gray-400"
                      }`}
                      onClick={() => {
                        if (step.id === 1) setActiveStep(1);
                        else if (step.id === 2 && canProceedToStep2) setActiveStep(2);
                        else if (step.id === 3 && canProceedToStep2 && canProceedToStep3) setActiveStep(3);
                      }}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                          activeStep > step.id
                            ? "bg-green-500 text-white"
                            : activeStep === step.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {activeStep > step.id ? <CheckIcon /> : step.id}
                      </div>
                      <div className="ml-3 hidden sm:block">
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="text-xs text-gray-500">{step.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-12 sm:w-20 h-0.5 mx-2 sm:mx-4 ${
                          activeStep > step.id ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 sm:p-8">
              {/* Step 1: File Upload */}
              {activeStep === 1 && (
                <div className="space-y-8">
                  {/* Cover Upload Section */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                        <ImageIcon />
                      </span>
                      Cover Image
                    </h3>

                    {/* Cover Type Selection */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { value: "img", label: "Image", icon: <ImageIcon /> },
                        { value: "pdf", label: "PDF", icon: <FileIcon /> },
                        { value: "link", label: "Link", icon: <LinkIcon /> },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setCoverType(option.value)}
                          className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                            coverType === option.value
                              ? "border-purple-500 bg-purple-100 text-purple-600"
                              : "border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700 bg-white"
                          }`}
                        >
                          {option.icon}
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Cover File/Link Input */}
                    {coverType === "link" ? (
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                          placeholder="Enter cover image URL..."
                          value={coverLink || ""}
                          onChange={(e) => setCoverLink(e.target.value)}
                        />
                      </div>
                    ) : coverType ? (
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer bg-white ${
                          dragActive.cover
                            ? "border-purple-500 bg-purple-50"
                            : Cover && Cover.length > 0
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        onDragEnter={(e) => handleDrag(e, "cover")}
                        onDragLeave={(e) => handleDrag(e, "cover")}
                        onDragOver={(e) => handleDrag(e, "cover")}
                        onDrop={(e) => handleDrop(e, "cover")}
                        onClick={() => coverInputRef.current?.click()}
                      >
                        <input
                          ref={coverInputRef}
                          type="file"
                          className="hidden"
                          accept={coverAcceptType}
                          onChange={handleCoverChange}
                        />
                        {Cover && Cover.length > 0 ? (
                          <div className="text-green-600">
                            <CheckIcon />
                            <p className="mt-2 font-medium">{Cover[0].name}</p>
                            <p className="text-sm text-gray-500">
                              {(Cover[0].size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            <UploadIcon />
                            <p className="mt-2 text-gray-600">
                              Drag & drop or{" "}
                              <span className="text-purple-600 font-medium">browse</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {coverType === "img" ? "PNG, JPG, GIF" : "PDF files"}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        Select a cover type above
                      </div>
                    )}
                  </div>

                  {/* Document Upload Section */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <FileIcon />
                      </span>
                      Document Files
                    </h3>

                    {/* Document Type Selection */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                      {[
                        { value: "pdf", label: "PDF", icon: <FileIcon /> },
                        { value: "imgs", label: "Images", icon: <ImageIcon /> },
                        { value: "link", label: "Link", icon: <LinkIcon /> },
                        { value: "mp4", label: "Video", icon: <VideoIcon /> },
                        { value: "*", label: "All Types", icon: <FileIcon /> },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setDocumentType(option.value)}
                          className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border transition-all ${
                            documentType === option.value
                              ? "border-blue-500 bg-blue-100 text-blue-600"
                              : "border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700 bg-white"
                          }`}
                        >
                          {option.icon}
                          <span className="text-xs font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Document File/Link Input */}
                    {documentType === "link" ? (
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          placeholder="Enter document URL..."
                          value={documentLink || ""}
                          onChange={(e) => setDocumentLink(e.target.value)}
                        />
                      </div>
                    ) : documentType ? (
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer bg-white ${
                          dragActive.document
                            ? "border-blue-500 bg-blue-50"
                            : documentFile && documentFile.length > 0
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        onDragEnter={(e) => handleDrag(e, "document")}
                        onDragLeave={(e) => handleDrag(e, "document")}
                        onDragOver={(e) => handleDrag(e, "document")}
                        onDrop={(e) => handleDrop(e, "document")}
                        onClick={() => documentInputRef.current?.click()}
                      >
                        <input
                          ref={documentInputRef}
                          type="file"
                          className="hidden"
                          multiple
                          accept={documentAcceptType}
                          onChange={handleDocumentChange}
                        />
                        {documentFile && documentFile.length > 0 ? (
                          <div className="text-green-600">
                            <CheckIcon />
                            <p className="mt-2 font-medium">
                              {documentFile.length} file(s) selected
                            </p>
                            <div className="mt-2 space-y-1">
                              {Array.from(documentFile)
                                .slice(0, 3)
                                .map((file, i) => (
                                  <p key={i} className="text-sm text-gray-600">
                                    {file.name}
                                  </p>
                                ))}
                              {documentFile.length > 3 && (
                                <p className="text-sm text-gray-500">
                                  +{documentFile.length - 3} more
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            <UploadIcon />
                            <p className="mt-2 text-gray-600">
                              Drag & drop or{" "}
                              <span className="text-blue-600 font-medium">browse</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Multiple files supported
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        Select a document type above
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-4">
                    <button
                      onClick={toggleUploadOptions}
                      className="px-6 py-2.5 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => canProceedToStep2 && setActiveStep(2)}
                      disabled={!canProceedToStep2}
                      className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                        canProceedToStep2
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Details */}
              {activeStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="Document title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Accession Number</label>
                      <input
                        type="text"
                        value={accessionNumber}
                        onChange={(e) => setAccessionNumber(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="Accession number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <select
                        value={department}
                        onChange={(e) => {
                          setDepartment(e.target.value);
                          if (e.target.value) searchSubjects(e.target.value);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      >
                        <option value="">Select Department</option>
                        {allDepartments.map((dep) => (
                          <option key={dep.dep_code} value={dep.dep_code}>{dep.dep_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      >
                        <option value="">Select Category</option>
                        {allCategories.map((cat) => (
                          <option key={cat.code} value={cat.code}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      >
                        <option value="">Select Subject</option>
                        {Array.isArray(subjects) && subjects.map((sub) => (
                          <option key={sub.code} value={sub.code}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="isPublic" className="text-gray-700 font-medium">Make document publicly available</label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setActiveStep(1)}
                      className="px-6 py-2.5 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => canProceedToStep3 && setActiveStep(3)}
                      disabled={!canProceedToStep3}
                      className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                        canProceedToStep3
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Authors */}
              {activeStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Add Authors</label>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter author name..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={addAuthor}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all"
                      >
                        Add Author
                      </button>
                    </div>

                    {authorsList.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {authorsList.map((author, idx) => (
                          <div
                            key={idx}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            {author}
                            <button
                              onClick={() => removeAuthor(author)}
                              className="text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setActiveStep(2)}
                      className="px-6 py-2.5 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-600 disabled:opacity-50 transition-all"
                    >
                      {isUploading ? "Submitting..." : "Submit for Approval"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Faculty Profile Component
const FacultyProfile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("user"));
    if (userData) {
      setUser(userData);
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone_number: userData.phone_number || ''
      });
    }
  }, []);

  const handleUpdateProfile = async () => {
    await req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json"
    };
    const res = await req_client.fetchReq(
      `edit_user/`,
      "POST",
      headers,
      JSON.stringify({ id: user.id || user._id, ...formData })
    );
    if (res.ok) {
      const updatedUser = { ...user, ...formData };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditing(false);
      alert("Profile updated successfully");
    } else {
      alert("Error updating profile");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  if (!user) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-4xl text-white font-bold">
              {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user.first_name} {user.last_name}</h2>
            <p className="text-gray-500">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Faculty</span>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleUpdateProfile} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
              <button onClick={() => setEditing(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{user.username}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{user.phone_number || 'Not set'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{user.dep_code || 'Not assigned'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <FaCog /> Edit Profile
              </button>
              <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Faculty = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("user"));
    setUser(userData);
  }, []);
  
  const navItems = [
    { label: "Dashboard", path: "/facultypanel", icon: FaHome },
    { label: "My Documents", path: "/facultypanel/my-documents", icon: FaFolder },
    { label: "Groups Management", path: "/facultypanel/groups", icon: FaUsers },
    { label: "Document Requests", path: "/facultypanel/requested-docs", icon: FaFileAlt },
    { label: "Upload Document", path: "/facultypanel/upload-doc", icon: FaUpload },
    { label: "My Profile", path: "/facultypanel/profile", icon: FaUser },
  ];

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const getPageTitle = () => {
    const currentItem = navItems.find(item => item.path === location.pathname);
    return currentItem?.label || "Faculty Panel";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - Admin Panel Style */}
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
                  <h2 className="font-bold text-lg">Faculty Panel</h2>
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
          {navItems.map(({ label, path, icon: Icon }) => (
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
                <Icon />
              </span>
              {sidebarOpen && <span className="font-medium">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer - Logout */}
        {sidebarOpen && (
          <div className="p-4 border-t border-slate-700">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <FaSignOutAlt className="text-xl" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar - Same as Admin Panel */}
        <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.first_name || 'Faculty'}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FaBell className="text-gray-600 text-xl" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Link to="/facultypanel/profile" className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-slate-900 font-bold">
                  {user?.first_name?.charAt(0) || 'F'}{user?.last_name?.charAt(0) || ''}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="font-medium text-gray-800">{user?.first_name || 'Faculty'}</p>
                <p className="text-xs text-gray-500">Faculty Member</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          <Routes>
            <Route path="/" element={<FacultyDashboard />} />
            <Route path="/my-documents" element={<FacultyDocumentManager />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/requested-docs" element={<RequestedDocument />} />
            <Route path="/upload-doc" element={<FacultyUploadDoc />} />
            <Route path="/profile" element={<FacultyProfile />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Faculty;
