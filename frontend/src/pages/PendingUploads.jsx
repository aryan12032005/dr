import React, { useState, useEffect } from "react";
import networkRequests from "../request_helper";
import { FaCloudUploadAlt, FaCheck, FaTimes, FaUser, FaFileAlt, FaBuilding, FaSearch } from "react-icons/fa";

const req_client = new networkRequests();

const PendingUploads = () => {
  const [pendingUploads, setPendingUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionModal, setActionModal] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchPendingUploads();
  }, []);

  const fetchPendingUploads = async () => {
    setLoading(true);
    await req_client.reload_tokens();
    const headers = { Authorization: `Bearer ${req_client.accessToken}` };
    const res = await req_client.fetchReq("get_pending_uploads/", "GET", headers);
    if (res.ok) {
      const data = await res.json();
      setPendingUploads(data.pending_uploads || []);
    }
    setLoading(false);
  };

  const handleAction = async (uploadId, action) => {
    await req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json"
    };
    const res = await req_client.fetchReq(
      "handle_pending_upload/",
      "POST",
      headers,
      JSON.stringify({ upload_id: uploadId, action, comment })
    );
    if (res.ok) {
      alert(`Document ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setActionModal(null);
      setComment("");
      fetchPendingUploads();
    } else {
      const err = await res.json();
      alert(err.message || "Error processing request");
    }
  };

  const filteredUploads = pendingUploads.filter(upload =>
    upload.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    upload.faculty_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <FaCloudUploadAlt className="text-purple-600 text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pending Uploads</h1>
            <p className="text-gray-500">Review and approve faculty document submissions</p>
          </div>
        </div>
        <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium">
          {pendingUploads.length} Pending
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or faculty name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
          />
        </div>
      </div>

      {/* Uploads List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading pending uploads...</p>
          </div>
        ) : filteredUploads.length === 0 ? (
          <div className="text-center py-12">
            <FaCloudUploadAlt className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No pending uploads</p>
            <p className="text-gray-400">Faculty document submissions will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredUploads.map((upload) => (
              <div key={upload.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{upload.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaUser className="text-blue-400" />
                        {upload.faculty_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaFileAlt className="text-green-400" />
                        {upload.docType?.toUpperCase()}
                      </span>
                      {upload.department && (
                        <span className="flex items-center gap-1">
                          <FaBuilding className="text-orange-400" />
                          {upload.department}
                        </span>
                      )}
                      <span className="text-gray-400">
                        {new Date(upload.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {upload.authors && (
                      <p className="text-sm text-gray-500 mt-2">Authors: {upload.authors}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setActionModal({ upload, action: 'approve' })}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <FaCheck />
                      Approve
                    </button>
                    <button
                      onClick={() => setActionModal({ upload, action: 'reject' })}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <FaTimes />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {actionModal.action === 'approve' ? 'Approve' : 'Reject'} Document
            </h3>
            <p className="text-gray-600 mb-4">
              {actionModal.action === 'approve' 
                ? 'This will publish the document to the repository.'
                : 'This will reject the document submission.'}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 h-24 resize-none"
                placeholder="Add a comment for the faculty..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAction(actionModal.upload.id, actionModal.action)}
                className={`flex-1 py-2 rounded-lg font-medium ${
                  actionModal.action === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                Confirm {actionModal.action === 'approve' ? 'Approval' : 'Rejection'}
              </button>
              <button
                onClick={() => { setActionModal(null); setComment(""); }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
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

export default PendingUploads;
