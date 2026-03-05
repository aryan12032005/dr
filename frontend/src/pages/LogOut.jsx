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
    const data = {
      refresh_token: req_client.refreshToken
    }
    const result=await req_client.fetchReq('logout/', "POST", headers, JSON.stringify(data));
    // Always clear storage and redirect, regardless of API result
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    localStorage.removeItem('user_status');
    navigate('/');
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
