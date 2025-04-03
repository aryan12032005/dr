import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import networkRequests from "../request_helper";
//import { saveAs } from "file-saver";

const req_client = new networkRequests();

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [addNewUser, setAddUser] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
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
  const navigate = useNavigate();
  const [csvFile, setCSVFile] = useState("");
  const [uploadAsFaculty, toggleUploadFaculty] = useState(false);
  const [allDepartments, setAllDepartments] = useState([]);

  useEffect(() => {
    getAllDepartments();
  }, [navigate]);

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

  useEffect(() => {
    // on loading page refresh users in db
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    // Fetch users from db
    if (!req_client.accessToken) {
      navigate("/LogIn");
      return;
    }
    try {
      req_client.reload_tokens();
      const headers = { Authorization: `Bearer ${req_client.accessToken}` };
      const result = await req_client.fetchReq(
        "admin/?start_c=0&end_c=50&is_admin=False",
        "GET",
        headers
      );
      const resultJson = await result.json();
      if (result.ok) {
        setUsers(resultJson.users);
        setFilteredUsers(resultJson.users);
      } else {
        alert(resultJson.message);
        sessionStorage.clear();
        navigate("/LogIn");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    // on search term change
    setFilteredUsers(
      users.filter(
        (user) =>
          user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  const searchUser = async (query) => {
    // search for specific user in database
    try {
      req_client.reload_tokens();
      const headers = {
        Authorization: `Bearer ${req_client.accessToken}`,
        "Content-Type": "application/json",
      };
      const result = await req_client.fetchReq(
        `admin/?start_c=0&end_c=50&querry=${query}&is_admin=False`,
        "GET",
        headers
      );
      const resultJson = await result.json();
      setUsers(resultJson.users);
      setFilteredUsers(resultJson.users);
    } catch (error) {
      console.error("Error searching users:", error);
    }
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

  const handleEdit = (user) => {
    setEditUser(user);
  };

  const handleUpdateUser = async (user) => {
    // update user information to database
    const confirmation = window.confirm(
      `Are you sure to save user ${user.username}?`
    );
    if (confirmation) {
      if (
        editUser.first_name.trim() !== "" &&
        editUser.email.trim() !== "" &&
        editUser.phone_number.trim() !== ""
      ) {
        req_client.reload_tokens();
        const headers = {
          Authorization: `Bearer ${req_client.accessToken}`,
          "Content-Type": "application/json",
        };
        const result = await req_client.fetchReq(
          "edit_user/",
          "POST",
          headers,
          JSON.stringify(user)
        );
        if (result.ok) {
          fetchUsers();
        } else {
          data = result.json();
          alert(data.message);
        }
        setEditUser(null);
      } else {
        alert("Please Enter a valid name and email and phone ");
      }
    }
  };

  const handleDelete = async (user) => {
    // handle detele a user
    const confirmation = window.confirm(
      `Are you sure to delete user ${user.username}?`
    );
    if (confirmation) {
      try {
        req_client.reload_tokens();
        const headers = {
          Authorization: `Bearer ${req_client.accessToken}`,
          "Content-Type": "application/json",
        };
        const result = await req_client.fetchReq(
          "admin/delete_user/",
          "DELETE",
          headers,
          JSON.stringify(user)
        );
        const message = await result.json();
        if (result.ok) {
          alert("User deleted.");
          fetchUsers();
        } else {
          alert(message.message);
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg flex flex-col items-center p-6 mb-4 ">
      <h1 className="text-3xl font-semibold mb-2 text-gray-1200 underline">
        User Management
      </h1>
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
      )}
      <input
        type="text"
        placeholder="Search Users..."
        className="border rounded-md px-3 py-2 mb-4 mt-7 w-full shadow-sm focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button
        onClick={() => searchUser(searchTerm)}
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
            <th className="border px-4 py-2">Is Allowed</th>
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
                    type="tel"
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
              <td className="border px-4 py-2">
                {" "}
                {editUser?.id === user.id ? (
                  <input
                    type="checkbox"
                    checked={editUser.is_allowed}
                    onChange={(e) =>
                      setEditUser({
                        ...editUser,
                        is_allowed: e.target.checked,
                      })
                    }
                    className="border rounded px-2 py-1 w-full"
                  />
                ) : user.is_allowed ? (
                  "Yes"
                ) : (
                  "No"
                )}
              </td>

              <td className="border px-4 py-2 text-center">
                {editUser?.id === user.id ? (
                  <>
                    <button
                      onClick={() => handleUpdateUser(editUser)}
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
    </div>
  );
};

export default UserManagement;
