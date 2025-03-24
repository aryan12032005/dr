import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';

const AboutUs = () => {
  return (
    <div className="bg-gradient-to-br from-indigo-100 via-blue-100 to-sky-100 min-h-screen flex flex-col items-center justify-center py-16 px-6 sm:px-8 lg:px-16">
      
      {/* Card Container */}
      <div className="max-w-7xl mx-auto bg-white bg-opacity-100 backdrop-lg shadow-2xl rounded-2xl overflow-hidden transform transition-all duration-500 hover:scale-105">
        
        <div className="md:flex">
          {/* Left Side: Text Content */}
          <div className="md:w-1/2 p-8 lg:p-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">About Us</h2>
            <p className="text-lg text-black-1000 leading-relaxed mb-5">
              We are a passionate team dedicated to crafting exceptional web experiences. Our goal is to build cutting-edge, user-friendly applications that empower businesses and individuals alike.
            </p>
            <p className="text-lg text-black-1000 leading-relaxed">
              With a strong focus on <span className="font-semibold text-indigo-600">innovation</span> and <span className="font-semibold text-indigo-600">collaboration</span>, we transform ideas into reality through creativity and expertise. Our mission is not just about building software—it's about building lasting partnerships.
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
          <h3 className="text-2xl font-semibold mb-4">Connect With Us</h3>
          <div className="flex justify-center space-x-6">
           
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
