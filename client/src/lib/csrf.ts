import { apiRequest } from "./queryClient";

// Keep a cached token in memory
let csrfToken = "";

/**
 * Simple function to fetch a CSRF token from the server
 */
export async function fetchCsrfToken(): Promise<string> {
  // Return cached token if available
  if (csrfToken) {
    return csrfToken;
  }
  
  try {
    // Make a simple fetch request to the CSRF endpoint
    const response = await fetch("/api/csrf-token", {
      method: "GET",
      credentials: "include" // Important: include credentials for cookies
    });
    
    if (!response.ok) {
      throw new Error(`CSRF token request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.csrfToken) {
      throw new Error("No CSRF token in response");
    }
    
    // Store the token for future requests
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
    throw new Error("Could not get security token. Please refresh the page and try again.");
  }
}

/**
 * Makes a secure API request with CSRF protection
 */
export async function secureApiRequest(
  method: string,
  url: string,
  data?: any
): Promise<Response> {
  // Use standard API request for GET requests (no CSRF needed)
  if (method === "GET") {
    return apiRequest(method, url, data);
  }
  
  // For non-GET requests, we need a CSRF token
  try {
    const token = await fetchCsrfToken();
    
    // Make the request with the token
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": token
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include"
    });
    
    if (!response.ok) {
      // Format the error message based on the response
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If we can't parse JSON, just use the status text
      }
      
      throw new Error(errorMessage);
    }
    
    return response;
  } catch (error) {
    console.error(`Error during ${method} ${url}:`, error);
    throw error;
  }
}

/**
 * Helper that calls secureApiRequest and parses the JSON
 */
export async function secureApiRequestJson<T = any>(
  method: string,
  url: string,
  data?: any
): Promise<T> {
  const response = await secureApiRequest(method, url, data);
  return await response.json();
}