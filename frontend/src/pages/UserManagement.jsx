import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEdit, FaTrash, FaKey, FaSave, FaTimes, FaUser, FaEnvelope, FaPhone, FaCheck, FaBan, FaUserPlus, FaUpload, FaBuilding } from "react-icons/fa";
import networkRequests from "../request_helper";
import Signup from "./SignUp";

const req_client = new networkRequests();

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // on loading page refresh users in db
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    // Fetch users from db
    try {
      req_client.reload_tokens();
      const headers = { Authorization: `Bearer ${req_client.accessToken}` };
      const result = await req_client.fetchReq(
        "search_user/?start_c=0&end_c=50&is_admin=False",
        "GET",
        headers
      );
      const resultJson = await result.json();
      if (result.ok) {
        setUsers(resultJson.users);
        setFilteredUsers(resultJson.users);
      } else {
        alert(resultJson.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    // on search term change
    setFilteredUsers(
      users.filter(
        (user) =>
          user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  const searchUser = async (query) => {
    // search for specific user in database
    try {
      req_client.reload_tokens();
      const headers = {
        Authorization: `Bearer ${req_client.accessToken}`,
        "Content-Type": "application/json",
      };
      const result = await req_client.fetchReq(
        `search_user/?start_c=0&end_c=50&querry=${query}`,
        "GET",
        headers
      );
      const resultJson = await result.json();
      setUsers(resultJson.users);
      setFilteredUsers(resultJson.users);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
  };

  const handleUpdateUser = async (user) => {
    // update user information to database
    const confirmation = window.confirm(
      `Are you sure to save user ${user.username}?`
    );
    if (confirmation) {
      if (
        editUser.first_name.trim() !== "" &&
        editUser.email.trim() !== "" &&
        editUser.phone_number.trim() !== ""
      ) {
        req_client.reload_tokens();
        const headers = {
          Authorization: `Bearer ${req_client.accessToken}`,
          "Content-Type": "application/json",
        };
        const result = await req_client.fetchReq(
          "edit_user/",
          "POST",
          headers,
          JSON.stringify(user)
        );
        if (result.ok) {
          fetchUsers();
        } else {
          data = result.json();
          alert(data.message);
        }
        setEditUser(null);
      } else {
        alert("Please Enter a valid name and email and phone ");
      }
    }
  };

  const handleDelete = async (user) => {
    // handle detele a user
    const confirmation = window.confirm(
      `Are you sure to delete user ${user.username}?`
    );
    if (confirmation) {
      try {
        req_client.reload_tokens();
        const headers = {
          Authorization: `Bearer ${req_client.accessToken}`,
          "Content-Type": "application/json",
        };
        const result = await req_client.fetchReq(
          "delete_user/",
          "DELETE",
          headers,
          JSON.stringify(user)
        );
        const message = await result.json();
        if (result.ok) {
          alert("User deleted.");
          fetchUsers();
        } else {
          alert(message.message);
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleChangePass = async (user) => {
    const newPassword = window.prompt("Enter new password");
    const data = {
      id: user.id,
      password: newPassword,
    };
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    if (newPassword) {
      const result = await req_client.fetchReq(
        "change_password/",
        "PUT",
        headers,
        JSON.stringify(data)
      );
      if (result.ok) {
        const resultJson = await result.json();
        alert(resultJson.message);
      } else {
        alert("Error updating password");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
      </div>

      {/* Add User Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <Signup onUserCreated={fetchUsers} />
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUser(searchTerm)}
            />
          </div>
          <button
            onClick={() => searchUser(searchTerm)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <FaSearch />
            Search
          </button>
        </div>
        <p className="text-gray-500 text-sm mt-4">
          Total Users: {filteredUsers.length} (Filtered from {users.length})
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{user.id?.toString().slice(-6)}</td>
                  <td className="px-6 py-4">
                    {editUser?.id === user.id ? (
                      <input
                        type="text"
                        value={editUser.first_name}
                        onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                      />
                    ) : (
                      <span className="font-medium text-gray-800">{user.first_name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editUser?.id === user.id ? (
                      <input
                        type="email"
                        value={editUser.email}
                        onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                      />
                    ) : (
                      <span className="text-gray-600">{user.email}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editUser?.id === user.id ? (
                      <input
                        type="text"
                        value={editUser.username}
                        onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                      />
                    ) : (
                      <span className="text-gray-600">{user.username}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editUser?.id === user.id ? (
                      <input
                        type="text"
                        value={editUser.phone_number}
                        onChange={(e) => setEditUser({ ...editUser, phone_number: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                      />
                    ) : (
                      <span className="text-gray-600">{user.phone_number}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editUser?.id === user.id ? (
                      <label className="flex items-center justify-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editUser.is_allowed}
                          onChange={(e) => setEditUser({ ...editUser, is_allowed: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">Allowed</span>
                      </label>
                    ) : user.is_allowed ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <FaCheck /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        <FaBan /> Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {editUser?.id === user.id ? (
                        <>
                          <button
                            onClick={() => handleUpdateUser(editUser)}
                            className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                            title="Save"
                          >
                            <FaSave />
                          </button>
                          <button
                            onClick={() => setEditUser(null)}
                            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            title="Cancel"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                          <button
                            onClick={() => handleChangePass(user)}
                            className="p-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors"
                            title="Change Password"
                          >
                            <FaKey />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <FaUser className="text-4xl mx-auto mb-3 text-gray-300" />
                    <p>No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
