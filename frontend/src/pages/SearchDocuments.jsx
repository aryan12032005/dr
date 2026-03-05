import React, { useState, useRef, useEffect } from "react";
import networkRequests from "../request_helper";
import { saveAs } from "file-saver";
import DocEdit from "./DocEdit.jsx";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFilter, FaTimes, FaEye, FaDownload, FaTrash, FaFileAlt, FaCalendarAlt, FaUsers, FaLock, FaUnlock, FaTags, FaBuilding, FaBookOpen, FaSortAmountDown, FaSortAmountUp, FaExternalLinkAlt } from "react-icons/fa";

const req_client = new networkRequests();

const SearchDocument = ({ userStatus }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [viewingDocument, setViewDocument] = useState(null);
  const [deleteDocId, setDeleteDocId] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const filterRef = useRef(null);

  const [filters, setFilters] = useState({
    docType: "",
    department: "",
    sortOrder: "-1",
    category: "",
  });
  const [isSearching, setIsSearching] = useState(false);

  const closeModal = () => setIsModalOpen(false);
  const toggleFilter = () => setIsFilterOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  // Load departments and categories on mount
  useEffect(() => {
    getAllDepartments();
    getAllCategories();
  }, []);

  const getAllDepartments = async () => {
    await req_client.reload_tokens();
    const headers = {
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq("get_department/", "GET", headers);
    if (!result || result === -1) return [];
    const resultJson = await result.json();
    if (result.ok) {
      setAllDepartments(resultJson.departments);
      return resultJson.departments;
    }
    return [];
  };

  const getAllCategories = async () => {
    await req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq("get_categories/", "GET", headers);
    if (!result || result === -1) return;
    const resultJson = await result.json();
    if (result.ok) {
      setAllCategories(resultJson.categories);
    }
  };

  const clearFilter = () => {
    setFilters({
      docType: "",
      department: "",
      sortOrder: "-1",
      category: "",
    });
    setSearchTerm("");
    setFilteredDocuments([]);
  };

  const searchDocument = async () => {
    setIsSearching(true);
    const headers = {
      "Content-Type": "application/json",
    };
    const response = await req_client.fetchReq(
      `search_document/?querry=${searchTerm}&docType=${filters.docType}&department=${filters.department}&order=${filters.sortOrder}&category=${filters.category}`,
      "GET",
      headers
    );

    setIsSearching(false);
    if (response.ok) {
      const data = await response.json();
      setFilteredDocuments(data.documents);
      getAllDepartments();
    } else if (response.status === 404) {
      const responseJson = await response.json();
      setFilteredDocuments([]);
    }
  };

  const openDoc = async (doc_id) => {
    req_client.reload_tokens();
    let headers = {};
    if (req_client.accessToken) {
      headers = {
        Authorization: `Bearer ${req_client.accessToken}`,
        "Content-Type": "application/json",
      };
    } else {
      headers = {
        "Content-Type": "application/json",
      };
    }
    
    try {
      const result = await req_client.fetchReq(
        `get_document/?doc_id=${doc_id}`,
        "GET",
        headers
      );

      if (!result || result === -1) {
        alert("Network error while fetching document");
        return;
      }

      if (result.ok) {
        const resultJson = await result.json();
        const departments = await getAllDepartments();
        const department = (departments || []).find(
          (obj) => obj.dep_code === resultJson.document.department
        );
        resultJson.document.departmentName = department?.dep_name || resultJson.document.department;
        resultJson.document.subject = resultJson.document.subject || '';
        setViewDocument(resultJson.document);
        setIsModalOpen(true);
      } else {
        const errorData = await result.json();
        alert(errorData.message || "Please login to view documents");
      }
    } catch (err) {
      console.error("openDoc error:", err);
      alert("Error fetching document: " + err.message);
    }
  };

  const downloadDoc = async (id) => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };

    try {
      const result = await req_client.fetchReq(
        `download_doc/?doc_id=${id}`,
        "GET",
        headers
      );

      if (!result || result === -1) {
        alert("Network error while downloading");
        return;
      }

      if (result.ok) {
        const contentType = result.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const resultJson = await result.json();
          alert(resultJson.message);
        } else {
          const contentDisposition = result.headers.get("Content-Disposition");
          let filename = "download.zip";
          if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+?)"/);
            if (match && match.length > 1) {
              filename = match[1];
            }
          }
          saveAs(await result.blob(), filename);
        }
      } else if (result.status == 400) {
        const resultJson = await result.json();
        if (!resultJson?.isPublic) {
          const confirmation = window.confirm(
            "Document is private, request access?"
          );
          if (confirmation) {
            reqAccess(id);
          }
        }
      } else {
        alert("Error downloading document");
      }
    } catch (err) {
      console.error("downloadDoc error:", err);
      alert("Error downloading: " + err.message);
    }
  };

  const deleteDoc = async (doc_id) => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };

    try {
      const result = await req_client.fetchReq(
        `delete_document/?doc_id=${doc_id}`,
        "DELETE",
        headers,
        JSON.stringify({ reason: deleteReason })
      );
      
      if (!result || result === -1) {
        alert("Network error while deleting");
        return;
      }
      
      if (result.ok) {
        const resultJson = await result.json();
        alert(resultJson.message);
        setDeleteDocId(false);
        setDeleteReason("");
        searchDocument();
      } else {
        const errorData = await result.json();
        alert(errorData.message || "Error deleting document");
      }
    } catch (err) {
      console.error("deleteDoc error:", err);
      alert("Error deleting: " + err.message);
    }
  };

  const reqAccess = async (id) => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq(
      `request_access/`,
      "POST",
      headers,
      JSON.stringify({ doc_id: id })
    );
    if (result.ok) {
      alert("Document requested");
    } else if (result.status == 409) {
      alert("Document already requested");
    } else {
      alert("Something went wrong");
    }
  };

  const getDocTypeColor = (docType) => {
    const colors = {
      pdf: 'bg-red-100 text-red-700 border-red-200',
      imgs: 'bg-purple-100 text-purple-700 border-purple-200',
      link: 'bg-blue-100 text-blue-700 border-blue-200',
      mp4: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      '*': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[docType] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const hasActiveFilters = filters.docType || filters.department || filters.category || filters.sortOrder !== "-1";

  const Modal = ({ onClose, children }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-slideUp">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2.5 rounded-full bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-all z-10 shadow-sm"
        >
          <FaTimes className="text-lg" />
        </button>
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-4">
              <FaBookOpen className="text-blue-200" />
              Digital Repository
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Search and discover academic documents, research papers, and educational resources
            </p>
          </div>

          {/* Main Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 shadow-2xl border border-white/20">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-200 text-lg" />
                  <input
                    type="text"
                    placeholder="Search by title, author, or keywords..."
                    className="w-full pl-14 pr-4 py-4 bg-white/90 backdrop-blur rounded-xl border-0 text-gray-800 placeholder-gray-500 focus:ring-4 focus:ring-blue-300/50 transition-all text-lg outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchDocument()}
                  />
                </div>
                <button
                  onClick={searchDocument}
                  disabled={isSearching}
                  className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaSearch className="text-lg" />
                  )}
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mt-8 gap-3">
            <button
              onClick={() => navigate("/search-doc")}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white/20 text-white border border-white/30 shadow-lg"
            >
              <FaSearch className="inline mr-2" />
              Search Docs
            </button>
            <button
              onClick={() => navigate("/my-groups")}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all"
            >
              <FaUsers className="inline mr-2" />
              My Groups
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaFilter className="text-blue-500" />
                Filters
              </h2>
              
              {/* Quick Filters */}
              <div className="flex gap-2 flex-wrap">
                <select
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-medium bg-white"
                  value={filters.docType}
                  onChange={(e) => setFilters(f => ({ ...f, docType: e.target.value }))}
                >
                  <option value="">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="imgs">Images</option>
                  <option value="link">Links</option>
                  <option value="mp4">Videos</option>
                  <option value="*">Self-Guided</option>
                </select>
                
                <select
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-medium bg-white"
                  value={filters.department}
                  onChange={(e) => setFilters(f => ({ ...f, department: e.target.value }))}
                >
                  <option value="">All Departments</option>
                  {allDepartments.map((dept) => (
                    <option value={dept.dep_code} key={dept.dep_code}>{dept.dep_name}</option>
                  ))}
                </select>
                
                <select
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-medium bg-white"
                  value={filters.category}
                  onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="">All Categories</option>
                  {allCategories.map((cat) => (
                    <option value={cat.code} key={cat.code}>{cat.name}</option>
                  ))}
                </select>
                
                <button
                  onClick={() => setFilters(f => ({ ...f, sortOrder: f.sortOrder === "-1" ? "1" : "-1" }))}
                  className={`px-4 py-2.5 border-2 rounded-xl transition-all text-sm font-medium flex items-center gap-2 ${
                    filters.sortOrder === "1" 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {filters.sortOrder === "-1" ? <FaSortAmountDown /> : <FaSortAmountUp />}
                  {filters.sortOrder === "-1" ? 'Latest' : 'Oldest'}
                </button>
              </div>
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilter}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2"
              >
                <FaTimes />
                Clear All
              </button>
            )}
          </div>
          
          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-gray-600 flex items-center gap-2">
              <FaFileAlt className="text-blue-500" />
              <span className="font-semibold text-gray-800">{filteredDocuments.length}</span> 
              document{filteredDocuments.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Documents Grid */}
        {isSearching ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-500 text-lg">Searching documents...</p>
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="hidden sm:flex w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl items-center justify-center text-white shadow-lg flex-shrink-0">
                          <FaFileAlt className="text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-800 mb-2 truncate group-hover:text-blue-600 transition-colors">
                            {doc.title}
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            <span className="flex items-center gap-1.5 text-sm text-gray-500">
                              <FaCalendarAlt className="text-blue-400" />
                              {doc.date}
                            </span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getDocTypeColor(doc.docType)}`}>
                              {doc.docType?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => openDoc(doc.id)}
                        className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105 transition-all"
                        title="View Details"
                      >
                        <FaEye className="text-lg" />
                      </button>
                      {userStatus !== -1 && (
                        <button
                          onClick={() => downloadDoc(doc.id)}
                          className="p-3 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-105 transition-all"
                          title="Download"
                        >
                          <FaDownload className="text-lg" />
                        </button>
                      )}
                      {((userStatus?.is_admin && userStatus.is_admin == true) ||
                        (userStatus?.user_id && userStatus.user_id == doc.owner)) && (
                        <button
                          onClick={() => setDeleteDocId(doc.id)}
                          className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:scale-105 transition-all"
                          title="Delete"
                        >
                          <FaTrash className="text-lg" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Delete Confirmation */}
                  {deleteDocId === doc.id && (
                    <div className="mt-6 p-5 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200 animate-fadeIn">
                      <div className="flex items-center gap-2 mb-3">
                        <FaTrash className="text-red-500" />
                        <h4 className="font-bold text-red-700">Confirm Deletion</h4>
                      </div>
                      <p className="text-sm text-red-600 mb-3">This action cannot be undone. Please provide a reason.</p>
                      <textarea
                        className="w-full p-4 border-2 border-red-200 rounded-xl focus:border-red-400 outline-none resize-none text-gray-700"
                        placeholder="Enter reason for deletion..."
                        rows={2}
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                      />
                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={() => deleteDoc(doc.id)}
                          className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium shadow-md hover:shadow-lg"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => { setDeleteDocId(false); setDeleteReason(""); }}
                          className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Edit Section for Owners/Admins */}
                  {((userStatus?.is_admin && userStatus.is_admin == true) ||
                    (userStatus?.user_id && userStatus.user_id == doc.owner)) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <DocEdit doc_id={doc.id} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaSearch className="text-4xl text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No documents found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        )}

        {/* View Document Modal */}
        {isModalOpen && viewingDocument && (
          <Modal onClose={closeModal}>
            <div className="p-8">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-3 pr-12">{viewingDocument?.title}</h2>
                <div className="flex flex-wrap gap-3">
                  <span className={`px-4 py-1.5 text-sm font-semibold rounded-full border ${getDocTypeColor(viewingDocument?.docType)}`}>
                    {viewingDocument?.docType?.toUpperCase()}
                  </span>
                  <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${
                    viewingDocument?.isPublic === "true" || viewingDocument?.isPublic === true
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}>
                    {viewingDocument?.isPublic === "true" || viewingDocument?.isPublic === true ? <FaUnlock /> : <FaLock />}
                    {viewingDocument?.isPublic === "true" || viewingDocument?.isPublic === true ? "Public" : "Private"}
                  </span>
                </div>
              </div>
              
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <FaTags className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Category</p>
                    <p className="font-bold text-gray-800">{viewingDocument?.category || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <FaFileAlt className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Document Type</p>
                    <p className="font-bold text-gray-800">{viewingDocument?.docType?.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <FaBuilding className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Department</p>
                    <p className="font-bold text-gray-800">{viewingDocument?.departmentName || viewingDocument?.department || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                    <FaUsers className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">Authors</p>
                    <p className="font-bold text-gray-800">{viewingDocument?.authors || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
                <span className="flex items-center gap-2 text-gray-600">
                  <FaCalendarAlt className="text-gray-400" />
                  <span className="font-medium">Uploaded:</span> {viewingDocument?.createDate}
                </span>
                {viewingDocument?.accessionNumber && (
                  <span className="text-gray-600">
                    <span className="font-medium">Accession:</span> {viewingDocument?.accessionNumber}
                  </span>
                )}
                {viewingDocument?.subject && (
                  <span className="text-gray-600">
                    <span className="font-medium">Subject:</span> {viewingDocument?.subject}
                  </span>
                )}
              </div>

              {/* Document Preview */}
              <div className="rounded-2xl overflow-hidden border-2 border-gray-200 shadow-inner">
                {viewingDocument?.cover && viewingDocument?.coverType?.includes("pdf") ? (
                  <iframe
                    src={`data:application/pdf;base64,${viewingDocument?.cover}`}
                    className="w-full min-h-[60vh]"
                  />
                ) : viewingDocument?.coverType?.includes("link") ? (
                  <div className="p-8 text-center bg-gradient-to-r from-gray-50 to-gray-100">
                    <FaExternalLinkAlt className="text-4xl text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600 mb-3">External Cover Link:</p>
                    <a
                      href={viewingDocument?.coverLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      {viewingDocument?.coverLink}
                    </a>
                  </div>
                ) : viewingDocument?.cover ? (
                  <img
                    src={`data:${viewingDocument?.coverType};base64,${viewingDocument?.cover}`}
                    className="w-full max-h-[60vh] object-contain bg-gray-100"
                    alt={viewingDocument?.title}
                  />
                ) : (
                  <div className="p-16 text-center bg-gradient-to-r from-gray-50 to-gray-100">
                    <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No preview available</p>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="mt-8 flex gap-4 justify-end">
                <button
                  onClick={() => downloadDoc(viewingDocument?.id)}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <FaDownload /> Download
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Custom Animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default SearchDocument;
