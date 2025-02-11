import React from 'react';
import { Link } from 'react-router-dom';
import { ReactTyped } from "react-typed";

const Hero = () => {
  return (
    <div className="h-screen flex flex-col items-center bg-[url('./books.jpg')] bg-cover bg-center scroll-px-10"> {/* Removed justify-center */}
      <div className="w-full lg:w-3/6 flex flex-col items-center px-4 lg:px-0 text-center pt-14 lg:pt-14"> {/* Removed justify-center */}
        <div className="rounded-lg p-8 ">
          <div className="text-container">
            <h1 className="text-4xl lg:text-6xl font-semibold text-yellow-100 leading-tight mb-4">
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
            <div className="mt-7 flex justify-center">
              <Link to="/Login" className="text-yellow-100 text-xl lg:text-2xl font-semibold border border-yellow-100 px-10 py-3 hover:bg-zinc-800 rounded-full transition-colors duration-300">
                Login to Discover
              </Link>
            </div>

            <div className="w-fit flex justify-center mt-8">
              {/* <img
                src="./Untitled.png"
                alt="Data storage visualization"
                className="max-w-full h-auto object-contain rounded-lg shadow-lg"
                loading="lazy"
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;