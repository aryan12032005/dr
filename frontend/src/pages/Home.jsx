import React, { useState, useEffect } from 'react'
import Hero from '../components/Home/Hero'
import { Link } from 'react-router-dom'
import { FaBook, FaSearch, FaUsers, FaCloudUploadAlt, FaShieldAlt, FaGraduationCap, FaUniversity, FaFileAlt, FaChartLine } from 'react-icons/fa'

const Home = () => {
  const [stats, setStats] = useState({ documents: 0, users: 0, departments: 0 });
  const [animatedStats, setAnimatedStats] = useState({ documents: 0, users: 0, departments: 0 });

  useEffect(() => {
    // Animate stats counting up
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimatedStats({
        documents: Math.floor(1500 * progress),
        users: Math.floor(500 * progress),
        departments: Math.floor(25 * progress)
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <FaCloudUploadAlt className="text-4xl text-blue-500" />,
      title: "Easy Upload",
      description: "Upload documents, research papers, and educational materials with just a few clicks"
    },
    {
      icon: <FaSearch className="text-4xl text-green-500" />,
      title: "Smart Search",
      description: "Powerful search functionality to find exactly what you're looking for"
    },
    {
      icon: <FaShieldAlt className="text-4xl text-purple-500" />,
      title: "Secure Access",
      description: "Role-based access control ensures your documents are protected"
    },
    {
      icon: <FaUsers className="text-4xl text-orange-500" />,
      title: "Collaboration",
      description: "Share resources with groups and collaborate with peers"
    }
  ];

  return (
    <div className="bg-zinc-900">
      {/* Hero Section */}
      <Hero />
      
      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-zinc-900 to-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-yellow-100 mb-4">Why Choose Our Repository?</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              A comprehensive digital platform designed for academic excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-zinc-800/50 backdrop-blur-sm p-8 rounded-2xl border border-zinc-700 hover:border-yellow-500/50 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl hover:shadow-yellow-500/10"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-600/20 via-yellow-500/10 to-yellow-600/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <FaFileAlt className="text-5xl text-yellow-400 mx-auto mb-4" />
              <div className="text-5xl font-bold text-white mb-2">{animatedStats.documents}+</div>
              <div className="text-zinc-400 text-lg">Documents Uploaded</div>
            </div>
            <div className="p-8">
              <FaUsers className="text-5xl text-yellow-400 mx-auto mb-4" />
              <div className="text-5xl font-bold text-white mb-2">{animatedStats.users}+</div>
              <div className="text-zinc-400 text-lg">Active Users</div>
            </div>
            <div className="p-8">
              <FaUniversity className="text-5xl text-yellow-400 mx-auto mb-4" />
              <div className="text-5xl font-bold text-white mb-2">{animatedStats.departments}+</div>
              <div className="text-zinc-400 text-lg">Departments</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-yellow-100 mb-6">
                Swami Vivekananda Library & Resource Center
              </h2>
              <p className="text-zinc-300 text-lg mb-6 leading-relaxed">
                The Institutional Digital Repository is an initiative by Manav Rachna University 
                to preserve and provide access to the intellectual output of the institution. 
                It serves as a platform for faculty, researchers, and students to share their 
                academic work with the wider community.
              </p>
              <p className="text-zinc-400 mb-8">
                Our mission is to facilitate the dissemination of knowledge and promote 
                academic collaboration through open access to educational resources.
              </p>
              <Link 
                to="/about-us"
                className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 rounded-full transition-all duration-300"
              >
                <FaGraduationCap />
                Learn More About Us
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
              <img 
                src="./lib1.jpg" 
                alt="Library" 
                className="relative rounded-3xl shadow-2xl border border-zinc-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-yellow-100 mb-12">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              to="/search-doc"
              className="group flex items-center gap-4 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-2xl hover:from-blue-500 hover:to-blue-600 transition-all duration-300"
            >
              <FaSearch className="text-3xl text-white" />
              <div>
                <h3 className="text-xl font-semibold text-white">Search Documents</h3>
                <p className="text-blue-200">Find research papers & resources</p>
              </div>
            </Link>
            <Link 
              to="/LogIn"
              className="group flex items-center gap-4 bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-2xl hover:from-green-500 hover:to-green-600 transition-all duration-300"
            >
              <FaCloudUploadAlt className="text-3xl text-white" />
              <div>
                <h3 className="text-xl font-semibold text-white">Upload Documents</h3>
                <p className="text-green-200">Share your academic work</p>
              </div>
            </Link>
            <Link 
              to="/about-us"
              className="group flex items-center gap-4 bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-2xl hover:from-purple-500 hover:to-purple-600 transition-all duration-300"
            >
              <FaUniversity className="text-3xl text-white" />
              <div>
                <h3 className="text-xl font-semibold text-white">About Repository</h3>
                <p className="text-purple-200">Learn about our mission</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

