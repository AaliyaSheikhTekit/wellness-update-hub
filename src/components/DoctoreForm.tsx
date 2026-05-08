import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import TreatmentPlanTable from "./TreatmentPlanTable";
import DietTableView from "./Dietician/DietTableView";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPatientById,
  createPatientConsult,
  getBackendToken,
  getAllYoga,
  getTherapyList,
} from "@/lib/api";
import SignatureCanvas from "react-signature-canvas";
import SignatureStep from "./ConsentStep";
import { Checkbox } from "./ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
const API_BASE_URL = "https://api.ikshanaturopathy.com/v1";

export const updatePatientConsult = async (consultationId: string, payload: any) => {
  const backendToken = getBackendToken();
  const response = await fetch(
    `${API_BASE_URL}/consultation/update/${consultationId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(backendToken ? { Authorization: `Bearer ${backendToken}` } : {}),
      },
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) throw new Error(`Update failed: ${response.status}`);
  return await response.json();
};

// API function for uploading report files
export const uploadConsultationReport = async (file: File) => {
  const backendToken = getBackendToken();
  const formData = new FormData();
  formData.append("report", file);

  const response = await fetch(`${API_BASE_URL}/consultation/upload`, {
    method: "POST",
    headers: {
      ...(backendToken ? { Authorization: `Bearer ${backendToken}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
  return await response.json();
};

export default function DoctorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  console.log("Patient ID from params:", id);
  const [step, setStep] = useState(1);

  const [signature, setSignature] = useState<string>(""); // Initialize as empty string, not null
  const [catOpen, setCatOpen] = useState(false);
  const handleSignatureSave = (dataUrl: string) => {
    console.log("✅ Signature captured:", dataUrl);
    setSignature(dataUrl);
    alert("Signature saved successfully!");
  };
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [treatmentPlanData, setTreatmentPlanData] = useState<any[]>([]);
  const [includeYoga, setIncludeYoga] = useState(true);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [investigationsFile, setInvestigationsFile] = useState<File | null>(
    null
  );
  const [diagnosisFile, setDiagnosisFile] = useState<File | null>(null);

  console.log("Patient ID from params:", patient, id);
  const [yogaCategories, setYogaCategories] = useState<any[]>([]);
  const [selectedAsanas, setSelectedAsanas] = useState<string[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openSubcategory, setOpenSubcategory] = useState<string | null>(null);
  const [selectedPranayama, setSelectedPranayama] = useState<string[]>([]);
  const [language, setLanguage] = useState("en");
  const [therapyList, setTherapyList] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getTherapyList();
        setTherapyList(data.data || []);
      } catch (err) {
        console.error("Error fetching therapies:", err);
      }
    })();
  }, []);

  const [opentherapies, setOpenTherapies] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTherapies, setSelectedTherapies] = useState([]);
  const filtered = therapyList.filter((t: any) =>
    t.treatment.toLowerCase().includes(search.toLowerCase())
  );

  const toggleTherapy = (therapy: any) => {
    const exists = selectedTherapies.some((t: any) => t.id === therapy.id);
    if (exists) {
      setSelectedTherapies(
        selectedTherapies.filter((t: any) => t.id !== therapy.id)
      );
    } else {
      setSelectedTherapies([...selectedTherapies, therapy]);
    }
  };

  useEffect(() => {
    const fetchYoga = async () => {
      try {
        const res = await getAllYoga();
        setYogaCategories(res.data || []);
      } catch (err) {
        console.error("Error fetching yoga data:", err);
      }
    };
    fetchYoga();
  }, []);
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErr("");

    const fetchPatient = async () => {
      try {
        const res = await getPatientById(id);
        console.log("Fetched patient response:", res);
        const p = Array.isArray(res?.data) ? res.data[0] : res?.data || res;
        setPatient(p || null);
      } catch (e: any) {
        setErr(e?.message || "Failed to fetch patient.");
        console.error("Error fetching patient:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);
  const [consentGiven, setConsentGiven] = useState(false);
  // const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [signaturePatient, setSignaturePatient] = useState("");
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [doctorData, setDoctorData] = useState<any>({
    pastMedicalHistory: {
      chronicIllnesses: [],
      surgeriesOrInjuries: "",
      allergies: "",
      familyHistory: "",
      chiefComplaints: "",
      knowCase: {
        diabetes: false,
        hypertension: false,
        cad: false,
        asthma: false,
        others: false,
        otherDescription: "",
      },
      otherChronicIllness: "",
    },
    medicineChart: [{ medicineName: "", dosage: "", frequency: "", remarks: "" }],
   physical: {
  pallor:         { absent: true,  present: false, other: false, otherDescription: "" },
  cyanosis:       { absent: true,  present: false, other: false, otherDescription: "" },
  icterus:        { absent: true,  present: false, other: false, otherDescription: "" },
  lymphadinopathy:{ absent: true,  present: false, other: false, otherDescription: "" },
  oedema:         { absent: true,  present: false, other: false, otherDescription: "" },
  clubbing:       { absent: true,  present: false, other: false, otherDescription: "" },
  eye:      { nad: true, ad: false, adDescription: "" },
  ear:      { nad: true, ad: false, adDescription: "" },
  nostrils: { nad: true, ad: false, adDescription: "" },
  lips:     { nad: true, ad: false, adDescription: "" },
  hair:     { nad: true, ad: false, adDescription: "" },
  head:     { nad: true, ad: false, adDescription: "" },
  throat:   { nad: true, ad: false, adDescription: "" },
  teeth:    { nad: true, ad: false, adDescription: "" },
  mouth:    { nad: true, ad: false, adDescription: "" },
  genitals: { nad: true, ad: false, adDescription: "" },
},
    systemic: {
      respiratorySystem: { nad: true, ad: false, adDescription: "" },
      cardioVascularSystem: { nad: true, ad: false, adDescription: "" },
      gastroIntestinalSystem: { nad: true, ad: false, adDescription: "" },
      nrvousSystem: { nad: true, ad: false, adDescription: "" },
      musculoskeletalSystem: { nad: true, ad: false, adDescription: "" },
    },
    investigationsOrDiagnosis: {
      investigations: "",
      provisionalDiagnosis: "",
      investigationsUrl: "",
      provisionalDiagnosisUrl: "",
    },
    treatment: {
      recommendation: { title: [], duration: "" },
      dietChart: { title: "" },
      yogaChart: { title: "" },
    },
    treatmentPlan: [],
    includeYoga: true,
    consent: true,
    patientSignature: "",
    doctorName: "",
    signature: "",
  });

  const [medicineChart, setMedicineChart] = useState([
    { medicineName: "", dosage: "", frequency: "", remarks: "" },
  ]);

  const handleMedicineChange = (index, field, value) => {
    const updatedChart = [...medicineChart];
    updatedChart[index][field] = value;
    setMedicineChart(updatedChart);
  };

  const addRow = () => {
    setMedicineChart([
      ...medicineChart,
      { medicineName: "", dosage: "", frequency: "", remarks: "" },
    ]);
  };

  const deleteRow = (index) => {
    const updatedChart = medicineChart.filter((_, i) => i !== index);
    setMedicineChart(updatedChart);
  };

  const handleNext = async () => {
    // If completing step 1, create the consultation
    if (step === 1 && !consultationId) {
      await handleStep1Submit();
    }

    // If completing step 5, upload any files
    if (step === 5 && (investigationsFile || diagnosisFile)) {
      await handleStep5FileUploads();
    }

    if (step < 7) setStep(step + 1);
  };
  const latestAppointment =
    Array.isArray(patient?.appointment) && patient.appointment.length > 0
      ? patient.appointment.reduce((latest, current) => {
          const latestDate = new Date(latest.date);
          const currentDate = new Date(current.date);
          return currentDate > latestDate ? current : latest;
        })
      : null;

  const latestAppointmentId = latestAppointment?.id ?? null;
  // Handle Physical Exam description changes
  const handlePhysicalExamDescChange = (field, value) => {
    setDoctorData((prev) => ({
      ...prev,
      physical: {
        ...prev.physical,
        [field]: {
          ...prev.physical[field],
          otherDescription: value,
        },
      },
    }));
  };

  // Handle Sense Organ checkbox changes
  const handleSenseOrganChange = (field, type) => {
    setDoctorData((prev) => ({
      ...prev,
      physical: {
        ...prev.physical,
        [field]: {
          nad: type === "nad",
          ad: type === "ad",
          adDescription:
            type === "ad" ? prev.physical[field].adDescription : "",
        },
      },
    }));
  };

  // Handle Sense Organ description changes
  const handleSenseOrganDescChange = (field, value) => {
    setDoctorData((prev) => ({
      ...prev,
      physical: {
        ...prev.physical,
        [field]: {
          ...prev.physical[field],
          adDescription: value,
        },
      },
    }));
  };

  // Handle Systemic Exam changes
  const handleSystemicExamChange = (field, type) => {
    setDoctorData((prev) => ({
      ...prev,
      systemic: {
        ...prev.systemic,
        [field]: {
          nad: type === "nad",
          ad: type === "ad",
          adDescription:
            type === "ad" ? prev.systemic[field].adDescription : "",
        },
      },
    }));
  };

  // Handle Systemic Exam description changes
  const handleSystemicExamDescChange = (field, value) => {
    setDoctorData((prev) => ({
      ...prev,
      systemic: {
        ...prev.systemic,
        [field]: {
          ...prev.systemic[field],
          adDescription: value,
        },
      },
    }));
  };
  const handlePhysicalExamChange = (field, type) => {
    setDoctorData((prev) => ({
      ...prev,
      physical: {
        ...prev.physical,
        [field]: {
          absent: type === "absent",
          present: type === "present",
          other: type === "other",
          otherDescription:
            type === "other" ? prev.physical[field].otherDescription : "",
        },
      },
    }));
  };
  // Step 1: Create initial consultation
  const handleStep1Submit = async () => {
    if (!patient?.id) {
      setErr("Patient information is missing!");
      return;
    }

    setSubmitting(true);
    setErr("");

    try {
      const payload = {
        chronicIllnesses: doctorData.pastMedicalHistory.chronicIllnesses,
        surgeriesOrInjuries: doctorData.pastMedicalHistory.surgeries,
        allergies: doctorData.pastMedicalHistory.allergies,
        familyHistory: doctorData.pastMedicalHistory.familyHistory,
        patientId: patient.id,
        appointmentId: latestAppointmentId,
        cheifCompaints: doctorData.pastMedicalHistory.cheifCompaints,
        knowCase: doctorData.pastMedicalHistory.knowCase,
      };

      const result = await createPatientConsult(payload);

      console.log("Consultation created successfully:", result);

      // Store the consultation ID for subsequent updates
      const createdId = result?.data?.id || result?.id;
      setConsultationId(createdId);

      alert("Step 1 completed! Moving to next step.");
    } catch (error: any) {
      console.error("Error creating consultation:", error);
      setErr(
        error?.message || "Failed to create consultation. Please try again."
      );
      alert(`Error: ${error?.message || "Failed to create consultation"}`);
      throw error; // Prevent moving to next step
    } finally {
      setSubmitting(false);
    }
  };

  // Step 5: Upload report files
  const handleStep5FileUploads = async () => {
    setUploadingReport(true);
    setErr("");

    try {
      // Upload investigations file if present
      if (investigationsFile) {
        console.log("Uploading investigations report...");
        const result = await uploadConsultationReport(investigationsFile);
        const fileUrl = result?.data?.url || result?.url;

        if (fileUrl) {
          setDoctorData({
            ...doctorData,
            investigationsUrl: fileUrl,
          });
          console.log("Investigations report uploaded:", fileUrl);
        }
      }

      // Upload diagnosis file if present
      if (diagnosisFile) {
        console.log("Uploading diagnosis report...");
        const result = await uploadConsultationReport(diagnosisFile);
        const fileUrl = result?.data?.url || result?.url;

        if (fileUrl) {
          setDoctorData({
            ...doctorData,
            provisionalDiagnosisUrl: fileUrl,
          });
          console.log("Diagnosis report uploaded:", fileUrl);
        }
      }

      if (investigationsFile || diagnosisFile) {
        alert("Reports uploaded successfully!");
      }
    } catch (error: any) {
      console.error("Error uploading reports:", error);
      setErr(error?.message || "Failed to upload reports. Please try again.");
      alert(`Error: ${error?.message || "Failed to upload reports"}`);
    } finally {
      setUploadingReport(false);
    }
  };

  // Final Submit: Update consultation with all details
  const handleSubmit = async () => {
    if (!consultationId) {
      alert("No consultation found! Please complete Step 1 first.");
      return;
    }

    setSubmitting(true);
    setErr("");

    try {
      // Prepare medicine history (only non-empty entries)
      const medicineHistory = (medicineChart || [])
      .filter((med) => med?.dosage || med?.frequency || med?.remarks || med?.medicineName)
      .map((med) => ({
        ...(med?.medicineName ? { medicineName: med.medicineName } : {}),
        dosage: med?.dosage || "",
        frequency: med?.frequency || "",
        remarks: med?.remarks || "",
      }));

      const payload = {
        physical: doctorData.physical ?? {},
        systemic: doctorData.systemic ?? {},
        investigationsOrDiagnosis: {
          investigations: doctorData.investigations,
          provisionalDiagnosis: doctorData.provisionalDiagnosis,
          investigationsUrl: doctorData.investigationsUrl,
          provisionalDiagnosisUrl: doctorData.provisionalDiagnosisUrl,
        },

        recommandation: {
          treatmentPlan: {
            title: doctorData.treatment?.treatmentPlan?.title || "",

            duration: doctorData.treatment?.treatmentPlan?.duration || "",
          },
          dietChart: {
            title: doctorData.treatment?.dietChart?.title || "",
          },
          yogaChart: {
            title:
              doctorData.treatment?.yogaChart?.title ||
              selectedAsanas.join(", "),
          },
        },

        doctorName: doctorData.doctorName,
       consent: consentGiven ? "true" : "false",
        patientSignature: signaturePatient,
        signature: signature,
        medicineHistory:
          medicineHistory.length > 0 ? medicineHistory : undefined,
        treatmentPlan:
          treatmentPlanData.length > 0 ? treatmentPlanData : undefined,
        includeYoga: includeYoga,
      };

      console.log("Updating consultation with payload:", payload);

      const result = await updatePatientConsult(consultationId, payload);

      console.log("Consultation updated successfully:", result);
      alert("Doctor consultation form submitted successfully!");

      // Optionally navigate or reset
      navigate("/patient/" + patient?.id);
    } catch (error: any) {
      console.error("Error updating consultation:", error);
      setErr(
        error?.message || "Failed to update consultation. Please try again."
      );
      alert(`Error: ${error?.message || "Failed to update consultation"}`);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    // Update yogaChart title based on selected asanas
    const yogaNames = yogaCategories
      .flatMap((cat) =>
        cat.subCategories.flatMap((sub) =>
          sub.items
            .filter((item) => selectedAsanas.includes(item.id))
            .map((item) => item.name)
        )
      )
      .join(", ");

    setDoctorData((prev) => ({
      ...prev,
      treatment: {
        ...prev.treatment,
        yogaChart: {
          ...prev.treatment.yogaChart,
          title: yogaNames,
        },
      },
    }));
  }, [selectedAsanas, yogaCategories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-700 font-semibold">
            Loading patient data...
          </p>
        </div>
      </div>
    );
  }

  if (err && !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-12 h-12 mx-auto mb-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Error Loading Patient
            </h3>
            <p className="text-gray-600">{err}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Card className="bg-gradient-to-br from-amber-100 to-amber-200 shadow-2xl border-8 border-amber-800 rounded-lg overflow-hidden">
          <CardContent className="p-4 md:p-8">
            <div className="bg-white rounded shadow-inner p-4 md:p-8">
              {/* Header */}
              <div className="text-center mb-6 border-b-4 border-amber-600 pb-4">
                <h1 className="text-3xl font-bold text-amber-800 mb-2">
                  Doctor Consultation Form
                </h1>
                <p className="text-gray-600 text-sm">
                  Iksha Naturopathy - Complete Medical Assessment
                </p>
                {consultationId && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Consultation ID: {consultationId}
                  </p>
                )}
              </div>

              {/* Error Display */}
              {err && (
                <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <p className="text-red-800 font-semibold">⚠ {err}</p>
                </div>
              )}

              {/* Patient Info Summary */}
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200">
                <h3 className="font-bold text-amber-800 mb-2">
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Name:</span>
                    <p className="text-gray-900">
                      {patient?.fullName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Age:</span>
                    <p className="text-gray-900">{patient?.age || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Sex:</span>
                    <p className="text-gray-900">{patient?.sex || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      Contact:
                    </span>
                    <p className="text-gray-900">
                      {patient?.contactNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="relative mb-12">
                <div
                  className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full"
                  style={{ left: "20px", right: "20px" }}
                ></div>

                <div
                  className="absolute top-5 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
                  style={{
                    left: "20px",
                    width: `calc(${((step - 1) / 6) * 100}% - ${
                      step === 1 ? 20 : 0
                    }px)`,
                  }}
                ></div>

                <div className="relative flex justify-between">
                  {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                    <div key={s} className="flex flex-col items-center">
                      <button
                        onClick={() => setStep(s)}
                        // disabled={s > 1 && !consultationId}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 transform hover:scale-110 ${
                          step >= s
                            ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/50"
                            : "bg-white border-2 border-gray-300 text-gray-400 hover:border-amber-400"
                        } ${
                          step === s ? "ring-4 ring-amber-200 scale-110" : ""
                        } ${
                          s > 1 && !consultationId
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {step > s ? (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          s
                        )}
                      </button>

                      <span
                        className={`mt-3 text-xs font-medium transition-colors duration-300 text-center ${
                          step >= s ? "text-amber-600" : "text-gray-400"
                        }`}
                      >
                        {s === 1 && "History"}
                        {s === 2 && "Medicine"}
                        {s === 3 && "Physical"}
                        {s === 4 && "Systemic"}
                        {s === 5 && "Reports"}
                        {s === 6 && "Suggestions"}
                        {s === 7 && "Complete"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1: Past Medical History */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Past Medical History
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Chief Complaints
                      </label>
                      <Textarea
                        placeholder="Enter Chief Complaints..."
                        value={
                          doctorData.pastMedicalHistory.chiefComplaints || ""
                        }
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            pastMedicalHistory: {
                              ...doctorData.pastMedicalHistory,
                              chiefComplaints: e.target.value,
                            },
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Known Case
                      </label>
                      {/* Checkboxes */}
                      <div className="flex flex-wrap gap-4 mb-3">
                        {[
                          "Diabetes",
                          "Hypertension",
                          "CAD",
                          "Asthma",
                          "Others",
                        ].map((illness) => (
                          <label
                            key={illness}
                            className="flex items-center gap-2 text-sm text-gray-800"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-blue-600"
                              checked={doctorData.pastMedicalHistory.chronicIllnesses?.includes(
                                illness
                              )}
                              onChange={(e) => {
                                const selected =
                                  doctorData.pastMedicalHistory
                                    .chronicIllnesses || [];
                                const newIllnesses = e.target.checked
                                  ? [...selected, illness]
                                  : Array.isArray(selected)
                                  ? selected.filter((i: any) => i !== illness)
                                  : [];

                                setDoctorData({
                                  ...doctorData,
                                  pastMedicalHistory: {
                                    ...doctorData.pastMedicalHistory,
                                    chronicIllnesses: newIllnesses,
                                  },
                                });
                              }}
                            />
                            {illness}
                          </label>
                        ))}
                      </div>

                      {/* Conditional "Others" Text Field */}
                      {doctorData.pastMedicalHistory.chronicIllnesses?.includes(
                        "Others"
                      ) && (
                        <Textarea
                          placeholder="Please specify other chronic illnesses..."
                          value={
                            doctorData.pastMedicalHistory.otherChronicIllness ||
                            ""
                          }
                          onChange={(e) =>
                            setDoctorData({
                              ...doctorData,
                              pastMedicalHistory: {
                                ...doctorData.pastMedicalHistory,
                                otherChronicIllness: e.target.value,
                              },
                            })
                          }
                          rows={2}
                          className="mt-2"
                        />
                      )}
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Surgeries / Injuries
                      </label>
                      <Textarea
                        placeholder="Enter surgeries or injuries..."
                        value={doctorData.pastMedicalHistory.surgeries}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            pastMedicalHistory: {
                              ...doctorData.pastMedicalHistory,
                              surgeries: e.target.value,
                            },
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Allergies (if any)
                      </label>
                      <Textarea
                        placeholder="Enter allergies..."
                        value={doctorData.pastMedicalHistory.allergies}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            pastMedicalHistory: {
                              ...doctorData.pastMedicalHistory,
                              allergies: e.target.value,
                            },
                          })
                        }
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Family History (if any)
                      </label>
                      <Textarea
                        placeholder="Enter family medical history..."
                        value={doctorData.pastMedicalHistory.familyHistory}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            pastMedicalHistory: {
                              ...doctorData.pastMedicalHistory,
                              familyHistory: e.target.value,
                            },
                          })
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Medicine Chart */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Medicine History Chart
                  </h3>

                  <div className="flex justify-end gap-2 mb-2">
                    <Button
                      onClick={addRow}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      + Add Row
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-amber-100">
                          <th className="border border-amber-300 p-2 text-left">
                            Sr. No.
                          </th>
                          <th className="border border-amber-300 p-2 text-left">
                            Medicine Name (Optional)
                          </th>
                          <th className="border border-amber-300 p-2 text-left">
                            Dosage (mg/ml)
                          </th>
                          <th className="border border-amber-300 p-2 text-left">
                            Frequency
                          </th>
                          <th className="border border-amber-300 p-2 text-left">
                            Remarks
                          </th>
                          <th className="border border-amber-300 p-2 text-center">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicineChart.map((med, index) => (
                          <tr key={index}>
                            <td className="border border-amber-200 p-2 font-semibold">
                              {index + 1}
                            </td>
                            <td className="border border-amber-200 p-1">
                              <Input
                                placeholder="Medicine Name"
                                value={med.medicineName}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "medicineName",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="border border-amber-200 p-1">
                              <Input
                                placeholder="Dosage"
                                value={med.dosage}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "dosage",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="border border-amber-200 p-1">
                              <Input
                                placeholder="Frequency"
                                value={med.frequency}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "frequency",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="border border-amber-200 p-1">
                              <Input
                                placeholder="Remarks"
                                value={med.remarks}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "remarks",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="border border-amber-200 p-2 text-center">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteRow(index)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Step 3: General Physical Examination */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    General Physical Examination
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* General findings */}
                    {[
                      "pallor",
                      "cyanosis",
                      "icterus",
                      "lymphadinopathy",
                      "oedema",
                      "clubbing",
                    ].map((field) => (
                      <div key={field} className="mb-4">
                        <label className="font-semibold text-gray-700 capitalize block mb-1">
                          {field.replace(/([A-Z])/g, " $1").trim()}:
                        </label>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-800">
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={doctorData.physical[field].absent}
                              onCheckedChange={() =>
                                handlePhysicalExamChange(field, "absent")
                              }
                            />
                            Absent
                          </label>
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={doctorData.physical[field].present}
                              onCheckedChange={() =>
                                handlePhysicalExamChange(field, "present")
                              }
                            />
                            Present
                          </label>
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={doctorData.physical[field].other}
                              onCheckedChange={() =>
                                handlePhysicalExamChange(field, "other")
                              }
                            />
                            Other
                          </label>
                        </div>
                        {doctorData.physical[field].other && (
                          <Input
                            className="mt-2"
                            placeholder="Specify other findings..."
                            value={doctorData.physical[field].otherDescription}
                            onChange={(e) =>
                              handlePhysicalExamDescChange(
                                field,
                                e.target.value
                              )
                            }
                          />
                        )}
                      </div>
                    ))}

                    {/* Sense organs */}
                    {[
                      "eye",
                      "ear",
                      "nostrils",
                      "lips",
                      "hair",
                      "head",
                      "throat",
                      "teeth",
                      "mouth",
                      "genitals",
                    ].map((field) => (
                      <div key={field} className="mb-4">
                        <label className="font-semibold text-gray-700 capitalize block mb-1">
                          {field}:
                        </label>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-800">
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={doctorData.physical[field].nad}
                              onCheckedChange={() =>
                                handleSenseOrganChange(field, "nad")
                              }
                            />
                            NAD
                          </label>
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={doctorData.physical[field].ad}
                              onCheckedChange={() =>
                                handleSenseOrganChange(field, "ad")
                              }
                            />
                            AD
                          </label>
                        </div>
                        {doctorData.physical[field].ad && (
                          <Input
                            className="mt-2"
                            placeholder="Enter AD details..."
                            value={doctorData.physical[field].adDescription}
                            onChange={(e) =>
                              handleSenseOrganDescChange(field, e.target.value)
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Systemic Examination */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Systemic Examination
                  </h3>

                  {[
                    { key: "respiratorySystem", label: "Respiratory System" },
                    {
                      key: "cardioVascularSystem",
                      label: "Cardio Vascular System",
                    },
                    {
                      key: "gastroIntestinalSystem",
                      label: "Gastro Intestinal System",
                    },
                    { key: "nrvousSystem", label: "Nervous System" },
                    {
                      key: "musculoskeletalSystem",
                      label: "Musculoskeletal System",
                    },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="font-semibold text-gray-700 block mb-2">
                        {label}
                      </label>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-800">
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={doctorData.systemic[key].nad}
                            onCheckedChange={() =>
                              handleSystemicExamChange(key, "nad")
                            }
                          />
                          NAD
                        </label>
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={doctorData.systemic[key].ad}
                            onCheckedChange={() =>
                              handleSystemicExamChange(key, "ad")
                            }
                          />
                          AD
                        </label>
                      </div>
                      {doctorData.systemic[key].ad && (
                        <Input
                          className="mt-2"
                          placeholder="Enter AD findings..."
                          value={doctorData.systemic[key].adDescription}
                          onChange={(e) =>
                            handleSystemicExamDescChange(key, e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Step 5: Investigations & Diagnosis */}
              {step === 5 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Investigations & Diagnosis
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Investigations / Reports (if any)
                      </label>
                      <Textarea
                        placeholder="Enter investigation details and reports..."
                        value={doctorData.investigations}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            investigations: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Provisional Diagnosis
                      </label>
                      <Textarea
                        placeholder="Enter provisional diagnosis..."
                        value={doctorData.provisionalDiagnosis}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            provisionalDiagnosis: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Upload Diagnosis Report
                      </label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setDiagnosisFile(file);
                            }
                          }}
                          className="flex-1"
                        />
                        {diagnosisFile && (
                          <span className="text-sm text-green-600">
                            ✓ {diagnosisFile.name}
                          </span>
                        )}
                      </div>
                      {doctorData.provisionalDiagnosisUrl && (
                        <p className="text-xs text-gray-500 mt-1">
                          Uploaded: {doctorData.provisionalDiagnosisUrl}
                        </p>
                      )}
                    </div>
                    {uploadingReport && (
                      <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          <p className="text-blue-800 font-semibold">
                            Uploading reports...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 6: Treatment Plan */}
              {step === 6 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Treatment Plan
                  </h3>
                  <div className="space-y-4">
                    {/* 🔹 Yoga / Lifestyle Recommendations */}
                    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-800 text-lg">
                        🧘 Yoga / Lifestyle Recommendations
                      </h3>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Title
                      </label>
                      {/* Yoga Chart Title */}
                      <Input
                        placeholder="e.g. Morning Yoga Routine, Relaxation Plan..."
                        value={doctorData.treatment?.yogaChart?.title || ""}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            treatment: {
                              ...doctorData.treatment,
                              yogaChart: {
                                ...(doctorData.treatment?.yogaChart || {}),
                                title: e.target.value,
                              },
                            },
                          })
                        }
                      />

                      {/* Yoga Category List */}
                      {/* Yoga Category List */}
                      <div className="mt-6 border-t border-blue-200 pt-4">
                        <h4 className="text-sm font-semibold text-blue-700 mb-3">
                          Select Recommended Yoga Asanas
                        </h4>

                        {yogaCategories.length === 0 ? (
                          <p className="text-gray-500 text-sm italic">
                            Loading yoga list...
                          </p>
                        ) : (
                          <div className="border border-gray-200 rounded-lg overflow-hidden divide-y">
                            {yogaCategories.map((cat) => {
                              const isOpen = openCategory === cat.id;
                              const allAsanaIds = cat.subCategories.flatMap(
                                (sub) => sub.items.map((item) => item.id)
                              );

                              const allSelected = allAsanaIds.every((id) =>
                                selectedAsanas.includes(id)
                              );

                              const handleToggleSelectAll = () => {
                                setSelectedAsanas((prev) =>
                                  allSelected
                                    ? prev.filter(
                                        (id) => !allAsanaIds.includes(id)
                                      )
                                    : [...new Set([...prev, ...allAsanaIds])]
                                );
                              };

                              const handleTogglePranayama = () => {
                                setSelectedPranayama((prev) =>
                                  prev.includes(cat.id)
                                    ? prev.filter((id) => id !== cat.id)
                                    : [...prev, cat.id]
                                );
                              };

                              return (
                                <div key={cat.id}>
                                  {/* Category Header */}
                                  <div
                                    className="bg-blue-50 px-3 py-2 text-sm font-semibold text-gray-700 flex justify-between items-center cursor-pointer hover:bg-blue-100 transition"
                                    onClick={() =>
                                      setOpenCategory(isOpen ? null : cat.id)
                                    }
                                  >
                                    <span>{cat.name}</span>
                                    <svg
                                      className={`w-4 h-4 transition-transform ${
                                        isOpen ? "rotate-180" : ""
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </div>

                                  {/* Subcategories inside Category */}
                                  {isOpen && (
                                    <div className="bg-white border-t border-gray-100">
                                      {/* Extra Options (Select All / Pranayama) */}
                                      <div className="flex items-center gap-6 px-4 py-3 bg-gray-50 border-b border-gray-100">
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                          <input
                                            type="checkbox"
                                            className="h-4 w-4 accent-green-600"
                                            checked={allSelected}
                                            onChange={handleToggleSelectAll}
                                          />
                                          Select All Asanas
                                        </label>

                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                          <input
                                            type="checkbox"
                                            className="h-4 w-4 accent-blue-600"
                                            checked={selectedPranayama?.includes(
                                              cat.id
                                            )}
                                            onChange={handleTogglePranayama}
                                          />
                                          Include Pranayama
                                        </label>
                                      </div>

                                      {/* Subcategory + Items */}
                                      {cat.subCategories.map((sub) => (
                                        <div
                                          key={sub.id}
                                          className="border-t border-gray-100"
                                        >
                                          {/* Subcategory Header */}
                                          <div
                                            className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition"
                                            onClick={() =>
                                              setOpenSubcategory(
                                                openSubcategory === sub.id
                                                  ? null
                                                  : sub.id
                                              )
                                            }
                                          >
                                            <span>{sub.name}</span>
                                            <svg
                                              className={`w-3.5 h-3.5 transition-transform ${
                                                openSubcategory === sub.id
                                                  ? "rotate-180"
                                                  : ""
                                              }`}
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                              />
                                            </svg>
                                          </div>

                                          {/* Items */}
                                          {openSubcategory === sub.id && (
                                            <div className="pl-5 divide-y divide-gray-100">
                                              {sub.items.map((item) => {
                                                const yogaId = item.id;
                                                const checked =
                                                  selectedAsanas.includes(
                                                    yogaId
                                                  );
                                                return (
                                                  <div
                                                    key={item.id}
                                                    className={`p-3 text-sm flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition ${
                                                      checked
                                                        ? "bg-green-50"
                                                        : ""
                                                    }`}
                                                    onClick={() =>
                                                      setSelectedAsanas(
                                                        (prev) =>
                                                          checked
                                                            ? prev.filter(
                                                                (a) =>
                                                                  a !== yogaId
                                                              )
                                                            : [...prev, yogaId]
                                                      )
                                                    }
                                                  >
                                                    <Checkbox
                                                      checked={checked}
                                                    />
                                                    <span>{item.name}</span>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-6 border-t pt-6 mt-6">
                      <h2 className="text-xl font-bold text-amber-700 flex items-center gap-2">
                        🩺 Treatment Details
                      </h2>

                      {/* 🔹 Treatment Plan */}
                      <div className="space-y-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <label className="font-semibold text-gray-700 block mb-2">
                          Select Therapies
                        </label>
                        <Popover
                          open={opentherapies}
                          onOpenChange={setOpenTherapies}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                            >
                              {selectedTherapies.length > 0
                                ? selectedTherapies
                                    .map((t: any) => t.treatment)
                                    .join(", ")
                                : "Select therapies"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-2">
                            <Input
                              placeholder="Search therapy..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className="mb-2"
                            />
                            <div className="max-h-48 overflow-y-auto space-y-1">
                              {filtered.map((therapy: any) => {
                                const selected = selectedTherapies.some(
                                  (t: any) => t.id === therapy.id
                                );
                                return (
                                  <div
                                    key={therapy.id}
                                    onClick={() => toggleTherapy(therapy)}
                                    className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer hover:bg-amber-100 ${
                                      selected ? "bg-amber-200" : ""
                                    }`}
                                  >
                                    {therapy.treatment}
                                    {selected && (
                                      <Check className="h-4 w-4 text-amber-600" />
                                    )}
                                  </div>
                                );
                              })}
                              {filtered.length === 0 && (
                                <div className="text-sm text-gray-500 px-2 py-2">
                                  No results
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                        {/* 🔹 Duration Inputs for selected therapies */}
                        <div className="mt-4 space-y-3">
                          <h4 className="font-semibold text-gray-800">
                            Therapy Durations
                          </h4>
                          <Input
                            placeholder="Duration (e.g. 60 min)"
                            value={
                              selectedTherapies.length > 0
                                ? `${selectedTherapies.reduce(
                                    (sum: number, t: any) =>
                                      sum + (parseInt(t.duration) || 0),
                                    0
                                  )} min`
                                : doctorData.recommandationduration || ""
                            }
                            onChange={(e) =>
                              setDoctorData({
                                ...doctorData,
                                recommandationduration: e.target.value,
                              })
                            }
                            readOnly={selectedTherapies.length > 0}
                          />
                        </div>
                      </div>

                      {/* 🔹 Diet Chart */}
                      <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-800 text-lg">
                          Diet Chart
                        </h3>

                        <Input
                          placeholder="e.g. High-protein vegetarian diet"
                          value={doctorData.treatment?.dietChart?.title || ""}
                          onChange={(e) =>
                            setDoctorData({
                              ...doctorData,
                              treatment: {
                                ...doctorData.treatment,
                                dietChart: {
                                  ...(doctorData.treatment?.dietChart || {}),
                                  title: e.target.value,
                                },
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-gray-700 block mb-2">
                          Treatment Plan
                        </label>

                        <TreatmentPlanTable
                          value={treatmentPlanData}
                          onChange={setTreatmentPlanData}
                          includeYoga={true} // or a state you already have
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-gray-700 block mb-2">
                          Diet Chart
                        </label>
                   {patient && (
                          <DietTableView
                            patientId={patient.id}
                            patientName={patient.fullName}
                            latestAppointmentId={latestAppointmentId}
                            consultationId={consultationId}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Step 7: Doctor's Signature */}
              {step === 7 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Final Review & Signature
                  </h3>
                  <div className="space-y-4">
                    {/* Language Toggle */}
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">
                        {language === "en"
                          ? "Informed Consent Form"
                          : "सूचित सहमति प्रपत्र"}
                      </h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setLanguage(language === "en" ? "hi" : "en")
                        }
                      >
                        {language === "en"
                          ? "हिंदी में देखें"
                          : "View in English"}
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto p-4 border rounded bg-gray-50 text-gray-800">
                      {language === "en" ? (
                        <>
                          <p className="font-semibold">Treatment Details:</p>
                          <p>
                            The procedure may include Naturopathy treatments
                            such as dietary changes, fasting therapy,
                            hydrotherapy, mud therapy, yoga, pranayama, massage,
                            colon hydrotherapy, acupuncture, physiotherapy,
                            chromotherapy, magneto therapy, reflexology, and
                            cupping therapy. It may also involve Panchakarma
                            procedures such as Shirodhara, Nasya (Nasal
                            Therapy), External Basti, Akshitarpan, Raktamokshana
                            (bloodletting, if needed), Abhyanga (oil massage),
                            and Swedana (steam therapy). These therapies will be
                            prescribed specifically based on your condition and
                            requirements.
                          </p>

                          <p className="font-semibold">Expected Benefits:</p>
                          <p>
                            These therapies aim to detoxify and cleanse the
                            body, rejuvenate the body and mind, improve
                            digestion and metabolism, increase energy and
                            vitality, relieve stress, enhance mental clarity,
                            reduce pain and stiffness, strengthen the immune
                            system, and promote overall well-being.
                          </p>

                          <p className="font-semibold">
                            Risks and Limitations:
                          </p>
                          <p>
                            I understand that possible risks include mild
                            nausea, dizziness, fatigue, headache, skin
                            irritation, temporary digestive changes, and
                            emotional fluctuations. Unforeseen complications may
                            occur, which can include serious conditions. The
                            management reserves the right to transfer me to an
                            appropriate medical facility if required and will
                            not be held liable for any adverse reactions. I also
                            understand that results may vary depending on
                            adherence to protocol and advice given by the doctor
                            and no guarantee of success is provided.
                          </p>

                          <p className="font-semibold">
                            Conditions & Policies:
                          </p>
                          <p>
                            I have been informed that there will be no refund
                            for the treatment under any circumstances. The
                            management reserves the right to discontinue the
                            treatment at any time if necessary. I agree to
                            follow all instructions given by the doctor and
                            their team to ensure the success of the treatment.
                          </p>

                          <p className="font-semibold">Medical Information:</p>
                          <p>
                            I have shared my complete medical history, including
                            allergies, medications, and any pre-existing
                            conditions. I confirm that I do not have pregnancy,
                            severe heart disease, active infections, or unstable
                            psychiatric issues. I will inform the practitioner
                            immediately if any such condition exists or
                            develops. I affirm that I have read the basic rules
                            and answered all the above questions in absolute
                            honesty. I hereby declare that the above information
                            is complete and accurate to the best of my knowledge
                            and I undertake the treatment at my own risk and
                            responsibility.
                          </p>

                          <p className="font-semibold">Final Declaration:</p>
                          <p>
                            I have been given sufficient time to ask questions,
                            consider alternative options, and make an informed
                            decision. I understand that I can withdraw my
                            consent at any time. I am giving this consent
                            voluntarily, without any pressure or influence,
                            after understanding all details of the proposed
                            treatments to undergo Panchakarma and Naturopathy
                            therapies as a holistic wellness approach.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold">उपचार विवरण:</p>
                          <p>
                            प्रक्रिया में प्राकृतिक चिकित्सा उपचार जैसे आहार में
                            परिवर्तन, उपवास चिकित्सा, जल चिकित्सा, मिट्टी
                            चिकित्सा, योग, प्राणायाम, मालिश, कोलन हाइड्रोथैरेपी,
                            एक्यूपंक्चर, फिजियोथैरेपी, क्रोमोथैरेपी,
                            मैग्नेटोथैरेपी, रिफ्लेक्सोलॉजी और कपिंग थेरेपी शामिल
                            हो सकते हैं। पंचकर्म प्रक्रियाओं में शिरोधारा, नस्य,
                            बाह्य बस्ती, अक्षितर्पण, रक्तमोक्षण (आवश्यकता
                            अनुसार), अभ्यंग और स्वेदन शामिल हो सकते हैं। ये
                            उपचार आपकी स्थिति और आवश्यकता के अनुसार निर्धारित
                            किए जाएंगे।
                          </p>

                          <p className="font-semibold">अपेक्षित लाभ:</p>
                          <p>
                            इन उपचारों का उद्देश्य शरीर को विषहरण और शुद्ध करना,
                            शरीर और मन को पुनर्जीवित करना, पाचन और चयापचय में
                            सुधार करना, ऊर्जा और स्फूर्ति बढ़ाना, तनाव दूर करना,
                            मानसिक स्पष्टता बढ़ाना, दर्द और अकड़न कम करना,
                            प्रतिरक्षा तंत्र को मजबूत करना और समग्र स्वास्थ्य को
                            बढ़ावा देना है।
                          </p>

                          <p className="font-semibold">जोखिम और सीमाएँ:</p>
                          <p>
                            मैं समझता/समझती हूँ कि संभावित जोखिमों में हल्की
                            मतली, चक्कर, थकान, सिरदर्द, त्वचा में जलन, अस्थायी
                            पाचन परिवर्तन और भावनात्मक उतार-चढ़ाव शामिल हो सकते
                            हैं। अप्रत्याशित जटिलताएँ भी हो सकती हैं। प्रबंधन
                            आवश्यकता अनुसार मुझे किसी उपयुक्त चिकित्सा केंद्र
                            में स्थानांतरित करने का अधिकार रखता है और किसी
                            प्रतिकूल प्रतिक्रिया के लिए उत्तरदायी नहीं होगा। मैं
                            यह भी समझता/समझती हूँ कि परिणाम प्रोटोकॉल और डॉक्टर
                            की सलाह के पालन पर निर्भर करते हैं और सफलता की कोई
                            गारंटी नहीं दी जाती।
                          </p>

                          <p className="font-semibold">नियम और नीतियाँ:</p>
                          <p>
                            मुझे बताया गया है कि किसी भी परिस्थिति में उपचार की
                            राशि वापस नहीं की जाएगी। प्रबंधन आवश्यकता पड़ने पर
                            किसी भी समय उपचार बंद करने का अधिकार रखता है। मैं
                            उपचार की सफलता सुनिश्चित करने के लिए डॉक्टर और उनकी
                            टीम द्वारा दिए गए सभी निर्देशों का पालन करने के लिए
                            सहमत हूँ।
                          </p>

                          <p className="font-semibold">चिकित्सीय जानकारी:</p>
                          <p>
                            मैंने अपनी संपूर्ण चिकित्सीय जानकारी, जैसे एलर्जी,
                            दवाइयाँ और पूर्ववर्ती बीमारियाँ साझा की हैं। मैं
                            पुष्टि करता/करती हूँ कि मुझे गर्भावस्था, गंभीर हृदय
                            रोग, सक्रिय संक्रमण या अस्थिर मानसिक विकार नहीं हैं।
                            यदि ऐसी कोई स्थिति है या विकसित होती है तो मैं तुरंत
                            चिकित्सक को सूचित करूंगा/करूंगी। मैं घोषणा करता/करती
                            हूँ कि मैंने सभी नियम पढ़े हैं और सभी प्रश्नों का
                            ईमानदारीपूर्वक उत्तर दिया है। मैं यह भी घोषणा
                            करता/करती हूँ कि उपरोक्त जानकारी मेरे ज्ञान के
                            अनुसार पूर्ण और सही है और मैं यह उपचार अपने जोखिम और
                            जिम्मेदारी पर ले रहा/रही हूँ।
                          </p>

                          <p className="font-semibold">अंतिम घोषणा:</p>
                          <p>
                            मुझे प्रश्न पूछने, वैकल्पिक विकल्पों पर विचार करने
                            और सूचित निर्णय लेने के लिए पर्याप्त समय दिया गया
                            है। मैं समझता/समझती हूँ कि मैं किसी भी समय अपनी
                            सहमति वापस ले सकता/सकती हूँ। मैं यह सहमति स्वेच्छा
                            से, बिना किसी दबाव या प्रभाव के, प्रस्तावित उपचारों
                            के सभी विवरणों को समझने के बाद पंचकर्म और प्राकृतिक
                            चिकित्सा के समग्र कल्याण दृष्टिकोण के रूप में दे
                            रहा/रही हूँ।
                          </p>
                        </>
                      )}
                    </div>

                    {/* Checkbox and Signature */}
                    <div>
                      <div className="flex items-center gap-2 mt-2">
                        <Checkbox
                          checked={consentGiven}
                          onCheckedChange={(c) => setConsentGiven(c === true)}
                        />
                        <span>
                          {language === "en"
                            ? "I have read and understood the consent form and give my consent."
                            : "मैंने सहमति प्रपत्र पढ़ा और समझा है तथा मैं अपनी सहमति देता/देती हूँ।"}
                        </span>
                      </div>
                    </div>

                    {consentGiven && (
                      <div className="mt-4">
                        <h3 className="font-semibold text-lg">
                          {language === "en"
                            ? "Patient Signature"
                            : "रोगी के हस्ताक्षर"}
                        </h3>
                        <SignatureStep onSaveSignature={handleSignatureSave} />
                      </div>
                    )}

                    {uploadingSignature && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {language === "en"
                          ? "Uploading signature…"
                          : "हस्ताक्षर अपलोड हो रहे हैं..."}
                      </p>
                    )}

                    {signature && typeof signature === "string" && (
                      <div className="mt-3">
                        <p className="text-xs text-green-700">
                          {language === "en"
                            ? "Signature uploaded."
                            : "हस्ताक्षर सफलतापूर्वक अपलोड हो गए।"}
                        </p>
                        <img
                          src={signature}
                          alt="Signature"
                          className="border border-gray-300 h-20 mt-1"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                    <p className="text-green-800 font-semibold mb-2">
                      ✓ All sections completed!
                    </p>
                    <p className="text-gray-700">
                      Please review all information and provide your signature
                      below.
                    </p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-2">
                      Doctor's Name
                    </label>
                    <Input
                      placeholder="Enter doctor's name"
                      value={doctorData.doctorName}
                      onChange={(e) =>
                        setDoctorData({
                          ...doctorData,
                          doctorName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-2">
                      Doctor's Signature
                    </label>
                    <div className="border-2 border-amber-300 rounded-lg p-4 bg-white min-h-[150px] flex items-center justify-center">
                      <div className="border-2 border-amber-300 rounded-lg p-4 bg-white">
                        <SignatureStep
                          onSaveSignature={handleSignatureSave}
                          height={180}
                          strokeWidth={2}
                        />

                        {signature && (
                          <div className="mt-4 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                            <p className="text-sm text-green-700 font-semibold mb-2">
                              ✓ Signature Saved
                            </p>
                            <img
                              src={signature}
                              alt="Doctor's signature"
                              className="border border-gray-300 rounded max-w-full h-auto"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t-2 border-amber-200">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="border-amber-600 text-amber-700 hover:bg-amber-50"
                  >
                    ← Back
                  </Button>
                )}
                <div className="ml-auto flex gap-3">
                  {step < 7 && (
                    <Button
                      onClick={handleNext}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      Next →
                    </Button>
                  )}
                  {step === 7 && (
                    <Button
                      onClick={handleSubmit}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      ✓ Submit Consultation
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
