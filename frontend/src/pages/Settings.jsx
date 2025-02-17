import React from 'react';

const Settings = () => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-4"> {/* Added margin-bottom */}
      <h2>Settings</h2>
      {/* Your settings form or content goes here */}
      <p>This is the settings page content.</p>
      {/* Example: */}
      <form>
        <label htmlFor="theme">Theme:</label>
        <select id="theme">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default Settings;