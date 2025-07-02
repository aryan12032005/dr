import React, { useState, useRef, useEffect } from "react";
import networkRequests from "../request_helper";
import { saveAs } from "file-saver";
import DocEdit from "./DocEdit.jsx";
import { useNavigate } from "react-router-dom";

const req_client = new networkRequests();

const SearchDocument = ({ userStatus }) => {
  const navigate = useNavigate();
  const styles = {
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "8px",
      maxWidth: "80%",
      maxHeight: "90vh",
      overflowY: "auto",
      position: "relative",
    },
    closeButton: {
      position: "absolute",
      top: "10px",
      right: "10px",
      backgroundColor: "grey",
      color: "white",
      border: "none",
      padding: "5px 10px",
      cursor: "pointer",
    },
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [viewingDocument, setViewDocument] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [allDepartments, setAllDepartments] = useState([]);
  const filterRef = useRef(null);

  const [filters, setFilters] = useState({
    docType: "",
    department: "",
    sortOrder: 0,
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleFilter = () => setIsFilterOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  const getAllDepartments = async () => {
    req_client.reload_tokens();
    const headers = {
      // Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq("get_department/", "GET", headers);
    const resultJson = await result.json();
    if (result.ok) {
      setAllDepartments(resultJson.departments);
    }
  };

  const searchDocument = async () => {
    const headers = {
      "Content-Type": "application/json",
    };
    const response = await req_client.fetchReq(
      `search_document/?querry=${searchTerm}&docType=${filters.docType}&department=${filters.department}&order=${filters.sortOrder}`,
      "GET",
      headers
    );

    if (response.ok) {
      const data = await response.json();
      setFilteredDocuments(data.documents);
    } else if (response.status === 404) {
      const responseJson = await response.json();
      setFilteredDocuments([]);
      alert(responseJson.message);
    }
  };

  const openDoc = async (doc_id) => {
    req_client.reload_tokens();
    let headers={}
    if (req_client.accessToken){
      headers = {
        Authorization: `Bearer ${req_client.accessToken}`,
        "Content-Type": "application/json",
      };
    }
    else{
      headers = {
        "Content-Type": "application/json",
      };
    }

    const result = await req_client.fetchReq(
      `get_document/?doc_id=${doc_id}`,
      "GET",
      headers
    );
    await getAllDepartments();
    if (result.ok) {
      const resultJson = await result.json();
      const department = allDepartments.find(obj => obj.dep_code === resultJson.document.department);
      resultJson.document.department = department?.dep_name;
      resultJson.document.subject = department?.subjects?.find(obj => obj.code === resultJson.document.subject)?.name;
      setViewDocument(resultJson.document);
      openModal();
    } else {
      alert("please login to view documents");
    }
  };

  const downloadDoc = async (id) => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };

    const result = await req_client.fetchReq(
      `download_doc/?doc_id=${id}`,
      "GET",
      headers
    );

    if (result.ok) {
      const contentType = result.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const resultJson = await result.json();
        alert(resultJson.message);
      } else {
        const contentDisposition = result.headers.get("Content-Disposition");
        let filename = "download.zip";
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+?)"/);
          if (match && match.length > 1) {
            filename = match[1];
          }
        }
        saveAs(await result.blob(), filename);
      }
    } else if (result.status == 400) {
      const resultJson = await result.json();
      if (!resultJson?.isPublic) {
        const confirmation = window.confirm(
          "Document is private, request access?"
        );
        if (confirmation) {
          reqAccess(id);
        }
      }
    }
  };

  const deleteDoc = async (doc_id) => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };

    const result = await req_client.fetchReq(
      `delete_document/?doc_id=${doc_id}`,
      "DELETE",
      headers
    );
    if (result.ok) {
      const resultJson = await result.json();
      alert("document deleted");
      searchDocument();
    } else {
      alert("error deleting document");
    }
  };

  const reqAccess = async (id) => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq(
      `request_access/`,
      "POST",
      headers,
      JSON.stringify({ doc_id: id })
    );
    if (result.ok) {
      alert("Document requested");
    } else if (result.status == 409) {
      alert("Document already requested");
    } else {
      alert("something went wrong");
    }
  };

  const Modal = ({ onClose, children }) => (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <button onClick={onClose} style={styles.closeButton}>
          X
        </button>
        {children}
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-4 relative flex flex-col items-center">
      <div className="bg-gray-200 p-1 rounded-full w-fit flex">
        <button
          onClick={() => navigate("/search-doc")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all bg-blue-500 text-white shadow`}
        >
          Search Docs
        </button>
        <button
          onClick={() => navigate("/my-groups")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all text-gray-700`}
        >
          View Groups
        </button>
      </div>
      <h2 className="text-xl font-semibold mb-2 text-gray-700 mt-5">
        Search Documents
      </h2>

      <input
        type="text"
        placeholder="Search documents..."
        className="border rounded-md px-3 py-2 mb-4 w-full shadow-sm focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="flex justify-between items-center">
        <button
          onClick={searchDocument}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded left-20 absolute"
        >
          Search
        </button>

        <div className="flex flex-col m-10" ref={filterRef}>
          <button
            onClick={toggleFilter}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded absolute right-20"
          >
            Filter
          </button>
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4 space-y-2">
              <div>
                <select
                  className="border border-gray-300 rounded-lg p-2 w-full mt-2"
                  value={filters.docType}
                  onChange={(e) =>
                    setFilters((filters) => ({
                      ...filters,
                      docType: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="" disabled default>
                    Document Type
                  </option>
                  <option value="pdf">PDF</option>
                  <option value="imgs">Multiple Images</option>
                  <option value="link">Link</option>
                  <option value="mp4">Video</option>
                  <option value="*">Self-Guided (All Types)</option>
                </select>
              </div>
              <div>
                <select
                  className="border border-gray-300 rounded-lg p-2 w-full mt-2"
                  value={filters.department}
                  onFocus={getAllDepartments}
                  onChange={(e) =>
                    setFilters((filters) => ({
                      ...filters,
                      department: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="" disabled default>
                    Department
                  </option>
                  {allDepartments.length > 0 &&
                    allDepartments.map((dept) => (
                      <option value={dept.dep_code} key={dept.dep_code}>
                        {dept.dep_name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <select
                  value={filters.sortOrder}
                  onChange={(e) =>
                    setFilters({ ...filters, sortOrder: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-1 mt-4"
                >
                  <option value="-1">Latest First</option>
                  <option value="1">Oldest First</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-600 mt-4">
        Total results: {filteredDocuments.length}
      </p>

      <div className="rounded-lg overflow-hidden mt-4 justify-between w-full">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-row space-x-10 items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {doc.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Uploaded on : {doc.date}
                    <br />
                    File type: {doc.docType}
                  </p>
                </div>
                <div className="flex space-x-4 right-10 absolute">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => openDoc(doc.id)}
                  >
                    View
                  </button>
                  {userStatus !== -1 && (
                    <button
                      className="text-green-500 hover:text-green-700"
                      onClick={() => downloadDoc(doc.id)}
                    >
                      Download
                    </button>
                  )}
                  {((userStatus.is_admin && userStatus.is_admin == true) ||
                    (userStatus.user_id &&
                      userStatus.user_id == doc.owner)) && (
                    <button
                      className="text-green-500 hover:text-green-700"
                      onClick={() => deleteDoc(doc.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              {((userStatus.is_admin && userStatus.is_admin == true) ||
                (userStatus.user_id && userStatus.user_id == doc.owner)) && (
                <DocEdit doc_id={doc.id} />
              )}
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            No documents found.
          </div>
        )}
      </div>

      {isModalOpen && viewingDocument && (
        <Modal onClose={closeModal}>
          <div className="flex flex-col items-center p-6">
            <h2 className="text-2xl font-bold text-blue-800">
              {viewingDocument?.title}
            </h2>
            <p className="text-gray-600">
              <strong>Category: </strong> {viewingDocument?.category}
            </p>
            <p className="text-gray-600">
              <strong>Document Type: </strong> {viewingDocument?.docType}
            </p>
            <p className="text-gray-600">
              <strong>Department: </strong> { viewingDocument?.department }
            </p>
            <p className="text-gray-600">
              <strong>Subject: </strong> { viewingDocument?.subject }
            </p>
            <p className="text-gray-600">
              <strong>Authors: </strong> {viewingDocument?.authors}
            </p>
            <p className="text-gray-600">
              <strong>HSN number: </strong> {viewingDocument?.hsnNumber}
            </p>
            <p className="text-gray-500 text-sm">
              <strong>Uploaded On: </strong> {viewingDocument?.createDate}
            </p>
            {viewingDocument?.isPublic === "true" ? (
              <p className="text-green-800">
                <strong>Public</strong>
              </p>
            ) : (
              <p className="text-red-500">
                <strong>Private</strong>
              </p>
            )}

            {viewingDocument.cover &&
            viewingDocument?.coverType.includes("pdf") ? (
              <iframe
                src={`data:application/pdf;base64,${viewingDocument?.cover}`}
                className="max-w-[80vw] min-w-[50vw] min-h-[80vh] rounded-lg shadow-lg mt-5"
              ></iframe>
            ) : viewingDocument?.coverType.includes("link") ? (
              <>
              <h1>Document Link : </h1> <a href={viewingDocument?.coverLink} target="_blank" className="text-blue-500 hover:scale-110 transition-transform duration-300">{viewingDocument?.coverLink}</a>
              </>
            ) : (
              <img
                src={`data:${viewingDocument?.coverType};base64,${viewingDocument?.cover}`}
                style={{ width: "700px", height: "100%" }}
                alt={viewingDocument?.title}
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SearchDocument;
