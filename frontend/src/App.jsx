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
  const [isInitialized, setInitialized] = useState(false);
  return (
    <div>
      <Router>
        <Navbar isInitialized={isInitialized} setInitialized={setInitialized} />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route
            path="/LogIn"
            element={<Login setInitialized={setInitialized} />}
          />
          <Route path="/SignUp" element={<Signup />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/AdminPanel/*" element={<AdminPanel />} />
          <Route path="/doc-upload" element={<DocUpload />} />
          <Route path="/logout" element={<LogOut />} />
          <Route path="/search-doc" element={<SearchDocument />} />
          <Route path="/facultypanel" element={<Faculty />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};

export default App;
