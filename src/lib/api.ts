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
export const createPatient = async (payload: any) => {
 const backendToken = getBackendToken();
  const response = await fetch(`${API_BASE_URL}/patient/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(backendToken ? { Authorization: `Bearer ${backendToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Create failed: ${response.status}`);
  return await response.json();
};

/** 🧾 Update patient details (PUT /patient/:id) */
export const updatePatient = async (patientId: string, payload: any) => {
 const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(
    `${API_BASE_URL}/patient/${patientId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendToken}`,
      },
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) throw new Error(`Update failed: ${response.status}`);
  return await response.json();
};

/** 🧾 Fetch existing patient (GET /patient/:id) */
export const getPatient = async (patientId: string) => {
 const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(
    `${API_BASE_URL}/patient/${patientId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendToken}`,
      },
    }
  );
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  return await response.json();
};

/** 💳 Get payment QR (GET /qr) */
export const getPaymentQr = async () => {
 const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(`${API_BASE_URL}/qr`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
    },
  });
  if (!response.ok) throw new Error(`QR fetch failed: ${response.status}`);
  return await response.json();
};

export const uploadPatientSignature = async (file: File) => {
  const backendToken = getBackendToken(); // your existing getter
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s

  try {
    const form = new FormData();
    // keep the field name EXACTLY "signature"
    form.append("signature", file, "signature.png"); // simple filename

    const res = await fetch(`${API_BASE_URL}/patient/upload`, {
      method: "POST",
      headers: {
        // IMPORTANT: raw token (no "Bearer ") to mirror your working snippet
        Authorization: `Bearer ${backendToken}`,
      } as any,
      body: form,
      redirect: "follow",
      signal: controller.signal,
    });

    // some backends return text, others JSON — handle both
    const raw = await res.text();
    let data: any = {};
    try { data = JSON.parse(raw); } catch { /* server returned text */ }

    if (!res.ok) {
      const msg = data?.message || data?.error || raw || `HTTP ${res.status}`;
      throw new Error(`Signature upload failed: ${msg}`);
    }

    // Your server example returned: { "signatureUrl": "https://..." }
    const url =
      data?.signatureUrl ||
      data?.data?.signatureUrl ||
      data?.data?.url ||
      data?.url ||
      data?.signature ||
      raw; // last resort if the server just returns a URL string

    if (!url || typeof url !== "string")
      throw new Error("Upload succeeded but no signature URL returned.");
    return url;
  } finally {
    clearTimeout(timeout);
  }
};

export const getPatients = async (search:any) => {
 const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(`${API_BASE_URL}/patient/get?search=${search}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
    },
  });
  if (!response.ok) throw new Error(`QR fetch failed: ${response.status}`);
  return await response.json();
};