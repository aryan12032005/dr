import { useState, useEffect } from "react";
import networkRequests from "../request_helper";
import { useNavigate } from "react-router-dom";

const req_client = new networkRequests();
const ViewGroups = () => {
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
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchedGroups, setSearchedGroups] = useState([]);
  const [documentSearchQuery, setDocumentSearchQuery] = useState("");
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [openGroup, setOpenGroup] = useState([]);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [viewingDocument, setViewDocument] = useState(null);

  useEffect(() => {
    const get_groups = async () => {
      const reload_status = await req_client.reload_tokens();
      if(reload_status === null){
        alert("Please login first");
        navigate('/LogIn');
        return;
      }
      else{
        searchGroups();
      }
    }
    get_groups();
  }, [navigate]);

  useEffect(() => {
    if (openGroup.documents) {
      setFilteredDocuments(
        openGroup.documents.filter((document) =>
          document.title
            .toLowerCase()
            .includes(documentSearchQuery.toLowerCase())
        )
      );
    }
  }, [documentSearchQuery]);

  const handleOpenDocumentModal = (group) => {
    setOpenGroup(group);
    setFilteredDocuments(group.documents);
    setShowDocumentModal(true);
  };

  const openDoc = async (doc_id) => {
    const token_status = req_client.reload_tokens();
    if (token_status == false) {
      alert("Please Login to open documents!");
      return;
    }

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
      setIsDocumentModalOpen(true);
    } else {
      alert("please login to view documents");
    }
  };

  const searchGroups = async () => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    let endpoint = `get_member_group/`
    if(groupSearchQuery!=""){
      endpoint = `get_member_group/?query=${groupSearchQuery}`
    }
    const result = await req_client.fetchReq(
      endpoint, 
      "GET",
      headers
    );
    if (result.ok) {
      const resultJson = await result.json();
      setSearchedGroups(resultJson.groups);
    } else {
      alert("no groups found");
    }
  };

  const handleLeaveGroup = async (group) => {
    await req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq(
      `leave-group/?group_id=${group.id}`, 
      "DELETE",
      headers
    );
    if(result.ok){
      const resultJson = await result.json();
      searchGroups();
      alert(resultJson.message);
    }
    else{
      const resultJson = await result.json();
      alert(resultJson.message);
    }
  }

  useEffect(() => {
    const fetchGroupDetails = async () => {
      const headers = {
        Authorization: `Bearer ${req_client.accessToken}`,
        "Content-Type": "application/json",
      };
      let details = await Promise.all(
        searchedGroups.map(async (group_id) => {
          let endpoint = `get_groups/?group_id=${encodeURIComponent(group_id)}`;
          if(groupSearchQuery != ""){
            endpoint = `get_groups/?group_id=${encodeURIComponent(group_id)}&query=${groupSearchQuery}`;
          }
          try {
            const response = await req_client.fetchReq(
              endpoint,
              "GET",
              headers
            );

            if (response.ok) {
              const data = await response.json();
              return data.group_details; 
            } else {
              return null;
            }
          } catch (error) {
            return null;
          }
        })
      );

      // Filter out any null or undefined values from the result
      details = details.filter((detail) => detail !== null);

      setFilteredGroups(details);
    };

    if (searchedGroups.length > 0) {
      fetchGroupDetails();
    }
  }, [searchedGroups]);

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
    <>
      <div className="flex flex-col items-center mt-5 mx-10">
        <div className="bg-gray-200 p-1 rounded-full w-fit flex">
          <button
            onClick={() => navigate("/search-doc")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all text-gray-700 `}
          >
            Search Docs
          </button>
          <button
            onClick={() => navigate("/my-groups")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all bg-blue-500 text-white shadow`}
          >
            View Groups
          </button>
        </div>
        <h1 className="text-xl font-semibold mb-2 text-gray-700 mt-5">
          My groups
        </h1>
        <input
          type="text"
          placeholder="Search groups..."
          value={groupSearchQuery}
          onChange={(e) => setGroupSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-5"
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-5 transition-all duration-300 hover:scale-105"
          onClick={searchGroups}
        >
          Search
        </button>

        {/* Groups List */}
        {filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-lg text-gray-800">
                      {group.group_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {group.members.length} members
                    </p>
                  </div>
                  <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full mr-1 transition-all duration-300 hover:scale-105 right-2"
                        onClick={() => handleLeaveGroup(group)}
                      >
                        Leave group
                      </button>
                </div>

                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Members:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {group.members.slice(0, 5).map((member) => (
                      <span
                        key={member.id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {member.first_name} - {member.username}
                      </span>
                    ))}
                    {group.members.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        +{group.members.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Documents Section */}

                <div className="mt-1 border-t pt-2">
                  {group.documents && group.documents.length > 0 ? (
                    <div className="flex flex-wrap gap-1 relative">
                      {group.documents.slice(0, 3).map((doc, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                        >
                          {doc.title.split(" ").slice(0, 3).join(' ') || `Document ${index + 1}`}
                        </span>
                      ))}
                      {group.documents.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          +{group.documents.length - 3} more
                        </span>
                      )}
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-full mr-1 transition-all duration-300 hover:scale-105 right-2"
                        onClick={() => handleOpenDocumentModal(group)}
                      >
                        View Documents
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs">
                      No documents added yet
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">No groups found.</p>
        )}
      </div>

      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="relative">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Shared Documents
                </h2>
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-lg font-bold"
                  onClick={() => setShowDocumentModal(false)}
                  aria-label="Close"
                >
                  X
                </button>
              </div>
              <input
                type="text"
                placeholder="Search document..."
                value={documentSearchQuery}
                onChange={(e) => setDocumentSearchQuery(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-5"
              />
              <div className="rounded-lg overflow-hidden mt-4">
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
                        <div className="flex space-x-4">
                          <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => openDoc(doc.id)}
                          >
                            View
                          </button>
                          <button
                            className="text-green-500 hover:text-green-700"
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
              </div>
            </div>
          </div>
        </div>
      )}

      {isDocumentModalOpen && viewingDocument && (
        <Modal onClose={() => setIsDocumentModalOpen(false)}>
          <div className="flex flex-col items-center p-6">
            <h2 className="text-2xl font-bold text-blue-800">
              {viewingDocument.title}
            </h2>
            <p className="text-gray-600">
              <strong>Category:</strong> {viewingDocument.category}
            </p>
            <p className="text-gray-600">
              <strong>Document Type:</strong> {viewingDocument.docType}
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
            {viewingDocument.isPublic === "true" ? (
              <p className="text-green-800">
                <strong>Public</strong>
              </p>
            ) : (
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
            ) : viewingDocument.coverType.includes("link") ? (
              <img
                src={viewingDocument.coverLink}
                style={{ width: "700px", height: "100%" }}
                alt="error loading image"
              />
            ) : (
              <img
                src={`data:${viewingDocument.coverType};base64,${viewingDocument.cover}`}
                style={{ width: "700px", height: "100%" }}
                alt={viewingDocument.title}
              />
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

export default ViewGroups;
