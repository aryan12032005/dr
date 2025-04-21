import React from 'react';
import SearchDocument from './SearchDocuments';
import DocUpload from './DocUpload';

const DocumentManage = ({ userStatus }) => {
  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-100 via-white to-gray-200 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center drop-shadow-lg">
        📄 Manage Your Documents
      </h1>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Upload Section */}
        <div className="bg-white/80  border border-gray-200 rounded-xl shadow-xl hover:shadow-blue-100 transition-shadow duration-500 transform hover:scale-[1.005]">
          <div className="p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
              🚀 Upload New Document
            </h2>
            <DocUpload />
          </div>
        </div>

        {/* View Uploaded Documents Section */}
        <div className="bg-white/80  border border-gray-200 rounded-xl shadow-xl hover:shadow-blue-100 transition-shadow duration-500 transform hover:scale-[1.005]">
          <div className="p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
              📚 View Uploaded Documents
            </h2>
            <SearchDocument userStatus={userStatus}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentManage;
