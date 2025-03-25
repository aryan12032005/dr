import React, { useState } from 'react';

const Demo = () => {
  // State variables
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([
    { id: 'S1', name: 'John Doe' },
    { id: 'S2', name: 'Jane Smith' },
    { id: 'S3', name: 'Mike Johnson' },
    { id: 'S4', name: 'Sarah Williams' },
    { id: 'S5', name: 'David Brown' },
  ]);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [currentGroup, setCurrentGroup] = useState(null);
  const [selectedGroupStudents, setSelectedGroupStudents] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showGroupStudentsModal, setShowGroupStudentsModal] = useState(false);
  const [groupStudentSearchQuery, setGroupStudentSearchQuery] = useState('');
  const [newDocument, setNewDocument] = useState({ visibility: 'all' });

  // Filter groups based on search query
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );

  // Filter students for group selection modal
  const filteredGroupStudents = students.filter(student =>
    student.name.toLowerCase().includes(groupStudentSearchQuery.toLowerCase())
  );

  // Get student name by ID
  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown';
  };

  // Add group to document selection
  const addGroupToSelection = (groupId) => {
    // Implementation depends on your specific requirements
    console.log(`Adding group ${groupId} to document selection`);
  };

  // Create new group
  const handleCreateGroup = () => {
    setNewGroupName('');
    setCurrentGroup({
      id: `G${Date.now().toString().slice(-3)}`,
      name: '',
      students: []
    });
    setSelectedGroupStudents([]);
    setEditingGroup(null);
    setShowGroupModal(true);
  };

  // Edit existing group
  const handleEditGroup = (group) => {
    setNewGroupName(group.name);
    setCurrentGroup(group);
    setSelectedGroupStudents([...group.students]);
    setEditingGroup(group.id);
    setShowGroupModal(true);
  };

  // Delete group
  const handleDeleteGroup = (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      setGroups(groups.filter(g => g.id !== groupId));
    }
  };

  // Save group
  const handleSaveGroup = () => {
    if (!newGroupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    if (editingGroup) {
      // Update existing group
      setGroups(groups.map(g => 
        g.id === editingGroup 
          ? { ...g, name: newGroupName, students: selectedGroupStudents } 
          : g
      ));
    } else {
      // Create new group
      setGroups([
        ...groups,
        {
          id: currentGroup.id,
          name: newGroupName,
          students: selectedGroupStudents
        }
      ]);
    }

    setShowGroupModal(false);
    setCurrentGroup(null);
    setNewGroupName('');
    setSelectedGroupStudents([]);
    setEditingGroup(null);
  };

  // Open student selection modal for group
  const handleOpenGroupStudentsModal = () => {
    setGroupStudentSearchQuery('');
    setShowGroupStudentsModal(true);
  };

  // Handle group student selection
  const handleGroupStudentSelection = (studentId) => {
    const updatedSelection = selectedGroupStudents.includes(studentId)
      ? selectedGroupStudents.filter(id => id !== studentId)
      : [...selectedGroupStudents, studentId];
    setSelectedGroupStudents(updatedSelection);
  };

  // Save selected students for group
  const saveGroupStudents = () => {
    setShowGroupStudentsModal(false);
  };

  // Select all filtered students for group
  const selectAllFilteredGroupStudents = () => {
    const filteredStudentIds = filteredGroupStudents.map(student => student.id);
    const newSelection = [...new Set([...selectedGroupStudents, ...filteredStudentIds])];
    setSelectedGroupStudents(newSelection);
  };

  // Deselect all filtered students for group
  const deselectAllFilteredGroupStudents = () => {
    const filteredStudentIds = filteredGroupStudents.map(student => student.id);
    const newSelection = selectedGroupStudents.filter(id => !filteredStudentIds.includes(id));
    setSelectedGroupStudents(newSelection);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Student Groups</h2>
        <button 
          onClick={handleCreateGroup}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors flex items-center"
        >
          + Create New Group
        </button>
      </div>

      {/* Search Groups */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search groups..."
          value={groupSearchQuery}
          onChange={(e) => setGroupSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Groups List */}
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGroups.map(group => (
            <div key={group.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-lg text-gray-800">{group.name}</h3>
                  <p className="text-sm text-gray-500">{group.students.length} students</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="text-blue-500 hover:text-blue-600"
                    title="Edit Group"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-red-500 hover:text-red-600"
                    title="Delete Group"
                  >
                    🗑
                  </button>
                </div>
              </div>
                
              <div className="mt-2">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Students:</h4>
                <div className="flex flex-wrap gap-1">
                  {group.students.slice(0, 5).map(studentId => (
                    <span key={studentId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {getStudentName(studentId)}
                    </span>
                  ))}
                  {group.students.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      +{group.students.length - 5} more
                    </span>
                  )}
                </div>
              </div>
                
              {newDocument.visibility === 'students' && (
                <button
                  onClick={() => addGroupToSelection(group.id)}
                  className="mt-3 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-md transition-colors w-full"
                >
                  Add to document selection
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-6">No groups found.</p>
      )}

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingGroup ? 'Edit Group' : 'Create New Group'}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter group name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Students</label>
                <div className="border rounded-md p-2 min-h-10">
                  {selectedGroupStudents.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedGroupStudents.map(studentId => (
                        <span key={studentId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {getStudentName(studentId)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No students selected</p>
                  )}
                </div>
                <button
                  onClick={handleOpenGroupStudentsModal}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedGroupStudents.length > 0 ? 'Edit Students' : '+ Add Students'}
                </button>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                onClick={handleSaveGroup}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setShowGroupModal(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Students Selection Modal */}
      {showGroupStudentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Students</h3>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={groupStudentSearchQuery}
                  onChange={(e) => setGroupStudentSearchQuery(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md mb-2"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={selectAllFilteredGroupStudents}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllFilteredGroupStudents}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto border rounded-md">
                {filteredGroupStudents.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {filteredGroupStudents.map(student => (
                      <li key={student.id} className="p-2 hover:bg-gray-50">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedGroupStudents.includes(student.id)}
                            onChange={() => handleGroupStudentSelection(student.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{student.name}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-4 text-gray-500 text-center">No students found</p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                onClick={saveGroupStudents}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setShowGroupStudentsModal(false)}
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

export default Demo;