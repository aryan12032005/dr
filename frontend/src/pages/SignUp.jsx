import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import config from "../config.js";
import networkRequests from "../request_helper";

const req_client = new networkRequests();

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
  const [allDepartments,setAllDepartments] = useState([]);

  useEffect(() => {
    getAllDepartments();
  },[navigate]);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getCSRFToken = async () => {
    const response = await fetch(`${config.backendUrl}signup/`, {
      method: "GET",
    });
    const data = await response.json();
    return data.csrf_token;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers= {
        "Content-Type": "application/json",
      };
      const response = await req_client.fetchReq("signup/","POST", headers, JSON.stringify(formData));

      if (response.ok) {
        alert("Signup successful!");
        navigate("/LogIn");
      } else {
        const errorData = await response.json();
        alert(`Signup failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("An error occurred during signup.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-700 rounded-lg shadow-lg p-8 border border-zinc-600">
        <h2 className="text-3xl font-semibold text-yellow-100 mb-6 text-center">
          Sign Up
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-white mb-1">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-zinc-600 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="department" className="block text-white mb-1">
              Department code:
            </label>
            <select
              className="w-full p-3 rounded-md border border-zinc-600 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.dep_code}
              onChange={handleChange}
            >
              <option value="" default disabled>
                Select a department
              </option>
              {allDepartments.map((item) => (
              <option value={item.dep_code} key={item.dep_code}>{item.dep_name}</option>
            ))}
            </select>
          </div>
          <div>
            <label htmlFor="username" className="block text-white mb-1">
              Username:
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-zinc-600 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-white mb-1">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-zinc-600 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="first_name" className="block text-white mb-1">
              First Name:
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-zinc-600 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-white mb-1">
              Last Name:
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-zinc-600 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="phone_number" className="block text-white mb-1">
              Phone Number:
            </label>
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-zinc-600 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_faculty"
                name="is_faculty"
                checked={formData.is_faculty}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="is_faculty" className="text-white">
                Is Faculty?
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_admin"
                name="is_admin"
                checked={formData.is_admin}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="is_admin" className="text-white">
                Is Admin?
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_allowed"
                name="is_allowed"
                checked={formData.is_allowed}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="is_allowed" className="text-white">
                Is Allowed?
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-300"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
