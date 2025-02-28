import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaGripLines } from "react-icons/fa";
import { useNavigate,useLocation} from "react-router-dom";
import config from "../../config";

const getCSRFToken = async () => {
  var response = await fetch(`${config.backendUrl}get_csrf/`, {
    method: "GET",
  });
  var data = await response.json();
  return data.csrf_token;
};

const get_status = async () => {
  var access_token = localStorage.getItem("access_token");
  if (!access_token) {
    return 1;
  }
  const result = await fetch(`${config.backendUrl}get_user_type/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });
  if (result.ok) {
    const data = await result.json();
    return data;
  } else {
    localStorage.clear();
    return -1;
  }
};

const Navbar = ({isInitialized,setInitialized}) => {
  const navigate = useNavigate();
  const [loginSignup, setloginSignup] = useState([]);
  const [user_status, set_user_status] = useState(1);

  const [links, setLinks] = useState([
    { title: "Home", link: "/" },
    { title: "About Us", link: "/about-us" },
    { tittle: "Search documents", link: "/search_doc" },
  ]);
  const [MobileNav, setMobileNav] = useState("hidden");


  useEffect(() => {
    if (!isInitialized) {
      get_status().then((result) => {
        set_user_status(result);
      });

      setInitialized(true); // This ensures the effect runs only once
    }
  }, [isInitialized]);

  // Side-effect when user status changes
  useEffect(() => {
    if (user_status === 1) {
      setloginSignup([
        { tittle: "Log in", link: "/LogIn" },
        { tittle: "Sign Up", link: "/SignUp" },
      ]);
    } else if (user_status === -1) {
      setLinks([
        { title: "Home", link: "/" },
        { title: "About Us", link: "/about-us" },
        { tittle: "Search documents", link: "/search_doc" },
      ]);
      localStorage.clear();
      navigate("/LogIn");
    } else {
      const updatedLinks = [
        { title: "Home", link: "/" },
        { title: "About Us", link: "/about-us" },
        { title: "Search documents", link: "/search_doc" },
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
          { title: "Logout", link: "/logout" }

        );
      }
      setloginSignup([]);
      setLinks(updatedLinks);
    }
  }, [user_status, navigate]);

  return (
    <>
      <nav className="z-50 relative flex bg-zinc-800 text-white px-4 py-4 items-center justify-between">
        <Link to="/" className="flex items-center">
          <img className="h-10 me-4" src="vaibhavlogo.png" alt="logo" />
          <h1 className="text-2xl font-semibold">Digital Repository</h1>
        </Link>
        <div className="nav-links-repo block md:flex items-center gap-4">
          <div className="hidden md:flex gap-4">
            {links.map((items, i) => (
              <Link
                to={items.link}
                className="hover:text-blue-500 transition-all duration-300"
                key={i}
              >
                {items.title}{" "}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex gap-4 ">
            {loginSignup.map(({ tittle, link }, i) => (
              <Link
                to={link}
                key={i}
                className="px-4 py-1 border border-blue-500 rounded hover:bg-white hover:text-zinc-800 transition-all duration-300"
              >
                {tittle}{" "}
              </Link>
            ))}
          </div>
          <button
            className="block md:hidden text-white text-2xl hover:text-zinc-400"
            onClick={() =>
              MobileNav === "hidden"
                ? setMobileNav("block")
                : setMobileNav("hidden")
            }
          >
            <FaGripLines />
          </button>
        </div>
      </nav>
      <div
        className={`${MobileNav} bg-zinc-800 h-screen absolute top-0 left-0 w-full z-40 flex flex-col items-center justify-center`}
      >
        {links.map((items, i) => (
          <Link
            to={items.link}
            className={` ${MobileNav}"text-white text-4xl font-semibold mb-8 hover:text-blue-500 transition-all duration-300 `}
            key={i}
            onClick={() =>
              MobileNav === "hidden"
                ? setMobileNav("block")
                : setMobileNav("hidden")
            }
          >
            {items.title}{" "}
          </Link>
        ))}
        {loginSignup.map((items, i) => (
          <Link
            to={items.link}
            key={i}
            className={` ${MobileNav}px-4 mb-8 text-3xl font-semibold py-2  bg-blue-500 rounded hover:bg-white hover:text-zinc-800 transition-all duration-300 `}
          >
            {items.tittle}{" "}
          </Link>
        ))}
      </div>
    </>
  );
};

export default Navbar;
