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
        Authorization: `Bearer ${cognitoToken}`, // send Cognito token
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
  const response = await fetch(`${API_BASE_URL}/patient`, {
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
export type AppointmentStatusApi =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "rescheduled"
  | "no_show";

export const updateAppointment = async (
  id: string,
  payload: {
    date?: string;                // ISO string
    consultationType?: string;    // "consultation" | ...
    patientName?: string;
    doctor?: string;              // username or id (match your backend)
    note?: string;
    status?: AppointmentStatusApi;
  }
) => {
  const token = getBackendToken();
  if (!token) throw new Error("Missing backend token. Please login first.");

  const res = await fetch(`${API_BASE_URL}/appointment/update/${id}`, {
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




export const createDietPlan = async (
  patientId: string,
  appointmentId: string,
  consultationId: string,
  weekPlan: {
    date: string;
    dietPlanItems: {
      time: string;
      dietItem: string[];
      yogaItem?: string[];
    }[];
  }[],
  restrictions: string,
  vegetables: string,
  fruits: string,
  dal: string,
  atta: string
) => {
  const backendToken = getBackendToken();

  if (!backendToken) {
    throw new Error("Missing backend token. Please login first.");
  }

  const response = await fetch(`${API_BASE_URL}/diet-plan/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
    },
    body: JSON.stringify({
      appointmentId,
      consultationId,
      patientId,
      restrictions,

      vegetables,
      fruits,
      dal,
      atta,

      weekPlan,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(
      `Failed to create diet plan: ${response.status} - ${errorData}`
    );
  }

  return await response.json();
};


// api/diet.ts


type GetDietParams = {
  search?: string;     // optional server-side search
  page?: number;       // if your API supports pagination
  limit?: number;      // if your API supports pagination
  signal?: AbortSignal; // optional cancellation
};

// Raw API shapes (adjust if your API differs)
export type DietApiItem = {
  id: string;
  name: string;
  subForm?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type DietApiSubcategory = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items?: DietApiItem[];
};

export type DietApiCategory = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  subCategories?: DietApiSubcategory[];
};

export type DietApiResponse = {
  data: DietApiCategory[];
};

export const getDiet = async (params: GetDietParams = {}): Promise<DietApiResponse> => {
  const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (typeof params.page === "number") qs.set("page", String(params.page));
  if (typeof params.limit === "number") qs.set("limit", String(params.limit));

  const url = `${API_BASE_URL}/diet/${qs.toString() ? `?${qs}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    signal: params.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Diet fetch failed: ${response.status} ${response.statusText}${text ? ` – ${text}` : ""}`);
  }

  return response.json();
};
export const createDiet = async (payload: any) => {
const backendToken = getBackendToken();
if (!backendToken) throw new Error("Missing backend token. Please login first.");


const response = await fetch(`${API_BASE_URL}/diet`, {
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${backendToken}`,
},
body: JSON.stringify(payload),
});


if (!response.ok) throw new Error(`Create failed ${response.status}`);
return response.json();
};


export const updateDiet = async (id: string, payload: Partial<any>) => {
const backendToken = getBackendToken();
if (!backendToken) throw new Error("Missing backend token. Please login first.");


const response = await fetch(`${API_BASE_URL}/diet/${id}`, {
method: "PUT",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${backendToken}`,
},
body: JSON.stringify(payload),
});


if (!response.ok) throw new Error(`Update failed ${response.status}`);
return response.json();
};


export const deleteDiet = async (id: string) => {
const backendToken = getBackendToken();
if (!backendToken) throw new Error("Missing backend token. Please login first.");


const response = await fetch(`${API_BASE_URL}/diet/${id}`, {
method: "DELETE",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${backendToken}`,
},
});


if (!response.ok) throw new Error(`Delete failed ${response.status}`);
};
export const createPatientConsult = async (payload: any) => {
 const backendToken = getBackendToken();
  const response = await fetch(`${API_BASE_URL}/consultation/create`, {
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
//-----------------------Invoice----------------
export const createInvoice = async (payload: any) => {
 const backendToken = getBackendToken();
  const response = await fetch(`${API_BASE_URL}/invoice/create`, {
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
// api.ts
export const getAllInvoices = async (status: "paid" | "unpaid" | "draft" = "paid") => {
  const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(`${API_BASE_URL}/invoice/get?status=${status}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
    },
  });

  if (!response.ok) throw new Error(`Error: ${response.status}`);
  return await response.json();
};
export async function getInvoiceById(id: string) {
  const token = getBackendToken();
  const res = await fetch(`${API_BASE_URL}/invoice/get/${id}`, {
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
export async function updateInvoice(id: string, payload: Record<string, any>) {
  const token = getBackendToken();
  if (!token) throw new Error("Missing backend token. Please login first.");

  const res = await fetch(`${API_BASE_URL}/invoice/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update invoice: ${res.status} ${text}`);
  }

  return await res.json();
}
//therapist 
export const createTherapist = async (payload: any) => {
 const backendToken = getBackendToken();
  const response = await fetch(`${API_BASE_URL}/therapist/create`, {
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
export const getAllTherapist = async () => {
  const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(`${API_BASE_URL}/therapist/get`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
    },
  });

  if (!response.ok) throw new Error(`Error: ${response.status}`);
  return await response.json();
};
export const assignTherapist = async (
  therapistId: string,
  treatmentPlanId: string,
  treatmentId: string
) => {
  const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(`${API_BASE_URL}/patient/assign-therapist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
    },
    body: JSON.stringify({
      therapistId,
      treatmentPlanId,
      treatmentId,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Assign failed: ${response.status} - ${errText}`);
  }

  return await response.json();
};
//----------------------generate pdf
export const generatePDF = async (patientId: string) => {
 const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(
    `${API_BASE_URL}/appointment/generate/${patientId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendToken}`,
      },
    }
  );
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    // 🧠 Expect binary PDF, not JSON
  const blob = await response.blob();
  return blob;

};
//yogas
export const getAllYoga = async () => {
  const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(`${API_BASE_URL}/yoga`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
    },
  });

  if (!response.ok) throw new Error(`Error: ${response.status}`);
  return await response.json();
};


//diet pdf 
export const generateDietPDF = async (appointmentId: string) => {
 const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(
    `${API_BASE_URL}/appointment/generate-diet-pdf/${appointmentId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendToken}`,
      },
    }
  );
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    // 🧠 Expect binary data (PDF), not JSON
  const blob = await response.blob();
  return blob;
};
export const generatetTreatmentPDF = async (appointmentId: string) => {
 const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(
    `${API_BASE_URL}/appointment/generate-treatment-pdf/${appointmentId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendToken}`,
      },
    }
  );
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    // 🧠 Expect binary data (PDF), not JSON
  const blob = await response.blob();
  return blob;
};
export const generatetInvoicePDF = async (invoiceId: string) => {
 const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(
    `${API_BASE_URL}/invoice/generate-invoice/${invoiceId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendToken}`,
      },
    }
  );
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    // 🧠 Expect binary data (PDF), not JSON
  const blob = await response.blob();
  return blob;
};
export const generatetPrescriptionPDF = async (prescriptionId: string) => {
 const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(
    `${API_BASE_URL}/appointment/generate-prescription-pdf/${prescriptionId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendToken}`,
      },
    }
  );
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    // 🧠 Expect binary data (PDF), not JSON
  const blob = await response.blob();
  return blob;
};
//feedback


