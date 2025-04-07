import React, { useRef, useState, useEffect } from "react";
import networkRequests from "../request_helper";

const req_client = new networkRequests();

const Settings = () => {
  const [dep_name, setDepName] = useState("");
  const [dep_code, setDepCode] = useState("");
  const [managerSearchTerm, setManagerSearchTerm] = useState("");
  const [searchedManagers, setSearchedManagers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [newSubject, setNewSubject] = useState({ code: "", name: "" });

  const handleSubjectChange = (e) => {
    const { name, value } = e.target;
    setNewSubject({ ...newSubject, [name]: value });
  };

  const handleAddSubject = () => {
    if (validateInputs()) {
      setSubjects((subjects) => [...subjects, newSubject]);
      setNewSubject({ code: "", name: "" });
    }
  };

  const validateInputs = () => {
    if (!newSubject.code.trim()) {
      alert("Subject code is required");
      return false;
    } else if (
      subjects.some(
        (sub) => sub.code.toLowerCase() === newSubject.code.trim().toLowerCase()
      )
    ) {
      alert("Subject code already exists");
      return false;
    }
    if (!newSubject.name.trim()) {
      alert("Subject name is required");
      return false;
    }
    return true;
  };

  const handleDelete = (code) => {
    setSubjects(subjects.filter((sub) => sub.code !== code));
  };

  const handleAddManager = (username, email) => {
    const newManager = { username, email };
    setManagers((managers) => [...managers, newManager]);
  };

  const handleRemoveManager = (username) => {
    setManagers(managers.filter((item) => item.username !== username));
  };

  const searchManagers = async () => {
    req_client.reload_tokens();
    const headers = { Authorization: `Bearer ${req_client.accessToken}` };
    const result = await req_client.fetchReq(
      `search_user/?start_c=0&end_c=50&querry=${managerSearchTerm}&is_admin=True`,
      "GET",
      headers
    );
    if (result.ok) {
      const resultJson = await result.json();
      setSearchedManagers(resultJson.users);
    } else {
      setSearchedManagers([]);
    }
  };

  const handleAddDepartment = async () => {
    const data = new FormData();
    data.append("dep_name", dep_name);
    data.append("dep_code", dep_code);
    data.append("managers", JSON.stringify(managers));
    data.append("subjects", JSON.stringify(subjects));
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq(
      "add_department/",
      "POST",
      headers,
      data
    );
    const resultJson = await result.json();
    if (result.ok) {
      alert(resultJson.message);
      setManagers([]);
      setSubjects([]);
      setDepCode("");
      setDepName("");
    } else {
      alert(resultJson.message);
    }
  };

  const inputRef = useRef(null);
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [managerSearchTerm]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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

  return (
    <div className="bg-gradient-to-r from-blue-50 to-white shadow-2xl rounded-3xl p-10 max-w-5xl mx-auto mt-10">
      <h2 className="text-3xl font-bold text-blue-800 mb-8 drop-shadow-md">Settings ⚙️</h2>

      <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
        <h3 className="text-xl font-semibold text-gray-700">Add New Department</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-gray-700 font-medium">Department Name</label>
            <input
              type="text"
              value={dep_name}
              onChange={(e) => setDepName(e.target.value)}
              className="w-full p-3 border rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400"
              placeholder="Enter department name"
            />
          </div>
          <div>
            <label className="text-gray-700 font-medium">Department Code</label>
            <input
              type="text"
              value={dep_code}
              onChange={(e) => setDepCode(e.target.value)}
              className="w-full p-3 border rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400"
              placeholder="Enter department code"
            />
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-600">Subjects</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="text-sm text-gray-600">Subject Code</label>
              <input
                name="code"
                value={newSubject.code}
                onChange={handleSubjectChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. SE"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Subject Name</label>
              <input
                name="name"
                value={newSubject.name}
                onChange={handleSubjectChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. Software Engineering"
              />
            </div>
            <button
              onClick={handleAddSubject}
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform"
            >
              Add Subject
            </button>
          </div>

          {subjects.length > 0 && (
            <div className="mt-6 overflow-auto">
              <table className="min-w-full bg-white border rounded-xl shadow-md">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-blue-800">Code</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-blue-800">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-blue-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub) => (
                    <tr key={sub.code} className="hover:bg-blue-50">
                      <td className="px-6 py-4 text-blue-600 font-medium">{sub.code}</td>
                      <td className="px-6 py-4 text-gray-700">{sub.name}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(sub.code)}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-600">Managers</h4>
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform mb-4"
          >
            Add Managers
          </button>

          {managers.length > 0 && (
            <div className="overflow-auto">
              <table className="min-w-full bg-white border rounded-xl shadow-md">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-blue-800">Username</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-blue-800">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-blue-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {managers.map((item) => (
                    <tr key={item.username} className="hover:bg-blue-50">
                      <td className="px-6 py-4 text-blue-600 font-medium">{item.username}</td>
                      <td className="px-6 py-4 text-gray-700">{item.email}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleRemoveManager(item.username)}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {isModalOpen && (
          <Modal onClose={closeModal}>
            <div className="space-y-4 px-10 py-10">
              <input
                type="text"
                value={managerSearchTerm}
                onChange={(e) => setManagerSearchTerm(e.target.value)}
                ref={inputRef}
                placeholder="Search for managers"
                className="w-full p-3 border rounded-lg shadow-inner"
              />
              <button
                onClick={searchManagers}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
              >
                Search
              </button>
              {searchedManagers.length > 0 && (
                <table className="min-w-full bg-white border rounded-xl shadow-md">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-blue-800">Username</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-blue-800">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-blue-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchedManagers.map((item) => (
                      <tr key={item.username} className="hover:bg-blue-50">
                        <td className="px-6 py-4 text-blue-600 font-medium">{item.username}</td>
                        <td className="px-6 py-4 text-gray-700">{item.email}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleAddManager(item.username, item.email)}
                            className="text-green-600 hover:underline"
                          >
                            Add
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Modal>
        )}

        <div className="pt-6">
          <button
            onClick={handleAddDepartment}
            className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold py-3 rounded-xl shadow-xl hover:scale-105 transition-transform"
          >
            Add Department
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;