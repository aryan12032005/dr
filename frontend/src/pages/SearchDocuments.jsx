import React, { useState, useEffect } from "react";
import networkRequests from "../request_helper";

const req_client = new networkRequests();
const SearchDocument = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDocuments, setDocuments] = useState({});
  const [viewingDocument, setViewDocument] = useState(null);

  const searchDocument = async () => {
    const headers = {
      "Content-Type": "application/json",
    };
    const response = await req_client.fetchReq(
      `search_document/?querry=${searchTerm}`,
      "GET",
      headers
    );
    if (response.ok) {
      const data = await response.json();
      setDocuments(data.documents);
    } else if (response.status === 404) {
      const responseJson = await response.json();
      alert(responseJson.message);
    }
  };

  const openDoc = async (doc_id) => {
    const token_status = req_client.reload_tokens();
    if (!token_status) {
      alert("Please Login to open documents! ");
      navigate("/LogIn");
    } else {
      const headers = {
        Authorization: `Bearer ${req_client.accessToken}`,
      };
      const result = await req_client.fetchReq(
        `get_document/?doc_id=${doc_id}`,
        "GET",
        headers
      );
      if (result.ok) {
        const resultJson = await result.json();
        setViewDocument(resultJson.document);
        openModal();
      } else if (result.status === 400) {
        const resultJson = await result.json();
        alert(resultJson.message);
      }
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
    } else if (result.status === 400) {
      const resultJson = await result.json();
      alert(resultJson.message);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const Modal = ({ onClose, children }) => {
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <button onClick={onClose} style={styles.closeButton}>
            X
          </button>
          {children}
        </div>
      </div>
    );
  };

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
      overflow: "hidden", // Prevents unwanted scrolling in the background
    },
    modalContent: {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "8px",
      maxWidth: "80%",
      maxHeight: "90vh",
      overflowY: "auto",
      overflowX: "auto",
      position: "absolute",
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
    inactiveBackground: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 999,
    },
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-4 ">
      <h2 className="text-xl font-semibold mb-2 text-gray-700">
        Search Documents
      </h2>
      <input
        type="text"
        placeholder="Search Documents..."
        className="border rounded-md px-3 py-2 mb-4 w-full shadow-sm focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        value={searchTerm}
        required
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button
        onClick={() => searchDocument()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-1 transition-all duration-300 hover:scale-105"
      >
        Search
      </button>
      <p className="text-gray-600 mb-4">
        Total results: {filteredDocuments.length}
      </p>
      <div className="rounded-lg overflow-hidden">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {doc.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Uploaded on : {doc.date}
                    <br></br> File type: {doc.docType}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    onClick={() => openDoc(doc.id)}
                  >
                    View
                  </button>
                  <button
                    className="text-green-500 hover:text-green-700 transition-colors"
                    onClick={() => downloadDoc(doc.id)}
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            No documents found.
          </div>
        )}
        {isModalOpen && (
          <Modal onClose={closeModal}>
            <div className="flex flex-col items-center p-6">
              <h2 className="text-2xl font-bold text-blue-800">
                {viewingDocument.title}
              </h2>
              <p className="text-gray-600">
                <strong>Category:</strong> {viewingDocument.category}
              </p>
              <p className="text-gray-600">
                <strong>Document Type: </strong> {viewingDocument.docType}
              </p>
              <p className="text-gray-600">
                <strong>Department:</strong> {viewingDocument.department}
              </p>
              <p className="text-gray-600">
                <strong>Subject:</strong> {viewingDocument.subject}
              </p>
              <p className="text-gray-500 text-sm">
                <strong>Uploaded On:</strong> {viewingDocument.createDate}
              </p>
              {viewingDocument.isPublic ? (
                <p className="text-green-800">
                  <strong>Public</strong>
                </p>
              ):(
                <p className="text-red-500">
                  <strong>Private</strong>
                </p>
              )}

              {viewingDocument.cover &&
              viewingDocument.coverType.includes("pdf") ? (
                <iframe
                  src={`data:application/pdf;base64,${viewingDocument.cover}`}
                  className="max-w-[80vw] min-w-[50vw] min-h-[80vh] rounded-lg shadow-lg mt-5"
                ></iframe>
              ) : (
                <img
                  src={`data:${viewingDocument.coverType};base64,${viewingDocument.cover}`}
                  // className="max-w-[80vw] min-w-[50vw] h-auto rounded-lg shadow-lg mt-5"
                  style={{ width: "700px", height: "100%" }}
                  alt={viewingDocument.title}
                />
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default SearchDocument;
