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
            <p className="text-lg text-black-1000 leading-relaxed mb-5">
            We are a passionate team dedicated to crafting exceptional web experiences. Our goal is to build cutting-edge, user-friendly applications that empower businesses and individuals alike....
            </p>
            <p className="text-lg text-black-1000 leading-relaxed">
              With a strong focus on <span className="font-semibold text-indigo-600">innovation</span>...
            </p>

            {/* Values Section */}
            <div className="mt-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Our Values</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>🚀 Innovation</li>
                <li>🎨 User-Centric Design</li>
                <li>🤝 Collaboration</li>
                <li>🏆 Excellence</li>
                <li>💡 Integrity</li>
              </ul>
            </div>
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
            {/* Add your social icons here if needed */}
          </div>
        </div>
      </div>

      {/* 🗺️ Location Card */}
      <div className="mt-12 w-full max-w-4xl bg-white shadow-xl rounded-xl overflow-hidden transition-transform duration-500 hover:scale-105">
        <div className="md:flex">
          <div className="md:w-1/2">
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
          </div>
          <div className="md:w-1/2 p-6 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Our Location</h3>
            <p className="text-gray-600 mb-4">
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
      </div>
    </div>
  );
};

export default AboutUs;
