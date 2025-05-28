
// Update API_BASE_URL to your actual API URL - modify this if needed
const API_BASE_URL = "http://localhost:5000";

export const apiClient = {
  get: async (path: string) => {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "x-access-token": token }),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, try to refresh
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry the request with new token
          return apiClient.get(path);
        }
      }

      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "An error occurred while fetching data");
    }

    const result = await response.json();
    // Handle the {data: {...}} wrapper structure from your API
    return result.data || result;
  },

  post: async (path: string, data: any) => {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "x-access-token": token }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, try to refresh
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry the request with new token
          return apiClient.post(path, data);
        }
      }

      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || "An error occurred while submitting data"
      );
    }

    const result = await response.json();
    // Handle the {data: {...}} wrapper structure from your API
    return result.data || result;
  },

  put: async (path: string, data: any) => {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "x-access-token": token }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, try to refresh
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry the request with new token
          return apiClient.put(path, data);
        }
      }

      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "An error occurred while updating data");
    }

    const result = await response.json();
    // Handle the {data: {...}} wrapper structure from your API
    return result.data || result;
  },

  delete: async (path: string) => {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "x-access-token": token }),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, try to refresh
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry the request with new token
          return apiClient.delete(path);
        }
      }

      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "An error occurred while deleting data");
    }

    const result = await response.json();
    // Handle the {data: {...}} wrapper structure from your API
    return result.data || result;
  },
};

// Helper function to refresh token
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    // No refresh token available, can't refresh
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // If refresh fails, clear tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login"; // Redirect to login
      return false;
    }

    const result = await response.json();
    const data = result.data || result;
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error refreshing token:", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login"; // Redirect to login
    return false;
  }
}
