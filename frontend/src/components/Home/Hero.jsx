import React from 'react'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <div className='h-screen md:h-[75vh] flex flex-col md:flex-row items-center justify-center'> {/* Center items in main container */}
  <div className='w-full lg:w-3/6 flex flex-col items-center justify-center'> {/* Center text block */}
    <h1 className='text-4xl lg:text-6xl font-semibold text-yellow-100 lg:text-left text-center'>
      Digitally Store Your Data
    </h1>
    <p className='mt-4 text-xl text-zinc-300 text-center lg:text-left'>
      An open source repository software package typically used for creating open access repositories for scholarly and/or published digital content.
    </p>
    <div className='mt-8 flex justify-center'>
      <Link to="/Login" className='text-yellow-100 text-xl lg:text-2xl font-semibold border border-yellow-100 px-10 py-3 hover:bg-zinc-800 rounded-full'>
        Login to Discover
      </Link>
    </div>
  </div>
  <div className='w-full lg:w-3/6 h-auto lg:h-[100%] flex items-center justify-center'>
    <img src='./Untitled.png' alt='newhome' className="max-w-full h-auto" /> {/* Image responsiveness */}
  </div>
</div>
  )
}

export default Hero
