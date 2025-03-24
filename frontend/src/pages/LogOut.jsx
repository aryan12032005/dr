import config from "../config.js";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import networkRequests from "../request_helper";

const req_client = new networkRequests();

const LogOut = () => {
  const navigate=useNavigate();
  useEffect( ()=> {
    const logoutUser = async() => {
    req_client.reload_tokens();
    const headers={
      "Content-Type": "application/json",
      Authorization: `Bearer ${req_client.accessToken}`,
    }
    const result=await req_client.fetchReq('logout/', "GET", headers);
    if(result.ok){
      localStorage.clear();
      navigate('/');
    }
    else{
      navigate('/');
    }
  };
  logoutUser();
  },[navigate]);
  
  return (
    <>
      <div> </div>
    </>
  );
};

export default LogOut;
