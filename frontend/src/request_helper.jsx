class networkRequests {
  constructor() {
    this.baseUrl = import.meta.env.VITE_backendUrl;
    // Use localStorage instead of sessionStorage to persist tokens across browser sessions
    this.accessToken = localStorage.getItem("access_token") || null;
    this.refreshToken = localStorage.getItem("refresh_token") || null;
  }

  reload_tokens() {
    // Synchronous function - removed async since no await is needed
    this.accessToken = localStorage.getItem("access_token");
    this.refreshToken = localStorage.getItem("refresh_token");  
    return this.accessToken !== null;
  }

  async getCSRFToken() {
    try {
      var response = await fetch(`${this.baseUrl}get_csrf/`, {
        method: "GET",
      });
      var data = await response.json();
      return data.csrf_token;
    } catch (error) {
      console.error("Failed to get CSRF token:", error);
      return null;
    }
  }

  async refresh_token() {
    const csrf_token = await this.getCSRFToken();
    this.refreshToken = localStorage.getItem("refresh_token");
    if (!this.refreshToken) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return 0;
    }
    try {
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
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        this.accessToken = data["access_token"];
        this.refreshToken = data["refresh_token"];
        return 1;
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return 0;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      return 0;
    }
  }

  async fetchReq(endPoint, method, headers, body = null, count = 0) {
    let result = null;
    try {
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
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
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
    } catch (error) {
      console.error("Network request failed:", error);
      // Return a mock Response object with error info instead of -1
      return {
        ok: false,
        status: 0,
        statusText: "Network Error",
        json: async () => ({ message: "Network error: Unable to connect to server" }),
        text: async () => "Network error: Unable to connect to server",
        _isNetworkError: true
      };
    }
  }
}

export default networkRequests;
