import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ReactTyped } from "react-typed";

const Hero = () => {
  const backgroundImages = [
    './lib1.jpg',
    './lib2.jpg',
    './lib3.jpg',
    './lib4.jpg',
    './lib5.jpg',
    './lib6.jpg'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Effect to handle automatic image sliding
  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsTransitioning(true);
      setNextImageIndex((currentImageIndex + 1) % backgroundImages.length);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
        setIsTransitioning(false);
      }, 1000);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [currentImageIndex, backgroundImages.length]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Current background image */}
      <div 
        className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        style={{
          backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
          zIndex: 1
        }}
      />
      
      {/* Next background image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImages[nextImageIndex]})`,
          zIndex: 0
        }}
      />
      
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-2"></div>
      
      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center w-full min-h-screen">
        <div className="w-full lg:w-3/6 flex flex-col items-center px-4 lg:px-0 text-center pt-14 lg:pt-14">
          <div className="rounded-lg p-8">
            <div className="text-container">
              <h1 className="text-4xl lg:text-6xl font-semibold text-yellow-100 leading-tight mb-4">
                <ReactTyped
                  strings={[
                    'Welcome to',
                    'Institutional Digital Resource Library',
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

              {/* Enhanced Book Animation */}
              <div className="w-full flex justify-center mt-12">
                <div className="book-animation w-64 h-48 relative transform-style-preserve-3d perspective-1000">
                  {/* Book Cover */}
                  <div
                    className="absolute w-full h-full bg-yellow-800 rounded-r-md shadow-lg transform-origin-left"
                    style={{
                      animation: 'bookCoverFlip 5s infinite ease-in-out',
                      zIndex: 10
                    }}
                  >
                    <div className="absolute inset-2 border-2 border-yellow-600 rounded-r-sm"></div>
                  </div>
                  
                  {/* Book Pages */}
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full h-full bg-gray-100 rounded-r-sm transform-origin-left"
                      style={{
                        animation: `bookPageTurn ${3 + i * 0.5}s infinite ${i * 0.2}s ease-in-out`,
                        zIndex: 5 - i
                      }}
                    >
                      {/* Page content - horizontal lines */}
                      <div className="h-full w-full p-4 flex flex-col justify-around">
                        {[...Array(6)].map((_, j) => (
                          <div
                            key={j}
                            className="h-1 bg-gray-300 rounded-full"
                            style={{ width: `${80 - Math.random() * 20}%` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Book Spine */}
                  <div className="absolute h-full w-4 bg-yellow-900 rounded-l-md shadow-inner left-0 top-0 z-10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Image slider indicators */}
        <div className="absolute bottom-8 flex space-x-2 z-10">
          {backgroundImages.map((_, index) => (
            <button 
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentImageIndex === index 
                  ? 'bg-yellow-100 w-6' 
                  : 'bg-gray-400 bg-opacity-50'
              }`}
              onClick={() => {
                setIsTransitioning(true);
                setNextImageIndex(index);
                setTimeout(() => {
                  setCurrentImageIndex(index);
                  setIsTransitioning(false);
                }, 1000);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
      {/* CSS Animations for the book */}
      <style>{`
        @keyframes bookCoverFlip {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(-160deg); }
          100% { transform: rotateY(0deg); }
        }
        
        @keyframes bookPageTurn {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(-140deg); }
          100% { transform: rotateY(0deg); }
        }
      `}</style>
    </section>
  );
};

export default Hero;