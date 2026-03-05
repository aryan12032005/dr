class networkRequests {
  constructor() {
    this.baseUrl = import.meta.env.VITE_backendUrl;
    this.accessToken = sessionStorage.getItem("access_token") || null;
    this.refreshToken = sessionStorage.getItem("refresh_token") || null;
  }

  async reload_tokens() {
    this.accessToken = sessionStorage.getItem("access_token");
    this.refreshToken = sessionStorage.getItem("refresh_token");  
    return this.accessToken === null ? false : true;
  }

  // CSRF token not needed with JWT in Node.js backend
  async getCSRFToken() {
    return 'not-required-with-jwt';
  }

  async refresh_token() {
    this.refreshToken = sessionStorage.getItem("refresh_token");
    if (!this.refreshToken) {
      localStorage.clear();
      return 0;
    }
    var result = await fetch(`${this.baseUrl}refresh_token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    try{
      if (body) {
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
    catch{
      // Return a Response-like object so callers can always call `.json()`
      console.error('Network request failed for', endPoint);
      const errorBody = { message: 'Network request failed' };
      return new Response(JSON.stringify(errorBody), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}

export default networkRequests;
