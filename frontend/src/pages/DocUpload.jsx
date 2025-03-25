import React, { useState, useEffect } from "react";
import config from "../config";
import { useNavigate } from "react-router-dom";
import networkRequests from "../request_helper";

const req_client = new networkRequests();
const DocUpload = () => {
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  // Document upload fields
  const [documentType, setDocumentType] = useState("");
  const [coverType, setCoverType] = useState("");
  const [Cover, setCover] = useState("");
  const [documentFile, setDocument] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [subject, setSubject] = useState("");
  const [coverAcceptType, setCoverAcceptType] = useState("");
  const [documentAcceptType, setDocumentAcceptType] = useState("");
  const [title, setTitle] = useState("");

  // form fields
  const [allDepartments, setAllDepartments] = useState([]);
  const [subjects,setSubjects]= useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (coverType === "img") {
      setCoverAcceptType("image/*");
    } else if (coverType === "link") {
      setCoverAcceptType("link");
    } else if (coverType === "pdf") {
      setCoverAcceptType(".pdf");
    }
    setCover(null);
  }, [coverType]);

  const getAllDepartments = async () => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq("get_department/", "GET", headers);
    const resultJson = await result.json();
    if (result.ok) {
      setAllDepartments(resultJson.departments);
    }
  };
  

  useEffect(() => {
    if (documentType === "pdf") {
      setDocumentAcceptType(".pdf");
    } else if (documentType === "imgs") {
      setDocumentAcceptType("image/*");
    } else if (documentType === "link") {
      setDocumentAcceptType("link");
    } else if (documentType === "mp4") {
      setDocumentAcceptType(".mp4");
    } else if (documentType === "self-guided") {
      setDocumentAcceptType("*");
    }
    setDocument(null);
  }, [documentType]);

  const toggleUploadOptions = () => {
    setShowUploadOptions(!showUploadOptions);
  };
  const handleCoverChange = (event) => {
    setCover(event.target.files);
  };
  const handleDocumentChange = (event) => {
    setDocument(event.target.files);
  };

  const searchSubjects = async () => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq(
      `get_department/?dep_code=${department}`,
      "GET",
      headers
    );
    const resultJson=await result.json();
    console.log(resultJson);
    if(result.ok){
      setSubjects(resultJson.subjects);
    }
  };

  const handleUpload = async () => {
    const data = new FormData();
    data.append("title", title);
    data.append("coverType", coverType);
    data.append("documentType", documentType);
    data.append("isPublic", isPublic);
    if (Cover && Cover.length > 0) {
      data.append("cover", Cover[0]);
    } else {
      data.append("coverLink", Cover);
    }

    // Append documents (multiple files)
    if (documentFile && documentFile.length > 0) {
      Array.from(documentFile).forEach((doc) => {
        data.append("documents", doc); // 'documents' will be an array in the backend
      });
    } else {
      data.append("documentLink", documentFile);
    }
    data.append("category", category);
    data.append("department",department);
    data.append("subject",subject);
    for (let [key, value] of data.entries()) {
      if (!value) {
        alert(`Please fill in the ${key} field.`);
        return false;
      }
    }

    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const response = await req_client.fetchReq(
      "upload-document/",
      "POST",
      headers,
      data
    );
    if (response.ok) {
      alert("document uploaded successfully");
    }
  };

  return (
    <div className="flex flex-col items-center p-4 mb-10">
      {/* Upload Button */}
      <button
        onClick={toggleUploadOptions}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Upload Document & Papers
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
          {coverType === "link" ? (
            <input
              type="text"
              className="mt-4 border p-2 rounded w-full"
              placeholder="Enter the link"
              onChange={(e) => setCover(e.target.value)}
              required
            />
          ) : (
            <input
              type="file"
              className="mt-4 border p-2 rounded w-full"
              multiple
              accept={coverAcceptType}
              onChange={handleCoverChange}
              required
            />
          )}
          <h2 className="text-lg font-semibold text-gray-800">
            Select Document Type
          </h2>

          {/* Dropdown for document type selection */}
          <select
            className="border border-gray-300 rounded-lg p-2 w-full mt-2"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            required
          >
            <option value="" disabled default>
              Select
            </option>
            <option value="pdf">PDF</option>
            <option value="imgs">Multiple Images</option>
            <option value="link">Link</option>
            <option value="mp4">Video</option>
            <option value="self-guided">Self-Guided (All Types)</option>
          </select>

          {/* Document Input */}
          {documentType === "link" ? (
            <input
              type="text"
              className="mt-4 border p-2 rounded w-full"
              placeholder="Enter the link"
              onChange={(e) => setDocument(e.target.value)}
              required
            />
          ) : (
            <input
              type="file"
              className="mt-4 border p-2 rounded w-full"
              multiple
              accept={documentAcceptType}
              onChange={handleDocumentChange}
              required
            />
          )}

          <h2 className="text-lg font-semibold text-gray-800">Title</h2>
          <input
            type="text"
            className="mt-4 border p-2 rounded w-full"
            placeholder="Enter Title"
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <h2 className="text-lg font-semibold text-gray-800">
            Select a Department
          </h2>
          <select
            className="border border-gray-300 rounded-lg p-2 w-full mt-2"
            value={department}
            onFocus={getAllDepartments}
            onChange={(e) => setDepartment(e.target.value)}
            onBlur={(e) => searchSubjects(e.target.value)}
            required
          >
            <option value="other" default>
              Other
            </option>
            {allDepartments.map((item) => (
              <option value={item.dep_code} key={item.dep_code}>{item.dep_name}</option>
            ))}
          </select>

          <h2 className="text-lg font-semibold text-gray-800">
            Select a Subject
          </h2>
          <select
            className="border border-gray-300 rounded-lg p-2 w-full mt-2"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          >
            <option value="other" default>
              Other
            </option>
            {subjects.length >0 &&
            subjects.map((item) => (
              <option value={item.code} key={item.code}>{item.name}</option>
            ))
            }
          </select>

          <h2 className="text-lg font-semibold text-gray-800">
            Select Document Category
          </h2>
          <select
            className="border border-gray-300 rounded-lg p-2 w-full mt-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="research_paper">Research Paper</option>
            <option value="book">Book</option>
            <option value="article">Article</option>
            <option value="question_bank">Question Bank</option>
            <option value="mock">Mock Test</option>
            <option value="other">Other</option>
          </select>

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
            onClick={handleUpload}
            className="bg-green-600 text-white px-4 py-2 mt-4 rounded-lg hover:bg-green-700 transition"
          >
            Upload
          </button>
        </div>
      )}
    </div>
  );
};

export default DocUpload;
