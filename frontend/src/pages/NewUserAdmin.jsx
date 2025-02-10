import React, { useState } from 'react';


const NewUserAdmin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {  // Placeholder - replace with actual API call
    e.preventDefault();
    // ... (Your actual API call logic here as in the previous example) ...
    // For this UI-only example, we'll simulate success/failure:
    if (username && password && email) { // Simple check
      setSuccess(true);
      setError('');
    } else {
      setError("All fields are required.");
      setSuccess(false);
    }
};
      return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <div className="bg-white p-8 rounded shadow-md w-96">
            <h2 className="text-2xl font-bold mb-4">Register</h2>
    
            {success && <p className="text-green-500 mb-4">Registration successful!</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}
    
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-gray-700 font-bold mb-2">Username:</label>
                <input
                  type="text"
                  id="username"
                  className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password:</label>
                <input
                  type="password"
                  id="password"
                  className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email:</label>
                <input
                  type="email"
                  id="email"
                  className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Register
              </button>
            </form>
          </div>
        </div>
      );
}

export default NewUserAdmin;
