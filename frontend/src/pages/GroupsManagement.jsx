import React, { useState, useEffect } from "react";
import networkRequests from "../request_helper";
import { FaUsers, FaSearch, FaTrash, FaFileAlt, FaUserMinus, FaTimes, FaEye, FaExclamationTriangle } from "react-icons/fa";

const req_client = new networkRequests();

const GroupsManagement = () => {
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDisbandModal, setShowDisbandModal] = useState(false);
  const [groupToDisband, setGroupToDisband] = useState(null);
  const [totalGroups, setTotalGroups] = useState(0);

  useEffect(() => {
    fetchAllGroups();
  }, []);

  const fetchAllGroups = async (query = "") => {
    setLoading(true);
    await req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    
    let endpoint = "admin_get_all_groups/";
    if (query) {
      endpoint += `?query=${query}`;
    }
    
    const result = await req_client.fetchReq(endpoint, "GET", headers);
    if (result.ok) {
      const data = await result.json();
      setGroups(data.groups || []);
      setTotalGroups(data.total || 0);
    } else {
      setGroups([]);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    fetchAllGroups(searchQuery);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const openDisbandModal = (group) => {
    setGroupToDisband(group);
    setShowDisbandModal(true);
  };

  const handleDisbandGroup = async () => {
    if (!groupToDisband) return;
    
    await req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    
    const result = await req_client.fetchReq(
      `admin_disband_group/?group_id=${groupToDisband.id}`,
      "DELETE",
      headers
    );
    
    if (result.ok) {
      alert("Group disbanded successfully");
      setShowDisbandModal(false);
      setGroupToDisband(null);
      fetchAllGroups(searchQuery);
    } else {
      const data = await result.json();
      alert(data.message || "Error disbanding group");
    }
  };

  const handleRemoveMember = async (groupId, memberId, memberName) => {
    if (!confirm(`Remove ${memberName} from this group?`)) return;
    
    await req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    
    const result = await req_client.fetchReq(
      `admin_remove_group_member/?group_id=${groupId}&member_id=${memberId}`,
      "DELETE",
      headers
    );
    
    if (result.ok) {
      alert("Member removed successfully");
      // Refresh the selected group details
      const updatedGroup = { ...selectedGroup };
      updatedGroup.members = updatedGroup.members.filter(m => m.id !== memberId);
      setSelectedGroup(updatedGroup);
      fetchAllGroups(searchQuery);
    } else {
      const data = await result.json();
      alert(data.message || "Error removing member");
    }
  };

  const openGroupDetails = (group) => {
    setSelectedGroup(group);
    setShowDetailsModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Groups Management</h2>
          <p className="text-gray-500">Manage all user groups • {totalGroups} total groups</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search groups by name..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Search
          </button>
        </div>
      </div>

      {/* Groups List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading groups...
          </div>
        ) : groups.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FaUsers className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No groups found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Group Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Owner</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Members</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Documents</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FaUsers className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-800">{group.group_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{group.ownerName}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {group.members?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {group.documents?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openGroupDetails(group)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => openDisbandModal(group)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Disband Group"
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
        )}
      </div>

      {/* Group Details Modal */}
      {showDetailsModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaUsers /> {selectedGroup.group_name}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Owner</p>
                <p className="font-medium text-gray-800">{selectedGroup.ownerName}</p>
              </div>

              {/* Members Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaUsers className="text-green-600" />
                  Members ({selectedGroup.members?.length || 0})
                </h4>
                {selectedGroup.members?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedGroup.members.map((member, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                            {member.first_name?.[0] || member.username?.[0] || "U"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {member.first_name && member.last_name 
                                ? `${member.first_name} ${member.last_name}` 
                                : member.username}
                            </p>
                            {member.email && (
                              <p className="text-sm text-gray-500">{member.email}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(selectedGroup.id, member.id, member.username)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                          title="Remove from group"
                        >
                          <FaUserMinus />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No members in this group</p>
                )}
              </div>

              {/* Documents Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaFileAlt className="text-purple-600" />
                  Documents ({selectedGroup.documents?.length || 0})
                </h4>
                {selectedGroup.documents?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedGroup.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FaFileAlt className="text-purple-600" />
                        </div>
                        <p className="font-medium text-gray-800">{doc.title || "Untitled Document"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No documents in this group</p>
                )}
              </div>
            </div>

            <div className="border-t bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  openDisbandModal(selectedGroup);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FaTrash /> Disband Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disband Confirmation Modal */}
      {showDisbandModal && groupToDisband && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-3xl text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Disband Group?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to disband <span className="font-semibold">"{groupToDisband.group_name}"</span>? 
                This will remove all {groupToDisband.members?.length || 0} members from the group. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowDisbandModal(false);
                    setGroupToDisband(null);
                  }}
                  className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisbandGroup}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Disband Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsManagement;
