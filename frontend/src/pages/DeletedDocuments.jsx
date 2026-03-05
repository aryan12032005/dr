import { React, useEffect, useState } from "react";
import { FaTrashAlt, FaSearch, FaCheck, FaTimes, FaUser, FaFileAlt, FaExclamationTriangle } from "react-icons/fa";
import networkRequests from "../request_helper";

const req_client = new networkRequests();
const DeletedDocuments = () => {
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
                `search_user/?user_id=${req.fac_id}&start_c=0&end_c=20`,
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
      console.log(results);
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
      `get_delete_requests/`,
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

  const handleApprove = async ( doc_id) => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const data = {
      doc_id: doc_id,
    };
    const result = await req_client.fetchReq(
      "approve_document_delete/",
      "PUT",
      headers,
      JSON.stringify(data)
    );
    if (result.ok) {
      alert("Delete approved");
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
      `reject_document_detele/?doc_id=${doc_id}`,
      "DELETE",
      headers
    );
    if (result.ok) {
      alert("Request Rejected");
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
        <FaTrashAlt className="text-2xl text-red-500" />
        <h1 className="text-2xl font-bold text-gray-800">Delete Requests</h1>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search delete requests..."
              value={requestSearchId}
              onChange={(e) => setRequestSearchId(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
          <button
            onClick={searchRequests}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            <FaSearch /> Search
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requestData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FaTrashAlt className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No Delete Requests</h3>
            <p className="text-gray-400 mt-1">All delete requests will appear here</p>
          </div>
        ) : (
          requestData.map((req) => (
            <div
              key={`${req.doc_id}-${req.requester_id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FaFileAlt className="text-blue-500" />
                    {req.document?.title || "Loading..."}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <FaUser className="text-gray-400" />
                      Requested by: <span className="font-medium">{req.requester?.first_name || ""}</span> ({req.requester?.username || "Loading..."})
                    </p>
                    <p className="flex items-center gap-2">
                      <FaExclamationTriangle className="text-orange-400" />
                      Reason: <span className="font-medium">{req.reason || "No reason provided"}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(req.doc_id)}
                    className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaCheck /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(req.requester_id, req.doc_id)}
                    className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaTimes /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DeletedDocuments;
