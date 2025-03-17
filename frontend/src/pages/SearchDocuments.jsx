import React, { useState, useEffect } from "react";
import networkRequests from "../request_helper";

const req_client = new networkRequests();
const SearchDocument = () => {
  const [searchTerm,setSearchTerm]=useState("");
  const [filteredDocuments,setDocuments]=useState({})

  const searchDocument = async() => {
    const headers={
      "Content-Type": "application/json",
    }
    const response= await req_client.fetchReq(`search_document/?querry=${searchTerm}`, "GET", headers);
    if(response.ok){
      const data=await response.json();
      setDocuments(data.documents);
    }
  };
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-4 ">
      <h2 className="text-xl font-semibold mb-2 text-gray-700">
        Search Documents
      </h2>
      <input
        type="text"
        placeholder="Search Users..."
        className="border rounded-md px-3 py-2 mb-4 w-full shadow-sm focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        value={searchTerm}
        required
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button
        onClick={() => searchDocument()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-1 transition-all duration-300 hover:scale-105"
      >
        Search
      </button>
      <p className="text-gray-600 mb-4">
        Total results: {filteredDocuments.length}
      </p>
      <div className="rounded-lg overflow-hidden">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{doc.title}</h2>
                    <p className="text-sm text-gray-500">
                      Uploaded on : {doc.date}<br></br> File type:  {doc.docType}
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      onClick={() => alert(`Viewing ${doc.title}`)}
                    >
                      View
                    </button>
                    <button
                      className="text-green-500 hover:text-green-700 transition-colors"
                      onClick={() => alert(`Downloading ${doc.title}`)}
                    >
                      Download
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 transition-colors"
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
  );
};

export default SearchDocument;
