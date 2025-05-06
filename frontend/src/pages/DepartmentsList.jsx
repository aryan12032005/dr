import React, { useEffect, useState } from "react";
import networkRequests from "../request_helper";

const req_client = new networkRequests();
const DepartmentList = ({ setEditDepartmentId }) => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq("get_department/", "GET", headers);
    const resultJson = await result.json();
    if (result.ok) {
      setDepartments(resultJson.departments);
    }
  };

  const deleteDepartment = async (dep_code) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this department?"
    );
    if (!confirmed) return;
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const response = await req_client.fetchReq(
      `delete_department/?dep_code=${dep_code}`,
      "DELETE",
      headers
    );

    if (response.ok) {
      fetchDepartments();
    } else {
      alert("Failed to delete department.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Departments</h2>
      {departments.map((dep) => (
        <div
          key={dep.dep_code}
          className="border p-4 mb-4 rounded-lg shadow-sm"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {dep.dep_name} ({dep.dep_code})
            </h3>
            <div className="space-x-2">
            <button
                className="bg-yellow-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
                onClick={() => setEditDepartmentId(dep.dep_code)}
              >
                Edit
              </button>
              <button
                className="bg-red-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
                onClick={() => deleteDepartment(dep.dep_code)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DepartmentList;
