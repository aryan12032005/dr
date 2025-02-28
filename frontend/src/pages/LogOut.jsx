import config from "../config.js";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LogOut = () => {
  const navigate=useNavigate();
  useEffect(()=>{
    const access_token = localStorage.getItem("access_token");
    const result = fetch(`${config.backendUrl}logout/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    if(result.ok){
      localStorage.clear();
      navigate('/');
    }
    else{
      navigate('/');
    }
  },[navigate]);
  
  return (
    <>
      <div> </div>
    </>
  );
};

export default LogOut;
