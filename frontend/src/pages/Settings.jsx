import React from 'react';

const Settings = () => {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 max-w-lg mx-auto mt-10">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Settings ⚙️</h2>
      <p className="text-gray-600 mb-6">Update your account settings below.</p>
      
      <form className="space-y-4">
        {/* Theme Selection */}
        <div>
          <label htmlFor="theme" className="block text-gray-700 font-medium">Theme</label>
          <select id="theme" className="w-full border rounded-lg p-2 mt-1">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        
        {/* Change Name */}
        <div>
          <label htmlFor="name" className="block text-gray-700 font-medium">Change Name 📝</label>
          <input type="text" id="name" className="w-full border rounded-lg p-2 mt-1" placeholder="Enter your name" />
        </div>
        
        {/* Change Email */}
        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium">Change Email 📧</label>
          <input type="email" id="email" className="w-full border rounded-lg p-2 mt-1" placeholder="Enter your email" />
        </div>
        
        {/* Change Password */}
        <div>
          <label htmlFor="password" className="block text-gray-700 font-medium">Change Password 🔒</label>
          <input type="password" id="password" className="w-full border rounded-lg p-2 mt-1" placeholder="Enter new password" />
        </div>
        
        {/* Update Profile Picture */}
        <div>
          <label htmlFor="profilePicture" className="block text-gray-700 font-medium">Update Profile Picture (Optional) 📷</label>
          <input type="file" id="profilePicture" className="w-full border rounded-lg p-2 mt-1" />
        </div>
        
        {/* Save Changes Button */}
        <button type="submit" className="w-full bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200">
          Save Changes
        </button>
        <div className="bg-white shadow-lg rounded-2xl p-6 max-w-lg mx-auto mt-10 pb-10"></div>

      </form>
    </div>
  );
};

export default Settings;