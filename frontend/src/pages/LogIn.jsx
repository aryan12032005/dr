import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import config from '../config.js'

const Login = () => {

  const getCSRFToken = async() => {
    var response=await fetch(`${config.backendUrl}login/`, {
      method: 'GET',
    });
    var data= await response.json()
    return data.csrf_token
  };

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send login data to your backend (replace with your actual API endpoint)
      const csrfToken = getCSRFToken();
      const response = await fetch(`${config.backendUrl}login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Handle successful login (e.g., store token in local storage and redirect)
        const data = await response.json(); 
        localStorage.setItem('token', data.token); 
        alert('Login successful!');
        // Redirect to the desired page after login
      } else {
        // Handle login errors
        const errorData = await response.json();
        alert(`Login failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login.');
    }
  };

  return (
    <div className=" md:h-[85vh] flex flex-col md:flex-row items-center justify-center bg-zinc-900">
      <div className="w-full md:w-1/2 p-8 bg-zinc-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-100">Log In</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-white">
              Username:
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-white">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
            onClick={handleSubmit}
          >
            Log In
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className='text-white'>
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-500">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;