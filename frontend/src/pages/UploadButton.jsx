import React, { useState } from "react";

const UploadButton = () => {
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [documentType, setDocumentType] = useState("cover-page");
  const [isPublic, setIsPublic] = useState(true);

  // Toggle dropdown visibility
  const toggleUploadOptions = () => {
    setShowUploadOptions(!showUploadOptions);
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  // Handle file upload
  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }

    console.log("Uploading:", selectedFiles);
    console.log("Document Type:", documentType);
    console.log("Access Type:", isPublic ? "Public" : "Private");

    alert("Files uploaded successfully!");
    setShowUploadOptions(false); // Hide options after upload
  };

  return (
    <div className="flex flex-col items-center p-4">
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
          <h2 className="text-lg font-semibold text-gray-800">Select Document Type</h2>

          {/* Dropdown for document type selection */}
          <select
            className="border border-gray-300 rounded-lg p-2 w-full mt-2"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          >
            <option value="cover-page">Cover Page (Image, Links, PDF)</option>
            <option value="documents">Documents (PDF, Multiple Images)</option>
            <option value="videos">Videos (MP4)</option>
            <option value="self-guided">Self-Guided (All Types)</option>
          </select>

          {/* File Input */}
          <input
            type="file"
            className="mt-4 border p-2 rounded w-full"
            multiple
            accept={
              documentType === "cover-page"
                ? ".pdf,.jpg,.jpeg,.png"
                : documentType === "documents"
                ? ".pdf,.jpg,.jpeg,.png"
                : documentType === "videos"
                ? ".mp4"
                : "*"
            }
            onChange={handleFileChange}
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
            className="bg-green-600 text-white px-4 py-2 mt-4 rounded-lg hover:bg-green-700 transition"
          >
            Upload
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadButton;
