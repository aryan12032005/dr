import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import networkRequests from "../request_helper";

const req_client = new networkRequests();

const Login = () => {
  const navigate = useNavigate();

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
      req_client.reload_tokens();
      const header = {
        'Content-Type': 'application/json',
      };
      const response = await req_client.fetchReq("login/", "POST", header, JSON.stringify(formData));
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('access_token', data.access_token);
        sessionStorage.setItem('refresh_token', data.refresh_token);
        req_client.accessToken = data.access_token;
        req_client.refreshToken = data.refresh_token;
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(`Login failed: ${errorData.message}`);
      }
    } catch (error) {
      alert('An error occurred during login.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-md  bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 transition-transform hover:scale-105">
        <h2 className="text-4xl font-bold text-white text-center mb-6 drop-shadow-md">
           Welcome Back
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm text-white mb-1">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-white mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300"
          >
            Log In
          </button>
        </form>
        {/* <div className="mt-6 text-center">
          <p className="text-gray-300">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-500 underline">
              Sign Up
            </Link>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
