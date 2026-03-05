import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaHome, FaInfoCircle, FaSearch, FaUpload, FaUserShield, FaChalkboardTeacher, FaSignOutAlt, FaSignInAlt } from "react-icons/fa";
import networkRequests from "../../request_helper";

const req_client = new networkRequests();

const get_status = async () => {
  await req_client.reload_tokens();
  if (!req_client.accessToken || !req_client.refreshToken) {
    return -1;
  }
  const header = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${req_client.accessToken}`,
  };
  const result = await req_client.fetchReq("get_user_type/", "GET", header);

  if (result.ok) {
    const data = result.json();
    return data;
  } else {
    localStorage.clear();
    return -1;
  }
};

// Icon mapping for nav items
const iconMap = {
  "Home": FaHome,
  "About Us": FaInfoCircle,
  "Search documents": FaSearch,
  "Document Upload": FaUpload,
  "Admin Panel": FaUserShield,
  "Faculty Panel": FaChalkboardTeacher,
  "Logout": FaSignOutAlt,
};

const Navbar = ({ setUserStatus }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPath,setCurrentPath] = useState(window.location.href);

  useEffect(() => {
    setCurrentPath(window.location.href);
  });

  const [loginSignup, setloginSignup] = useState([
    { tittle: "Log in", link: "/LogIn" },
  ]);
  const [user_status, set_user_status] = useState("");
  const [links, setLinks] = useState([
    { title: "Home", link: "/home" },
    { title: "About Us", link: "/about-us" },
    { tittle: "Search documents", link: "/search-doc" },
  ]);
  const [MobileNav, setMobileNav] = useState("hidden");

  const userStatusRef = useRef(user_status);
  useEffect(() => {
    userStatusRef.current = user_status;
  }, [user_status]);

  useEffect(() => {
    get_status().then((result) => {
      localStorage.setItem("user_status", JSON.stringify(result));
      setUserStatus(result);
      set_user_status(result);
    });
    const interval = setInterval(() => {
      get_status().then((result) => {
        if (JSON.stringify(userStatusRef.current) !== JSON.stringify(result)) {
          localStorage.setItem("user_status", JSON.stringify(result));
          setUserStatus(result);
          set_user_status(result);
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [navigate, location]);

  useEffect(() => {
    if (user_status === -1) {
      setloginSignup([{ tittle: "Log in", link: "/LogIn" }]);
      setLinks([
        { title: "Home", link: "/home" },
        { title: "About Us", link: "/about-us" },
        { tittle: "Search documents", link: "/search-doc" },
      ]);
      navigate("/");
    } else {
      // For admin users, show minimal nav - they have sidebar in admin panel
      if (user_status.is_admin) {
        setloginSignup([]);
        setLinks([
          { title: "Home", link: "/home" },
          { title: "Admin Panel", link: "/adminpanel" },
          { title: "Logout", link: "/logout" }
        ]);
        return;
      }
      // For faculty users, show minimal nav - they have sidebar in faculty panel
      if (user_status.is_faculty) {
        setloginSignup([]);
        setLinks([
          { title: "Home", link: "/home" },
          { title: "Faculty Panel", link: "/facultypanel" },
          { title: "Logout", link: "/logout" }
        ]);
        return;
      }
      const updatedLinks = [
        { title: "Home", link: "/home" },
        { title: "About Us", link: "/about-us" },
        { title: "Search documents", link: "/search-doc" },
      ];
      updatedLinks.push({ title: "Logout", link: "/logout" });
      setloginSignup([]);
      setLinks(updatedLinks);
    }
  }, [user_status]);

  return (
    <>
      <nav className="z-50 relative flex bg-gradient-to-r from-[#0f1320] to-[#1a1f35] text-white px-6 py-4 items-center justify-between shadow-lg">
        <div className="flex flex-col items-center">
          <Link to="https://manavrachna.edu.in/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img className="h-10" src="mru_logo.png" alt="logo" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
              Manav Rachna University
            </h1>
          </Link>
          <Link to="/" className="flex mt-1">
            <h1 className="text-lg font-medium text-gray-300 hover:text-white transition-colors">
              Institutional Digital Repository
            </h1>
          </Link>
        </div>
        <div className="nav-links-repo block md:flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            {links.map((item, i) => {
              const title = item.title || item.tittle;
              const Icon = iconMap[title];
              return (
                <Link
                  to={item.link}
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    currentPath.includes(item.link)
                      ? "bg-yellow-500/20 text-yellow-300 shadow-md"
                      : "text-yellow-400 hover:bg-white/10 hover:text-yellow-300"
                  }`}
                >
                  {Icon && <Icon className="text-sm" />}
                  <span className="font-medium">{title}</span>
                </Link>
              );
            })}
          </div>
          <div className="hidden md:flex gap-4 ml-2">
            {loginSignup.map(({ tittle, link }, i) => (
              <Link
                to={link}
                key={i}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 rounded-lg font-semibold hover:from-yellow-400 hover:to-yellow-300 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FaSignInAlt />
                {tittle}
              </Link>
            ))}
          </div>
          <button 
            className="block md:hidden text-white text-2xl p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() =>
              setMobileNav(MobileNav === "hidden" ? "block" : "hidden")
            }
          >
            {MobileNav === "hidden" ? <FaBars /> : <FaTimes />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div
        className={`${MobileNav} bg-gradient-to-b from-[#0f1320] to-[#1a1f35] h-screen absolute top-0 left-0 w-full z-40 flex flex-col items-center justify-center`}
      >
        <button 
          className="absolute top-6 right-6 text-white text-3xl p-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setMobileNav("hidden")}
        >
          <FaTimes />
        </button>
        {links.map((item, i) => {
          const title = item.title || item.tittle;
          const Icon = iconMap[title];
          return (
            <Link
              to={item.link}
              key={i}
              onClick={() => setMobileNav("hidden")}
              className={`flex items-center gap-3 text-xl font-semibold mb-6 px-6 py-3 rounded-xl transition-all duration-300 ${
                currentPath.includes(item.link)
                  ? "text-yellow-400 bg-white/10"
                  : "text-white hover:text-yellow-400 hover:bg-white/5"
              }`}
            >
              {Icon && <Icon />}
              {title}
            </Link>
          );
        })}
        {loginSignup.map((item, i) => (
          <Link
            to={item.link}
            key={i}
            onClick={() => setMobileNav("hidden")}
            className="flex items-center gap-3 px-8 mt-4 text-xl font-semibold py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 rounded-xl hover:from-yellow-400 hover:to-yellow-300 transition-all duration-300 shadow-lg"
          >
            <FaSignInAlt />
            {item.tittle}
          </Link>
        ))}
      </div>
    </>
  );
};

export default Navbar;
