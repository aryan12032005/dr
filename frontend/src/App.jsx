import React from 'react'
import Home from './pages/Home'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
import Login from './pages/LogIn'
import Signup from './pages/SignUp'
import AboutUs from './pages/AboutUs'



const App = () => {
  return (
    <div>
      <Router>
        <Navbar />
        <Routes>
          <Route exact path='/' element={<Home />} />
          <Route path='/login' element={<Login/>} />
          <Route path='/signup' element={<Signup/>} />

          
          
          </Routes>
        <Footer />
      </Router>

    </div>
  )
}

export default App
