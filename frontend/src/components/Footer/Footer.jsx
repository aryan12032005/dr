import React from 'react'
import { FaFacebookF, FaInstagram, FaXTwitter, FaGithub, FaYoutube, FaLinkedin } from "react-icons/fa6";
import { Link } from 'react-router-dom';


const Footer = () => {
  return (
    <div className='bg-zinc-800 text-white py-1  w-full flex-shrink-0'>
            
    <footer className="bg-zinc-800 text-white py-1  w-full flex-shrink-0">
      <div className="container mx-auto">
       

        {/* Social Icons */}
        <div className="flex justify-center space-x-6 mb-4 text-xl">
          <a href="https://www.facebook.com/MREI1997/" className="text-white hover:text-blue-400 transform transition-transform duration-300 hover:scale-125"
              target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
          <a href="https://www.instagram.com/manav_rachna/" className="text-white hover:text-pink-400 transform transition-transform duration-300 hover:scale-125"
              target="_blank"  rel="noopener noreferrer"><FaInstagram /></a>
          <a href="https://x.com/manav_rachna" className="text-white hover:text-blue-400 transform transition-transform duration-300 hover:scale-125"
              target="_blank" rel="noopener noreferrer"><FaXTwitter /></a>
          <a href="https://www.linkedin.com/school/manav-rachna-educational-institutions/posts/?feedView=all" className="text-white hover:text-blue-400 transform transition-transform duration-300 hover:scale-125"
              target="_blank" rel="noopener noreferrer"><FaLinkedin/></a>
          <a href="https://www.youtube.com/user/mriuuni" className="text-white hover:text-red-400 transform transition-transform duration-300 hover:scale-125"
              target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
        </div>
      </div>
      <h1 className="text-2x1 font-semibold text-center ">
            &copy; 2024, Manav Rachna University
            </h1>
    </footer>
    

    </div>
  )
}

export default Footer