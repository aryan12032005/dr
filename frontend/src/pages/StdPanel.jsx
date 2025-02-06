import React, { useState } from 'react';
import SearchBar from '../components/searchbar/Searchbar'; 

const StdPanel = () => {
  const [searches, setSearches] = useState([]);

  const handleSearch = (inputValue) => {
    if (inputValue.trim()) {
      setSearches([inputValue, ...searches.slice(0, 4)]);
    }
  };

  return (
    <main style={{ 
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh', 
      backgroundColor: '#181818',
    }}> 
      <h1 style={{ fontSize: '5rem', color: 'yellow'}}>Digital Repository</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'normal', marginBottom: '2rem', color: 'yellow' }}>
        One stop for your Digitally Stored Your Data
      </h2>
      <SearchBar onSearch={handleSearch} /> 

      {searches.length > 0 && (
        <ul style={{ listStyle: 'none', padding: '0', margin: '1rem 0' }}>
          {searches.map((search, index) => (
            <li key={index} style={{ marginBottom: '0.5rem' }}>
              {search}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default StdPanel;