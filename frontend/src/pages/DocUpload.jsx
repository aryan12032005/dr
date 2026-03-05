import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import networkRequests from "../request_helper";

const req_client = new networkRequests();

// Icons as simple SVG components
const UploadIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const VideoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const DocUpload = () => {
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [dragActive, setDragActive] = useState({ cover: false, document: false });

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
  const [accessionNumber, setAccessionNumber] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Refs for file inputs
  const coverInputRef = useRef(null);
  const documentInputRef = useRef(null);

  // form fields
  const [allCategories, setAllCategories] = useState([]);
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

  const getAllCategories = async () => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq("get_categories/", "GET", headers);
    const resultJson = await result.json();
    if (result.ok) {
      setAllCategories(resultJson.categories);
    }
  };

  useEffect(() => {
    getAllDepartments();
    getAllCategories();
  }, []);

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
    setActiveStep(1);
  };

  const handleCoverChange = (event) => {
    setCover(event.target.files);
  };

  const handleDocumentChange = (event) => {
    setDocument(event.target.files);
  };

  // Drag and drop handlers
  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive({ ...dragActive, [type]: true });
    } else if (e.type === "dragleave") {
      setDragActive({ ...dragActive, [type]: false });
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({ ...dragActive, [type]: false });
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (type === "cover") {
        setCover(e.dataTransfer.files);
      } else {
        setDocument(e.dataTransfer.files);
      }
    }
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
    if (result.ok && resultJson.subjects) {
      // Convert subjects object to array format
      // subjects is an object like { "Category": ["Subject1", "Subject2"] }
      const subjectsArray = [];
      Object.entries(resultJson.subjects).forEach(([category, subjectsList]) => {
        if (Array.isArray(subjectsList)) {
          subjectsList.forEach(subjectName => {
            subjectsArray.push({ code: subjectName, name: subjectName, category });
          });
        }
      });
      setSubjects(subjectsArray);
    } else {
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAuthor();
    }
  };

  const handleUpload = async () => {
    const data = new FormData();
    data.append("title", title);
    data.append("coverType", coverType);
    data.append("documentType", documentType);
    data.append("isPublic", isPublic);
    if (Cover && Cover.length > 0 && coverType != "link") {
      data.append("cover", Cover[0]);
    } else {
      data.append("coverLink", coverLink);
    }

    if (documentFile && documentFile.length > 0 && documentType != "link") {
      Array.from(documentFile).forEach((doc) => {
        data.append("documents", doc);
      });
    } else {
      data.append("documentLink", documentLink);
    }
    data.append("category", category);
    data.append("department", department);
    data.append("subject", subject);
    data.append("authors", authorsList);
    data.append("accessionNumber", accessionNumber);

    if (!title) {
      alert("Please fill in the title field.");
      return false;
    }
    if (!category) {
      alert("Please select a category.");
      return false;
    }

    setIsUploading(true);
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const response = await req_client.fetchReq(
      "upload_document/",
      "POST",
      headers,
      data
    );
    setIsUploading(false);

    if (response.ok) {
      alert("Document uploaded successfully!");
      setTitle("");
      setCover("");
      setCoverLink("");
      setDocument("");
      setDocumentLink("");
      setDepartment("other");
      setSubject("other");
      setCoverType("");
      setDocumentType("");
      setAuthorList([]);
      setAccessionNumber("");
      setCategory("");
      setShowUploadOptions(false);
    } else {
      const resultJson = await response.json();
      alert(resultJson.message);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "img":
      case "imgs":
        return <ImageIcon />;
      case "pdf":
        return <FileIcon />;
      case "link":
        return <LinkIcon />;
      case "mp4":
        return <VideoIcon />;
      default:
        return <FileIcon />;
    }
  };

  const steps = [
    { id: 1, title: "Files", description: "Upload cover & document" },
    { id: 2, title: "Details", description: "Title & classification" },
    { id: 3, title: "Authors", description: "Add contributors" },
  ];

  const canProceedToStep2 = coverType && documentType;
  const canProceedToStep3 = title && category;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Upload</h1>
          <p className="text-gray-600">Upload and manage your documents and papers</p>
        </div>

        {/* Main Upload Card */}
        {!showUploadOptions ? (
          <div
            onClick={toggleUploadOptions}
            className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 group shadow-sm"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors text-blue-600">
              <UploadIcon />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Click to Upload New Document
            </h2>
            <p className="text-gray-500 text-sm">
              Supports PDF, Images, Videos, and Links
            </p>
          </div>
        ) : (
          <div className="bg-white backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
            {/* Progress Steps */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between max-w-xl mx-auto">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center cursor-pointer ${
                        activeStep >= step.id ? "text-blue-600" : "text-gray-400"
                      }`}
                      onClick={() => {
                        if (step.id === 1) setActiveStep(1);
                        else if (step.id === 2 && canProceedToStep2) setActiveStep(2);
                        else if (step.id === 3 && canProceedToStep2 && canProceedToStep3) setActiveStep(3);
                      }}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                          activeStep > step.id
                            ? "bg-green-500 text-white"
                            : activeStep === step.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {activeStep > step.id ? <CheckIcon /> : step.id}
                      </div>
                      <div className="ml-3 hidden sm:block">
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="text-xs text-gray-500">{step.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-12 sm:w-20 h-0.5 mx-2 sm:mx-4 ${
                          activeStep > step.id ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 sm:p-8">
              {/* Step 1: File Upload */}
              {activeStep === 1 && (
                <div className="space-y-8">
                  {/* Cover Upload Section */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                        <ImageIcon />
                      </span>
                      Cover Image
                    </h3>

                    {/* Cover Type Selection */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { value: "img", label: "Image", icon: <ImageIcon /> },
                        { value: "pdf", label: "PDF", icon: <FileIcon /> },
                        { value: "link", label: "Link", icon: <LinkIcon /> },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setCoverType(option.value)}
                          className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                            coverType === option.value
                              ? "border-purple-500 bg-purple-100 text-purple-600"
                              : "border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700 bg-white"
                          }`}
                        >
                          {option.icon}
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Cover File/Link Input */}
                    {coverType === "link" ? (
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                          placeholder="Enter cover image URL..."
                          value={coverLink || ""}
                          onChange={(e) => setCoverLink(e.target.value)}
                        />
                      </div>
                    ) : coverType ? (
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer bg-white ${
                          dragActive.cover
                            ? "border-purple-500 bg-purple-50"
                            : Cover && Cover.length > 0
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        onDragEnter={(e) => handleDrag(e, "cover")}
                        onDragLeave={(e) => handleDrag(e, "cover")}
                        onDragOver={(e) => handleDrag(e, "cover")}
                        onDrop={(e) => handleDrop(e, "cover")}
                        onClick={() => coverInputRef.current?.click()}
                      >
                        <input
                          ref={coverInputRef}
                          type="file"
                          className="hidden"
                          accept={coverAcceptType}
                          onChange={handleCoverChange}
                        />
                        {Cover && Cover.length > 0 ? (
                          <div className="text-green-600">
                            <CheckIcon />
                            <p className="mt-2 font-medium">{Cover[0].name}</p>
                            <p className="text-sm text-gray-500">
                              {(Cover[0].size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            <UploadIcon />
                            <p className="mt-2 text-gray-600">
                              Drag & drop or{" "}
                              <span className="text-purple-600 font-medium">browse</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {coverType === "img" ? "PNG, JPG, GIF" : "PDF files"}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        Select a cover type above
                      </div>
                    )}
                  </div>

                  {/* Document Upload Section */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <FileIcon />
                      </span>
                      Document Files
                    </h3>

                    {/* Document Type Selection */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                      {[
                        { value: "pdf", label: "PDF", icon: <FileIcon /> },
                        { value: "imgs", label: "Images", icon: <ImageIcon /> },
                        { value: "link", label: "Link", icon: <LinkIcon /> },
                        { value: "mp4", label: "Video", icon: <VideoIcon /> },
                        { value: "*", label: "All Types", icon: <FileIcon /> },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setDocumentType(option.value)}
                          className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border transition-all ${
                            documentType === option.value
                              ? "border-blue-500 bg-blue-100 text-blue-600"
                              : "border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700 bg-white"
                          }`}
                        >
                          {option.icon}
                          <span className="text-xs font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Document File/Link Input */}
                    {documentType === "link" ? (
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          placeholder="Enter document URL..."
                          value={documentLink || ""}
                          onChange={(e) => setDocumentLink(e.target.value)}
                        />
                      </div>
                    ) : documentType ? (
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer bg-white ${
                          dragActive.document
                            ? "border-blue-500 bg-blue-50"
                            : documentFile && documentFile.length > 0
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        onDragEnter={(e) => handleDrag(e, "document")}
                        onDragLeave={(e) => handleDrag(e, "document")}
                        onDragOver={(e) => handleDrag(e, "document")}
                        onDrop={(e) => handleDrop(e, "document")}
                        onClick={() => documentInputRef.current?.click()}
                      >
                        <input
                          ref={documentInputRef}
                          type="file"
                          className="hidden"
                          multiple
                          accept={documentAcceptType}
                          onChange={handleDocumentChange}
                        />
                        {documentFile && documentFile.length > 0 ? (
                          <div className="text-green-600">
                            <CheckIcon />
                            <p className="mt-2 font-medium">
                              {documentFile.length} file(s) selected
                            </p>
                            <div className="mt-2 space-y-1">
                              {Array.from(documentFile)
                                .slice(0, 3)
                                .map((file, i) => (
                                  <p key={i} className="text-sm text-gray-600">
                                    {file.name}
                                  </p>
                                ))}
                              {documentFile.length > 3 && (
                                <p className="text-sm text-gray-500">
                                  +{documentFile.length - 3} more
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            <UploadIcon />
                            <p className="mt-2 text-gray-600">
                              Drag & drop or{" "}
                              <span className="text-blue-600 font-medium">browse</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Multiple files supported
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        Select a document type above
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-4">
                    <button
                      onClick={toggleUploadOptions}
                      className="px-6 py-2.5 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => canProceedToStep2 && setActiveStep(2)}
                      disabled={!canProceedToStep2}
                      className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                        canProceedToStep2
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Document Details */}
              {activeStep === 2 && (
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder="Enter document title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Two Column Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Department */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <select
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                        value={department}
                        onChange={(e) => {
                          setDepartment(e.target.value);
                          searchSubjects(e.target.value);
                        }}
                      >
                        <option value="other">Other</option>
                        {allDepartments.map((item) => (
                          <option value={item.dep_code} key={item.dep_code}>
                            {item.dep_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <select
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      >
                        <option value="other">Other</option>
                        {subjects.length > 0 &&
                          subjects.map((item) => (
                            <option value={item.code} key={item.code}>
                              {item.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {allCategories.map((item) => (
                        <option value={item.code} key={item.code}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Accession Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accession Number
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder="Enter accession number (optional)"
                      value={accessionNumber}
                      onChange={(e) => setAccessionNumber(e.target.value)}
                    />
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setActiveStep(1)}
                      className="px-6 py-2.5 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => canProceedToStep3 && setActiveStep(3)}
                      disabled={!canProceedToStep3}
                      className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                        canProceedToStep3
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Authors & Submit */}
              {activeStep === 3 && (
                <div className="space-y-6">
                  {/* Authors Section */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Authors</h3>

                    {/* Added Authors */}
                    {authorsList.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {authorsList.map((author) => (
                          <span
                            key={author}
                            className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm"
                          >
                            {author}
                            <button
                              onClick={() => removeAuther(author)}
                              className="hover:text-red-500 transition-colors"
                            >
                              <CloseIcon />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Add Author Input */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="Enter author name..."
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                      <button
                        onClick={addAuthor}
                        className="px-4 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all flex items-center gap-2"
                      >
                        <PlusIcon />
                        <span className="hidden sm:inline">Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Visibility Toggle */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Document Visibility
                    </h3>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setIsPublic(true)}
                        className={`flex-1 p-4 rounded-lg border transition-all ${
                          isPublic
                            ? "border-green-500 bg-green-100 text-green-700"
                            : "border-gray-300 text-gray-500 hover:border-gray-400 bg-white"
                        }`}
                      >
                        <div className="text-2xl mb-2">🌐</div>
                        <p className="font-medium">Public</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Visible to everyone
                        </p>
                      </button>
                      <button
                        onClick={() => setIsPublic(false)}
                        className={`flex-1 p-4 rounded-lg border transition-all ${
                          !isPublic
                            ? "border-yellow-500 bg-yellow-100 text-yellow-700"
                            : "border-gray-300 text-gray-500 hover:border-gray-400 bg-white"
                        }`}
                      >
                        <div className="text-2xl mb-2">🔒</div>
                        <p className="font-medium">Private</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Restricted access
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Upload Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Title</p>
                        <p className="text-gray-900 font-medium truncate">{title || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Category</p>
                        <p className="text-gray-900 font-medium">
                          {allCategories.find((c) => c.code === category)?.name || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Cover Type</p>
                        <p className="text-gray-900 font-medium capitalize">{coverType || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Document Type</p>
                        <p className="text-gray-900 font-medium capitalize">
                          {documentType === "*" ? "All Types" : documentType || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setActiveStep(2)}
                      className="px-6 py-2.5 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className={`px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        isUploading
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25"
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <UploadIcon />
                          Upload Document
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocUpload;
