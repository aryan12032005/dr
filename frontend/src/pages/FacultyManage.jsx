import React, { useEffect, useState } from "react";
import networkRequests from "../request_helper";
import { useNavigate } from "react-router-dom";

const req_client = new networkRequests();
const FacultyManage = () => {
  const navigate = useNavigate();
  // Sample faculty data
  const [faculty, setFaculty] = useState([
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      department: "CSE",
      designation: "Associate Professor",
      email: "sarah.johnson@university.edu",
      joinDate: "2020-08-15",
      profileImage: "johnson.jpg",
      documents: [
        {
          id: 101,
          name: "Machine Learning Syllabus.pdf",
          uploadDate: "2023-01-15",
          size: "1.2 MB",
        },
        {
          id: 102,
          name: "Neural Networks Research.docx",
          uploadDate: "2023-02-20",
          size: "3.5 MB",
        },
        {
          id: 103,
          name: "Student Grading Sheet.xlsx",
          uploadDate: "2023-03-10",
          size: "0.8 MB",
        },
      ],
    },
    {
      id: 2,
      name: "Prof. Michael Chen",
      department: "Mechanical",
      designation: "Professor",
      email: "michael.chen@university.edu",
      joinDate: "2018-05-22",
      profileImage: "chen.jpg",
      documents: [
        {
          id: 201,
          name: "Thermodynamics Course Material.pdf",
          uploadDate: "2023-01-05",
          size: "5.2 MB",
        },
        {
          id: 202,
          name: "Fluid Mechanics Lab Manual.pdf",
          uploadDate: "2023-02-12",
          size: "2.7 MB",
        },
      ],
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      department: "CSE",
      designation: "Assistant Professor",
      email: "emily.rodriguez@university.edu",
      joinDate: "2021-01-10",
      profileImage: "rodriguez.jpg",
      documents: [
        {
          id: 301,
          name: "Data Structures Notes.pdf",
          uploadDate: "2023-01-18",
          size: "2.1 MB",
        },
        {
          id: 302,
          name: "Algorithm Analysis.pptx",
          uploadDate: "2023-02-25",
          size: "4.0 MB",
        },
        {
          id: 303,
          name: "Programming Assignment.zip",
          uploadDate: "2023-03-05",
          size: "1.5 MB",
        },
      ],
    },
    {
      id: 4,
      name: "Dr. Robert Wilson",
      department: "Electrical",
      designation: "Professor",
      email: "robert.wilson@university.edu",
      joinDate: "2017-09-01",
      profileImage: "wilson.jpg",
      documents: [
        {
          id: 401,
          name: "Circuit Theory Handbook.pdf",
          uploadDate: "2023-01-10",
          size: "3.8 MB",
        },
        {
          id: 402,
          name: "Electronics Lab Manual.pdf",
          uploadDate: "2023-02-15",
          size: "2.3 MB",
        },
        {
          id: 403,
          name: "Signal Processing Lecture Notes.pdf",
          uploadDate: "2023-03-20",
          size: "1.9 MB",
        },
      ],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [facultyList,setFacultyList] = useState({});
  const [allDepartments, setAllDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [expandedFaculty, setExpandedFaculty] = useState(null);
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
      resultJson.users.forEach(user => {
        setFacultyList((facultyList) => ({
          ...facultyList,
          [user.dep_code]: facultyList[user.dep_code] ? [...facultyList[user.dep_code], user] : [user]
        }))
      });
    }
  };

  const fetchFaculty = async (dep_code) => {
    if(dep_code in facultyList){
      setFacultyList((facultyList) => {
        const tempList = {...facultyList};
        delete tempList[dep_code];
        return tempList;
      })
      return;
    };
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
      setFacultyList((facultyList) => ({...facultyList,[dep_code]:resultJson.users}));
    }
  };

  // Handle faculty deletion
  const handleDelete = (id) => {
    setFaculty(faculty.filter((fac) => fac.id !== id));
  };

  // Handle document deletion
  const handleDocumentDelete = (facultyId, documentId) => {
    const updatedFaculty = faculty.map((fac) => {
      if (fac.id === facultyId) {
        return {
          ...fac,
          documents: fac.documents.filter((doc) => doc.id !== documentId),
        };
      }
      return fac;
    });

    setFaculty(updatedFaculty);
  };

  // Toggle faculty expansion
  const toggleFacultyExpansion = (facultyId) => {
    if (expandedFaculty === facultyId) {
      setExpandedFaculty(null);
    } else {
      setExpandedFaculty(facultyId);
    }
  };

  // Group faculty by department
  const groupedFaculty = () => {
    // Filter faculty based on search query first
    const filteredFaculty = faculty.filter((fac) => {
      return (
        fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    // Group by department if not showing all departments
    if (selectedDepartment !== "All") {
      return {
        [selectedDepartment]: filteredFaculty.filter(
          (fac) => fac.department === selectedDepartment
        ),
      };
    }

    // Otherwise, group all faculty by their departments
    return filteredFaculty.reduce((groups, fac) => {
      const department = fac.department;
      if (!groups[department]) {
        groups[department] = [];
      }
      groups[department].push(fac);
      return groups;
    }, {});
  };

  // Filter documents based on search query
  const filterDocuments = (documents) => {
    if (!documentSearchQuery) return documents;

    return documents.filter((doc) =>
      doc.name.toLowerCase().includes(documentSearchQuery.toLowerCase())
    );
  };

  const facultyByDepartment = groupedFaculty();

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
              <h3
                className="text-lg font-semibold text-gray-700 mb-3 bg-gray-200 p-2 rounded"
                onClick={() => fetchFaculty(dept.dep_code)}
              >
                {dept.dep_name} Department
              </h3>
              <div className="rounded-lg overflow-hidden">
                {(dept.dep_code in facultyList) ? (
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
                                {fac.dep_code} •{" "}
                                {fac.email}
                              </p>
                              <p className="text-sm text-gray-500">
                                Contact • {fac.phone_number} {"  "} Document(s)
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-4">
                            <button
                              className="text-blue-500 hover:text-blue-700 transition-colors"
                              onClick={() => toggleFacultyExpansion(fac.id)}
                            >
                              {expandedFaculty === fac.id
                                ? "Hide Documents"
                                : "Show Documents"}
                            </button>
                            <button
                              className="text-green-500 hover:text-green-700 transition-colors"
                              onClick={() =>
                                alert(`Editing ${fac.username}'s profile`)
                              }
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-500 hover:text-red-700 transition-colors"
                              onClick={() => handleDelete(fac.id)}
                            >
                              Delete
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
                            <label className="bg-green-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-600 transition-colors">
                              Upload New Document
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) =>
                                  handleDocumentUpload(fac.id, e)
                                }
                              />
                            </label>
                          </div>

                          {/* Document List */}
                          {filterDocuments(fac.documents).length > 0 ? (
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
                                      Size
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {filterDocuments(fac.documents).map((doc) => (
                                    <tr key={doc.id}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {doc.name}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {doc.uploadDate}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {doc.size}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex space-x-2">
                                          <button
                                            className="text-blue-500 hover:text-blue-700 transition-colors"
                                            onClick={() =>
                                              alert(`Downloading ${doc.name}`)
                                            }
                                          >
                                            Download
                                          </button>
                                          <button
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                            onClick={() =>
                                              handleDocumentDelete(
                                                fac.id,
                                                doc.id
                                              )
                                            }
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
