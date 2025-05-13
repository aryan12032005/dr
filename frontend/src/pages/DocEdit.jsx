import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import networkRequests from "../request_helper";

const req_client = new networkRequests();
const DocEdit = (doc) => {
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const navigate = useNavigate();
  // Document upload fields
  const [coverAcceptType, setCoverAcceptType] = useState("");
  const [coverType, setCoverType] = useState("");
  const [coverLink, setCoverLink] = useState("");
  const [Cover, setCover] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (coverType === "img") {
      setCoverLink("");
      setCoverAcceptType("image/*");
    } else if (coverType === "link") {
      setCoverAcceptType("link");
    } else if (coverType === "pdf") {
      setCoverLink("");
      setCoverAcceptType(".pdf");
    }
    setCover(null);
  }, [coverType]);

  const toggleUploadOptions = () => {
    setShowUploadOptions(!showUploadOptions);
  };
  const handleCoverChange = (event) => {
    setCover(event.target.files);
  };

  const fetchDocDetails = async (doc_id) => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const response = await req_client.fetchReq(
      `get_document/?doc_id=${doc_id}`,
      "GET",
      headers
    );
    if (response.ok) {
      let doc_details = await response.json();
      doc_details = doc_details.document;
      setCoverType(doc_details.coverType);
      if (coverType == "link") {
        setCoverLink(doc_details.coverLink);
      }
      setTitle(doc_details.title);
      setIsPublic(doc_details.isPublic === "true");
      setCategory(doc_details.category);
    } else return false;
  };
  useEffect(() => {
    fetchDocDetails(doc.doc_id);
  }, [navigate]);

  const handleUpload = async (doc_id) => {
    const data = new FormData();
    data.append("title", title);
    data.append("coverType", coverType);
    data.append("isPublic", isPublic);
    data.append("category", category);
    if (Cover && Cover.length > 0 && coverType != "link") {
      data.append("cover", Cover[0]);
    } else if (coverLink !== "") {
      data.append("coverLink", coverLink);
    }
    for (let [key, value] of data.entries()) {
      if (!value && !key==='cover') {
        alert(`Please fill in the ${key} field.`);
        return false;
      }
    }
    console.log(data);

    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const response = await req_client.fetchReq(
      `update_document/?doc_id=${doc_id}`,
      "POST",
      headers,
      data
    );
    if (response.ok) {
      alert("document updated successfully");
    } else {
      alert("error updating");
    }
  };

  return (
    <div className="flex flex-col items-center p-2">
      {/* Upload Button */}
      <button
        onClick={toggleUploadOptions}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:scale-105 hover:shadow-lg 105 :bg-blue-700 transition"
      >
        {(showUploadOptions) ? "Hide Edit" : "Edit document"}
      </button>

      {/* Upload Options (Visible only when button is clicked) */}
      {showUploadOptions && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-lg font-semibold text-gray-800">
            Select Cover Type
          </h2>

          {/* Dropdown for cover type selection */}
          <select
            className="border border-gray-300 rounded-lg p-2 w-full mt-2"
            value={coverType}
            onChange={(e) => setCoverType(e.target.value)}
          >
            <option value="" default disabled>
              Select
            </option>
            <option value="img">Image</option>
            <option value="pdf">PDF</option>
            <option value="link">Link</option>
          </select>

          {/* Cover Input */}
          <input
            type="text"
            className={`mt-4 border p-2 rounded w-full ${
              coverType === "link" ? "" : "hidden"
            }`}
            placeholder="Enter the link"
            value={coverLink || ""}
            onChange={(e) => setCoverLink(e.target.value)}
            required
          />
          <input
            type="file"
            className={`mt-4 border p-2 rounded w-full ${
              coverType === "link" ? "hidden" : ""
            }`}
            multiple
            accept={coverAcceptType}
            onChange={handleCoverChange}
            required
          />
          <h2 className="text-lg font-semibold text-gray-800">Title</h2>
          <input
            type="text"
            className="mt-4 border p-2 rounded w-full"
            placeholder="Enter Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Toggle for Public/Private */}
          <div className="mt-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
              />
              <span className="ml-2">{isPublic ? "Public" : "Private"}</span>
            </label>
          </div>

          {/* Confirm Upload Button */}
          <button
            onClick={() => handleUpload(doc.doc_id)}
            className="bg-green-600 text-white px-4 py-2 mt-4 rounded-lg hover:bg-green-700 transition"
          >
            Update
          </button>
        </div>
      )}
    </div>
  );
};

export default DocEdit;
