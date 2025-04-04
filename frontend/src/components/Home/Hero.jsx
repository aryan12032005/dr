import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ReactTyped } from "react-typed";

const Hero = () => {
  const backgroundImages = ["./lib1.jpg", "./lib2.jpg", "./lib3.jpg", "./lib4.jpg"];
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
      {/* Current background image (dimmed) */}
      <div
        className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        style={{
          backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
          zIndex: 1,
          filter: 'brightness(0.7) blur(1px)' // Dim the image
        }}
      />

      {/* Next background image (dimmed) */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImages[nextImageIndex]})`,
          zIndex: 0,
          filter: "brightness(40%)",
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 z-2"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full min-h-screen">
        <div className="w-full lg:w-3/6 flex flex-col items-center px-4 text-center pt-14">
          <div className="rounded-lg p-8">
            <h1 className="text-4xl lg:text-6xl font-semibold text-yellow-100 leading-tight mb-4">
              <ReactTyped
                strings={["Welcome to", "Institutional Digital Resource Library"]}
                typeSpeed={40}
                backSpeed={60}
                loop={true}
              />
            </h1>
            <p className="mt-4 text-xl text-zinc-300 leading-relaxed">
              An open-source repository software package for digital content.
            </p>
            <div className="mt-7">
              <Link
                to="/Login"
                className="text-yellow-100 text-xl lg:text-2xl font-semibold border border-yellow-100 px-10 py-3 hover:bg-zinc-800  rounded-full transition-colors duration-300 "
              >
             
                Login to Discover 
              </Link>
            </div>

            {/* 3D Book Animation */}
            <div className="flex justify-center mt-12 perspective-1000">
              <div className="book-container relative w-48 h-64">
                {/* Book Cover */}
                <div className="book-cover absolute w-full h-full bg-yellow-800 rounded-md shadow-lg transform-origin-left"></div>

                {/* Pages */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="book-page absolute w-full h-full bg-gray-200 rounded-md shadow-md transform-origin-left"
                    style={{ animationDelay: `${i * 0.4}s` }}
                  />
                ))}

                {/* Back Cover */}
                <div className="book-back absolute w-full h-full bg-yellow-900 rounded-md shadow-lg"></div>
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
        .perspective-1000 {
          perspective: 1000px;
        }

        .book-container {
          transform-style: preserve-3d;
          transform: rotateY(-15deg);
        }

        .book-cover {
          transform: rotateY(0deg);
          animation: bookOpenClose 6s ease-in-out infinite;
          z-index: 10;
        }

        .book-page {
          transform: rotateY(0deg);
          animation: pageFlip 5s ease-in-out infinite;
        }

        .book-back {
          transform: rotateY(180deg);
          z-index: -1;
        }

        @keyframes bookOpenClose {
          0% { transform: rotateY(0deg); }
          30% { transform: rotateY(-140deg); }
          70% { transform: rotateY(-140deg); }
          100% { transform: rotateY(0deg); }
        }

        @keyframes bookPageTurn {
          0% { transform: rotateY(0deg); }
          30% { transform: rotateY(-120deg); }
          70% { transform: rotateY(-120deg); }
          100% { transform: rotateY(0deg); }
        }
      `}</style>
    </section>
  );
};

export default Hero;
