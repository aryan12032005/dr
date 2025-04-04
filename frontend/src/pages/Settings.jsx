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

  const [newSubject, setNewSubject] = useState({
    code: "",
    name: "",
  });

  const handleSubjectChange = (e) => {
    const { name, value } = e.target;
    setNewSubject({ ...newSubject, [name]: value });
  };

  const handleAddSubject = () => {
    if (validateInputs()) {
      setSubjects((subjects) => [...subjects, newSubject]);
      setNewSubject({
        code: "",
        name: "",
      });
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
    const newManager = { username: username, email: email };
    setManagers((managers) => [...managers, newManager]);
  };

  const handleRemoveManager = (username) => {
    setManagers(managers.filter((item) => item.username !== username));
  };

  const searchManagers = async () => {
    req_client.reload_tokens();
    const headers = { Authorization: `Bearer ${req_client.accessToken}` };
    const result = await req_client.fetchReq(
      `admin/?start_c=0&end_c=50&querry=${managerSearchTerm}&is_admin=True`,
      "GET",
      headers
    );
    if (result.ok) {
      const resultJson = await result.json();
      console.log(resultJson, managerSearchTerm);
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
    console.log(managers);
    console.log(subjects);
    console.log(data);
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
    }
    else{
      alert(resultJson.message);
    }
    
  };

  const inputRef = useRef(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [managerSearchTerm]);
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
    },
    modalContent: {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "5px",
      maxWidth: "500px",
      width: "100%",
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
    <div className="bg-white shadow-lg rounded-2xl p-6 max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Settings ⚙️</h2>

      <div className="flex flex-col items-center justify-center shadow-lg mb-5 mt-5 p-6 rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-2 text-gray-600 mb-5">
          Add new department.
        </h2>

        <div className="flex flex-col items-center mb-4">
          <label htmlFor="dep_name" className="block text-gray-700 font-medium">
            Department name
          </label>
          <input
            type="text"
            id="dep_name"
            className="border rounded-lg p-2 mb-5 mt-1"
            placeholder="Enter Dep Name"
            value={dep_name}
            onChange={(e) => setDepName(e.target.value)}
          />
          <label htmlFor="dep_code" className="block text-gray-700 font-medium">
            Department Code
          </label>
          <input
            type="text"
            id="dep_code"
            className="border rounded-lg p-2 mb-5 mt-1"
            placeholder="Enter Dep Code"
            value={dep_code}
            onChange={(e) => setDepCode(e.target.value)}
          />
          {subjects.length > 0 ? (
            <div className="mb-7 flex flex-col items-center">
              <label
                htmlFor="sub_list"
                className="block text-gray-700 font-medium"
              >
                Subjects list
              </label>
              <table name="sub_list" className="divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SUbject Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subjects.map((sub) => (
                    <tr key={sub.code} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {sub.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sub.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDelete(sub.code)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">
              No Subjects added yet.
            </p>
          )}
          <div className="flex flex-row gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Code
              </label>
              <input
                type="text"
                name="code"
                value={newSubject.code}
                onChange={handleSubjectChange}
                placeholder="e.g. SE"
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                maxLength="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Name
              </label>
              <input
                type="text"
                name="name"
                value={newSubject.name}
                onChange={handleSubjectChange}
                placeholder="e.g. Software Engineering"
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <button
              onClick={handleAddSubject}
              className="bg-blue-600 text-white px-6 rounded-lg hover:scale-105 hover:shadow-lg :bg-blue-700 transition-all duration-300 ease-in-out"
            >
              Add
            </button>
          </div>
          {managers.length > 0 ? (
            <div className="mb-7 flex flex-col items-center">
              <label
                htmlFor="sub_list"
                className="block text-gray-700 font-medium"
              >
                Managers list
              </label>
              <table name="sub_list" className="divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {managers.map((item) => (
                    <tr key={item.username} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {item.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleRemoveManager(item.username)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">
              No Managers added yet.
            </p>
          )}

          <div>
            <div className="flex flex-row gap-5 mb-5">
              <button
                onClick={openModal}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:scale-105 hover:shadow-lg: bg-blue-700 transition-all duration-300 ease-in-out"
              >
                Add managers
              </button>
            </div>
            {isModalOpen && <div style={styles.inactiveBackground} />}
            {isModalOpen && (
              <Modal onClose={closeModal}>
                <div className="flex flex-row gap-5 mb-5 mt-10">
                  <input
                    type="text"
                    name="managersSearch"
                    value={managerSearchTerm}
                    onChange={(e) => setManagerSearchTerm(e.target.value)}
                    placeholder="Search for managers"
                    className="w-full p-2 border rounded-md"
                    ref={inputRef}
                  />
                  <button
                    onClick={searchManagers}
                    className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out"
                  >
                    Search
                  </button>
                </div>
                {searchedManagers.length > 0 ? (
                  <div className="mb-7 flex flex-col items-center">
                    <table name="sub_list" className="divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Username
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {searchedManagers.map((item) => (
                          <tr key={item.username} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                              {item.username}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() =>
                                  handleAddManager(item.username, item.email)
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                Add
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6">
                    No Managers added yet.
                  </p>
                )}
              </Modal>
            )}
          </div>
        </div>
        <button
          onClick={handleAddDepartment}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:scale-105 hover:shadow-lg: bg-blue-700 transition-all duration-300 ease-in-out"
        >
          Add Department
        </button>
      </div>
    </div>
  );
};

export default Settings;
