import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import networkRequests from "../request_helper";

const req_client = new networkRequests();
const DocUpload = () => {
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  // Document upload fields
  const [coverAcceptType, setCoverAcceptType] = useState("");
  const [documentAcceptType, setDocumentAcceptType] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [coverType, setCoverType] = useState("");
  const [coverLink, setCoverLink] = useState("");
  const [documentLink, setDocumentLink] = useState("");
  const [Cover, setCover] = useState("");
  const [documentFile, setDocument] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("other");
  const [subject, setSubject] = useState("other");
  const [title, setTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [authorsList, setAuthorList] = useState([]);
  const[hsnNumber,setHsnNumber] = useState("");
  
  // form fields
  const [allCategories,setAllCategories] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  const getAllDepartments = async () => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq("get_department/", "GET", headers);
    const resultJson = await result.json();
    if (result.ok) {
      setAllDepartments(resultJson.departments);
      setSubject("other");
    }
  };

  const getAllCategories = async() =>{
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq("get_categories/", "GET", headers);
    const resultJson = await result.json();
    if (result.ok) {
      setAllCategories(resultJson.categories);
    }
  }

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

  const searchSubjects = async (department) => {
    setSubject("other");
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq(
      `get_department/?dep_code=${department}`,
      "GET",
      headers
    );
    const resultJson = await result.json();
    if (result.ok) {
      setSubjects(resultJson.subjects);
    }
    else{
      setSubjects([]);
    }
  };

  const removeAuther = (author) => {
    setAuthorList(authorsList.filter((a) => a !== author));
  };

  const addAuthor = () => {
    if (newAuthor.trim() !== "" && !authorsList.includes(newAuthor.trim())) {
      setAuthorList([...authorsList, newAuthor.trim()]);
      setNewAuthor("");
    }
  };


  const handleUpload = async () => {
    // Validation
    if (!title) { alert("Please enter a title"); return; }
    if (!coverType) { alert("Please select cover type"); return; }
    if (!documentType) { alert("Please select document type"); return; }
    if (!category) { alert("Please select a category"); return; }
    if (!department) { alert("Please select a department"); return; }
    if (!subject) { alert("Please select a subject"); return; }
    if (!hsnNumber) { alert("Please enter HSN number"); return; }
    if (authorsList.length === 0) { alert("Please add at least one author"); return; }
    
    if (coverType !== "link" && (!Cover || Cover.length === 0)) {
      alert("Please select a cover file"); return;
    }
    if (coverType === "link" && !coverLink) {
      alert("Please enter cover link"); return;
    }
    if (documentType !== "link" && (!documentFile || documentFile.length === 0)) {
      alert("Please select document files"); return;
    }
    if (documentType === "link" && !documentLink) {
      alert("Please enter document link"); return;
    }

    const data = new FormData();
    data.append("title", title);
    data.append("coverType", coverType);
    data.append("documentType", documentType);
    data.append("isPublic", isPublic);
    
    if (Cover && Cover.length > 0 && coverType !== "link") {
      data.append("cover", Cover[0]);
    } else if (coverType === "link") {
      data.append("coverLink", coverLink);
    }

    // Append documents (multiple files)
    if (documentFile && documentFile.length > 0 && documentType !== "link") {
      Array.from(documentFile).forEach((doc) => {
        data.append("documents", doc);
      });
    } else if (documentType === "link") {
      data.append("documentLink", documentLink);
    }
    
    data.append("category", category);
    data.append("department", department);
    data.append("subject", subject);
    data.append('authors', authorsList.join(','));
    data.append('hsnNumber', hsnNumber);

    req_client.reload_tokens();
    
    if (!req_client.accessToken) {
      alert("Please login to upload documents");
      return;
    }
    
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    
    console.log("Uploading to:", req_client.baseUrl + "upload_document/");
    console.log("Token:", req_client.accessToken ? "Present" : "Missing");
    
    try {
      const response = await req_client.fetchReq(
        "upload_document/",
        "POST",
        headers,
        data
      );
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        alert("Document uploaded successfully!");
        setTitle("");
        setCover("");
        setCoverLink("");
        setDocument("");
        setDocumentLink("");
        setDepartment("");
        setSubject("");
        setCoverType("");
        setDocumentType("");
        setCategory("");
        setAuthorList([]);
        setHsnNumber("");
        setShowUploadOptions(false);
      } else {
        const resultJson = await response.json();
        console.error("Upload failed:", resultJson);
        alert(resultJson.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Network error during upload. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center p-4 mb-10">
      {/* Upload Button */}
      <button
        onClick={toggleUploadOptions}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:scale-105 hover:shadow-lg 105 :bg-blue-700 transition"
      >
        Upload Document & Papers
      </button>

      {/* Upload Options (Visible only when button is clicked) */}
      {showUploadOptions && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-lg font-semibold text-gray-800 mt-5">
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
          <h2 className="text-lg font-semibold text-gray-800 mt-5">
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
            <option value="*">Self-Guided (All Types)</option>
          </select>

          {/* Document Input */}
          <input
            type="text"
            className={`mt-4 border p-2 rounded w-full ${
              documentType === "link" ? "" : "hidden"
            }`}
            placeholder="Enter the link"
            value={documentLink || ""}
            onChange={(e) => setDocumentLink(e.target.value)}
            required
          />
          <input
            type="file"
            className={`mt-4 border p-2 rounded w-full ${
              documentType === "link" ? "hidden" : ""
            }`}
            multiple
            accept={documentAcceptType}
            onChange={handleDocumentChange}
            required
          />

          <h2 className="text-lg font-semibold text-gray-800 mt-5">Title</h2>
          <input
            type="text"
            className="mt-4 border p-2 rounded w-full"
            placeholder="Enter Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <h2 className="text-lg font-semibold text-gray-800 mt-5">
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
              <option value={item.dep_code} key={item.dep_code}>
                {item.dep_name}
              </option>
            ))}
          </select>

          <h2 className="text-lg font-semibold text-gray-800 mt-5">
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
            {subjects.length > 0 &&
              subjects.map((item) => (
                <option value={item.code} key={item.code}>
                  {item.name}
                </option>
              ))}
          </select>

          <h2 className="text-lg font-semibold text-gray-800 mt-5">
            Select Document Category
          </h2>
          <select
            className="border border-gray-300 rounded-lg p-2 w-full mt-2"
            value={category}
            onFocus={getAllCategories}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="" disabled default>
              Select
            </option>
            {allCategories.map((item) => (
              <option value={item.code} key={item.code}>
                {item.name}
              </option>
            ))}
          </select>
          <h2 className="text-lg font-semibold text-gray-800 mt-5">
            Authors
          </h2>
          <div className="flex flex-col gap-2 top-10">
            {authorsList &&
              authorsList.length > 0 &&
              authorsList.map((author) => (
                <div
                  className="flex items-center justify-between text-blue-600 cursor-pointer"
                  onClick={() => removeAuther(author)}
                  key={author}
                >
                  <span>{author}</span>
                  <span className="text-gray-700">X</span>
                </div>
              ))}
          </div>

          <input
            type="text"
            className="mt-4 border p-2 rounded w-full"
            placeholder="Enter author name"
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            required
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-lg hover:bg-blue-700 transition"
            onClick={addAuthor}
          >
            Add Author
          </button>

          <h2 className="text-lg font-semibold text-gray-800 mt-5">HSN number</h2>
          <input
            type="text"
            className="mt-4 border p-2 rounded w-full"
            placeholder="Enter HSN number"
            value={hsnNumber}
            onChange={(e) => setHsnNumber(e.target.value)}
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
            onClick={handleUpload}
            className="bg-green-500 text-white px-4 py-2 mt-4 rounded-lg hover:bg-green-700 transition"
          >
            Upload
          </button>
        </div>
      )}
    </div>
  );
};

export default DocUpload;
