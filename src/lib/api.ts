export const API_BASE_URL = "https://api.ikshanaturopathy.com/v1";

/** STEP 1: Use Cognito token to get backend token */
export const loginWithCognitoToken = async (username: string, role: string) => {
  const cognitoToken =
    localStorage.getItem(
      "CognitoIdentityServiceProvider.5il0mmtqno8kn2rpatfobnfb6.20ec79fc-d0a1-7077-7b09-c6c9358a7f65.accessToken"
    ) || "";

  if (!cognitoToken) throw new Error("No Cognito token found");

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: cognitoToken, // send Cognito token
      },
      body: JSON.stringify({ username, role }),
    });
    console.log("Backend token saved",response);
    if (!response.ok) throw new Error(`Login failed: ${response.status}`);

    const data = await response.json();
    const backendToken = data?.data?.token;

    if (!backendToken) throw new Error("No backend token in response");

    // Save backend token for later API calls
    localStorage.setItem("BackendAccessToken", backendToken);
    console.log("Backend token saved");
    return backendToken;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};
export const getBackendToken = (): string | null =>
  localStorage.getItem("BackendAccessToken");
// Generic POST with token
export const postData = async (endpoint: string, payload: any) => {
  const token = getBackendToken();

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Appointment POST (same logic)
export const appointmentPost = async (endpoint: string, payload: any) => {
  const token = getBackendToken();

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
/** Generic GET request with backend token */
export const getData = async (endpoint: string, params: Record<string, any> = {}) => {
  const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const query = new URLSearchParams(params).toString();

  const response = await fetch(`${API_BASE_URL}${endpoint}?${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
    },
  });

  if (!response.ok) throw new Error(`Error: ${response.status}`);
  return await response.json();
};