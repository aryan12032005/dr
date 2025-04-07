import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import networkRequests from "../request_helper";

const req_client = new networkRequests();

const Signup = () => {
  const [addNewUser, setAddUser] = useState(false);
  const [csvFile, setCSVFile] = useState("");
  const [uploadAsFaculty, toggleUploadFaculty] = useState(false);
  const [allDepartments, setAllDepartments] = useState([]);
  const [newUser, setNewUser] = useState({
    email: "",
    dep_code: "",
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    is_faculty: false,
    is_admin: false,
    is_allowed: true,
  });

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
  
  const resetNewUserState = () => {
    setNewUser({
      email: "",
      username: "",
      password: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      is_faculty: false,
      is_admin: false,
      is_allowed: true,
    });
  };

  const toggleAddUser = () => {
    setAddUser(addNewUser ? false : true);
  };

  const downloadSampleCsv = async () => {
    // downlaod sample csv format to upload users
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq("get_sample_csv/", "GET", headers);
    if (result.ok) {
      saveAs(await result.blob(), "Sample_csv.csv");
    } else {
      alert("Error downloading format.");
    }
  };

  const handleCsvChange = (e) => {
    setCSVFile(e.target.files);
  };

  const uploadCSV = async () => {
    // upload csv file to backend and create multiple users
    const body = new FormData();
    body.append("csvFile", csvFile[0]);
    body.append("is_faculty", uploadAsFaculty);
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq(
      "upload_csv/",
      "POST",
      headers,
      body
    );
    if (result.ok) {
      alert("User created successfull");
    } else if (result.status === 409) {
      const resultJson = await result.json();
      alert(`${resultJson.message} : ${resultJson.users}`);
    } else {
      alert("User creation failed");
    }
  };

  const handleAddUser = async () => {
    // add a single user to database
    if (newUser.password.length < 6) {
      alert("Password should be at least 6 characters long!");
      return;
    }

    try {
      req_client.reload_tokens();
      const headers = {
        Authorization: `Bearer ${req_client.accessToken}`,
        "Content-Type": "application/json",
      };
      const result = await req_client.fetchReq(
        "signup/",
        "POST",
        headers,
        JSON.stringify(newUser)
      );

      if (result.ok) {
        alert("User added successfully!");
        fetchUsers();
      } else {
        alert("Error creating user.");
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }

    resetNewUserState();
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center shadow-lg mb-5 mt-5 p-6 rounded-lg bg-white">
        <h2 className="font-semibold mb-2 text-gray-600 mb-5">
          Upload multiple users in csv, sample{" "}
          <a
            className="text-black hover:text-blue-500 transform hover:scale-110 transition-all duration-300 cursor-pointer"
            onClick={downloadSampleCsv}
          >
            format here.
          </a>
        </h2>
        <input
          type="file"
          accept=".csv"
          required
          className="bg-gray-800 text-white font-bold py-2 px-4 rounded-lg mb-4 transition-all duration-300 hover:scale-105 hover:bg-gray-700"
          onChange={handleCsvChange}
        />
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            className="border border-gray-400 rounded px-2 py-1"
            name="upload_aculty"
            value={uploadAsFaculty}
            onChange={(e) => toggleUploadFaculty(e.target.checked)}
          />
          <label htmlFor="upload_aculty" className="ml-2 text-gray-700">
            Upload as Faculty?
          </label>
        </div>
        <button
          onClick={uploadCSV}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg  hover:scale-105 bg-blue-700 transition-all duration-300 ease-in-out"
        >
          Upload CSV file
        </button>
      </div>

      <button
        onClick={toggleAddUser}
        className="bg-blue-600 text-white px-6 py-2 mb-5 rounded-lg  hover:scale-105 :bg-blue-700 transition"
      >
        Add Single User
      </button>
      {addNewUser && (
        <div className="p-4 bg-gray-50 rounded-lg shadow-inner transition-all duration-300">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            Add New User
          </h3>
          <input
            required
            type="text"
            placeholder="First Name"
            className="border rounded px-3 py-2 mr-2 mb-2 w-full"
            value={newUser.first_name}
            onChange={(e) =>
              setNewUser({ ...newUser, first_name: e.target.value })
            }
          />
          <input
            required
            type="text"
            placeholder="Last Name"
            className="border rounded px-3 py-2 mr-2 mb-2 w-full"
            value={newUser.last_name}
            onChange={(e) =>
              setNewUser({ ...newUser, last_name: e.target.value })
            }
          />
          <input
            required
            type="email"
            placeholder="Email"
            className="border rounded px-3 py-2 mr-2 mb-2 w-full"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <select
            className="border rounded px-3 py-2 mr-2 mb-2 w-full"
            value={newUser.dep_code}
            onChange={(e) =>
              setNewUser({ ...newUser, dep_code: e.target.value })
            }
          >
            <option value="" default disabled>
              Select a department
            </option>
            {allDepartments.map((item) => (
              <option value={item.dep_code} key={item.dep_code}>
                {item.dep_name}
              </option>
            ))}
          </select>
          <input
            required
            type="tel"
            placeholder="Phone"
            className="border rounded px-3 py-2 mr-2 mb-2 w-full"
            value={newUser.phone_number}
            onChange={(e) =>
              setNewUser({ ...newUser, phone_number: e.target.value })
            }
          />
          <input
            required
            type="text"
            placeholder="Username"
            className="border rounded px-3 py-2 mr-2 mb-2 w-full"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
          />
          <input
            required
            type="password"
            placeholder="Password"
            className="border rounded px-3 py-2 mr-2 mb-2 w-full"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isFaculty"
                checked={newUser.is_faculty}
                onChange={(e) =>
                  setNewUser({ ...newUser, is_faculty: e.target.checked })
                }
                className="mr-2"
              />
              <label htmlFor="isFaculty" className="text-gray-700">
                Is Faculty?
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isAdmin"
                checked={newUser.is_admin}
                onChange={(e) =>
                  setNewUser({ ...newUser, is_admin: e.target.checked })
                }
                className="mr-2"
              />
              <label htmlFor="isAdmin" className="text-gray-700">
                Is Admin?
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isAllowed"
                checked={newUser.is_allowed}
                onChange={(e) =>
                  setNewUser({ ...newUser, is_allowed: e.target.checked })
                }
                className="mr-2"
              />
              <label htmlFor="isAllowed" className="text-gray-700">
                Is Allowed?
              </label>
            </div>
          </div>
          <button
            onClick={handleAddUser}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 hover:scale-105"
          >
            Add User
          </button>
        </div>
      )}{" "}
    </>
  );
};

export default Signup;
