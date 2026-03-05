import React, { useEffect, useState } from "react";
import { FaTags, FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import networkRequests from "../request_helper";

const req_client = new networkRequests();

const CategoriesList = ({ setEditCategory }) => {
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ code: "", name: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq("get_categories/", "GET", headers);
    if (result && result.ok) {
      const resultJson = await result.json();
      setAllCategories(resultJson.categories || []);
    }
    setLoading(false);
  };

  const deleteCategory = async (code) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Category?"
    );
    if (!confirmed) return;
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const response = await req_client.fetchReq(
      `delete_category/?code=${code}`,
      "DELETE",
      headers
    );

    if (response && response.ok) {
      fetchCategories();
    } else {
      alert("Failed to delete Category.");
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq(
      "add_category/",
      "POST",
      headers,
      JSON.stringify(newCategory)
    );
    if (result && result.ok) {
      alert("Category added successfully!");
      setShowAddForm(false);
      setNewCategory({ code: "", name: "" });
      fetchCategories();
    } else {
      const error = await result.json();
      alert(error.message || "Error adding category");
    }
  };

  const handleEditCategory = (cat) => {
    setEditingCategory({ code: cat.code, name: cat.name });
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq(
      "update_category/",
      "PUT",
      headers,
      JSON.stringify(editingCategory)
    );
    if (result && result.ok) {
      alert("Category updated successfully!");
      setEditingCategory(null);
      fetchCategories();
    } else {
      const error = await result.json();
      alert(error.message || "Error updating category");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FaTags className="text-3xl text-purple-500" />
          <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all"
        >
          <FaPlus /> Add Category
        </button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Category</h2>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Code</label>
                <input
                  type="text"
                  value={newCategory.code}
                  onChange={(e) => setNewCategory({ ...newCategory, code: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., RESEARCH"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Research Papers"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600"
              >
                Save Category
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

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Category</h2>
              <button onClick={() => setEditingCategory(null)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Code</label>
                <input
                  type="text"
                  value={editingCategory.code}
                  disabled
                  className="w-full border rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600"
                >
                  Update Category
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCategories.map((cat) => (
            <div key={cat.code || cat._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full mb-2">
                    {cat.code}
                  </span>
                  <h3 className="text-xl font-bold text-gray-800">{cat.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCategory(cat)}
                    className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit Category"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.code)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Category"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {allCategories.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No categories found. Add your first category!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoriesList;
