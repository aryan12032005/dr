import React, { useEffect, useState, useRef } from "react";
import networkRequests from "../request_helper";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { FaUsers, FaSearch, FaChevronDown, FaChevronRight, FaUser, FaEnvelope, FaPhone, FaFileAlt, FaDownload, FaTrash, FaFolder, FaBuilding, FaUserPlus, FaTimes, FaEdit, FaSave, FaSpinner, FaCheck } from "react-icons/fa";

const req_client = new networkRequests();
const FacultyManage = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [facultyList, setFacultyList] = useState({});
  const [allDepartments, setAllDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [expandedFaculty, setExpandedFaculty] = useState(null);
  const [facultyDocs, setFacultyDoc] = useState([]);
  const [filteredFacultyDocs, setFilteredFacultyDoc] = useState([]);
  const [documentSearchQuery, setDocumentSearchQuery] = useState("");
  const [addFacultyForDept, setAddFacultyForDept] = useState(null); // Which department is adding faculty
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  // Autocomplete state
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const autocompleteRef = useRef(null);
  
  const [newFaculty, setNewFaculty] = useState({
    first_name: "",
    email: "",
    password: "",
    phone_number: "",
    dep_code: ""
  });

  useEffect(() => {
    getAllDepartments();
  }, [navigate]);

  useEffect(() => {
    setFilteredFacultyDoc(
      facultyDocs.filter((doc) =>
        doc.title.toLowerCase().includes(documentSearchQuery.toLowerCase())
      )
    )
  },[documentSearchQuery]);

  // Close autocomplete dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search users for autocomplete (debounced)
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (userSearchQuery.length >= 2) {
        searchUsersForAutocomplete(userSearchQuery);
      } else {
        setUserSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(searchTimeout);
  }, [userSearchQuery]);

  const getAllDepartments = async () => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq("get_department/", "GET", headers);
    const resultJson = await result.json();
    if (result.ok) {
      setAllDepartments(resultJson.departments);
    }
  };

  // Search users by name for autocomplete
  const searchUsersForAutocomplete = async (query) => {
    setIsSearchingUsers(true);
    await req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq(
      `search_user/?start_c=0&end_c=10&querry=${query}`,
      "GET",
      headers
    );
    setIsSearchingUsers(false);
    if (result && result.ok) {
      const data = await result.json();
      // Filter to only show users that are not already faculty
      const nonFacultyUsers = (data.users || []).filter(u => !u.is_faculty);
      setUserSuggestions(nonFacultyUsers);
      setShowSuggestions(true);
    } else {
      setUserSuggestions([]);
    }
  };

  // When user selects from autocomplete
  const selectUserFromSuggestion = (user) => {
    setSelectedUser(user);
    setNewFaculty({
      ...newFaculty,
      first_name: user.first_name || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
      existing_user_id: user.id // Store the user ID to update instead of create
    });
    setUserSearchQuery(user.first_name || '');
    setShowSuggestions(false);
  };

  // Open add faculty form for a specific department
  const openAddFacultyForm = (depCode) => {
    setAddFacultyForDept(depCode);
    setNewFaculty({
      first_name: "",
      email: "",
      password: "",
      phone_number: "",
      dep_code: depCode
    });
    setUserSearchQuery("");
    setSelectedUser(null);
    setUserSuggestions([]);
  };

  // Close add faculty form
  const closeAddFacultyForm = () => {
    setAddFacultyForDept(null);
    setNewFaculty({ first_name: "", email: "", password: "", phone_number: "", dep_code: "" });
    setUserSearchQuery("");
    setSelectedUser(null);
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    await req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };

    // If we selected an existing user, update them to be faculty
    if (selectedUser && selectedUser.id) {
      const result = await req_client.fetchReq(
        "edit_user/",
        "POST",
        headers,
        JSON.stringify({
          id: selectedUser.id,
          is_faculty: true,
          dep_code: newFaculty.dep_code
        })
      );
      if (result && result.ok) {
        alert("User promoted to faculty successfully!");
        const depCode = newFaculty.dep_code;
        closeAddFacultyForm();
        // Refresh faculty list for the department
        fetchFaculty(depCode);
      } else {
        const error = await result.json();
        alert(error.message || "Error promoting user to faculty");
      }
    } else {
      // Create a new user as faculty
      if (!newFaculty.first_name || !newFaculty.email || !newFaculty.password || !newFaculty.dep_code) {
        alert("Please fill all required fields");
        return;
      }
      const result = await req_client.fetchReq(
        "signup/",
        "POST",
        headers,
        JSON.stringify({
          ...newFaculty,
          is_faculty: true,
          is_admin: false
        })
      );
      if (result && result.ok) {
        alert("Faculty added successfully!");
        const depCode = newFaculty.dep_code;
        closeAddFacultyForm();
        // Refresh faculty list for the department
        fetchFaculty(depCode);
      } else {
        const error = await result.json();
        alert(error.message || "Error adding faculty");
      }
    }
  };

  const searchFaculty = async () => {
    setFacultyList({});
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq(
      `search_user/?start_c=0&end_c=50&querry=${searchQuery}&is_faculty=true&dep_code=${selectedDepartment}`,
      "GET",
      headers
    );
    const resultJson = await result.json();
    if (result.ok && resultJson.users.length > 0) {
      resultJson.users.forEach((user) => {
        setFacultyList((facultyList) => ({
          ...facultyList,
          [user.dep_code]: facultyList[user.dep_code]
            ? [...facultyList[user.dep_code], user]
            : [user],
        }));
      });
    }
  };

  const fetchFaculty = async (dep_code) => {
    if (dep_code in facultyList) {
      setFacultyList((facultyList) => {
        const tempList = { ...facultyList };
        delete tempList[dep_code];
        return tempList;
      });
      return;
    }
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq(
      `search_user/?start_c=0&end_c=50&is_faculty=true&dep_code=${dep_code}`,
      "GET",
      headers
    );
    const resultJson = await result.json();
    if (result.ok) {
      setFacultyList((facultyList) => ({
        ...facultyList,
        [dep_code]: resultJson.users,
      }));
    }
  };

  const fetchDocuments = async (id) => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq(
      `get_faculty_doc/?fac_id=${id}`,
      "GET",
      headers
    );
    if (result.ok) {
      const resultJson = await result.json();
      setFilteredFacultyDoc(resultJson.documents);
      setFacultyDoc(resultJson.documents);
    } else if (result.status === 404) {
      const resultJson = await result.json();
      alert(resultJson.message);
    }
    setExpandedFaculty(id);
  };

  const downloadDoc = async (id) => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq(
      `download_doc/?doc_id=${id}`,
      "GET",
      headers
    );
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
    } else if (result.status === 400) {
      const resultJson = await result.json();
      alert(resultJson.message);
    }
  };

  const deleteDoc = async (id) => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq(
      `delete_document/?doc_id=${id}`,
      "DELETE",
      headers
    );
    if (result.ok) {
      const resultJson = await result.json();
      alert(resultJson.message);
      fetchDocuments(expandedFaculty);
    } else {
      const resultJson = await result.json();
      alert(resultJson.message);
    }
  };

  const startEditFaculty = (faculty) => {
    setEditingFaculty(faculty.id);
    setEditFormData({
      first_name: faculty.first_name || '',
      email: faculty.email || '',
      phone_number: faculty.phone_number || '',
      dep_code: faculty.dep_code || ''
    });
  };

  const cancelEditFaculty = () => {
    setEditingFaculty(null);
    setEditFormData({});
  };

  const handleUpdateFaculty = async (facultyId, currentDepCode) => {
    await req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq(
      `edit_user/`,
      "POST",
      headers,
      JSON.stringify({ id: facultyId, ...editFormData })
    );
    if (result && result.ok) {
      alert("Faculty updated successfully!");
      setEditingFaculty(null);
      setEditFormData({});
      // Refresh faculty list for the department
      setFacultyList((prev) => {
        const updated = { ...prev };
        delete updated[currentDepCode];
        if (editFormData.dep_code !== currentDepCode) {
          delete updated[editFormData.dep_code];
        }
        return updated;
      });
      // Re-fetch the department
      fetchFaculty(currentDepCode);
      if (editFormData.dep_code !== currentDepCode) {
        fetchFaculty(editFormData.dep_code);
      }
    } else {
      const error = await result.json();
      alert(error.message || "Error updating faculty");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-xl">
            <FaUsers className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Faculty Management</h1>
            <p className="text-gray-500">Manage faculty profiles and documents</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search faculty by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={searchFaculty}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 font-medium"
          >
            <FaSearch /> Search
          </button>
          <div className="relative">
            <FaBuilding className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="pl-12 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer min-w-[200px]"
            >
              <option value="" disabled>Select Department</option>
              {allDepartments.map((dept) => (
                <option key={dept.dep_code} value={dept.dep_code}>
                  {dept.dep_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Faculty List by Department */}
      <div className="space-y-4">
        {allDepartments.length > 0 ? (
          allDepartments.map((dept) => (
            <div key={dept.dep_code} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Department Header */}
              <div
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 cursor-pointer hover:from-gray-100 hover:to-gray-150 transition-all"
                onClick={() => fetchFaculty(dept.dep_code)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaFolder className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">{dept.dep_name}</h3>
                </div>
                {dept.dep_code in facultyList ? (
                  <FaChevronDown className="text-gray-500" />
                ) : (
                  <FaChevronRight className="text-gray-500" />
                )}
              </div>

              {/* Faculty Cards */}
              {dept.dep_code in facultyList && (
                <div className="p-4 space-y-4">
                  {/* Add Faculty Button */}
                  {addFacultyForDept !== dept.dep_code && (
                    <button
                      onClick={() => openAddFacultyForm(dept.dep_code)}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2.5 rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                      <FaUserPlus /> Add Faculty to {dept.dep_name}
                    </button>
                  )}

                  {/* Add Faculty Form with Autocomplete */}
                  {addFacultyForDept === dept.dep_code && (
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <FaUserPlus className="text-green-600" />
                          <h5 className="font-semibold text-gray-700">Add Faculty to {dept.dep_name}</h5>
                        </div>
                        <button onClick={closeAddFacultyForm} className="text-gray-400 hover:text-gray-600">
                          <FaTimes />
                        </button>
                      </div>
                      <form onSubmit={handleAddFaculty} className="space-y-4">
                        {/* User Search with Autocomplete */}
                        <div className="relative" ref={autocompleteRef}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search Existing User or Enter New Name *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={userSearchQuery}
                              onChange={(e) => {
                                setUserSearchQuery(e.target.value);
                                setSelectedUser(null);
                                setNewFaculty({ ...newFaculty, first_name: e.target.value, existing_user_id: null });
                              }}
                              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Start typing to search users..."
                            />
                            {isSearchingUsers && (
                              <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                            )}
                            {selectedUser && (
                              <FaCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                            )}
                          </div>
                          {/* Autocomplete Dropdown */}
                          {showSuggestions && userSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {userSuggestions.map((user) => (
                                <div
                                  key={user.id}
                                  className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  onClick={() => selectUserFromSuggestion(user)}
                                >
                                  <div className="font-medium text-gray-800">{user.first_name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {showSuggestions && userSuggestions.length === 0 && userSearchQuery.length >= 2 && !isSearchingUsers && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-center text-gray-500">
                              No existing users found. A new user will be created.
                            </div>
                          )}
                        </div>

                        {/* Show additional fields for new users or selected user details */}
                        {(userSearchQuery.length > 0 || selectedUser) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                              <input
                                type="email"
                                value={newFaculty.email}
                                onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Enter email"
                                disabled={!!selectedUser}
                                required
                              />
                            </div>
                            {!selectedUser && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                <input
                                  type="password"
                                  value={newFaculty.password}
                                  onChange={(e) => setNewFaculty({ ...newFaculty, password: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="Enter password"
                                  required
                                />
                              </div>
                            )}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                              <input
                                type="tel"
                                value={newFaculty.phone_number}
                                onChange={(e) => setNewFaculty({ ...newFaculty, phone_number: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Enter phone number"
                                disabled={!!selectedUser}
                              />
                            </div>
                          </div>
                        )}

                        {selectedUser && (
                          <div className="bg-green-100 rounded-lg p-3 text-sm text-green-800">
                            <FaCheck className="inline mr-2" />
                            Existing user "{selectedUser.first_name}" will be promoted to faculty in {dept.dep_name}.
                          </div>
                        )}

                        <div className="flex gap-3 pt-2">
                          <button
                            type="submit"
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-lg hover:shadow-lg transition-all font-medium"
                            disabled={!userSearchQuery && !selectedUser}
                          >
                            {selectedUser ? 'Promote to Faculty' : 'Add Faculty'}
                          </button>
                          <button
                            type="button"
                            onClick={closeAddFacultyForm}
                            className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition-all font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {facultyList[dept.dep_code].length > 0 ? (
                    facultyList[dept.dep_code].map((fac) => (
                      <div key={fac.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Faculty Profile Card */}
                        <div className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {fac.first_name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-800">{fac.first_name}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                  <span className="flex items-center gap-1">
                                    <FaBuilding className="text-gray-400" /> {fac.dep_code}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FaEnvelope className="text-gray-400" /> {fac.email}
                                  </span>
                                  {fac.phone_number && (
                                    <span className="flex items-center gap-1">
                                      <FaPhone className="text-gray-400" /> {fac.phone_number}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="flex items-center gap-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors font-medium"
                                onClick={() => startEditFaculty(fac)}
                              >
                                <FaEdit /> Edit
                              </button>
                              <button
                                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                                onClick={() => fetchDocuments(fac.id)}
                              >
                                <FaFileAlt /> {expandedFaculty === fac.id ? 'Hide' : 'Show'} Documents
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Edit Faculty Form */}
                        {editingFaculty === fac.id && (
                          <div className="p-4 bg-amber-50 border-t border-amber-200">
                            <div className="flex items-center gap-2 mb-4">
                              <FaEdit className="text-amber-600" />
                              <h5 className="font-semibold text-gray-700">Edit Faculty Profile</h5>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                  type="text"
                                  value={editFormData.first_name || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                  placeholder="Enter full name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                  type="email"
                                  value={editFormData.email || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                  placeholder="Enter email"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                  type="tel"
                                  value={editFormData.phone_number || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                  placeholder="Enter phone number"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select
                                  value={editFormData.dep_code || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, dep_code: e.target.value })}
                                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                >
                                  <option value="">Select Department</option>
                                  {allDepartments.map((d) => (
                                    <option key={d.dep_code} value={d.dep_code}>
                                      {d.dep_name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                              <button
                                onClick={() => handleUpdateFaculty(fac.id, dept.dep_code)}
                                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded-lg hover:shadow-lg transition-all font-medium"
                              >
                                <FaSave /> Save Changes
                              </button>
                              <button
                                onClick={cancelEditFaculty}
                                className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-300 transition-all font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Documents Section (Expanded) */}
                        {expandedFaculty === fac.id && (
                          <div className="p-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center gap-2 mb-4">
                              <FaFileAlt className="text-gray-500" />
                              <h5 className="font-semibold text-gray-700">Documents</h5>
                            </div>

                            {/* Document Search */}
                            <div className="relative mb-4">
                              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search documents..."
                                value={documentSearchQuery}
                                onChange={(e) => setDocumentSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            {/* Document List */}
                            {filteredFacultyDocs.length > 0 ? (
                              <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Document Name</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Upload Date</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredFacultyDocs.map((doc) => (
                                      <tr key={doc.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{doc.title}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{doc.createDate}</td>
                                        <td className="px-4 py-3">
                                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                            {doc.docType}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => downloadDoc(doc.id)}
                                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                              title="Download"
                                            >
                                              <FaDownload />
                                            </button>
                                            <button
                                              onClick={() => deleteDoc(doc.id)}
                                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                              title="Delete"
                                            >
                                              <FaTrash />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <FaFileAlt className="mx-auto text-4xl text-gray-300 mb-2" />
                                <p>No documents found</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-gray-500">No faculty profiles in this department</p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FaUsers className="mx-auto text-5xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No departments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyManage;
