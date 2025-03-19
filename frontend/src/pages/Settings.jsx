import React, { useState } from "react";

const Settings = () => {
  const [dep_name,setDepName]= useState("");
  const [dep_code,setDepCode] = useState("");
  const [managers,setManagers] = useState([]);
  const [subjects,setSubjects] = useState([]);

  const handleAddDepartment = async() => {
    const data= new FormData();
    data.append("dep_name",dep_name);
    data.append("dep_code",dep_code);
    data.append("managers",managers);
    data.append("subjects",subjects);
  }

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 max-w-lg mx-auto mt-10">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Settings ⚙️</h2>
      <p className="text-gray-600 mb-6">Update your account settings below.</p>

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
            className="w-full border rounded-lg p-2 mb-5 mt-1"
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
            className="w-full border rounded-lg p-2 mt-1"
            placeholder="Enter Dep Code"
            value={dep_code}
            onChange={(e) => setDepCode(e.target.value)}
          />
        </div>
        <button
          onClick={handleAddDepartment}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out"
        >
          Add Department
        </button>
      </div>
      
    </div>
  );
};

export default Settings;
