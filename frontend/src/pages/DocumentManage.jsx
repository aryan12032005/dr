import React, { useState,useEffect } from 'react';
import SearchDocument from './SearchDocuments';
import DocUpload from './DocUpload';

const DocumentManage = () => {

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Your Documents</h1>

      {/* Upload Section */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload New Document</h2>
        <DocUpload/>
      </div>

      {/* View Uploaded Documents Section */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">View Uploaded Documents</h2>

        
      <SearchDocument/>
      </div>
    </div>
  );
};

export default DocumentManage;