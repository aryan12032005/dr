import { React, useEffect, useState } from 'react'
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaGithub,
  FaYoutube,
  FaLinkedin,
} from 'react-icons/fa6'
import { Link } from 'react-router-dom'

const Footer = () => {
  const [showFooter, setShowFooter] = useState(true);

  useEffect(() => {
    const checkFooterVisibility = () => {
      const scrolled = window.scrollY > 0;
      const isScrollable = document.documentElement.scrollHeight > window.innerHeight;
      setShowFooter(scrolled || !isScrollable);
    };
  
    // Initial check
    checkFooterVisibility();
  
    // Add event listeners
    window.addEventListener('scroll', checkFooterVisibility);
    window.addEventListener('resize', checkFooterVisibility);
  
    return () => {
      window.removeEventListener('scroll', checkFooterVisibility);
      window.removeEventListener('resize', checkFooterVisibility);
    };
  }, []);
  return showFooter ? (
    <div className="bg-[#0f1320] text-white py-2 w-full flex-shrink-0 shadow-inner mt-auto">
      <footer className="bg-[#0f1320] text-white py-0 w-full flex-shrink-0">
        <div className="container mx-auto">
          {/* Social Icons */}
          <div className="flex justify-center space-x-6 mb-4 text-xl">
            <a
              href="https://www.facebook.com/MREI1997/" 
              className="text-white hover:text-blue-400 transform transition-transform duration-300 hover:scale-125"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.instagram.com/manav_rachna/"
              className="text-white hover:text-pink-400 transform transition-transform duration-300 hover:scale-125"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
            <a
              href="https://x.com/manav_rachna"
              className="text-white hover:text-blue-400 transform transition-transform duration-300 hover:scale-125"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaXTwitter />
            </a>
            <a
              href="https://www.linkedin.com/school/manav-rachna-educational-institutions/posts/?feedView=all"
              className="text-white hover:text-blue-400 transform transition-transform duration-300 hover:scale-125"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://www.youtube.com/user/mriuuni"
              className="text-white hover:text-red-400 transform transition-transform duration-300 hover:scale-125"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
        <h1 className="text-sm font-medium text-center text-gray-300">
          &copy; 2024, Manav Rachna University
        </h1>
      </footer>
    </div>
  ) : <div></div>;
}

export default Footer
