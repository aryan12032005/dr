import { useState, useEffect } from "react";
import networkRequests from "../request_helper";
import { useNavigate } from "react-router-dom";

const req_client = new networkRequests();
const ViewGroups = () => {
  const navigate = useNavigate();
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchedGroups, setSearchedGroups] = useState([]);

  useEffect(() => {
    searchGroups();
  }, [navigate]);

  const searchGroups = async () => {
    req_client.reload_tokens();
    const headers = {
      Authorization: `Bearer ${req_client.accessToken}`,
      "Content-Type": "application/json",
    };
    const result = await req_client.fetchReq(
      `get_member_group/`,
      "GET",
      headers
    );
    if (result.ok) {
      const resultJson = await result.json();
      console.log(resultJson);
      setSearchedGroups(resultJson.groups);
    } else {
      alert("no groups found");
    }
  };

  useEffect(() => {
    const fetchGroupDetails = async () => {
      const headers = {
        Authorization: `Bearer ${req_client.accessToken}`,
        "Content-Type": "application/json",
      };
      let details = await Promise.all(
        searchedGroups.map(async (group_id) => {
          try {
            console.log("Sending group_id:", group_id); // Now a single string
            const response = await req_client.fetchReq(
              `/get_groups/?group_id=${encodeURIComponent(group_id)}`,
              "GET",
              headers
            );
      
            if (response.ok) {
              const data = await response.json();
              return data.group_details;  // Return the result for this group_id
            } else {
              return null;
            }
          } catch (error) {
            return null;
          }
        })
      );
      
      // Filter out any null or undefined values from the result
      details = details.filter(detail => detail !== null);
      
      setFilteredGroups(details);
    };

    if (searchedGroups.length > 0) {
      fetchGroupDetails();
    }
    console.log("filtered_groups", filteredGroups);
  }, [searchedGroups]);

  return (
    <>
      <div className="flex flex-col items-center mt-5 mx-10">
        <div className="bg-gray-200 p-1 rounded-full w-fit flex">
          <button
            onClick={() => navigate("/search-doc")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all text-gray-700 `}
          >
            Search Docs
          </button>
          <button
            onClick={() => navigate("/my-groups")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all bg-blue-500 text-white shadow`}
          >
            View Groups
          </button>
        </div>
        <h1 className="text-xl font-semibold mb-2 text-gray-700 mt-5">
          My groups
        </h1>
        <input
          type="text"
          placeholder="Search groups..."
          value={groupSearchQuery}
          onChange={(e) => setGroupSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-5"
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-5 transition-all duration-300 hover:scale-105"
          onClick={searchGroups}
        >
          Search
        </button>

        {/* Groups List */}
        {filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-lg text-gray-800">
                      {group.group_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {group.members.length} members
                    </p>
                  </div>
                </div>

                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Members:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {group.members.slice(0, 5).map((member) => (
                      <span
                        key={member.id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {member.first_name} - {member.username}
                      </span>
                    ))}
                    {group.members.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        +{group.members.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Documents Section */}

                <div className="mt-1 border-t pt-2">
                  {group.documents && group.documents.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {group.documents.slice(0, 3).map((doc, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                        >
                          {doc.title || `Document ${index + 1}`}
                        </span>
                      ))}
                      {group.documents.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          +{group.documents.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs">
                      No documents added yet
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">No groups found.</p>
        )}
      </div>
    </>
  );
};

export default ViewGroups;
