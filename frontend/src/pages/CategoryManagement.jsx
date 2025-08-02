import React, { useState, useEffect } from "react";
import CategoriesList from "./CategoriesList";
import networkRequests from "../request_helper";

const req_client = new networkRequests();
const CategoryManagement = () => {
  const [newCategory, setNewCategory] = useState({
    name: "",
    code: "",
  });

  const [editingCategory, setEditCategory] = useState({
    name: "",
    code: "",
  });


  useEffect(() => {
    setNewCategory(editingCategory);
  },[editingCategory]);
  
  const handleAddCategory = async () => {
    const data = new FormData();
      data.append("name", newCategory.name);
      data.append("code", newCategory.code);
    req_client.reload_tokens();
    const headers = { 
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    let result = null;
    if (editingCategory?.code !== "") {
      result = await req_client.fetchReq(
        "update_category/",
        "PUT",
        headers,
        data
      );
    } else {
      result = await req_client.fetchReq(
        "add_category/",
        "POST",
        headers,
        data
      );
    }
    handleClearCategory();
    if (result.ok) {
      const resultJson = await result.json();
      alert(resultJson.message);
    } else {
      const resultJson = await result.json();
      alert(resultJson.message);
    }
  };

  const handleClearCategory = () => {
    setEditCategory({
      name: "",
      code: "",
    });
    setNewCategory({
      name: "",
      code: "",
    });
  };

  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-white shadow-2xl rounded-3xl p-10 max-w-5xl mx-auto mt-10">
        <h2 className="text-3xl font-bold text-blue-800 mb-8 drop-shadow-md">
          Categories
        </h2>

        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
          <h3 className="text-xl font-semibold text-gray-700">
            Add New Category
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-gray-700 font-medium">Category Name</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                className="w-full p-3 border rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400"
                placeholder="Enter category name"   
              />
            </div>
            <div>
              <label className="text-gray-700 font-medium">Category Code</label>
              <input  
                type="text"
                value={newCategory.code}
                disabled={editingCategory?.code !== ""}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, code: e.target.value })
                }
                className="w-full p-3 border rounded-xl shadow-inner focus:ring-2 focus:ring-blue-400"
                placeholder="Enter category code"
              />
            </div>
          </div>
          <button
            onClick={handleAddCategory}
            className="w-full bg-gradient-to-r from-green-700 to-green-300 text-white font-semibold py-3 rounded-xl shadow-xl hover:scale-105 transition-transform"
          >
            {editingCategory?.code !== "" ? "Update Category" : "Add Category"}
          </button>
          <button
            onClick={handleClearCategory}
            className="w-full bg-gradient-to-r from-blue-300 to-blue-700 text-white font-semibold py-3 rounded-xl shadow-xl hover:scale-105 transition-transform"
          >
            Cancel
          </button>
        </div>
        <CategoriesList setEditCategory={setEditCategory} />
      </div>
    </>
  );
};

export default CategoryManagement;