// feedback.api.ts
export const createFeedback = async (feedbackData: {
  otherSource?: string;
  website?: boolean;
  socialMedia?: boolean;
  friendFamily?: boolean;
  receptionRegistration?: number;
  cleanlinessHygiene?: number;
  staffBehavior?: number;
  doctorsConsultation?: number;
  treatmentQuality?: number;
  overallExperience?: number;
  reliefReceived?: string;
  likedMost?: string;
  improvements?: string;
  recommendToOthers?: boolean;
  additionalComments?: string;
  patientId: string;
  name: string;
}) => {
  const backendToken = getBackendToken(); // your existing token util
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  try {
    const res = await fetch(`${API_BASE_URL}/feedback/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${backendToken}`,
      },
      body: JSON.stringify(feedbackData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to submit feedback: ${errorText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("❌ Error submitting feedback:", error);
    throw error;
  }
};
export const getFeedbackByPatientId = async (patientId: string) => {
  const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token.");

  const res = await fetch(`${API_BASE_URL}/feedback/get/patient/${patientId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backendToken}`,
    },
  });

  if (!res.ok) return null;
  return await res.json();
};
export const getWeeklyDietPlan = async (
  consultationId: string,
  startDate: string,
  endDate: string
) => {
  const token = await getBackendToken(); // reuse your existing auth helper

  const res = await fetch(
    `${API_BASE_URL}/diet-plan/get-weekly/${consultationId}?startDate=${startDate}&endDate=${endDate}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch weekly diet plan");
  return res.json();
};
export const getTreatmentTable = async (
  
) => {
  const token = await getBackendToken(); // reuse your existing auth helper

  const res = await fetch(
    `${API_BASE_URL}/patient/get-patient-treatment`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch weekly diet plan");
  return res.json();
};
export const updatePatientTreatmentTable = async (patientId: string, payload: any) => {
 const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(
    `${API_BASE_URL}/patient/update-patient-treatment/${patientId}`,
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
export const getPatientTreatmentCalendar = async (startDate: string, endDate: string) => {
  const backendToken = getBackendToken();
  if (!backendToken) throw new Error("Missing backend token. Please login first.");

  const response = await fetch(
    `${API_BASE_URL}/patient/get-patient-treatment-calendar?startDate=${startDate}&endDate=${endDate}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${backendToken}`,
      },
    }
  );

  if (!response.ok) throw new Error(`Failed to fetch calendar data: ${response.status}`);
  return await response.json();
};
export const getTherapyList = async (
  
) => {
  const token = await getBackendToken(); // reuse your existing auth helper

  const res = await fetch(
    `${API_BASE_URL}/therapies`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch weekly diet plan");
  return res.json();
};