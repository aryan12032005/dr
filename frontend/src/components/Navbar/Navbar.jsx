import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaGripLines } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
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

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginSignup, setloginSignup] = useState([
    { tittle: "Log in", link: "/LogIn" },
    { tittle: "Sign Up", link: "/SignUp" },
  ]);
  const [user_status, set_user_status] = useState(1);
  const [links, setLinks] = useState([
    { title: "Home", link: "/" },
    { title: "About Us", link: "/about-us" },
    { tittle: "Search documents", link: "/search-doc" },
  ]);
  const [MobileNav, setMobileNav] = useState("hidden");


  useEffect(() => {
    get_status().then((result) => {
      set_user_status(result);
    });
    const interval = setInterval(() => {
      get_status().then((result) => {
        set_user_status(result);
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [location,navigate,window.location.pathname]);

  // Side-effect when user status changes
  useEffect(() => {
    if (user_status === -1) {
      setloginSignup([
        { tittle: "Log in", link: "/LogIn" },
        { tittle: "Sign Up", link: "/SignUp" },
      ]);
      setLinks([
        { title: "Home", link: "/" },
        { title: "About Us", link: "/about-us" },
        { tittle: "Search documents", link: "/search-doc" },
      ]);
      navigate("/");
    } else {
      const updatedLinks = [
        { title: "Home", link: "/" },
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
          { title: "Logout", link: "/logout" }
        );
      }
      setloginSignup([]);
      setLinks(updatedLinks);
    }
  }, [user_status]);

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
