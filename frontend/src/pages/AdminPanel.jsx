import React, { useState, useEffect } from 'react';
import Settings from './Settings'; 
import DocumentManage from './DocumentManage';
import NewUserAdmin from './NewUserAdmin';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import UserManagement from './UserManagement';
import config from '../config.js'

const AdminPanel = () => {
  const location =useLocation();
  const navigate=useNavigate();
  const check = async () => {
    try {
      const accessToken=localStorage.getItem('access_token');
      if(!accessToken){
        navigate('/LogIn');
      }
      else{
        var result = await fetch(
          `${config.backendUrl}admin/?start_c=0&end_c=5`,
          {
            method: "get",
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if(result.ok){
          console.log('ok');
        }
        else{
          localStorage.clear();
          navigate('/LogIn');
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }
  useEffect(() => {
      check();
    }, [navigate]);

  return (
    <div className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 min-h-screen p-4 ">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800 drop-shadow-lg">Admin Panel</h1>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6"> {/* Card-like container */}
          <div className="flex space-x-6 justify-center"> {/* Use flexbox for horizontal layout */}
            <Link to="/adminpanel/UserManagement" className={`px-4 py-2 rounded-md ${location.pathname === '/adminpanel/UserManagement' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors duration-300`}>
              User Management
            </Link>
            <Link to="/adminpanel/DocumentManage" className={`px-4 py-2 rounded-md ${location.pathname === '/adminpanel/DocumentManage' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors duration-300`}>
              Document Management
            </Link>
            <Link to="/adminpanel/Settings" className={`px-4 py-2 rounded-md ${location.pathname === '/adminpanel/Settings' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors duration-300`}>
              Settings
            </Link>
            <Link to="/adminpanel/NewUserAdmin" className={`px-4 py-2 rounded-md ${location.pathname === '/adminpanel/NewUserAdmin' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors duration-300`}>
              New User Sign Up
            </Link>
          </div>
        </div>
        {/* Conditionally render the paragraph */}
        {location.pathname === '/' || location.pathname==='/adminpanel' ? ( // Check if on the base path or adminpanel
          <div className="text-center">
            <p>Navigate through the dashboard to access admin features</p>
          </div>
        ) : null}
        <Routes>
        <Route path="/Settings" element={<Settings />} />
        <Route path="/NewUserAdmin" element={<NewUserAdmin/>} />
        <Route path="/DocumentManage" element={<DocumentManage/>} />
        <Route path="/UserManagement" element={<UserManagement/>} />
        </Routes>
      
      </div>
    </div>
  );
};

export default AdminPanel;