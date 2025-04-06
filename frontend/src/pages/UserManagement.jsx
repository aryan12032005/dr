import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import networkRequests from "../request_helper";
import Signup from "./SignUp";

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
        "search_user/?start_c=0&end_c=50&is_admin=False",
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
        `search_user/?start_c=0&end_c=50&querry=${query}&is_admin=False`,
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
          "delete_user/",
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
      <Signup/>
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