import { React, useEffect, useState } from "react";
import networkRequests from "../request_helper";
import SearchDocument from "./SearchDocuments";

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
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Deleted Documents
          </h2>
        </div>

        {/* Search Groups */}
        <div className="mb-4 flex flex-row">
          <input
            type="text"
            placeholder="Search deletes..."
            value={requestSearchId}
            onChange={(e) => setRequestSearchId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-5"
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-1 transition-all duration-300 hover:scale-105"
            onClick={searchRequests}
          >
            Search
          </button>
        </div>
        <div className="space-y-4">
        
          {requestData.map((req) => (
            <div
              key={`${req.doc_id}-${req.requester_id}`}
              className="border p-4 rounded"
            >
              <h3 className="text-lg font-semibold">
                {req.document?.title || "Loading..."}
              </h3>
              <p>
                Requested by: {req.requester?.first_name || ""} -{" "}
                {req.requester?.username || "Loading..."}
              </p>
              <p>
                Reason : {req.reason || ""}
                </p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() =>
                    handleApprove(req.doc_id)
                  }
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(req.requester_id,req.doc_id)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DeletedDocuments;
