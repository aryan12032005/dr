import React from 'react';
import { FaCloudUploadAlt, FaFolderOpen, FaRocket } from 'react-icons/fa';
import SearchDocument from './SearchDocuments';
import DocUpload from './DocUpload';

const DocumentManage = ({ userStatus }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FaFolderOpen className="text-2xl text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-800">Manage Your Documents</h1>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <FaRocket className="text-blue-500" />
          Upload New Document
        </h2>
        <DocUpload />
      </div>

      {/* View Documents Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <FaFolderOpen className="text-green-500" />
          View Uploaded Documents
        </h2>
        <SearchDocument userStatus={userStatus}/>
      </div>
    </div>
  );
};

export default DocumentManage;
