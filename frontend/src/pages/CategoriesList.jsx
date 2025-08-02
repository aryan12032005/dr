import React, { useEffect, useState } from "react";
import networkRequests from "../request_helper";

const req_client = new networkRequests();
const CategoriesList = ({ setEditCategory }) => {
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
    };
    const result = await req_client.fetchReq("get_categories/", "GET", headers);
    const resultJson = await result.json();
    if (result.ok) {
      setAllCategories(resultJson.categories);
    }
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

    if (response.ok) {
      fetchCategories();
    } else {
      alert("Failed to delete Category.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Categories</h2>
      {allCategories.map((cat) => (
        <div
          key={cat.code}
          className="border p-4 mb-4 rounded-lg shadow-sm"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {cat.name} ({cat.code})
            </h3>
            <div className="space-x-2">
            <button
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm"
                onClick={() => setEditCategory({"name":cat.name,"code":cat.code})}
              >
                Edit
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm"
                onClick={() => deleteCategory(cat.code)}
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

export default CategoriesList;
