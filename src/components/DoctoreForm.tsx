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
} from "@/lib/api";
import SignatureCanvas from "react-signature-canvas";
const API_BASE_URL = "https://api.ikshanaturopathy.com/v1";

// API function for updating consultation
const updatePatientConsult = async (consultationId: string, payload: any) => {
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
const uploadConsultationReport = async (file: File) => {
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
  

  const sigCanvas = useRef<SignatureCanvas | null>(null);
 const [signature, setSignature] = useState<string>(""); // Initialize as empty string, not null
  

  // 🧹 Clear signature
  const clear = () => {
    sigCanvas.current?.clear();
    setSignature("");
  };

  // 💾 Save as Base64
  const save = () => {
    if (!sigCanvas.current?.isEmpty()) {
      const base64 = sigCanvas.current
        .getTrimmedCanvas()
        .toDataURL("image/png")
        .replace(/^data:image\/png;base64,/, ""); // ✅ Only pure Base64 (optional)
      setSignature(base64);

      console.log("✅ Signature Base64:", base64);

    
    } else {
      alert("Please sign before saving.");
    }
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


  const [doctorData, setDoctorData] = useState({
    pastMedicalHistory: {
      chronicIllnesses: "",
      surgeries: "",
      allergies: "",
      familyHistory: "",
    },
    medicineChart: Array.from({ length: 5 }, () => ({
      medicineName: "",
      name: "",
      dosage: "",
      frequency: "",
      remarks: "",
    })),
    generalPhysicalExam: {
      pallor: "",
      cyanosis: "",
      icterus: "",
      lymphadinopathy: "",
      oedema: "",
      clubbing: "",
      eye: "",
      ear: "",
      nostrils: "",
      lips: "",
      hair: "",
      head: "",
      throat: "",
      teeth: "",
      mouth: "",
      genitals: "",
    },
    systemicExam: {
      respiratory: "",
      cardiovascular: "",
      gastrointestinal: "",
      nervous: "",
      musculoskeletal: "",
    },
    investigations: "",
    investigationsUrl: "",
    provisionalDiagnosis: "",
    provisionalDiagnosisUrl: "",
    treatmentPlan: "",
    dietChart: "",
    yogaChart: "",
    doctorName: "",
    signature: "",
      treatment: {
        treatmentPlan:"",
        dietChart: "",
        yogaChart: ""
    },
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
    setMedicineChart([...medicineChart, { medicineName: "", dosage: "", frequency: "", remarks: "" }]);
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
const latestAppointment = Array.isArray(patient?.appointment) && patient.appointment.length > 0
  ? patient.appointment.reduce((latest, current) => {
      const latestDate = new Date(latest.date);
      const currentDate = new Date(current.date);
      return currentDate > latestDate ? current : latest;
    })
  : null;

const latestAppointmentId = latestAppointment?.id ?? null;


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
      const medicineHistory = doctorData.medicineChart
        .filter((med) => med.dosage || med.frequency)
        .map((med) => ({
          ...(med.medicineName ? { medicineName: med.medicineName } : {}),
          dosage: med.dosage,
          frequency: med.frequency,
          remarks: med.remarks,
        }));

      const payload = {
        physical: {
          pallor: doctorData.generalPhysicalExam.pallor,
          cyanosis: doctorData.generalPhysicalExam.cyanosis,
          icterus: doctorData.generalPhysicalExam.icterus,
          lymphadinopathy: doctorData.generalPhysicalExam.lymphadinopathy,
          oedema: doctorData.generalPhysicalExam.oedema,
          clubbing: doctorData.generalPhysicalExam.clubbing,
          eye: doctorData.generalPhysicalExam.eye,
          ear: doctorData.generalPhysicalExam.ear,
          nostrils: doctorData.generalPhysicalExam.nostrils,
          lips: doctorData.generalPhysicalExam.lips,
          hair: doctorData.generalPhysicalExam.hair,
          head: doctorData.generalPhysicalExam.head,
          throat: doctorData.generalPhysicalExam.throat,
          teeth: doctorData.generalPhysicalExam.teeth,
          mouth: doctorData.generalPhysicalExam.mouth,
          genitals: doctorData.generalPhysicalExam.genitals,
        },
        systemic: {
          respiratorySystem: doctorData.systemicExam.respiratory,
          cardioVascularSystem: doctorData.systemicExam.cardiovascular,
          gastroIntestinalSystem: doctorData.systemicExam.gastrointestinal,
          nrvousSystem: doctorData.systemicExam.nervous,
          musculoskeletalSystem: doctorData.systemicExam.musculoskeletal,
        },
        investigationsOrDiagnosis: {
          investigations: doctorData.investigations,
          provisionalDiagnosis: doctorData.provisionalDiagnosis,
          investigationsUrl: doctorData.investigationsUrl,
          provisionalDiagnosisUrl: doctorData.provisionalDiagnosisUrl,
        },
        treatment: {
          treatmentPlan: doctorData.treatmentPlan,
          dietChart: doctorData.dietChart,
          yogaChart: doctorData.yogaChart,
        },
        doctorName: doctorData.doctorName,
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
                        disabled={s > 1 && !consultationId}
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
                        {s === 6 && "Treatment"}
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
                        Chronic Illnesses (Diabetes / BP / CAD / Asthma /
                        Others)
                      </label>
                      <Textarea
                        placeholder="Enter chronic illnesses..."
                        value={doctorData.pastMedicalHistory.chronicIllnesses}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            pastMedicalHistory: {
                              ...doctorData.pastMedicalHistory,
                              chronicIllnesses: e.target.value,
                            },
                          })
                        }
                        rows={3}
                      />
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
        <Button onClick={addRow} className="bg-green-500 hover:bg-green-600 text-white">
          + Add Row
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-amber-100">
              <th className="border border-amber-300 p-2 text-left">Sr. No.</th>
              <th className="border border-amber-300 p-2 text-left">Medicine Name (Optional)</th>
              <th className="border border-amber-300 p-2 text-left">Dosage (mg/ml)</th>
              <th className="border border-amber-300 p-2 text-left">Frequency</th>
              <th className="border border-amber-300 p-2 text-left">Remarks</th>
              <th className="border border-amber-300 p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicineChart.map((med, index) => (
              <tr key={index}>
                <td className="border border-amber-200 p-2 font-semibold">{index + 1}</td>
                <td className="border border-amber-200 p-1">
                  <Input
                    placeholder="Medicine Name"
                    value={med.medicineName}
                    onChange={(e) => handleMedicineChange(index, "medicineName", e.target.value)}
                  />
                </td>
                <td className="border border-amber-200 p-1">
                  <Input
                    placeholder="Dosage"
                    value={med.dosage}
                    onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                  />
                </td>
                <td className="border border-amber-200 p-1">
                  <Input
                    placeholder="Frequency"
                    value={med.frequency}
                    onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                  />
                </td>
                <td className="border border-amber-200 p-1">
                  <Input
                    placeholder="Remarks"
                    value={med.remarks}
                    onChange={(e) => handleMedicineChange(index, "remarks", e.target.value)}
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
                    {Object.entries(doctorData.generalPhysicalExam).map(
                      ([key, value]) => (
                        <div key={key}>
                          <label className="font-semibold text-gray-700 capitalize block mb-1">
                            {key.replace(/([A-Z])/g, " $1").trim()}:
                          </label>
                          <Input
                            placeholder={`Absent/Present/Other`}
                            value={value}
                            onChange={(e) =>
                              setDoctorData({
                                ...doctorData,
                                generalPhysicalExam: {
                                  ...doctorData.generalPhysicalExam,
                                  [key]: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Systemic Examination */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Systemic Examination
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Respiratory System
                      </label>
                      <Input
                        placeholder="NAD / Enter findings..."
                        value={doctorData.systemicExam.respiratory}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            systemicExam: {
                              ...doctorData.systemicExam,
                              respiratory: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Cardio Vascular System
                      </label>
                      <Input
                        placeholder="NAD / Enter findings..."
                        value={doctorData.systemicExam.cardiovascular}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            systemicExam: {
                              ...doctorData.systemicExam,
                              cardiovascular: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Gastro Intestinal System
                      </label>
                      <Input
                        placeholder="NAD / Enter findings..."
                        value={doctorData.systemicExam.gastrointestinal}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            systemicExam: {
                              ...doctorData.systemicExam,
                              gastrointestinal: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Nervous System
                      </label>
                      <Input
                        placeholder="NAD / Enter findings..."
                        value={doctorData.systemicExam.nervous}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            systemicExam: {
                              ...doctorData.systemicExam,
                              nervous: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Musculoskeletal System
                      </label>
                      <Input
                        placeholder="NAD / Enter findings..."
                        value={doctorData.systemicExam.musculoskeletal}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            systemicExam: {
                              ...doctorData.systemicExam,
                              musculoskeletal: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
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
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Yoga Chart
                      </label>
                      <Textarea
                        placeholder="Enter yoga recommendations..."
                        value={doctorData.treatment.treatmentPlan}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            treatmentPlan: e.target.value,
                          })
                        }
                        rows={4}
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
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Yoga Chart
                      </label>
                      <Textarea
                        placeholder="Enter yoga recommendations..."
                        value={doctorData.yogaChart}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            yogaChart: e.target.value,
                          })
                        }
                        rows={4}
                      />
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
                        <SignatureCanvas
                          ref={sigCanvas}
                          penColor="black"
                          canvasProps={{
                            className: "w-full h-[150px] bg-white rounded-lg",
                          }}
                        />
                        <div className="flex justify-between mt-2">
                          <button
                            type="button"
                            onClick={clear}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={save}
                            className="px-3 py-1 bg-amber-400 text-white rounded hover:bg-amber-500"
                          >
                            Save
                          </button>
                        </div>

                        {signature && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600">Preview:</p>
                            <img
                              src={`data:image/png;base64,${signature}`}
                              alt="Signature preview"
                              className="mt-2 border rounded"
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
