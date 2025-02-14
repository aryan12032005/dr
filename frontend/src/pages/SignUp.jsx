import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import config from '../config.js'
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password:'',
    first_name: '',
    last_name: '',
    phone_number: '',
    is_faculty: false,
    is_admin: false,
    is_allowed: true,
  });

  const navigate=useNavigate();

  // Handle changes in form input fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const getCSRFToken = async() => {
    var response=await fetch(`${config.backendUrl}signup/`, {
      method: 'GET',
    });
    var data= await response.json()
    console.log(data.csrf_token)
    return data.csrf_token
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation (you'll likely need more robust validation)
    // if (formData.password !== formData.confirmPassword) {
    //   alert('Passwords do not match.');
    //   return;
    // }

    try {
      // Send signup data to your backend (replace with your actual API endpoint)
      const csrfToken = getCSRFToken();
      const response = await fetch(`${config.backendUrl}signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Handle successful signup (e.g., redirect to login page)
        alert('Signup successful!');
        // Redirect to login page
        navigate('/LogIn')
      } else {
        // Handle signup errors
        const errorData = await response.json();
        alert(`Signup failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup.');
    }
  };

  return (
    <div className="h-screen md:h-[85vh] flex flex-col md:flex-row items-center justify-center bg-zinc-900">
      <div className="w-full md:w-1/2 p-8 bg-zinc-800 rounded-lg shadow-md">
        <h2 className="text-2xl text-yellow-100 font-semibold mb-4">Sign Up</h2>
        <form onSubmit={handleSubmit}>
        <div>
        <label htmlFor="email" className="block text-white">
          Email:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="username" className="block text-white">
          Username:
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="username" className="block text-white">
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

      <div>
        <label htmlFor="first_name" className="block text-white">
          First Name:
        </label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="last_name" className="block text-white">
          Last Name:
        </label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="phone_number" className="block text-white ">
          Phone Number:
        </label>
        <input
          type="text"
          id="phone_number"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
        />
      </div>

      
      <div className="flex flex-col md:flex-row gap-4 mb-8"> {/* Parent container */}
  <div className="flex items-center">
    <input type="checkbox" id="is_faculty" name="is_faculty" checked={formData.is_faculty} onChange={handleChange} className="mr-2" />
    <label htmlFor="is_faculty" className="text-white">Is Faculty?</label>
  </div>

  <div className="flex items-center">
    <input type="checkbox" id="is_admin" name="is_admin" checked={formData.is_admin} onChange={handleChange} className="mr-2" />
    <label htmlFor="is_admin" className="text-white">Is Admin?</label>
  </div>

  <div className="flex items-center">
    <input type="checkbox" id="is_allowed" name="is_allowed" checked={formData.is_allowed} onChange={handleChange} className="mr-2" />
    <label htmlFor="is_allowed" className="text-white">Is Allowed?</label>
  </div>
</div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center ">
          <p className='text-white'>
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;