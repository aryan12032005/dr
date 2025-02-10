import React from 'react';
import { Link } from 'react-router-dom';
import { ReactTyped } from "react-typed";

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-zinc-900">
      <div className="w-full lg:w-3/6 flex flex-col items-center justify-center px-4 lg:px-0 text-center pt-14 lg:pt-20">
        <h1 className="text-4xl lg:text-6xl font-semibold text-yellow-100 leading-tight">
        <ReactTyped  
            strings={[
              'Digitally Store Your Data', 
              'Securely Manage Files', 
              'Easy Access'
            ]}
            typeSpeed={40} 
            backSpeed={40} 
            loop={true} 
          />
        </h1>
        <p className="mt-4 text-xl text-zinc-300 leading-relaxed">
          An open source repository software package typically used for creating open access repositories for scholarly and/or published digital content.
        </p>
        <div className="mt-8 flex justify-center">
          <Link to="/Login" className="text-yellow-100 text-xl lg:text-2xl font-semibold border border-yellow-100 px-10 py-3 hover:bg-zinc-800 rounded-full transition-colors duration-300">
            Login to Discover
          </Link>
        </div>

        <div className="w-fit flex justify-center mt-4"> {/* Adjusted margin here */}
          <img
            src="./Untitled.png"
            alt="Data storage visualization"
            className="max-w-full h-auto object-contain"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;