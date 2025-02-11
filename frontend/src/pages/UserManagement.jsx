import React, { useState, useEffect } from 'react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);

      const [newUser, setNewUser] = useState({ name: '', email: '',phone:'' });
    
      const [searchTerm, setSearchTerm] = useState('');
    
      const [editUser, setEditUser] = useState(null);
    
    
    
      useEffect(() => {
    
        const fetchUsers = async () => {
    
          try {
    
            const response = await new Promise((resolve) => {
    
              setTimeout(() => {
    
                resolve([
    
                  { id: 1, name: 'John Doe', email: 'john.doe@example.com',phone: '123-456-7890' },
    
                  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com',phone: '123-456-7890' },
    
                  { id: 3, name: 'Peter Jones', email: 'peter.jones@example.com',phone: '123-456-7890' },
    
                  { id: 4, name: 'Alice Johnson', email: 'alice.j@example.com',phone: '123-456-7890' },
    
                  { id: 5, name: 'Bob Williams', email: 'bob.w@example.com',phone: '123-456-7890' },
    
                ]);
    
              }, 500);
    
            });
    
            setUsers(response);
    
          } catch (error) {
    
            console.error("Error fetching users:", error);
    
          }
    
        };
    
        fetchUsers();
    
      }, []);
    
    
    
      const handleDelete = (id) => {
    
        setUsers(users.filter((user) => user.id !== id));
    
      };
    
    
    
      const handleAddUser = () => {
    
        if (newUser.name.trim() !== "" && newUser.email.trim() !== "" && newUser.email.trim() !== "") {
    
          const nextId = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
    
          setUsers([...users, { id: nextId, ...newUser }]);
    
          setNewUser({ name: '', email: '', phone:'' });
    
        } else {
    
          alert("Please Enter a valid name and email and phone number");
    
        }
    
      };
    
    
    
      const handleEdit = (user) => {
    
        setEditUser(user);
    
      };
    
    
    
      const handleUpdateUser = () => {
    
        if (editUser.name.trim() !== "" && editUser.email.trim() !== "" && editUser.phone.trim() !== "") {
    
          setUsers(users.map(user => user.id === editUser.id ? editUser : user));
    
          setEditUser(null);
    
        } else {
    
          alert("Please Enter a valid name and email and phone ");
    
        }
    
      };
    
    
    
      const filteredUsers = users.filter(user =>
    
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    
        user.email.toLowerCase().includes(searchTerm.toLowerCase())||
    
        user.phone.toLowerCase().includes(searchTerm.toLowerCase())
    
      );
    
    
    
      return (
    
        <div className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 min-h-screen p-4 ">
    
          <div className="container mx-auto">

    
    
            <div className="bg-white shadow-lg rounded-lg p-6 mb-4 ">
    
              <h2 className="text-xl font-semibold mb-2 text-gray-700">User Management</h2>
    
    
    
              <input
    
                type="text"
    
                placeholder="Search Users..."
    
                className="border rounded-md px-3 py-2 mb-4 w-full shadow-sm focus:ring-2 focus:ring-blue-500 transition-all duration-300"
    
                value={searchTerm}
    
                onChange={(e) => setSearchTerm(e.target.value)}
    
              />
    
    
    
              <p className="text-gray-600 mb-4">Total Users: {filteredUsers.length} (Filtered from {users.length})</p>
    
    
    
              <table className="min-w-full border border-collapse shadow-md">
    
                <thead>
    
                  <tr className="bg-gray-300 text-gray-800 font-medium">
    
                    <th className="border px-4 py-2">ID</th>
    
                    <th className="border px-4 py-2">Name</th>
    
                    <th className="border px-4 py-2">Email</th>
    
                    <th className="border px-4 py-2">Phone</th>
    
                    <th className="border px-4 py-2">Actions</th>
    
                  </tr>
    
                </thead>
    
                <tbody>
    
                  {filteredUsers.map((user) => (
    
                    <tr key={user.id} className="hover:bg-gray-100 transition-all duration-200">
    
                      <td className="border px-4 py-2 text-center">{user.id}</td>
    
                      <td className="border px-4 py-2">
    
                        {editUser?.id === user.id ? (
    
                          <input
    
                            type="text"
    
                            value={editUser.name}
    
                            onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
    
                            className="border rounded px-2 py-1 w-full"
    
                          />
    
                        ) : (
    
                          user.name
    
                        )}
    
                      </td>
    
                      <td className="border px-4 py-2">
    
                        {editUser?.id === user.id ? (
    
                          <input
    
                            type="email"
    
                            value={editUser.email}
    
                            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
    
                            className="border rounded px-2 py-1 w-full"
    
                          />
    
                        ) : (
    
                          user.email
    
                        )}
    
                      </td>
    
                      <td className="border px-4 py-2"> {/* Phone number cell */}
    
                        {editUser?.id === user.id ? (
    
                          <input
    
                            type="tel" // Use tel input for phone numbers
    
                            value={editUser.phone}
    
                            onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
    
                            className="border rounded px-2 py-1 w-full"
    
                          />
    
                        ) : (
    
                          user.phone
    
                        )}
    
                      </td>
    
                      <td className="border px-4 py-2 text-center">
    
                        {editUser?.id === user.id ? (
    
                          <>
    
                            <button
    
                              onClick={handleUpdateUser}
    
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
    
                          onClick={() => handleDelete(user.id)}
    
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
    
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Add New User</h3>
    
                <input
    
                  type="text"
    
                  placeholder="Name"
    
                  className="border rounded px-3 py-2 mr-2 mb-2 w-full"
    
                  value={newUser.name}
    
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
    
                />
    
                <input
    
                  type="email"
    
                  placeholder="Email"
    
                  className="border rounded px-3 py-2 mr-2 mb-2 w-full"
    
                  value={newUser.email}
    
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
    
                />
    
                <input  
    
                  type="tel"
    
                  placeholder="Phone"
    
                  className="border rounded px-3 py-2 mr-2 mb-2 w-full"
    
                  value={newUser.phone}
    
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
    
                />
    
                <button
    
                  onClick={handleAddUser}
    
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 hover:scale-105"
    
                >
    
                  Add User
    
                </button>
    
              </div>
    
            </div>
    
          </div>
    
        </div>
  )
}

export default UserManagement
