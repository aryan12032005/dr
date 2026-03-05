import React, { useEffect, useState } from "react";
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import networkRequests from "../request_helper";

const req_client = new networkRequests();

const DepartmentList = ({ setEditDepartmentId }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [newDept, setNewDept] = useState({ dep_code: "", dep_name: "", managers: [], subjects: {} });
  const [newSubject, setNewSubject] = useState({ category: "", subjects: "" });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq("get_department/", "GET", headers);
    if (result && result.ok) {
      const resultJson = await result.json();
      setDepartments(resultJson.departments || []);
    }
    setLoading(false);
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

    if (response && response.ok) {
      fetchDepartments();
    } else {
      alert("Failed to delete department.");
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq(
      "add_department/",
      "POST",
      headers,
      JSON.stringify(newDept)
    );
    if (result && result.ok) {
      alert("Department added successfully!");
      setShowAddForm(false);
      setNewDept({ dep_code: "", dep_name: "", managers: [], subjects: {} });
      fetchDepartments();
    } else {
      const error = await result.json();
      alert(error.message || "Error adding department");
    }
  };

  const handleEditDepartment = (dept) => {
    setEditingDepartment({
      dep_code: dept.dep_code,
      dep_name: dept.dep_name,
      managers: dept.managers || [],
      subjects: dept.subjects || {}
    });
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq(
      "update_department/",
      "PUT",
      headers,
      JSON.stringify(editingDepartment)
    );
    if (result && result.ok) {
      alert("Department updated successfully!");
      setEditingDepartment(null);
      fetchDepartments();
    } else {
      const error = await result.json();
      alert(error.message || "Error updating department");
    }
  };

  const addSubjectToEdit = () => {
    if (!newSubject.category || !newSubject.subjects) {
      alert("Please provide both a category and subjects.");
      return;
    }
    const subjectsArray = newSubject.subjects.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    if (subjectsArray.length === 0) {
      alert("Please enter at least one valid subject.");
      return;
    }
    const updatedSubjects = { ...(editingDepartment.subjects || {}) };
    const existing = Array.isArray(updatedSubjects[newSubject.category]) ? updatedSubjects[newSubject.category] : [];
    updatedSubjects[newSubject.category] = Array.from(new Set([...existing, ...subjectsArray]));
    setEditingDepartment({ ...editingDepartment, subjects: updatedSubjects });
    setNewSubject({ category: "", subjects: "" });
  };

  const addSubjectToNewDept = () => {
    // validate inputs
    if (!newSubject.category || !newSubject.subjects) {
      alert("Please provide both a category and subjects (comma-separated).");
      return;
    }

    // split, trim and filter empty values
    const subjectsArray = newSubject.subjects
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (subjectsArray.length === 0) {
      alert("Please enter at least one valid subject.");
      return;
    }

    // ensure subjects object exists
    const updatedSubjects = { ...(newDept.subjects || {}) };

    // merge with existing subjects for the category, avoiding duplicates
    const existing = Array.isArray(updatedSubjects[newSubject.category])
      ? updatedSubjects[newSubject.category]
      : [];
    const merged = Array.from(new Set([...existing, ...subjectsArray]));

    updatedSubjects[newSubject.category] = merged;

    setNewDept({
      ...newDept,
      subjects: updatedSubjects,
    });

    setNewSubject({ category: "", subjects: "" });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FaBuilding className="text-3xl text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-800">Departments</h1>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all"
        >
          <FaPlus /> Add Department
        </button>
      </div>

      {/* Add Department Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Department</h2>
          <form onSubmit={handleAddDepartment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Code</label>
                <input
                  type="text"
                  value={newDept.dep_code}
                  onChange={(e) => setNewDept({ ...newDept, dep_code: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., CSE"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  value={newDept.dep_name}
                  onChange={(e) => setNewDept({ ...newDept, dep_name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>
            </div>
            
            {/* Subjects Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Add Subjects</h3>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSubject.category}
                  onChange={(e) => setNewSubject({ ...newSubject, category: e.target.value })}
                  className="flex-1 border rounded-lg px-4 py-2"
                  placeholder="Category name"
                />
                <input
                  type="text"
                  value={newSubject.subjects}
                  onChange={(e) => setNewSubject({ ...newSubject, subjects: e.target.value })}
                  className="flex-1 border rounded-lg px-4 py-2"
                  placeholder="Subjects (comma separated)"
                />
                <button
                  type="button"
                  onClick={addSubjectToNewDept}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Add
                </button>
              </div>
              {Object.keys(newDept.subjects).length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  {Object.entries(newDept.subjects).map(([cat, subs]) => (
                    <div key={cat} className="text-sm">
                      <span className="font-medium">{cat}:</span> {subs.join(", ")}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Save Department
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Department Modal */}
      {editingDepartment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Department</h2>
              <button onClick={() => setEditingDepartment(null)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdateDepartment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Code</label>
                  <input
                    type="text"
                    value={editingDepartment.dep_code}
                    disabled
                    className="w-full border rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                  <input
                    type="text"
                    value={editingDepartment.dep_name}
                    onChange={(e) => setEditingDepartment({ ...editingDepartment, dep_name: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              {/* Subjects Section */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Subjects</h3>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSubject.category}
                    onChange={(e) => setNewSubject({ ...newSubject, category: e.target.value })}
                    className="flex-1 border rounded-lg px-4 py-2"
                    placeholder="Category name"
                  />
                  <input
                    type="text"
                    value={newSubject.subjects}
                    onChange={(e) => setNewSubject({ ...newSubject, subjects: e.target.value })}
                    className="flex-1 border rounded-lg px-4 py-2"
                    placeholder="Subjects (comma separated)"
                  />
                  <button
                    type="button"
                    onClick={addSubjectToEdit}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    Add
                  </button>
                </div>
                {Object.keys(editingDepartment.subjects || {}).length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    {Object.entries(editingDepartment.subjects).map(([cat, subs]) => (
                      <div key={cat} className="text-sm flex items-center justify-between">
                        <span><span className="font-medium">{cat}:</span> {Array.isArray(subs) ? subs.join(", ") : subs}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedSubjects = { ...editingDepartment.subjects };
                            delete updatedSubjects[cat];
                            setEditingDepartment({ ...editingDepartment, subjects: updatedSubjects });
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  Update Department
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDepartment(null)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Departments List */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dep) => (
            <div key={dep.dep_code || dep._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full mb-2">
                    {dep.dep_code}
                  </span>
                  <h3 className="text-xl font-bold text-gray-800">{dep.dep_name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditDepartment(dep)}
                    className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Edit Department"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteDepartment(dep.dep_code)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Department"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              {dep.subjects && Object.keys(dep.subjects).length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Subjects</h4>
                  {Object.entries(dep.subjects).map(([cat, subs]) => (
                    <div key={cat} className="text-sm text-gray-500">
                      <span className="font-medium text-gray-700">{cat}:</span>{" "}
                      {Array.isArray(subs) ? subs.join(", ") : subs}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {departments.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No departments found. Add your first department!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DepartmentList;
