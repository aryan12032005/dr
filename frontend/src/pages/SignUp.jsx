import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { FaUpload, FaUserPlus, FaChevronDown, FaChevronUp, FaUser, FaEnvelope, FaPhone, FaLock, FaBuilding } from "react-icons/fa";
import networkRequests from "../request_helper";

const req_client = new networkRequests();

const Signup = ({ onUserCreated }) => {
  const [addNewUser, setAddUser] = useState(false);
  const [csvFile, setCSVFile] = useState("");
  const [uploadAsFaculty, toggleUploadFaculty] = useState(false);
  const [allDepartments, setAllDepartments] = useState([]);
  const [csvDepCode, setCsvDepCode] = useState("");
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
    if (!csvFile || csvFile.length === 0) {
      alert("Please select a CSV file first");
      return;
    }
    if (!csvDepCode) {
      alert("Please select a department");
      return;
    }
    const body = new FormData();
    body.append("csvFile", csvFile[0]);
    body.append("is_faculty", uploadAsFaculty);
    body.append('dep_code', csvDepCode);
    await req_client.reload_tokens();
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
      alert("Users created successfully!");
      if (onUserCreated) onUserCreated();
    } else if (result.status === 409) {
      const resultJson = await result.json();
      alert(`${resultJson.message} : ${resultJson.users}`);
    } else {
      const errorJson = await result.json();
      alert(errorJson.message || "User creation failed");
    }
  };

  const handleAddUser = async () => {
    // add a single user to database
    if (newUser.password.length < 6) {
      alert("Password should be at least 6 characters long!");
      return;
    }
    if(newUser.phone_number.length !=10){
      alert('enter a 10 digit phone number');
      return;
    }
    const hasEmptyValue = Object.values(newUser).some(value => value === '' || value === null || value === undefined);
    if(hasEmptyValue){
      alert("Please fill all fields");
      return;
    }

    try {
      await req_client.reload_tokens();
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
        resetNewUserState();
        if (onUserCreated) onUserCreated();
      } else {
        const errorJson = await result.json();
        alert(errorJson.message || "Error creating user.");
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
    setNewUser({ ...newUser, dep_code: "" });
  };

  return (
    <div className="space-y-4">
      {/* CSV Upload Section */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <FaUpload className="text-blue-500" />
          Upload multiple users in csv, sample{" "}
          <span
            className="text-blue-600 hover:text-blue-700 cursor-pointer underline"
            onClick={downloadSampleCsv}
          >
            format here.
          </span>
        </h3>
        
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <input
            type="file"
            accept=".csv"
            required
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700"
            onChange={handleCsvChange}
          />
          
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              value={uploadAsFaculty}
              onChange={(e) => toggleUploadFaculty(e.target.checked)}
            />
            Upload as Faculty?
          </label>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 mt-3">
          <select
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            value={csvDepCode}
            onFocus={() => getAllDepartments()}
            onChange={(e) => setCsvDepCode(e.target.value)}
          >
            <option value="" disabled>Select a department</option>
            {allDepartments.map((item) => (
              <option value={item.dep_code} key={item.dep_code}>{item.dep_name}</option>
            ))}
          </select>
          
          <button
            onClick={uploadCSV}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all flex items-center gap-2"
          >
            <FaUpload /> Upload CSV file
          </button>
        </div>
      </div>

      {/* Add Single User Toggle */}
      <button
        onClick={toggleAddUser}
        className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
      >
        <FaUserPlus />
        Add Single User
        {addNewUser ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {/* Add User Form */}
      {addNewUser && (
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaUserPlus className="text-green-500" />
            Add New User
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="First Name"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                value={newUser.first_name}
                onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
              />
            </div>
            
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                value={newUser.last_name}
                onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
              />
            </div>
            
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            
            <div className="relative">
              <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none bg-white"
                value={newUser.dep_code}
                onFocus={() => getAllDepartments()}
                onChange={(e) => setNewUser({ ...newUser, dep_code: e.target.value })}
              >
                <option value="" disabled>Select a department</option>
                {allDepartments.map((item) => (
                  <option value={item.dep_code} key={item.dep_code}>{item.dep_name}</option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                placeholder="Phone (10 digits)"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                value={newUser.phone_number}
                onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })}
              />
            </div>
            
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Username"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
            </div>
            
            <div className="relative md:col-span-2">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
          </div>
          
          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newUser.is_faculty}
                onChange={(e) => setNewUser({ ...newUser, is_faculty: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Is Faculty?</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newUser.is_admin}
                onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Is Admin?</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newUser.is_allowed}
                onChange={(e) => setNewUser({ ...newUser, is_allowed: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Is Allowed?</span>
            </label>
          </div>
          
          <button
            onClick={handleAddUser}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all flex items-center gap-2"
          >
            <FaUserPlus /> Add User
          </button>
        </div>
      )}
    </div>
  );
};

export default Signup;
