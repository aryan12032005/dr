import { React, useEffect, useState } from "react";
import networkRequests from "../request_helper";
import { FaFileAlt, FaSearch, FaCheck, FaTimes, FaUser, FaClipboardList } from "react-icons/fa";

const req_client = new networkRequests();
const RequestedDocument = () => {
  const [requestSearchId, setRequestSearchId] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [requestData, setRequestData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const results = await Promise.all(
        allRequests.map(async (req) => {
          try {
            req_client.reload_tokens();
            const headers = {
              Authorization: `Bearer ${req_client.accessToken}`,
              "Content-Type": "application/json",
            };
            const [requesterRes, docRes] = await Promise.all([
              req_client.fetchReq(
                `search_user/?user_id=${req.requester_id}&start_c=0&end_c=20`,
                "GET",
                headers
              ),
              req_client.fetchReq(
                `get_document/?doc_id=${req.doc_id}`,
                "GET",
                headers
              ),
            ]);
            const requesterData = await requesterRes.json();
            const docData = await docRes.json();
            return {
              ...req,
              requester: requesterData?.users[0] ?? null,
              document: docData?.document ?? null,
            };
          } catch (error) {
            console.error("Error fetching data", error);
            return req; // fallback
          }
        })
      );

      setRequestData(results);
    };

    fetchData();
  }, [allRequests]);

  const searchRequests = async () => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const user_status = JSON.parse(localStorage.getItem("user_status"));
    const result = await req_client.fetchReq(
      `get_requests/?fac_id=${user_status.user_id}`,
      "GET",
      headers
    );
    if (result.ok) {
      const resultJson = await result.json();
      setAllRequests(resultJson.requests);
    } else {
      setAllRequests([]);
    }
  };

  const handleApprove = async (requester_id, doc_id) => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const data = {
      requester_id: requester_id,
      doc_id: doc_id,
    };
    const result = await req_client.fetchReq(
      "approve_document/",
      "PUT",
      headers,
      JSON.stringify(data)
    );
    if (result.ok) {
      alert("Access provided");
      searchRequests();
    } else {
      alert("Something went wrong");
    }
  };

  const handleReject = async(requester_id,doc_id) => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq(
      `delete_request/?doc_id=${doc_id}&requester_id=${requester_id}`,
      "DELETE",
      headers
    );
    if (result.ok) {
      alert("Access Rejected");
      searchRequests();
    } else {
      alert("Something went wrong");
    }
  };

  useEffect(() => {
    searchRequests();
  },[])
 
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-500 rounded-xl">
          <FaClipboardList className="text-white text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Document Requests</h2>
          <p className="text-gray-500 text-sm">Review and approve document access requests</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={requestSearchId}
              onChange={(e) => setRequestSearchId(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all flex items-center gap-2"
            onClick={searchRequests}
          >
            <FaSearch /> Search
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {requestData.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {requestData.map((req) => (
              <div
                key={`${req.doc_id}-${req.requester_id}`}
                className="p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <FaFileAlt className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">
                        {req.document?.title || "Loading..."}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-gray-500">
                        <FaUser className="text-gray-400" />
                        <span>Requested by: <span className="font-medium text-gray-700">{req.requester?.first_name || ""}</span></span>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm">{req.requester?.email || ""}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 md:ml-auto">
                    <button
                      onClick={() => handleApprove(req.requester_id, req.doc_id, req.fac_id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                    >
                      <FaCheck /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.requester_id, req.doc_id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
                    >
                      <FaTimes /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaClipboardList className="mx-auto text-5xl text-gray-300 mb-4" />
            <p className="text-gray-500">No pending requests</p>
            <p className="text-gray-400 text-sm mt-1">Document access requests will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestedDocument;
