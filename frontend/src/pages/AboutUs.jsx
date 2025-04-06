import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';

const AboutUs = () => {
  return (
    <div className="bg-gradient-to-br from-indigo-100 via-blue-100 to-sky-100 min-h-screen flex flex-col items-center justify-center py-16 px-6 sm:px-8 lg:px-16">
      
      {/* Main Card */}
      <div className="max-w-7xl mx-auto bg-white bg-opacity-100 backdrop-lg shadow-2xl rounded-2xl overflow-hidden transform transition-all duration-500 hover:scale-105">
        <div className="md:flex">
          {/* Left Side */}
          <div className="md:w-1/2 p-8 lg:p-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">About Us</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-5">
            Welcome to <span className="font-semibold text-indigo-600">Manav Rachna University (MRU)</span> — a hub of innovation, academic excellence, and holistic development. Rooted in a legacy of values and vision, MRIIRS is a multidisciplinary institute nurturing future leaders and changemakers.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-5">
            At the heart of our academic ecosystem is the <span className="font-semibold text-indigo-600">Central Library</span>, a dynamic knowledge resource center that supports learning, research, and personal growth. Equipped with modern facilities, digital resources, and a vast collection of physical books, journals, and e-content, the library is a space where curiosity meets opportunity.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Whether you're diving into research, collaborating on projects, or simply exploring new ideas, MRU and its library provide the perfect environment to thrive.
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
          <h3 className="text-2xl font-semibold mb-4">Live, Learn and Thrive</h3>
          <div className="flex justify-center space-x-6">
            {/* Social media icons if needed */}
          </div>
        </div>
      </div>

      {/*  Location and  Contact Form Section */}
      <div className="mt-12 w-full max-w-7xl flex flex-col md:flex-row gap-8 justify-center">
        
        {/*  Location Card */}
        <div className="md:w-1/2 h-full bg-white shadow-xl rounded-xl overflow-hidden transition-transform duration-500 hover:scale-105 flex flex-col">
          <a
            href="https://maps.app.goo.gl/qYaoGggQhQ3QX9ZH9"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="MRIIRS.png"
              alt="Our Location - Satellite View"
              className="w-full h-64 object-cover"
            />
          </a>
          <div className="p-6 flex flex-col justify-between flex-grow">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Our Location</h3>
            <p className="text-gray-600 mb-4 flex-grow">
              Visit us at our vibrant campus nestled in a beautiful location. Click the image to view in Google Maps with satellite view.
            </p>
            <a
              href="https://maps.app.goo.gl/VNes1p1Ca43xrohx7"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>

        {/* 📝 Contact Form Card */}
        <div className="md:w-1/2 bg-white shadow-xl rounded-xl p-8 transition-transform duration-500 hover:scale-105 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Have a Query? 📝</h3>
            <p className="text-gray-600 mb-6">
              Fill in your details and let us know what's on your mind. We'll get back to you shortly.
            </p>
            <form className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Your email</label>
                <input
                  type="text"
                  placeholder="Enter your email id"
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Your Query</label>
                <textarea
                  rows="4"
                  placeholder="Type your query here..."
                  className="w-full border border-gray-300 rounded px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                ></textarea>
              </div>
              <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-xl shadow-lg hover:shadow-indigo-400 hover:-translate-y-0.5 transition-all"
            >
              Submit Query
            </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
