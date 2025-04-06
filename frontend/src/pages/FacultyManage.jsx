import React, { useEffect, useState } from "react";
import networkRequests from "../request_helper";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";

const req_client = new networkRequests();
const FacultyManage = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [facultyList, setFacultyList] = useState({});
  const [allDepartments, setAllDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [expandedFaculty, setExpandedFaculty] = useState(null);
  const [facultyDocs, setFacultyDoc] = useState([]);
  const [documentSearchQuery, setDocumentSearchQuery] = useState("");

  useEffect(() => {
    getAllDepartments();
  }, [navigate]);

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

  const searchFaculty = async () => {
    setFacultyList({});
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq(
      `admin/?start_c=0&end_c=50&querry=${searchQuery}&is_faculty=True&dep_code=${selectedDepartment}`,
      "GET",
      headers
    );
    const resultJson = await result.json();
    if (result.ok && resultJson.users.length > 0) {
      resultJson.users.forEach((user) => {
        setFacultyList((facultyList) => ({
          ...facultyList,
          [user.dep_code]: facultyList[user.dep_code]
            ? [...facultyList[user.dep_code], user]
            : [user],
        }));
      });
    }
  };

  const fetchFaculty = async (dep_code) => {
    if (dep_code in facultyList) {
      setFacultyList((facultyList) => {
        const tempList = { ...facultyList };
        delete tempList[dep_code];
        return tempList;
      });
      return;
    }
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq(
      `admin/?start_c=0&end_c=50&is_faculty=True&dep_code=${dep_code}`,
      "GET",
      headers
    );
    const resultJson = await result.json();
    if (result.ok) {
      setFacultyList((facultyList) => ({
        ...facultyList,
        [dep_code]: resultJson.users,
      }));
    }
  };

  const fetchDocuments = async (id) => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq(
      `get_faculty_doc/?fac_id=${id}`,
      "GET",
      headers
    );
    if (result.ok) {
      const resultJson = await result.json();
      setFacultyDoc(resultJson.documents);
    } else if (result.status === 404) {
      const resultJson = await result.json();
      alert(resultJson.message);
    }
    setExpandedFaculty(id);
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

  const deleteDoc = async (id) => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq(
      `delete_document/?doc_id=${id}`,
      "DELETE",
      headers
    );
    if (result.ok) {
      const resultJson = await result.json();
      alert(resultJson.message);
      fetchDocuments(expandedFaculty);
    } else {
      const resultJson = await result.json();
      alert(resultJson.message);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Faculty Management System
      </h1>

      {/* View Faculty Profiles Section */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          View Faculty Profiles
        </h2>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <input
            type="text"
            placeholder="Search faculty by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={searchFaculty}
            className="bg-blue-600 text-white px-6 py-2 mb-5 rounded-lg hover:scale-105 hover:shadow-lg: bg-blue-700 transition"
          >
            Search
          </button>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled default>
              Select Department
            </option>
            {allDepartments.map((dept) => (
              <option key={dept.dep_code} value={dept.dep_code}>
                {dept.dep_name}
              </option>
            ))}
          </select>
        </div>

        {/* Faculty List - Grouped by Department */}
        {allDepartments.length > 0 ? (
          allDepartments.map((dept) => (
            <div key={dept.dep_code} className="mb-8">
              <div
                className="flex items-center justify-between w-full bg-gray-200 p-2 pr-10 rounded cursor-pointer"
                onClick={() => fetchFaculty(dept.dep_code)}
              >
                <h3 className="text-lg font-semibold text-gray-700 mb-3 bg-gray-200 rounded">
                  {dept.dep_name}
                </h3>
                <h2>{dept.dep_code in facultyList ? "▼" : "▶"}</h2>
              </div>
              <div className="rounded-lg overflow-hidden">
                {dept.dep_code in facultyList ? (
                  facultyList[dept.dep_code].map((fac) => (
                    <div
                      key={fac.id}
                      className="border border-gray-200 rounded-lg mb-4"
                    >
                      {/* Faculty Profile */}
                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-4 items-center">
                            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                              {fac.profileImage ? (
                                <span>{fac.first_name.charAt(0)} </span>
                              ) : (
                                <span>{fac.first_name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <h2 className="text-lg font-semibold text-gray-800">
                                {fac.first_name}
                              </h2>
                              <p className="text-sm text-gray-500">
                                {fac.dep_code} • {fac.email}
                              </p>
                              <p className="text-sm text-gray-500">
                                Contact • {fac.phone_number} {"  "} Document(s)
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-4">
                            <button
                              className="text-blue-500 hover:text-blue-700 transition-colors"
                              onClick={() => fetchDocuments(fac.id)}
                            >
                              Show documents
                            </button>
                            <button
                              className="text-green-500 hover:text-green-700 transition-colors"
                              onClick={() =>
                                alert(`Editing ${fac.username}'s profile`)
                              }
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Documents Section */}
                      {expandedFaculty === fac.id && (
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                          <h3 className="text-md font-semibold text-gray-700 mb-3">
                            Documents
                          </h3>

                          {/* Document Search and Upload */}
                          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3 mb-4">
                            <input
                              type="text"
                              placeholder="Search documents..."
                              value={documentSearchQuery}
                              onChange={(e) =>
                                setDocumentSearchQuery(e.target.value)
                              }
                              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Document List */}
                          {facultyDocs.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Document Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Upload Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Doc type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {facultyDocs.map((doc) => (
                                    <tr key={doc.id}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {doc.title}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {doc.createDate}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {doc.docType}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex space-x-2">
                                          <button
                                            className="text-blue-500 hover:text-blue-700 transition-colors"
                                            onClick={() => downloadDoc(doc.id)}
                                          >
                                            Download
                                          </button>
                                          <button
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                            onClick={() => deleteDoc(doc.id)}
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-500">No documents found.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No faculty profiles found.</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No faculty profiles found.</p>
        )}
      </div>
    </div>
  );
};

export default FacultyManage;
