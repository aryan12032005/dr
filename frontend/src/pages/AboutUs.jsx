import { React, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import networkRequests from "../request_helper";

const req_client = new networkRequests();
const AboutUs = () => {
  const [query, setQuery] = useState("");
  const [queryEmail, setQueryEmail] = useState("");
  const [queryName, setQueryName] = useState("");

  const sendQuery = async () => {
    const headers = {};
    const data = new FormData();
    data.append("query", query);
    data.append("email", queryEmail);
    data.append("name", queryName);
    const result = await req_client.fetchReq(
      "send_query/",
      "POST",
      headers,
      data
    );
    if (result.ok) {
      const resultJson = await result.json();
      alert(resultJson.message);
    } else {
      const resultJson = await result.json();
      alert(resultJson.message);
    }
  };
  return (
    <div className="bg-gradient-to-br from-indigo-100 via-blue-100 to-sky-100 min-h-screen flex flex-col items-center justify-center py-16 px-6 sm:px-8 lg:px-16">
      {/* Main Card */}
      <div className="max-w-7xl mx-auto bg-white bg-opacity-100 backdrop-lg shadow-2xl rounded-2xl overflow-hidden transform transition-all duration-500 hover:scale-105">
        <div className="md:flex">
          {/* Left Side */}
          <div className="md:w-1/2 p-8 lg:p-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              About Us
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-5">
              Welcome to{" "}
              <span className="font-semibold text-indigo-600">
                Institutional Digital Repository, Manav Rachna University
              </span>{" "}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-5">
              At the heart of our academic ecosystem is the{" "}
              <span className="font-semibold text-indigo-600">
                Swami Vivekananda Library and Resource Center
              </span>
              , a dynamic knowledge resource center established under the
              ecosystem on{" "}
              <span className="font-semibold text-indigo-600">
                Manav Rachna University
              </span>{" "}
              that supports learning, research, and personal growth. Equipped
              with modern facilities, digital resources, and a vast collection
              of physical books, journals, and e-content, the library is a space
              where curiosity meets opportunity.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-5">
              Whether you're diving into research, collaborating on projects, or
              simply exploring new ideas, MRU and its library provide the
              perfect environment to thrive.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              The only thing that you absolutely have to know is the location of
              the library -{" "}
              <span className="font-semibold text-indigo-600">
                Albert Einstein
              </span>
            </p>
          </div>

          {/* Right Side: Image */}
          <div className="md:w-1/2 relative">
            <img
              src="lib3.jpg"
              alt="Teamwork"
              className="w-full h-full object-cover md:h-auto transition-transform duration-500 hover:scale-110"
            />
          </div>
        </div>

        {/* Social Media Section */}
        <div className="bg-gray-900 text-white py-8 px-6 lg:px-12 text-center">
          <h3 className="text-2xl font-semibold mb-4">
            Live, Learn and Thrive
          </h3>
          <div className="flex justify-center space-x-6">
            {/* Social media icons if needed */}
          </div>
        </div>
      </div>

      {/*  Location and  Contact Form Section */}
      <div className="mt-12 w-full max-w-7xl flex flex-col md:flex-row gap-8 justify-center">
        {/*  Location Card */}
        <div className="md:w-1/2 h-full bg-white shadow-xl rounded-xl overflow-hidden transition-transform duration-500 hover:scale-105 flex flex-col">
          <div className="p-6 flex flex-col justify-between flex-grow">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Developed By
            </h3>
            <a
              href="https://www.linkedin.com/in/dr-mrinal-pand ey-0b35352a2/"
              target="_blank"
            >
              <p className="text-gray-600 mb-4 flex-grow transition-transform duration-500 hover:scale-105 hover:text-blue-500">
                Project Mentor - Dr. Mrinal Pandey (Professor, MRU)
              </p>
            </a>
            <a
              href="https://www.linkedin.com/in/mamta-kaushik-ab2a84266/"
              target="_blank"
            >
              <p className="text-gray-600 mb-4 flex-grow transition-transform duration-500 hover:scale-105 hover:text-blue-500">
                Project Guide - Dr. Mamta Kaushik (Deputy Librarian, MRU)
              </p>
            </a>
            <a
              href="https://www.linkedin.com/in/harsh-yadav-1761ab228/"
              target="_blank"
            >
              <p className="text-gray-600 mb-4 flex-grow transition-transform duration-500 hover:scale-105 hover:text-blue-500">
                Team Lead - Harsh Yadav (FullStack Developer)
              </p>
            </a>
            <a
              href="https://www.linkedin.com/in/mridul-milan-4677a7253/"
              target="_blank"
            >
              <p className="text-gray-600 mb-4 flex-grow transition-transform duration-500 hover:scale-105 hover:text-blue-500">
                Senior devloper - Mridul Milan (Frontend Developer)
              </p>
            </a>
            <p className="text-gray-600 mb-4 flex-grow">
              Junior Developers - Vaibhav Gusain, Riya Verma, Priyal Yadav,
              Shivam Khundari
            </p>
          </div>
        </div>

        {/* 📝 Contact Form Card */}
        <div className="md:w-1/2 bg-white shadow-xl rounded-xl p-8 transition-transform duration-500 hover:scale-105 flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Have a Query? 📝
            </h3>
            <p className="text-gray-600 mb-6">
              Fill in your details and let us know what's on your mind. We'll
              get back to you shortly.
            </p>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Your email
              </label>
              <input
                type="text"
                placeholder="Enter your email id"
                value={queryEmail}
                onChange={(e) => setQueryEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                placeholder="Enter your Name"
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Your Query
              </label>
              <textarea
                rows="4"
                placeholder="Type your query here..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
              ></textarea>
            </div>
            <button
              onClick={sendQuery}
              className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-xl shadow-lg hover:shadow-indigo-400 hover:-translate-y-0.5 transition-all"
            >
              Submit Query
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
