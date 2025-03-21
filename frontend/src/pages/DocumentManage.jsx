import React, { useState } from 'react';

const DocumentManage = () => {
  // Sample document data
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Project_Report.pdf', date: '2023-10-01', size: '2.5 MB' },
    { id: 2, name: 'Design_Specs.docx', date: '2023-09-25', size: '1.2 MB' },
    { id: 3, name: 'Financial_Summary.xlsx', date: '2023-09-20', size: '3.0 MB' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  // Handle document upload
  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newDocument = {
        id: documents.length + 1,
        name: file.name,
        date: new Date().toISOString().split('T')[0],
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      };
      setDocuments([...documents, newDocument]);
    }
  };

  // Handle document deletion
  const handleDelete = (id) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  // Filter documents based on search query
  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Your Documents</h1>

      {/* Upload Section */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload New Document</h2>
        <label className="bg-blue-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors">
          Upload Document
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>

      {/* View Uploaded Documents Section */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">View Uploaded Documents</h2>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Document List */}
        <div className="rounded-lg overflow-hidden">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{doc.name}</h2>
                    <p className="text-sm text-gray-500">
                      Uploaded on {doc.date} • {doc.size}
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      onClick={() => alert(`Viewing ${doc.name}`)}
                    >
                      View
                    </button>
                    <button
                      className="text-green-500 hover:text-green-700 transition-colors"
                      onClick={() => alert(`Downloading ${doc.name}`)}
                    >
                      Download
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 transition-colors"
                      onClick={() => handleDelete(doc.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No documents found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentManage;