import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaGripLines } from "react-icons/fa";
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

const Navbar = ({ setUserStatus }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = window.location.href;

  const [loginSignup, setloginSignup] = useState([
    { tittle: "Log in", link: "/LogIn" },
  ]);
  const [user_status, set_user_status] = useState(1);
  const [links, setLinks] = useState([
    { title: "Home", link: "/home" },
    { title: "About Us", link: "/about-us" },
    { tittle: "Search documents", link: "/search-doc" },
  ]);
  const [MobileNav, setMobileNav] = useState("hidden");

  useEffect(() => {
    get_status().then((result) => {
      sessionStorage.setItem("user_status", result);
      setUserStatus(result);
      set_user_status(result);
    });
    const interval = setInterval(() => {
      get_status().then((result) => {
        sessionStorage.setItem("user_status", result);
        setUserStatus(result);
        set_user_status(result);
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [location, navigate]);

  useEffect(() => {
    if (user_status === -1) {
      setloginSignup([
        { tittle: "Log in", link: "/LogIn" },
      ]);
      setLinks([
        { title: "Home", link: "/home" },
        { title: "About Us", link: "/about-us" },
        { tittle: "Search documents", link: "/search-doc" },
      ]);
      navigate("/");
    } else {
      const updatedLinks = [
        { title: "Home", link: "/home" },
        { title: "About Us", link: "/about-us" },
        { title: "Search documents", link: "/search-doc" },
      ];
      if (user_status.is_admin) {
        updatedLinks.push(
          { title: "Document Upload", link: "/doc-upload" },
          { title: "Admin Panel", link: "/adminpanel" },
          { title: "Logout", link: "/logout" }
        );
      } else if (user_status.is_faculty) {
        updatedLinks.push(
          { title: "Document Upload", link: "/doc-upload" },
          { title: "Faculty", link: "/facultypanel" },
          { title: "Logout", link: "/logout" }
        );
      }
      setloginSignup([]);
      setLinks(updatedLinks);
    }
  }, [user_status]);

  return (
    <>
      <nav className="z-50 relative flex bg-[#0f1320] text-white px-4 py-4 items-center justify-between shadow-md">
        <Link to="/" className="flex items-center">
          <img className="h-10 me-1" src="new_logo.png" alt="logo" />
          <h1 className="text-2xl font-semibold">Digital Repository</h1>
        </Link>
        <div className="nav-links-repo block md:flex items-center gap-4">
          <div className="hidden md:flex gap-4">
            {links.map((item, i) => (
              <Link
                to={item.link}
                key={i}
                className={`transition-all duration-300 ${
                  currentPath.includes(item.link)
                    ? "border-b-2 border-yellow-300 pb-1 text-yellow-300"
                    : "hover:text-gray-300"
                }`}
              >
                {item.title || item.tittle}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex gap-4">
            {loginSignup.map(({ tittle, link }, i) => (
              <Link
                to={link}
                key={i}
                className="px-4 py-1 border border-gray-400 rounded hover:bg-white hover:text-black transition-all duration-300"
              >
                {tittle}
              </Link>
            ))}
          </div>
          <button
            className="block md:hidden text-white text-2xl hover:text-gray-300"
            onClick={() =>
              setMobileNav(MobileNav === "hidden" ? "block" : "hidden")
            }
          >
            <FaGripLines />
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div
        className={`${MobileNav} bg-[#0f1320] h-screen absolute top-0 left-0 w-full z-40 flex flex-col items-center justify-center`}
      >
        {links.map((item, i) => (
          <Link
            to={item.link}
            key={i}
            onClick={() => setMobileNav("hidden")}
            className={`text-4xl font-semibold mb-8 transition-all duration-300 ${
              currentPath === item.link
                ? "text-yellow-300 underline"
                : "text-white hover:text-gray-300"
            }`}
          >
            {item.title || item.tittle}
          </Link>
        ))}
        {loginSignup.map((item, i) => (
          <Link
            to={item.link}
            key={i}
            className="px-6 mb-8 text-3xl font-semibold py-2 bg-gray-800 text-white rounded hover:bg-white hover:text-black transition-all duration-300"
          >
            {item.tittle}
          </Link>
        ))}
      </div>
    </>
  );
};

export default Navbar;
