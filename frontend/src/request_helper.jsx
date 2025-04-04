import config from "./config";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

class networkRequests {
  constructor() {
    this.baseUrl = config.backendUrl;
    this.accessToken = sessionStorage.getItem("access_token");
    this.refreshToken = sessionStorage.getItem("refresh_token");
  }

  async reload_tokens() {
    this.accessToken = sessionStorage.getItem("access_token");
    this.refreshToken = sessionStorage.getItem("refresh_token");
    return this.accessToken ? true : false;
  }

  async getCSRFToken() {
    var response = await fetch(`${this.baseUrl}get_csrf/`, {
      method: "GET",
    });
    var data = await response.json();
    return data.csrf_token;
  }

  async refresh_token() {
    const csrf_token = await this.getCSRFToken();
    this.refreshToken = sessionStorage.getItem("refresh_token");
    if (!this.refreshToken) {
      localStorage.clear();
      return 0;
    }
    var result = await fetch(`${this.baseUrl}refresh_token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrf_token,
      },
      body: JSON.stringify({ refresh_token: this.refreshToken }),
    });
    if (result.ok) {
      const data = await result.json();
      sessionStorage.setItem("access_token", data.access_token);
      sessionStorage.setItem("refresh_token", data.refresh_token);
      this.accessToken = data["access_token"];
      this.refreshToken = data["refresh_token"];
      return 1;
    } else {
      sessionStorage.clear();
      return 0;
    }
  }

  async fetchReq(endPoint, method, headers, body = null, count = 0) {
    let result = null;
    if (body) {
      headers["X-CSRFToken"] = await this.getCSRFToken();
      result = await fetch(`${this.baseUrl}${endPoint}`, {
        method: method,
        headers: headers,
        body: body,
      });
    } else {
      result = await fetch(`${this.baseUrl}${endPoint}`, {
        method: method,
        headers: headers,
      });
    }
    if (count > 1) {
      sessionStorage.clear();
      return result;
    }
    if (result.status === 401) {
      const isTokenRefreshed = await this.refresh_token();
      if (isTokenRefreshed == 1) {
        headers["Authorization"] = `Bearer ${this.accessToken}`;
        result = await this.fetchReq(
          endPoint,
          method,
          headers,
          body,
          count + 1
        );
      }
    }
    return result;
  }
}

export default networkRequests;
