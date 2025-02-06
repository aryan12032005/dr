import { useState } from "react";
import { Search } from "lucide-react";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="flex items-center border border-gray-300 rounded-lg p-1 pl-2 shadow-sm w-full max-w-md bg-white focus-within:border-blue-500"> 
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleInputChange}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }} 
        className="flex-1 outline-none p-2 bg-transparent focus:outline-none" 
      />
      <button
        onClick={handleSearch}
        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed" 
        disabled={!query} 
      >
        <Search size={20} />
      </button>
    </div>
  );
};

export default SearchBar;