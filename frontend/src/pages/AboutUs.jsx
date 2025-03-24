
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faWhatsapp, faLinkedin } from '@fortawesome/free-brands-svg-icons';

const AboutUs = () => {
  
  return (
    <div className="bg-gradient-to-r from-indigo-100 via-blue-100 to-sky-100 min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden md:max-w-4xl lg:max-w-6xl">
        <div className="md:flex">
          <div className="md:w-1/2">
            <div className="p-6 md:p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 md:text-4xl">About Uss</h2>
              <p className="text-base text-gray-700 leading-relaxed mb-6">
                We are a team of passionate developers dedicated to crafting exceptional web experiences. Our mission is to build innovative and user-friendly applications that empower businesses and individuals alike. We believe in the power of technology to transform ideas into reality, and we strive to deliver solutions that exceed expectations.
              </p>
              <p className="text-base text-gray-700 leading-relaxed mb-6">
                Driven by a shared commitment to excellence, we combine our diverse skills and expertise to create cutting-edge products.  From concept to deployment, we prioritize collaboration, creativity, and continuous improvement. We're not just building software; we're building partnerships.
              </p>

              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Values</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Innovation</li>
                  <li>User-centric Design</li>
                  <li>Collaboration</li>
                  <li>Excellence</li>
                  <li>Integrity</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
              alt="Teamwork"
              className="w-full h-full object-cover md:h-auto"
            />
          </div>
        </div>

        <div className="bg-gray-100 p-6 md:p-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Connect With Us</h3>
          <div className="flex space-x-6 justify-center">
          <a
          href="https://www.linkedin.com/school/manav-rachna-educational-institutions/?originalSubdomain=in"
          className="text-indigo-500 hover:text-indigo-700 transition duration-300"
          target="_blank"
          rel="noopener noreferrer"
          >
      <FontAwesomeIcon icon={faLinkedin} size="2x" /> 
          </a>
          <a
              href="https://www.instagram.com/manav_rachna/?hl=en" 
              className="text-indigo-500 hover:text-indigo-700 transition duration-300"
              target="_blank" 
              rel="noopener noreferrer" 
            >
              <FontAwesomeIcon icon={faInstagram} size="2x" /> 
            </a>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AboutUs;
