import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLinkedin, FaBook, FaLightbulb, FaUsers } from "react-icons/fa";
import networkRequests from "../request_helper";

const req_client = new networkRequests();

const AboutUs = () => {
  const [query, setQuery] = useState("");
  const [queryEmail, setQueryEmail] = useState("");
  const [queryName, setQueryName] = useState("");

  const sendQuery = async () => {
    if (!query.trim() || !queryEmail.trim() || !queryName.trim()) {
      alert("Please fill in all fields");
      return;
    }
    const headers = {};
    const data = new FormData();
    data.append("query", query);
    data.append("email", queryEmail);
    data.append("name", queryName);
    const result = await req_client.fetchReq("send_query/", "POST", headers, data);
    if (result.ok) {
      const resultJson = await result.json();
      alert(resultJson.message);
      setQuery("");
      setQueryEmail("");
      setQueryName("");
    } else {
      const resultJson = await result.json();
      alert(resultJson.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">About Digital Repository</h1>
          <p className="text-xl text-gray-600">Institutional Digital Repository, Manav Rachna University</p>
        </div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Text Content */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FaBook className="text-blue-600 text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Welcome</h2>
                  <p className="text-gray-600">Swami Vivekananda Library & Resource Center</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                At the heart of our academic ecosystem is the <span className="font-semibold text-blue-600">Swami Vivekananda Library and Resource Center</span>, a dynamic knowledge resource center established under <span className="font-semibold text-blue-600">Manav Rachna University</span>.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Equipped with modern facilities, digital resources, and a vast collection of physical books, journals, and e-content, the library is a space where curiosity meets opportunity.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <FaLightbulb className="text-amber-600 text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Whether you're diving into research, collaborating on projects, or exploring new ideas, MRU and its library provide the perfect environment to thrive and excel in your academic journey.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8">
              <p className="text-xl text-center text-gray-800 font-medium italic">
                "The only thing that you absolutely have to know is the location of the library"
              </p>
              <p className="text-center text-gray-600 mt-3">— Albert Einstein</p>
            </div>
          </div>

          {/* Right: Image */}
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src="lib3.jpg"
              alt="Library"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Project Info Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FaUsers className="text-purple-600 text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Project Leadership</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Project Mentor */}
            <a href="https://www.linkedin.com/in/dr-mrinal-pandey-0b35352a2/" target="_blank" rel="noopener noreferrer" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all group-hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <FaUser className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-semibold">Project Mentor</p>
                    <p className="text-lg font-bold text-gray-900">Dr. Mrinal Pandey</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">Professor, Manav Rachna University</p>
                <div className="flex items-center gap-2 mt-4 text-blue-600">
                  <FaLinkedin /> View Profile
                </div>
              </div>
            </a>

            {/* Project Guide */}
            <a href="https://www.linkedin.com/in/mamta-kaushik-ab2a84266/" target="_blank" rel="noopener noreferrer" className="group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all group-hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <FaUser className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-semibold">Project Guide</p>
                    <p className="text-lg font-bold text-gray-900">Dr. Mamta Kaushik</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">Deputy Librarian, Manav Rachna University</p>
                <div className="flex items-center gap-2 mt-4 text-green-600">
                  <FaLinkedin /> View Profile
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Query Form Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-amber-100 rounded-xl">
              <FaEnvelope className="text-amber-600 text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Have a Query?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={queryEmail}
                onChange={(e) => setQueryEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Query</label>
            <textarea
              rows="5"
              placeholder="Tell us what's on your mind..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            onClick={sendQuery}
            className="mt-6 w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-8 rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            Submit Query
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
