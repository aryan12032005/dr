import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config.js";

const SearchDocument = () => {
    const [searchTerm,setSearchTerm]=useState("");

  const getCSRFToken = async () => {
    var response = await fetch(`${config.backendUrl}get_csrf/`, {
      method: "GET",
    });
    var data = await response.json();
    return data.csrf_token;
  };
  const searchDocument = async() => {
    var response = await fetch(`${config.backendUrl}search_document/`, {
        method:'GET',
    });
  };
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-4 ">
      <h2 className="text-xl font-semibold mb-2 text-gray-700">
        Search Documents
      </h2>
      <input
        type="text"
        placeholder="Search Users..."
        className="border rounded-md px-3 py-2 mb-4 w-full shadow-sm focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button
        onClick={() => searchDocument(searchTerm)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-1 transition-all duration-300 hover:scale-105"
      >
        Search
      </button>
      <p className="text-gray-600 mb-4">
        Total Users: {filteredUsers.length} (Filtered from {users.length})
      </p>
      <table className="min-w-full border border-collapse shadow-md">
        <thead>
          <tr className="bg-gray-300 text-gray-800 font-medium">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Username</th>
            <th className="border px-4 py-2">Phone</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-gray-100 transition-all duration-200"
            >
              <td className="border px-4 py-2 text-center">{user.id}</td>
              <td className="border px-4 py-2">
                {editUser?.id === user.id ? (
                  <input
                    type="text"
                    value={editUser.first_name}
                    onChange={(e) =>
                      setEditUser({
                        ...editUser,
                        first_name: e.target.value,
                      })
                    }
                    className="border rounded px-2 py-1 w-full"
                  />
                ) : (
                  user.first_name
                )}
              </td>
              <td className="border px-4 py-2">
                {editUser?.id === user.id ? (
                  <input
                    type="email"
                    value={editUser.email}
                    onChange={(e) =>
                      setEditUser({ ...editUser, email: e.target.value })
                    }
                    className="border rounded px-2 py-1 w-full"
                  />
                ) : (
                  user.email
                )}
              </td>
              <td className="border px-4 py-2">
                {editUser?.id === user.id ? (
                  <input
                    type="text"
                    value={editUser.username}
                    onChange={(e) =>
                      setEditUser({ ...editUser, username: e.target.value })
                    }
                    className="border rounded px-2 py-1 w-full"
                  />
                ) : (
                  user.username
                )}
              </td>
              <td className="border px-4 py-2">
                {" "}
                {/* Phone number cell */}
                {editUser?.id === user.id ? (
                  <input
                    type="tel" // Use tel input for phone numbers
                    value={editUser.phone_number}
                    onChange={(e) =>
                      setEditUser({
                        ...editUser,
                        phone_number: e.target.value,
                      })
                    }
                    className="border rounded px-2 py-1 w-full"
                  />
                ) : (
                  user.phone_number
                )}
              </td>
              <td className="border px-4 py-2 text-center">
                {editUser?.id === user.id ? (
                  <>
                    <button
                      onClick={() => handleUpdateUser(user)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-1 transition-all duration-300 hover:scale-105"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => setEditUser(null)}
                      className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded transition-all duration-300 hover:scale-105"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEdit(user)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-1 transition-all duration-300 hover:scale-105"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(user)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded transition-all duration-300 hover:scale-110"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow-inner transition-all duration-300">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Add New User
        </h3>
        <form>
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
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_allowed"
              name="is_allowed"
              checked={newUser.is_allowed}
              onChange={(e) =>
                setNewUser({ ...newUser, is_allowed: e.target.value })
              }
              className="mr-2"
            />
            <label htmlFor="is_allowed" className="text-black">
              Is Allowed?
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_faculty"
              name="is_faculty"
              checked={newUser.is_faculty}
              onChange={(e) =>
                setNewUser({ ...newUser, is_faculty: e.target.value })
              }
              className="mr-2"
            />
            <label htmlFor="is_faculty" className="text-black">
              Is Faculty?
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_admin"
              name="is_admin"
              checked={newUser.is_admin}
              onChange={(e) =>
                setNewUser({ ...newUser, is_admin: e.target.value })
              }
              className="mr-2"
            />
            <label htmlFor="is_admin" className="text-black">
              Is Admin?
            </label>
          </div>
          <button
            onClick={handleAddUser}
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 hover:scale-105"
          >
            Add User
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchDocument;
