import { React, useState, useEffect } from "react";
import Home from "./pages/Home";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Login from "./pages/LogIn";
import Signup from "./pages/SignUp";
import AboutUs from "./pages/AboutUs";
import AdminPanel from "./pages/AdminPanel";
import DocUpload from "./pages/DocUpload";
import LogOut from "./pages/LogOut";
import SearchDocument from "./pages/SearchDocuments";
import Faculty from "./pages/Faculty";

const App = () => {
  const [userStatus, setUserStatus] = useState({});

  return (
    <div className="flex flex-col min-h-screen">
      <Router>
        <Navbar setUserStatus={setUserStatus} />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/home" element={<Home />} />
          <Route path="/LogIn" element={<Login />} />
          <Route path="/SignUp" element={<Signup />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/AdminPanel/*" element={<AdminPanel userStatus={userStatus} />} />
          <Route path="/doc-upload" element={<DocUpload />} />
          <Route path="/logout" element={<LogOut />} />
          <Route path="/search-doc" element={<SearchDocument userStatus={userStatus} />} />
          <Route path="/facultypanel" element={<Faculty />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};

export default App;
