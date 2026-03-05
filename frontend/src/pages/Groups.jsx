import React, { useState, useEffect } from "react";
import networkRequests from "../request_helper";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaSearch, FaPlus, FaEdit, FaTrash, FaFileAlt, FaUserPlus, FaTimes, FaSave, FaCheck } from "react-icons/fa";

const req_client = new networkRequests();
const Groups = () => {
  // State variables
  const navigate = useNavigate();
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({
    group_name: "",
    members: [],
    documents: [],
    comments: [],
    ownerManaged: true,
  });
  const [editingGroup, setEditingGroup] = useState(false);

  const [editingGroupMembers, setEditingGroupMembers] = useState([]);
  const [groupMemberSearchQuery, setGroupMemberSearchQuery] = useState("");
  const [showGroupMembersModal, setShowGroupMembersModal] = useState(false);
  const [searchedMembers, setSearchedMembers] = useState([]);
  const [filteredSearchedMembers, setFilteredSearchedMembers] = useState([]);

  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [documentSearchQuery, setDocumentSearchQuery] = useState("");
  const [searchedDocuments, setSearchedDocuments] = useState([]);
  const [editingDocuments, setEditingDocuments] = useState([]);

  const resetNewGroupData = () => {
    setNewGroup({
      group_name: "",
      members: [],
      documents: [],
      comments: [],
      ownerManaged: true,
    });
  };

  const addMemberToEditGroup = (member) => {
    setEditingGroupMembers((editingGroupMembers) =>
      editingGroupMembers.some((obj) => obj.id === member.id)
        ? editingGroupMembers.filter((obj) => obj.id != member.id)
        : [...editingGroupMembers, member]
    );
  };

  const addDocToEditingGroup = (doc) => {
    setEditingDocuments((editingDocuments) =>
      editingDocuments.some((obj) => obj.id === doc.id)
        ? editingDocuments.filter((obj) => obj.id != doc.id)
        : [...editingDocuments, doc]
    );
  };

  const saveNewGroupDocuments = async () => {
    setNewGroup((newGroup) => ({ ...newGroup, documents: editingDocuments }));
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq(
      `add_group_documents/?group_id=${newGroup.id}`,
      "POST",
      headers,
      JSON.stringify(editingDocuments)
    );
    if (result.ok) {
      alert("documents added.");
      setEditingDocuments([]);
      setSearchedDocuments([]);
      setDocumentSearchQuery("");
      setShowAddDocumentModal(false);
      searchGroups();
    } else {
      alert("error adding documents");
    }
  };

  const saveNewGroupMembers = () => {
    setNewGroup((newGroup) => ({ ...newGroup, members: editingGroupMembers }));
    setEditingGroupMembers([]);
    setSearchedMembers([]);
    setFilteredSearchedMembers([]);
    setGroupMemberSearchQuery("");
    setShowGroupMembersModal(false);
  };

  const handleCreateGroup = () => {
    resetNewGroupData();
    setShowGroupModal(true);
  };

  const handleOpenGroupMembersModal = () => {
    setFilteredSearchedMembers(newGroup.members);
    setShowGroupMembersModal(true);
  };

  const handleCancelGroup = () => {
    resetNewGroupData();
    setShowGroupModal(false);
  };

  const handleAddDocument = (group) => {
    if (group.documents.length > 0) {
      setSearchedDocuments(group.documents);
      setEditingDocuments(group.documents);
    }
    setNewGroup(group);
    setShowAddDocumentModal(true);
  };

  useEffect(() => {
    searchGroups();
  }, []);

  useEffect(() => {
    setFilteredGroups(
      groups.filter((group) =>
        group.group_name.toLowerCase().includes(groupSearchQuery.toLowerCase())
      )
    );
  }, [groupSearchQuery]);

  useEffect(() => {
    setFilteredSearchedMembers(
      searchedMembers.filter(
        (member) =>
          member.username
            .toLowerCase()
            .includes(groupMemberSearchQuery.toLowerCase()) ||
          member.first_name
            .toLowerCase()
            .includes(groupMemberSearchQuery.toLowerCase())
      )
    );
  }, [groupMemberSearchQuery]);

  const handleSaveGroup = async () => {
    if (!newGroup.group_name.trim()) {
      alert("Please enter a group name");
      return;
    }
    await req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq(
      `create_group/`,
      "POST",
      headers,
      JSON.stringify(newGroup)
    );

    setShowGroupModal(false);
    if (result.ok) {
      const resultJson = await result.json();
      await searchGroups();
      alert(resultJson.message);
    } else {
      const resultJson = await result.json();
      alert(resultJson.message || "Error creating group");
    }
  };

  const handleUpdateGroup = async () => {
    const data = {
      comments: newGroup["comments"],
      members: newGroup["members"],
      group_name: newGroup["group_name"],
      owner_managed: newGroup["owner_managed"],
      document: newGroup["documents"],
    };
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq(
      `edit_group/?group_id=${newGroup.id}`,
      "PUT",
      headers,
      JSON.stringify(data)
    );
    if(result.ok){
      alert("Group upadted successfull");
      setEditingGroup(false);
      setEditingDocuments([]);
      resetNewGroupData();
      setGroupMemberSearchQuery("");
      setShowGroupModal(false);
      searchGroups();
    }
    else{
      alert(result.json().message);
    }
  };

  const searchDocuments = async () => {
    const headers = {
      "Content-Type": "application/json",
    };
    const response = await req_client.fetchReq(
      `search_document/?querry=${documentSearchQuery}`,
      "GET",
      headers
    );
    if (response.ok) {
      const resultJson = await response.json();
      setSearchedDocuments(resultJson.documents);
    } else {
      setSearchedDocuments(null);
    }
  };

  const searchGroups = async () => {
    await req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    let fetch_url = `get_groups/`;
    if (groupSearchQuery != "") {
      fetch_url = `get_groups/?query=${groupSearchQuery}`;
    }
    const result = await req_client.fetchReq(fetch_url, "GET", headers);
    if (result.ok) {
      const resultJson = await result.json();
      setFilteredGroups(resultJson.groups || []);
      setGroups(resultJson.groups || []);
    } else {
      setFilteredGroups([]);
      setGroups([]);
    }
  };

  const searchMembers = async () => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    if (groupMemberSearchQuery === "") return;
    const result = await req_client.fetchReq(
      `search_user/?start_c=0&end_c=50&querry=${groupMemberSearchQuery}&is_admin=False`,
      "GET",
      headers
    );
    if (result.ok) {
      const resultJson = await result.json();
      setFilteredSearchedMembers(resultJson.users);
      setSearchedMembers(resultJson.users);
    }
  };

  const handleEditGroup = (group) => {
    setNewGroup(group);
    setShowGroupModal(true);
    setEditingGroup(true);
    setEditingGroupMembers(group.members);
  };

  const handleDeleteGroup = async (group_id) => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq(
      `delete_group/?group_id=${group_id}`,
      "DELETE",
      headers
    );
    if (result.ok) {
      const resultJson = await result.json();
      alert(resultJson.message);
      searchGroups();
    } else {
      const resultJson = await result.json();
      alert(resultJson.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-xl">
            <FaUsers className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Member Groups</h2>
            <p className="text-gray-500 text-sm">Manage your groups and members</p>
          </div>
        </div>
        <button
          onClick={handleCreateGroup}
          className="bg-green-500 hover:bg-green-600 text-white py-2.5 px-5 rounded-xl transition-colors flex items-center gap-2 font-medium shadow-sm"
        >
          <FaPlus /> Create New Group
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={groupSearchQuery}
              onChange={(e) => setGroupSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all flex items-center gap-2"
            onClick={searchGroups}
          >
            <FaSearch /> Search
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaUsers className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">
                        {group.group_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {group.members.length} members
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddDocument(group)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Add Document"
                    >
                      <FaFileAlt />
                    </button>
                    <button
                      onClick={() => handleEditGroup(group)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit Group"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete Group"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Members */}
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                    <FaUserPlus className="text-gray-400" /> Members
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {group.members.slice(0, 5).map((member) => (
                      <span
                        key={member.id}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                      >
                        {member.first_name}
                      </span>
                    ))}
                    {group.members.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{group.members.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Documents */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <FaFileAlt className="text-gray-400" /> Documents
                    </h4>
                    <button
                      onClick={() => handleAddDocument(group)}
                      className="text-green-600 hover:text-green-700 text-xs font-medium flex items-center gap-1"
                    >
                      <FaPlus /> {group.documents.length > 0 ? "Edit" : "Add"}
                    </button>
                  </div>
                  {group.documents && group.documents.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {group.documents.slice(0, 3).map((doc, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full"
                        >
                          {doc.title || `Document ${index + 1}`}
                        </span>
                      ))}
                      {group.documents.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{group.documents.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs">No documents added yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaUsers className="mx-auto text-5xl text-gray-300 mb-4" />
            <p className="text-gray-500">No groups found.</p>
            <button
              onClick={handleCreateGroup}
              className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first group
            </button>
          </div>
        )}
      </div>

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingGroup ? "Edit Group" : "Create New Group"}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroup.group_name}
                  onChange={(e) =>
                    setNewGroup((newGroup) => ({
                      ...newGroup,
                      group_name: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter group name"
                />
              </div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newGroup.ownerManaged}
                  onChange={(e) =>
                    setNewGroup((newGroup) => ({
                      ...newGroup,
                      ownerManaged: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Owner Managed group
                </span>
              </label>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Members
                </label>
                <div className="border rounded-md p-2 min-h-10">
                  {newGroup.members.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {newGroup.members.map((member) => (
                        <span
                          key={member.id}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {member.first_name} - {member.username}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No members selected</p>
                  )}
                </div>
                <button
                  onClick={handleOpenGroupMembersModal}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  {newGroup.members.length > 0
                    ? "Edit Members"
                    : "+ Add Members"}
                </button>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {editingGroup ? (
                <button
                  onClick={handleUpdateGroup}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Update
                </button>
              ) : (
                <button
                  onClick={handleSaveGroup}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save
                </button>
              )}
              <button
                onClick={handleCancelGroup}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Members Selection Modal */}
      {showGroupMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Select Members
              </h3>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search members..."
                  value={groupMemberSearchQuery}
                  onChange={(e) => setGroupMemberSearchQuery(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md mb-2"
                />
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-1 transition-all duration-300 hover:scale-105"
                  onClick={searchMembers}
                >
                  Search
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto border rounded-md">
                {filteredSearchedMembers.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {filteredSearchedMembers.map((member) => (
                      <li key={member.id} className="p-2 hover:bg-gray-50">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={editingGroupMembers.some(
                              (obj) => obj.id == member.id
                            )}
                            onChange={() => addMemberToEditGroup(member)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            {member.first_name} - {member.username}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-4 text-gray-500 text-center">
                    No members found
                  </p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                onClick={saveNewGroupMembers}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setShowGroupMembersModal(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Select Documents
              </h3>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={documentSearchQuery}
                  onChange={(e) => setDocumentSearchQuery(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md mb-2"
                />
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-1 transition-all duration-300 hover:scale-105"
                  onClick={searchDocuments}
                >
                  Search
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto border rounded-md">
                {searchedDocuments.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {searchedDocuments.map((doc) => (
                      <li key={doc.id} className="p-2 hover:bg-gray-50">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={editingDocuments.some(
                              (obj) => obj.id == doc.id
                            )}
                            onChange={() => addDocToEditingGroup(doc)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            {doc.title} - {doc.docType}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-4 text-gray-500 text-center">
                    No Documents found
                  </p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                onClick={saveNewGroupDocuments}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setShowAddDocumentModal(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
