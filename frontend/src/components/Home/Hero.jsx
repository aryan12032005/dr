import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ReactTyped } from "react-typed";

const Hero = () => {
  const backgroundImages = [
    "./lib1.jpg",
    "./lib2.jpg",
    "./lib3.jpg",
    "./lib4.jpg",
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsTransitioning(true);
      setNextImageIndex((currentImageIndex + 1) % backgroundImages.length);
      setTimeout(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % backgroundImages.length
        );
        setIsTransitioning(false);
      }, 1000);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [currentImageIndex, backgroundImages.length]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden font-sans">
      {/* Backgrounds */}
      <div
        className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
        style={{
          backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
          zIndex: 1,
          filter: "brightness(0.7) blur(0.5px)",
        }}
      />
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImages[nextImageIndex]})`,
          zIndex: 0,
          filter: "brightness(0.2)",
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-60 z-2"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full min-h-screen justify-between">
        <div
          className="text-yellow-100 text-4xl w-full min-w-full mt-20"
          style={{
            height: "50px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "inline-block",
              position: "relative",
              animation: "marquee 15s linear infinite",
            }}
          >
            Welcome to, Swami Vivekananda Library and Resource Center
          </div>

          <style>
            {`
          @keyframes marquee {
            0%   { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}
          </style>
        </div>
        <div className="w-full max-w-3xl px-6 text-center pt-12">
          {/* Removed the blurred box */}
          <h1 className="text-4xl lg:text-6xl font-extrabold text-yellow-100 leading-tight mb-6 drop-shadow-md">
            <ReactTyped
              strings={["Welcome to", "Institutional Digital Repository"]}
              typeSpeed={40}
              backSpeed={60}
              loop={true}
            />
          </h1>
          <p className="mt-4 text-lg lg:text-xl text-zinc-200 leading-relaxed tracking-wide">
            An open-source repository software package for digital content.
          </p>
          {/* <h2 className="text-2xl text-bold">Manav Rachna University</h2> */}

          <div className="mt-8">
            <Link
              to="/Login"
              className="text-lg lg:text-xl font-semibold text-yellow-100 border border-yellow-100 px-8 py-3 rounded-full transition-all duration-300 hover:bg-yellow-100 hover:text-black shadow-md hover:shadow-yellow-400"
            >
              Login to Discover
            </Link>
          </div>

          {/* Book Animation */}
          <div className="flex justify-center mt-14 perspective-1000">
            <div className="book-container relative w-44 h-60">
              <div className="book-cover absolute w-full h-full bg-yellow-800 rounded-lg shadow-xl transform-origin-left z-20"></div>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="book-page absolute w-full h-full bg-gray-100 rounded-md shadow-sm transform-origin-left z-10"
                  style={{ animationDelay: `${i * 0.4}s` }}
                />
              ))}
              <div className="book-back absolute w-full h-full bg-yellow-900 rounded-md shadow-md z-0"></div>
            </div>
          </div>
        </div>

        {/* Indicators */}
        <div className="bottom-8 flex space-x-2 z-10">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentImageIndex === index
                  ? "bg-yellow-200 w-5 shadow-md"
                  : "bg-white/40 hover:bg-yellow-100"
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

      {/* Book CSS */}
      <style>{`
        .perspective-1000 {
          perspective: 1200px;
        }

        .book-container {
          transform-style: preserve-3d;
          transform: rotateY(-20deg);
        }

        .book-cover {
          transform: rotateY(0deg);
          animation: bookOpenClose 6s ease-in-out infinite;
        }

        .book-page {
          transform: rotateY(0deg);
          animation: bookPageTurn 5s ease-in-out infinite;
        }

        .book-back {
          transform: rotateY(180deg);
        }

        @keyframes bookOpenClose {
          0% { transform: rotateY(0deg); }
          30% { transform: rotateY(-130deg); }
          70% { transform: rotateY(-130deg); }
          100% { transform: rotateY(0deg); }
        }

        @keyframes bookPageTurn {
          0% { transform: rotateY(0deg); opacity: 1; }
          30% { transform: rotateY(-120deg); opacity: 0.7; }
          70% { transform: rotateY(-120deg); opacity: 0.7; }
          100% { transform: rotateY(0deg); opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
