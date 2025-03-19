import React, { useState } from 'react';

const Faculty= () => {
  // Sample faculty data
  const faculty = {
    id: 1,
    name: 'Dr. Sarah Johnson',
    department: 'CSE',
    designation: 'Associate Professor',
    email: 'sarah.johnson@university.edu',
  };

  // Document visibility options
  const visibilityOptions = [
    { id: 'faculty', label: 'Faculty Only' },
    { id: 'students', label: 'Selected Students' },
    { id: 'public', label: 'Public' }
  ];

  // Document types
  const documentTypes = [
    { id: 'syllabus', label: 'Syllabus' },
    { id: 'lecture', label: 'Lecture Notes' },
    { id: 'assignment', label: 'Assignment' },
    { id: 'research', label: 'Research Paper' },
    { id: 'other', label: 'Other' }
  ];

  // Sample documents
  const [documents, setDocuments] = useState([
    {
      id: 101,
      name: 'Machine Learning Syllabus.pdf',
      type: 'syllabus',
      uploadDate: '2023-01-15',
      size: '1.2 MB',
      visibility: 'public',
      selectedStudents: []
    },
    {
      id: 102,
      name: 'Neural Networks Research.docx',
      type: 'research',
      uploadDate: '2023-02-20',
      size: '3.5 MB',
      visibility: 'faculty',
      selectedStudents: []
    },
    {
      id: 103,
      name: 'Student Grading Sheet.xlsx',
      type: 'other',
      uploadDate: '2023-03-10',
      size: '0.8 MB',
      visibility: 'students',
      selectedStudents: ['ST001', 'ST002', 'ST003']
    },
    {
      id: 104,
      name: 'Assignment 1 - Data Structures.pdf',
      type: 'assignment',
      uploadDate: '2023-03-15',
      size: '1.5 MB',
      visibility: 'students',
      selectedStudents: ['ST001', 'ST002', 'ST003', 'ST004', 'ST005']
    },
    {
      id: 105,
      name: 'Introduction to AI Lecture Notes.pdf',
      type: 'lecture',
      uploadDate: '2023-03-20',
      size: '2.7 MB',
      visibility: 'public',
      selectedStudents: []
    }
  ]);

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');

  // State for new document upload
  const [newDocument, setNewDocument] = useState({
    name: '',
    file: null,
    type: 'other',
    visibility: 'faculty',
    selectedStudents: []
  });

  // State for selected students modal
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Sample students data
  const allStudents = [
    { id: 'ST001', name: 'John Smith', email: 'john.smith@university.edu' },
    { id: 'ST002', name: 'Emma Johnson', email: 'emma.johnson@university.edu' },
    { id: 'ST003', name: 'Michael Brown', email: 'michael.brown@university.edu' },
    { id: 'ST004', name: 'Sophia Davis', email: 'sophia.davis@university.edu' },
    { id: 'ST005', name: 'William Wilson', email: 'william.wilson@university.edu' },
    { id: 'ST006', name: 'Olivia Martinez', email: 'olivia.martinez@university.edu' },
    { id: 'ST007', name: 'James Taylor', email: 'james.taylor@university.edu' },
    { id: 'ST008', name: 'Ava Anderson', email: 'ava.anderson@university.edu' },
    { id: 'ST009', name: 'Benjamin Thomas', email: 'benjamin.thomas@university.edu' },
    { id: 'ST010', name: 'Isabella White', email: 'isabella.white@university.edu' },
    { id: 'ST011', name: 'Lucas Garcia', email: 'lucas.garcia@university.edu' },
    { id: 'ST012', name: 'Mia Robinson', email: 'mia.robinson@university.edu' },
    { id: 'ST013', name: 'Ethan Moore', email: 'ethan.moore@university.edu' },
    { id: 'ST014', name: 'Amelia Lee', email: 'amelia.lee@university.edu' },
    { id: 'ST015', name: 'Alexander Clark', email: 'alexander.clark@university.edu' }
  ];

  // Handle new document input change
  const handleNewDocumentChange = (e) => {
    const { name, value } = e.target;
    setNewDocument({
      ...newDocument,
      [name]: value
    });
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewDocument({
        ...newDocument,
        name: file.name,
        file: file
      });
    }
  };

  // Handle visibility change
  const handleVisibilityChange = (e) => {
    const visibility = e.target.value;
    setNewDocument({
      ...newDocument,
      visibility: visibility
    });

    if (visibility === 'students') {
      setShowStudentsModal(true);
    } else {
      setSelectedStudents([]);
    }
  };

  // Handle student selection in modal
  const handleStudentSelection = (studentId) => {
    const updatedSelection = selectedStudents.includes(studentId)
      ? selectedStudents.filter(id => id !== studentId)
      : [...selectedStudents, studentId];
    setSelectedStudents(updatedSelection);
  };

  // Save selected students
  const saveSelectedStudents = () => {
    setNewDocument({
      ...newDocument,
      selectedStudents: selectedStudents
    });
    setShowStudentsModal(false);
  };

  // Handle document upload
  const handleDocumentSubmit = () => {
    if (!newDocument.name || !newDocument.file) {
      alert('Please select a file to upload');
      return;
    }

    const newDocumentObj = {
      id: Date.now(),
      name: newDocument.name,
      type: newDocument.type,
      uploadDate: new Date().toISOString().split('T')[0],
      size: `${(newDocument.file.size / (1024 * 1024)).toFixed(2)} MB`,
      visibility: newDocument.visibility,
      selectedStudents: newDocument.selectedStudents
    };

    setDocuments([newDocumentObj, ...documents]);
    
    // Reset form
    setNewDocument({
      name: '',
      file: null,
      type: 'other',
      visibility: 'faculty',
      selectedStudents: []
    });
    
    setSelectedStudents([]);
    alert('Document uploaded successfully!');
  };

  // Handle document deletion
  const handleDocumentDelete = (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(doc => doc.id !== documentId));
    }
  };

  // Filter documents based on search query and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesQuery = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesVisibility = visibilityFilter === 'all' || doc.visibility === visibilityFilter;
    return matchesQuery && matchesType && matchesVisibility;
  });

  // Filter students based on search query
  const filteredStudents = allStudents.filter(student => {
    return student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || 
           student.email.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
           student.id.toLowerCase().includes(studentSearchQuery.toLowerCase());
  });

  // Get visibility label
  const getVisibilityLabel = (visibility, selectedStudents) => {
    if (visibility === 'faculty') return 'Faculty Only';
    if (visibility === 'public') return 'Public';
    if (visibility === 'students') return `Selected Students (${selectedStudents.length})`;
    return visibility;
  };

  // Get document type label
  const getDocumentTypeLabel = (type) => {
    const typeObj = documentTypes.find(t => t.id === type);
    return typeObj ? typeObj.label : type;
  };

  // Select all filtered students
  const selectAllFilteredStudents = () => {
    const filteredStudentIds = filteredStudents.map(student => student.id);
    
    // Combine currently selected students with filtered students (avoiding duplicates)
    const newSelection = [...new Set([...selectedStudents, ...filteredStudentIds])];
    setSelectedStudents(newSelection);
  };

  // Deselect all filtered students
  const deselectAllFilteredStudents = () => {
    const filteredStudentIds = filteredStudents.map(student => student.id);
    
    // Remove all filtered students from selection
    const newSelection = selectedStudents.filter(id => !filteredStudentIds.includes(id));
    setSelectedStudents(newSelection);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Document Management</h1>
          <div className="flex items-center mt-2">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {faculty.name.charAt(0)}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold">{faculty.name}</h2>
              <p className="text-sm text-gray-600">{faculty.designation}, {faculty.department}</p>
            </div>
          </div>
        </header>

        {/* Document Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload New Document</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document File</label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {newDocument.name && (
                <p className="mt-1 text-sm text-green-600">Selected: {newDocument.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select
                name="type"
                value={newDocument.type}
                onChange={handleNewDocumentChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {documentTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Visibility</label>
              <select
                name="visibility"
                value={newDocument.visibility}
                onChange={handleVisibilityChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {visibilityOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
              {newDocument.visibility === 'students' && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShowStudentsModal(true)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-gray-700"
                  >
                    {selectedStudents.length ? `${selectedStudents.length} Students Selected` : 'Select Students'}
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={handleDocumentSubmit}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
            >
              Upload Document
            </button>
          </div>
        </div>

        {/* Document List Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">My Documents</h2>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {documentTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Visibility</option>
                {visibilityOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Document List */}
          {filteredDocuments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visibility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {doc.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getDocumentTypeLabel(doc.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${doc.visibility === 'faculty' ? 'bg-red-100 text-red-800' : 
                            doc.visibility === 'public' ? 'bg-green-100 text-green-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {getVisibilityLabel(doc.visibility, doc.selectedStudents)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.uploadDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => alert(`Downloading ${doc.name}`)}
                          >
                            Download
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDocumentDelete(doc.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No documents found.</p>
          )}
        </div>
      </div>

      {/* Student Selection Modal */}
      {showStudentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Select Students</h3>
            
            {/* Student Search */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  placeholder="Search students by name, email, or ID..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Quick selection buttons */}
              <div className="flex justify-end space-x-2 mb-2">
                <span className="text-sm text-gray-500">
                  {filteredStudents.length} students found
                </span>
                <button
                  onClick={selectAllFilteredStudents}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllFilteredStudents}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Deselect All
                </button>
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleStudentSelection(student.id)}
                          className="rounded text-blue-500 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowStudentsModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveSelectedStudents}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white"
              >
                Save ({selectedStudents.length} Selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;