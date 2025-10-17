export const API_BASE_URL = "https://api.ikshanaturopathy.com/v1";

/** STEP 1: Use Cognito token to get backend token */
export const loginWithCognitoToken = async (username: string, role: string) => {
  const cognitoToken =
    localStorage.getItem(
      "CognitoAccessToken"
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
     localStorage.setItem("doctor_id", data?.data?.user?.id);
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
  const backendToken = getBackendToken();

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(backendToken && { Authorization: `Bearer ${backendToken}` }),
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
  const backendToken = getBackendToken();

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(backendToken && { Authorization: `Bearer ${backendToken}` }),
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
export const getPatientAll = async () => {
 const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(
    `${API_BASE_URL}/patient/get`,
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

export const getTreatmentAll = async () => {
  const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(`${API_BASE_URL}/treatment/get`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
    },
  });

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
export const getAppointmentById = async (id: string) => {
  const token = getBackendToken();
  if (!token) throw new Error("Missing backend token. Please login first.");

  const res = await fetch(`${API_BASE_URL}/appointment/get/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Get appointment failed: ${res.status}`);
  return res.json(); // expect { data: { ...appt } }
};
// --- Appointments: update ---
export const updateAppointment = async (
  id: string,
  payload: {
    date?: string;                // ISO string
    consultationType?: string;    // "consultation" | ...
    patientName?: string;
    doctor?: string;              // username or id (match your backend)
    note?: string;
    status?: "pending" | "confirmed" | "cancelled";
  }
) => {
  const token = getBackendToken();
  if (!token) throw new Error("Missing backend token. Please login first.");

  const res = await fetch(`${API_BASE_URL}/appointment/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Update appointment failed: ${res.status} ${txt || ""}`.trim());
  }
  return res.json(); // expect { data: { ...updated } }
};
// lib/api.ts
export const getDoctors = async (search = "") => {
  const token = getBackendToken();
  if (!token) throw new Error("Missing backend token. Please login first.");
  const res = await fetch(
    `${API_BASE_URL}/users/doctors?search=${encodeURIComponent(search)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error(`Failed to fetch doctors: ${res.status}`);
  return res.json(); // expect { data: [{ id, username, ...}] }
};
export async function getPatientById(id: string) {
  const token = getBackendToken();
  const res = await fetch(`${API_BASE_URL}/patient/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,   // <-- Bearer token (not base_url)
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch patient: ${res.status} ${text}`);
  }
  return res.json(); // assume { data: {...} }
}
export const getMedicines = async () => {
  const token = getBackendToken();
  if (!token) throw new Error("Missing backend token. Please login first.");

  const res = await fetch(`${API_BASE_URL}/medicine/get`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch medicines: ${res.status} ${text}`);
  }

  return res.json(); // expect { data: [{ id, name, ... }] }
};


// Get all diet items (food items available)
export const getDietItems = async () => {
  const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(`${API_BASE_URL}/diet-item`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
    },
  });
  
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  return await response.json();
};

// Create diet plan for a specific date and time
export const createDietPlan = async (
  date: string, // ISO format: "2025-11-28T06:30:00.000Z"
  patientId: string,
  time: string, // e.g., "04:30AM-05:00AM"
  dietItemIds: string[] // Array of diet item IDs
) => {
  const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(`${API_BASE_URL}/diet-plan/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
    },
    body: JSON.stringify({
      date,
      patientId,
      dietPlanItem: {
        time,
        dietItem: dietItemIds,
      },
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to create diet plan: ${response.status} - ${errorData}`);
  }
  
  return await response.json();
};

// Get diet plan for a patient
export const getDietPlan = async (patientId: string, startDate?: string, endDate?: string) => {
  const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  let url = `${API_BASE_URL}/diet-plan?patientId=${patientId}`;
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
    },
  });
  
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  return await response.json();
};

// Batch create diet plans for the entire week
export const createWeeklyDietPlan = async (
  patientId: string,
  weeklyPlan: {
    date: string;
    time: string;
    dietItemIds: string[];
  }[]
) => {
  const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const promises = weeklyPlan.map((plan) =>
    createDietPlan(plan.date, patientId, plan.time, plan.dietItemIds)
  );

  return await Promise.all(promises);
};