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
    if(result.ok){
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_status');
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
