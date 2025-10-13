import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import IkshaLogo from "../assets/iksha_logo.png";
import SignatureStep from "./ConsentStep";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  uploadPatientSignature,
  createPatient,
  updatePatient,
  getPaymentQr,
  getPatientById,
} from "@/lib/api";

// Define all Vitals & Anthropometric fields
const VITALS_FIELDS = [
  { label: "Blood Pressure", unit: "mmHg", normal: "90-120/60-80" },
  { label: "Pulse", unit: "Beat/min", normal: "60-100" },
  { label: "Weight", unit: "Kg", normal: "Varies by height (use BMI)" },
  { label: "Height", unit: "Cm", normal: "-" },
  { label: "BMI", unit: "kg/m²", normal: "18.5–24.9" },
  { label: "Temperature", unit: "°F", normal: "98.6" },
  { label: "Pain Scale", unit: "", normal: "-" },
  { label: "Mid-Upper Arm Circumference", unit: "Cm", normal: "22–32 cm" },
  {
    label: "Waist Circumference",
    unit: "Cm",
    normal: "Men < 94 cm, Women < 80 cm",
  },
  { label: "Hip Circumference", unit: "Cm", normal: "-" },
  {
    label: "Waist-Hip Ratio (WHR)",
    unit: "-",
    normal: "Men < 0.90, Women < 0.85",
  },
  {
    label: "Skinfold Thickness (Triceps)",
    unit: "Mm",
    normal: "Men: 6–13 mm, Women: 12–23 mm",
  },
  {
    label: "Skinfold Thickness (Biceps)",
    unit: "Mm",
    normal: "Men: 4–12 mm, Women: 9–18 mm",
  },
  {
    label: "Skinfold (Subscapular)",
    unit: "Mm",
    normal: "Men: 10–18 mm, Women: 12–25 mm",
  },
  {
    label: "Skinfold (Suprailiac)",
    unit: "Mm",
    normal: "Men: 8–15 mm, Women: 11–22 mm",
  },
  { label: "Body Fat %", unit: "%", normal: "Men: 10–20%, Women: 18–28%" },
];

const LIFESTYLE_FIELDS: Record<
  string,
  {
    options: string[];
    other?: boolean;
    frequency?: boolean;
    wakeTime?: boolean;
    sleepTime?: boolean;
  }
> = {
  diet: { options: ["Veg", "Non-Veg", "Mixed", "Vegan"], other: true },
  appetite: { options: ["Good", "Moderate", "Poor"], other: false },
  taste: {
    options: ["Normal", "Bitter", "Sour", "Salty", "Foul"],
    other: false,
  },
  bowel: {
    options: ["Regular", "Irregular", "Loose", "Constipated"],
    other: true,
    frequency: true,
  },
  sleep: {
    options: ["Sound", "Disturbed", "Insomnia"],
    other: false,
    wakeTime: true,
    sleepTime: true,
  },
  addictions: {
    options: ["Smoking", "Alcohol", "Tobacco", "Tea", "Coffee"],
    other: true,
  },
  physicalActivity: {
    options: ["Sedentary", "Active", "Walking", "Yoga", "Exercise"],
    other: true,
  },
  waterIntake: { options: [], other: true },
  stress: { options: ["Low", "Moderate", "High"], other: false },
  mentalState: {
    options: ["Calm", "Anxious", "Irritable", "Depressed"],
    other: false,
  },
};

const PatientRegistrationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [step, setStep] = useState(1);
  const [showPrint, setShowPrint] = useState(false);
  const printRef = useRef<HTMLDivElement | null>(null);

  const [lifestyle, setLifestyle] = useState<Record<string, any>>({
    diet: "",
    appetite: [],
    taste: [],
    bowel: [],
    sleep: [],
    addictions: [],
    physicalActivity: [],
    waterIntake: "",
    stress: [],
    mentalState: [],
    wakeTime: "",
    sleepTime: "",
    otherDiet: "",
    otherAddictions: "",
    otherBowel: "",
    otherSleep: "",
    otherWaterIntake: "",
  });

  const [formData, setFormData] = useState<Record<string, any>>({
    name: "",
    age: "",
    sex: "",
    fatherOrHusbandName: "",
    address: "",
    contactNumber: "",
    maritalStatus: "",
    // dateOfVisit: "",
    occupation: "",
    reference: "",
    dateOfBirth: "",
    bloodType: "",
    primaryHealthConcern: "",
    chronicIllnesses: "",
    surgeriesOrInjuries: "",
    allergies: "",
    familyHistory: "",
  });

  const [vitals, setVitals] = useState<Record<string, any>>({});
  const [consentGiven, setConsentGiven] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [signature, setSignature] = useState("");
  const [uploadingSignature, setUploadingSignature] = useState(false);
  // NEW: backend auth + patient progress state
  const [loggedIn, setLoggedIn] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  console.log(id, patientId, "iiidd");
  const [qr, setQr] = useState<{
    imageUrl?: string;
    upiId?: string;
    id?: string;
  } | null>(null);

  // 📡 API submission state
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [apiResponse, setApiResponse] = useState<any>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVitalsChange = (field: string, value: any) => {
    setVitals({ ...vitals, [field]: value });
  };

  const handlePrint = () => {
    setShowPrint(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // 🧰 Helpers
  const toISODate = (d: string) =>
    d ? new Date(d).toISOString().slice(0, 10) : "";

  const toNumberOrNull = (value: any) =>
    value !== undefined && value !== "" ? Number(value) : null;
  const toStringOrNull = (value: any) =>
    value !== undefined && value !== null ? String(value) : "";

  const buildCreatePayload = () => ({
    fullName: toStringOrNull(formData.name),
    age: toNumberOrNull(formData.age),
    sex: toStringOrNull(formData.sex),
    fatherOrHusbandName: toStringOrNull(formData.fatherOrHusbandName),
    contactNumber: toStringOrNull(formData.contactNumber),
    maritalStatus: toStringOrNull(formData.maritalStatus),
    dateOfBirth: formData.dateOfBirth ? toISODate(formData.dateOfBirth) : null,
    bloodType: toStringOrNull(formData.bloodType),
    occupation: toStringOrNull(formData.occupation),
    reference: toStringOrNull(formData.reference),
    address: toStringOrNull(formData.address),
    primaryHealthConcern: toStringOrNull(formData.primaryHealthConcern),
    chronicIllnesses: toStringOrNull(formData.chronicIllnesses),
    surgeriesOrInjuries: toStringOrNull(formData.surgeriesOrInjuries),
    allergies: toStringOrNull(formData.allergies),
    familyHistory: formData.familyHistory,
  });

  const buildUpdatePayload = (opts: { includeConsent?: boolean } = {}) => {
    return {
      // Vitals
      bloodPressure: toStringOrNull(vitals["Blood Pressure"]),
      pulse: toNumberOrNull(vitals["Pulse"]),
      weightKg: toNumberOrNull(vitals["Weight"]),
      heightCm: toNumberOrNull(vitals["Height"]),
      bmi: toNumberOrNull(vitals["BMI"]),
      temperatureF: toNumberOrNull(vitals["Temperature"]),
      painScale: toStringOrNull(vitals["Pain Scale"]),
      midUpperArmCircumferenceCm: toNumberOrNull(
        vitals["Mid-Upper Arm Circumference"]
      ),
      waistCircumferenceCm: toNumberOrNull(vitals["Waist Circumference"]),
      hipCircumferenceCm: toNumberOrNull(vitals["Hip Circumference"]),
      whr: toNumberOrNull(vitals["Waist-Hip Ratio (WHR)"]),
      skinfoldTricepsMm: toNumberOrNull(vitals["Skinfold Thickness (Triceps)"]),
      skinfoldBicepsMm: toNumberOrNull(vitals["Skinfold Thickness (Biceps)"]),
      skinfoldSubscapularMm: toNumberOrNull(vitals["Skinfold (Subscapular)"]),
      skinfoldSuprailiacMm: toNumberOrNull(vitals["Skinfold (Suprailiac)"]),
      bodyFatPercent: toNumberOrNull(vitals["Body Fat %"]),

      // Lifestyle
      diet: lifestyle.other_diet?.trim()
        ? lifestyle.other_diet
        : lifestyle.diet.length
        ? lifestyle.diet[0]
        : "",
      otherDiet: toStringOrNull(lifestyle.other_diet),
      appetite: lifestyle.appetite.length ? lifestyle.appetite[0] : null,
      taste: lifestyle.taste.length ? lifestyle.taste[0] : null,
      bowel: lifestyle.bowel.length ? lifestyle.bowel[0] : null,
      otherBowel: toStringOrNull(lifestyle.other_bowel),
      bowelFrequency: toStringOrNull(lifestyle.frequency_bowel),
      sleep: lifestyle.sleep.length ? lifestyle.sleep[0] : null,
      sleepWakeUpTime: toStringOrNull(lifestyle.wakeTime),
      sleepTime: toStringOrNull(lifestyle.sleepTime),
      addictions: lifestyle.addictions.length ? lifestyle.addictions : [],
      otherAddictions: toStringOrNull(lifestyle.other_addictions),
      physicalActivity: lifestyle.physicalActivity.length
        ? lifestyle.physicalActivity
        : [],
      otherPhysicalActivity: toStringOrNull(lifestyle.other_physicalActivity),
      waterIntakeLiters: toNumberOrNull(lifestyle.waterIntake),
      otherWaterIntake: lifestyle.other_water_intake || "test",
      stress: lifestyle.stress.length ? lifestyle.stress[0] : null,
      mentalState: lifestyle.mentalState.length
        ? lifestyle.mentalState[0]
        : null,

      // Signature & consent
      signature: toStringOrNull(signature),
      consent: opts.includeConsent ? !!consentGiven : null,

      // Payment
      paymentMethod: toStringOrNull(paymentMethod),
      upiId: qr?.upiId ? toStringOrNull(qr.upiId) : null,
      qrId: qr?.id ? qr.id : "",
    };
  };

  // Step advancement with API side-effects
  const handleNext = async () => {
    // validations
    if (step === 1 && (!formData.name || !formData.contactNumber)) {
      alert("Please fill Name and Contact Number");
      return;
    }

    if (step === 5 && !consentGiven) {
      alert("Please give consent to proceed");
      return;
    }

    try {
      setApiError("");

      // step 1 -> create patient
      if (step === 1) {
        setSubmitting(true);
        const res = await createPatient(buildCreatePayload());
        setSubmitting(false);
        const id = res?.data?.id || res?.id;
        if (!id) throw new Error("No patient id received");
        setPatientId(id);
        setApiSuccess("Patient created.");
      }

      // step 3 -> entering payment: fetch QR
      if (step === 3) {
        try {
          const qrRes = await getPaymentQr();
          setQr({
            imageUrl: qrRes?.data?.qrCodeUrl || qrRes?.qrCodeUrl,
            upiId: qrRes?.data?.upi || qrRes?.upi,
            id: qrRes?.data?.id || qrRes?.id,
          });
          console.log(qrRes?.data?.qrCodeUrl);
        } catch (e) {
          console.error(e);
          // proceed even if QR fails (cash option can still be used)
        }
      }

      // step 4 -> save payment method & QR refs
      if (step === 4 && id) {
        setSubmitting(true);
        await updatePatient(id, buildUpdatePayload({ includeConsent: false }));
        setSubmitting(false);
      }

      setStep(step + 1);
    } catch (err: any) {
      console.error(err);
      setSubmitting(false);
      setApiError(err?.message || "Something went wrong.");
    }
  };
  // 1) helper to turn dataURL -> File
  const dataUrlToFile = async (
    dataUrl: string,
    fileName = "signature.jpg"
  ): Promise<File> => {
    const blob = await (await fetch(dataUrl)).blob();

    // compress to JPEG (~0.82 quality) to avoid timeouts
    const bitmap = await createImageBitmap(blob);
    const off = document.createElement("canvas");
    off.width = bitmap.width;
    off.height = bitmap.height;
    const ctx = off.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    const jpegBlob: Blob = await new Promise((resolve) =>
      off.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.82)
    );
    return new File([jpegBlob], fileName, { type: "image/jpeg" });
  };
  // Accepts inputs like "120/80", "120-80", "120 80", "120:80", "  120  /  80 "
  const normalizeBloodPressure = (value: string): string | null => {
    if (!value) return null;
    const compact = String(value).trim().replace(/\s+/g, "");
    // matches 2–3 digit / 2–3 digit with / - :
    const m = compact.match(/^(\d{2,3})[\/\-\:](\d{2,3})$/);
    if (m) return `${m[1]}/${m[2]}`;

    // fallback: extract the first two 2–3 digit numbers
    const nums = String(value).match(/\d{2,3}/g);
    if (nums && nums.length >= 2) return `${nums[0]}/${nums[1]}`;

    return null;
  };

  // Optional: basic physiology guardrails to prevent obvious typos
  const isBloodPressureInPlausibleRange = (bp: string): boolean => {
    const m = bp.match(/^(\d{2,3})\/(\d{2,3})$/);
    if (!m) return false;
    const sys = parseInt(m[1], 10);
    const dia = parseInt(m[2], 10);
    // tweak ranges if your clinic wants different thresholds
    return sys >= 70 && sys <= 250 && dia >= 40 && dia <= 150 && sys > dia;
  };

  // 2) upload + auto-submit
  const handleSignatureSave = async (dataUrl: string) => {
    try {
      setApiError("");
      setApiSuccess("");
      setUploadingSignature(true);

      if (!id) throw new Error("No patient id. Please complete Step 1 first.");
      if (!consentGiven) throw new Error("Consent is required before signing.");

      const file = await dataUrlToFile(dataUrl, "signature.png");

      // upload -> get public URL (now returns data.signatureUrl)
      const url = await uploadPatientSignature(file);

      setSignature(url); // for preview
      setApiSuccess("Signature uploaded. Submitting form…");

      // auto-submit using the fresh URL
      await submitFinal(url);
    } catch (e: any) {
      console.error(e);
      setApiError(e?.message || "Failed to upload signature.");
    } finally {
      setUploadingSignature(false);
    }
  };

  const submitFinal = async (signatureOverride?: string) => {
    if (!patientId)
      return setApiError("No patient id. Please complete Step 1 again.");
    if (!consentGiven) return setApiError("Consent is required.");

    // --- Blood Pressure normalize + validate ---
    const bpInput = vitals["Blood Pressure"] || "";
    const normalizedBP = normalizeBloodPressure(bpInput);
    if (!normalizedBP) {
      return setApiError(
        'Please enter blood pressure like "120/80" (e.g., 118/76).'
      );
    }
    if (!isBloodPressureInPlausibleRange(normalizedBP)) {
      return setApiError(
        'Blood pressure looks out of range. Enter something like "120/80".'
      );
    }

    const sigToSend = signatureOverride ?? signature;
    if (!sigToSend)
      return setApiError("Signature is required. Please sign first.");

    setSubmitting(true);
    setApiError("");
    setApiSuccess("");
    try {
      const payload = buildUpdatePayload({ includeConsent: true });

      // Force the normalized BP into the payload key the backend expects
      payload.bloodPressure = normalizedBP;
      payload.signature = sigToSend;

      const data = await updatePatient(id, payload);
      setSignature(sigToSend);
      setApiResponse(data);
      setApiSuccess("Patient updated & forwarded successfully.");
      navigate(`/patient/${id}`);
    } catch (err: any) {
      setApiError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };
  // PatientRegistrationForm.tsx (same file)
  const mapPatientToFormState = (p: any) => ({
    name: p.fullName || "",
    age: p.age ?? "",
    sex: p.sex || "",
    fatherOrHusbandName: p.fatherOrHusbandName || "", // ✅ match backend key
    address: p.address || "",
    contactNumber: p.contactNumber || "",
    maritalStatus: p.maritalStatus || "",
    dateOfBirth: p.dateOfBirth || "",
    bloodType: p.bloodType || "",
    occupation: p.occupation || "",
    reference: p.reference || "",
    // dateOfVisit: p.formDate || "", // if you want formDate
  });

  const mapPatientToVitals = (p: any) => ({
    "Blood Pressure": p.bloodPressure || "",
    Pulse: p.pulse ?? "",
    Weight: p.weightKg ?? "", // ✅ corrected
    Height: p.heightCm ?? "", // ✅ corrected
    BMI: p.bmi ?? "", // ✅ corrected
    Temperature: p.temperatureF ?? "", // ✅ corrected
  });
  const mapPatientToLifestyle = (p: any) => ({
    diet: p.diet || "",
    appetite: p.appetite ? p.appetite.split(",") : [],
    taste: p.taste ? p.taste.split(",") : [],
    bowel: p.bowel ? p.bowel.split(",") : [],
    sleep: p.sleep ? p.sleep.split(",") : [],
    addictions: p.addictions ? p.addictions.split(",") : [],
    physicalActivity: p.physicalActivity ? p.physicalActivity.split(",") : [],
    waterIntake: p.waterIntakeLiters || "",
    otherWaterIntake: p.otherWaterIntake || "",
    stress: p.stress ? p.stress.split(",") : [],
    mentalState: p.mentalState ? p.mentalState.split(",") : [],
    wakeTime: p.sleepWakeUpTime || "",
    sleepTime: p.sleepTime || "",
    otherDiet: p.otherDiet || "",
    otherAddictions: p.otherAddictions || "",
    otherBowel: p.otherBowel || "",
    otherSleep: p.otherSleep || "",
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const json = await getPatientById(id);
        const data = json?.data ?? json;
        console.log("Loaded patient:", data);
        setFormData(mapPatientToFormState(data[0]));
        setLifestyle(mapPatientToLifestyle(data[0]));
        setVitals(mapPatientToVitals(data));
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [id]);
  // PRINT VIEW
  if (showPrint) {
    return (
      <div ref={printRef} className="print-view bg-white p-8 max-w-4xl mx-auto">
        <style>{`
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none !important; }
            .print-view { box-shadow: none !important; }
          }
        `}</style>

        {/* Header with Logo */}
        <div className="border-b-4 border-amber-600 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className=" mb-6  h-12 flex items-center">
                <img
                  src={IkshaLogo}
                  alt="Iksha Naturopathy Logo"
                  className="  h-36 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-gray-600">
                Integrated Natural Healing system for a comprehensive
              </p>
            </div>
            <div className="text-right text-sm">
              <p>📞 +91 9343922950</p>
              <p>📧 admin@ikshanaturopathy.com</p>
              <p>📍 Bhopal, Madhya Pradesh</p>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <h2 className="text-xl font-bold text-amber-700 mb-4 border-b-2 border-amber-200 pb-2">
          PATIENT INFORMATION
        </h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6 text-sm">
          <div>
            <span className="font-semibold">Name:</span> {formData.name}
          </div>
          <div>
            <span className="font-semibold">Age:</span> {formData.age}
          </div>
          <div>
            <span className="font-semibold">Sex:</span> {formData.sex}
          </div>
          <div>
            <span className="font-semibold">Blood Type:</span>{" "}
            {formData.bloodType}
          </div>
          <div>
            <span className="font-semibold">Father/Husband:</span>{" "}
            {formData.fatherOrHusbandName}
          </div>
          <div>
            <span className="font-semibold">DOB:</span> {formData.dateOfBirth}
          </div>
          <div>
            <span className="font-semibold">Contact:</span>{" "}
            {formData.contactNumber}
          </div>
          <div>
            <span className="font-semibold">Marital Status:</span>{" "}
            {formData.maritalStatus}
          </div>
          <div className="col-span-2">
            <span className="font-semibold">Address:</span> {formData.address}
          </div>
          <div>
            <span className="font-semibold">Occupation:</span>{" "}
            {formData.occupation}
          </div>
          <div>
            <span className="font-semibold">Reference:</span>{" "}
            {formData.reference}
          </div>
          {/* <div className="col-span-2">
            <span className="font-semibold">Date of Visit:</span>{" "}
            {formData.dateOfVisit}
          </div> */}
        </div>

        {/* Primary Health Concern */}
        <h2 className="text-xl font-bold text-amber-700 mb-4 border-b-2 border-amber-200 pb-2">
          PRIMARY HEALTH CONCERN
        </h2>
        <p className="mb-6 text-sm bg-amber-50 p-3 rounded">
          {formData.primaryHealthConcern}
        </p>

        {/* Medical History */}
        <h2 className="text-xl font-bold text-amber-700 mb-4 border-b-2 border-amber-200 pb-2">
          MEDICAL HISTORY
        </h2>
        <div className="space-y-3 mb-6 text-sm">
          {formData.chronicIllnesses && (
            <div>
              <span className="font-semibold">Chronic Illnesses:</span>{" "}
              {formData.chronicIllnesses}
            </div>
          )}
          {formData.surgeriesOrInjuries && (
            <div>
              <span className="font-semibold">Surgeries:</span>{" "}
              {formData.surgeriesOrInjuries}
            </div>
          )}
          {formData.allergies && (
            <div>
              <span className="font-semibold">Allergies:</span>{" "}
              {formData.allergies}
            </div>
          )}
          {formData.familyHistory && (
            <div>
              <span className="font-semibold">Family History:</span>{" "}
              {formData.familyHistory}
            </div>
          )}
        </div>

        {/* Vitals */}
        <h2 className="text-xl font-bold text-amber-700 mb-4 border-b-2 border-amber-200 pb-2">
          VITALS & MEASUREMENTS
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          {Object.entries(vitals).map(
            ([key, value]) =>
              value && (
                <div key={key} className="bg-gray-50 p-2 rounded">
                  <span className="font-semibold">{key}:</span> {String(value)}
                </div>
              )
          )}
        </div>

        {/* Payment */}
        <div className="mb-6 text-sm">
          <span className="font-semibold">Payment Method:</span> {paymentMethod}
        </div>

        {/* Signature */}
        {signature && (
          <div className="mb-6">
            <p className="font-semibold text-sm mb-2">Patient Signature:</p>
            <img
              src={signature}
              alt="Signature"
              className="border border-gray-300 h-20"
            />
          </div>
        )}

        {/* Footer */}
        <div className="border-t-4 border-amber-600 pt-4 mt-8 text-center text-xs text-gray-600">
          <p className="font-semibold">
            Integrated Natural Healing system for a comprehensive
          </p>
          <p>
            📞 +91 9343922950 | 📧 admin@ikshanaturopathy.com | 🌐
            www.ikshanaturopathy.com
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} Iksha Naturopathy. All rights reserved.
          </p>
        </div>

        <Button onClick={() => setShowPrint(false)} className="no-print mt-4">
          Back to Form
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      {/* Clipboard/Wooden Board Effect */}
      <div className="max-w-4xl mx-auto relative">
        {/* Clipboard Clip */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-12 bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-lg shadow-xl z-10">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-6 bg-gray-600 rounded shadow-inner"></div>
          </div>
        </div>

        {/* Wooden Board */}
        <Card className="bg-gradient-to-br from-amber-100 to-amber-200 shadow-2xl border-8 border-amber-800 rounded-lg overflow-hidden">
          <CardContent className="p-4 md:p-8">
            {/* Paper Effect */}
            <div className="bg-white rounded shadow-inner p-6 md:p-8">
              {/* Logo and Header */}
              <div className="text-center mb-6 border-b-4 border-amber-600 pb-4 flex flex-col items-center">
                <div className=" mb-6  h-12 flex items-center">
                  <img
                    src={IkshaLogo}
                    alt="Iksha Naturopathy Logo"
                    className="  h-36 w-auto object-contain"
                  />
                </div>
                <p className="text-gray-600 text-sm">
                  Integrated Natural Healing system for a comprehensive
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  📞 +91 9343922950 | 📧 admin@ikshanaturopathy.com
                </p>
              </div>

              {/* Progress */}
              <div className="relative mb-12">
                {/* Background Line */}
                <div
                  className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full"
                  style={{ left: "20px", right: "20px" }}
                ></div>

                {/* Active Progress Line */}
                <div
                  className="absolute top-5 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
                  style={{
                    left: "20px",
                    width: `calc(${((step - 1) / 4) * 100}% - ${
                      step === 1 ? 20 : 0
                    }px)`,
                  }}
                ></div>

                {/* Steps */}
                <div className="relative flex justify-between">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="flex flex-col items-center">
                      <button
                        onClick={() => setStep(s)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 transform hover:scale-110 ${
                          step >= s
                            ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/50"
                            : "bg-white border-2 border-gray-300 text-gray-400 hover:border-amber-400"
                        } ${
                          step === s ? "ring-4 ring-amber-200 scale-110" : ""
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

                      {/* Step Label */}
                      <span
                        className={`mt-3 text-xs font-medium transition-colors duration-300 text-center ${
                          step >= s ? "text-amber-600" : "text-gray-400"
                        }`}
                      >
                        {s === 1 && "Patient Info"}
                        {s === 2 && "Lifestyle"}
                        {s === 3 && "Vitals"}
                        {s === 4 && "Payment"}
                        {s === 5 && "Consent"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1: Patient Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Patient Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      name="name"
                      placeholder="Full Name *"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      name="age"
                      placeholder="Age"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      name="sex"
                      placeholder="Sex"
                      value={formData.sex}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      name="fatherOrHusbandName"
                      placeholder="Father/Husband Name"
                      value={formData.fatherOrHusbandName}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      name="contactNumber"
                      placeholder="Contact Number *"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      name="maritalStatus"
                      placeholder="Marital Status"
                      value={formData.maritalStatus}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="flex flex-col">
                      <label
                        htmlFor="dateOfBirth"
                        className="text-sm text-gray-500"
                      >
                        Date of Birth
                      </label>
                      <Input
                        name="dateOfBirth"
                        placeholder="Date of Birth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <Input
                      name="bloodType"
                      placeholder="Blood Type"
                      value={formData.bloodType}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      name="occupation"
                      placeholder="Occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      name="reference"
                      placeholder="Reference"
                      value={formData.reference}
                      onChange={handleInputChange}
                      required
                    />
                    {/* <div className="flex flex-col">
                      <label
                        htmlFor="dateOfVisit"
                        className="text-sm text-gray-500"
                      >
                        Date of Visit
                      </label>
                      <Input
                        name="dateOfVisit"
                        placeholder="Date of Visit"
                        type="date"
                        value={formData.dateOfVisit}
                        onChange={handleInputChange}
                        required
                      />
                    </div> */}
                  </div>
                  <Textarea
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                  <Textarea
                    name="primaryHealthConcern"
                    placeholder="Primary Health Concern *"
                    value={formData.primaryHealthConcern}
                    onChange={handleInputChange}
                    required
                    rows={3}
                  />
                  <Textarea
                    name="surgeriesOrInjuries"
                    placeholder="Surgeries Or Injuries *"
                    value={formData.surgeriesOrInjuries}
                    onChange={handleInputChange}
                    required
                    rows={3}
                  />
                  <Textarea
                    name="allergies"
                    placeholder="Allergies *"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    required
                    rows={3}
                  />

                  <Textarea
                    name="familyHistory"
                    placeholder="Family History *"
                    value={formData.familyHistory}
                    onChange={handleInputChange}
                    required
                    rows={3}
                  />
                  <h4 className="font-semibold text-amber-700 mt-4">
                    Your primary health concern and please specify how long you
                    have had this condition.
                  </h4>
                  <Textarea
                    name="chronicIllnesses"
                    placeholder="Chronic Illnesses"
                    value={formData.chronicIllnesses}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              {/* Step 2: Lifestyle */}
              {step === 2 && (
                <div className="space-y-4">
                  {Object.entries(LIFESTYLE_FIELDS).map(([key, config]) => (
                    <div key={key}>
                      <p className="font-semibold">
                        {key.replace(/([A-Z])/g, " $1")}
                      </p>

                      {config.options.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {config.options.map((opt) => (
                            <label
                              key={opt}
                              className="flex items-center space-x-1"
                            >
                              <Checkbox
                                checked={(lifestyle[key] || []).includes(opt)}
                                onCheckedChange={() => {
                                  const current = lifestyle[key] || [];
                                  setLifestyle({
                                    ...lifestyle,
                                    [key]: current.includes(opt)
                                      ? current.filter((i: string) => i !== opt)
                                      : [...current, opt],
                                  });
                                }}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {config.other && (
                        <Input
                          placeholder={`Other ${key}`}
                          value={lifestyle[`other_${key}`] || ""}
                          onChange={(e) =>
                            setLifestyle({
                              ...lifestyle,
                              [`other_${key}`]: e.target.value,
                            })
                          }
                          className="mb-2"
                        />
                      )}

                      {config?.frequency && (
                        <Input
                          placeholder="Frequency"
                          value={lifestyle[`frequency_${key}`] || ""}
                          onChange={(e) =>
                            setLifestyle({
                              ...lifestyle,
                              [`frequency_${key}`]: e.target.value,
                            })
                          }
                          className="mb-2"
                        />
                      )}

                      {config.wakeTime && (
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="Wake up time"
                            value={lifestyle[`wakeTime`]}
                            onChange={(e) =>
                              setLifestyle({
                                ...lifestyle,
                                wakeTime: e.target.value,
                              })
                            }
                          />
                          <Input
                            placeholder="Sleeping time"
                            value={lifestyle[`sleepTime`]}
                            onChange={(e) =>
                              setLifestyle({
                                ...lifestyle,
                                sleepTime: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}

                      {key === "waterIntake" && (
                        <>
                          <Input
                            placeholder="Water Intake (Liters)"
                            value={lifestyle.waterIntake}
                            onChange={(e) =>
                              setLifestyle({
                                ...lifestyle,
                                waterIntake: e.target.value,
                              })
                            }
                            className="mb-2"
                          />
                          <Input
                            placeholder="Other Water Intake"
                            value={lifestyle.otherWaterIntake || ""}
                            onChange={(e) =>
                              setLifestyle({
                                ...lifestyle,
                                otherWaterIntake: e.target.value,
                              })
                            }
                            className="mb-2"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3: Vitals */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Vitals & Anthropometric Measurements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {VITALS_FIELDS.map((v) => (
                      <div key={v.label} className="space-y-1">
                        <label className="font-medium text-sm">
                          {v.label} {v.unit && `(${v.unit})`}
                        </label>
                        <p className="text-xs text-gray-500">
                          Normal: {v.normal}
                        </p>
                        <Input
                          value={vitals[v.label] || ""}
                          onChange={(e) =>
                            handleVitalsChange(v.label, e.target.value)
                          }
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Payment */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Payment Method
                  </h3>

                  {qr?.imageUrl && (
                    <div className="p-3 rounded border bg-white">
                      <p className="text-sm mb-2">
                        Scan to pay (UPI: {qr?.upiId || "—"})
                      </p>
                      <img
                        src={qr.imageUrl}
                        alt="Payment QR"
                        className="max-w-[240px]"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-4">
                    <Button
                      onClick={() => {
                        setPaymentMethod("UPI");
                        setStep(5); // go straight to consent/signature
                      }}
                      className={`h-20 text-lg ${
                        paymentMethod === "UPI"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      💳 UPI/QR Payment
                    </Button>

                    <Button
                      onClick={() => {
                        setPaymentMethod("Cash");
                        setStep(5); // go straight to consent/signature
                      }}
                      className={`h-20 text-lg ${
                        paymentMethod === "Cash"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      💵 Cash Payment
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5: Consent */}
              {step === 5 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    Informed Consent Form
                  </h3>

                  {/* Consent Text */}
                  <div className="space-y-2 max-h-96 overflow-y-auto p-4 border rounded bg-gray-50 text-gray-800">
                    <p className="font-semibold">Treatment Details:</p>
                    <p>
                      The procedure may include Naturopathy treatments such as
                      dietary changes, fasting therapy, hydrotherapy, mud
                      therapy, yoga, pranayama, massage, colon hydrotherapy,
                      acupuncture, physiotherapy, chromotherapy, magneto
                      therapy, reflexology, and cupping therapy. It may also
                      involve Panchakarma procedures such as Shirodhara, Nasya
                      (Nasal Therapy), External Basti, Akshitarpan,
                      Raktamokshana (bloodletting, if needed), Abhyanga (oil
                      massage), and Swedana (steam therapy). These therapies
                      will be prescribed specifically based on your condition
                      and requirements.
                    </p>

                    <p className="font-semibold">Expected Benefits:</p>
                    <p>
                      These therapies aim to detoxify and cleanse the body,
                      rejuvenate the body and mind, improve digestion and
                      metabolism, increase energy and vitality, relieve stress,
                      enhance mental clarity, reduce pain and stiffness,
                      strengthen the immune system, and promote overall
                      well-being.
                    </p>

                    <p className="font-semibold">Risks and Limitations:</p>
                    <p>
                      I understand that possible risks include mild nausea,
                      dizziness, fatigue, headache, skin irritation, temporary
                      digestive changes, and emotional fluctuations. Unforeseen
                      complications may occur, which can include serious
                      conditions. The management reserves the right to transfer
                      me to an appropriate medical facility if required and will
                      not be held liable for any adverse reactions. I also
                      understand that results may vary depending on adherence to
                      protocol and advice given by the doctor and no guarantee
                      of success is provided.
                    </p>

                    <p className="font-semibold">Conditions & Policies:</p>
                    <p>
                      I have been informed that there will be no refund for the
                      treatment under any circumstances. The management reserves
                      the right to discontinue the treatment at any time if
                      necessary. I agree to follow all instructions given by the
                      doctor and their team to ensure the success of the
                      treatment.
                    </p>

                    <p className="font-semibold">Medical Information:</p>
                    <p>
                      I have shared my complete medical history, including
                      allergies, medications, and any pre-existing conditions. I
                      confirm that I do not have pregnancy, severe heart
                      disease, active infections, or unstable psychiatric
                      issues. I will inform the practitioner immediately if any
                      such condition exists or develops. I affirm that I have
                      read the basic rules and answered all the above questions
                      in absolute honesty. I hereby declare that the above
                      information is complete and an accurate record of my
                      current and past health condition to the best of my
                      knowledge, as on the undersigned date. I am aware of the
                      nature of treatments, therapies, facilities, activities
                      and services and that they are undertaken at my own risk
                      and complete responsibility.
                    </p>

                    <p className="font-semibold">Final Declaration:</p>
                    <p>
                      I have been given sufficient time to ask questions,
                      consider alternative options, and make an informed
                      decision. I understand that I can withdraw my consent at
                      any time. I am giving this consent voluntarily, without
                      any pressure or influence, after understanding all details
                      of the proposed treatments in a language which I
                      understand, to undergo Panchakarma and Naturopathy
                      treatments as a holistic wellness approach.
                    </p>
                  </div>

                  {/* Checkbox */}
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox
                      checked={consentGiven}
                      onCheckedChange={(c) => setConsentGiven(c === true)}
                    />
                    <span>
                      I have read and understood the consent form and give my
                      consent.
                    </span>
                  </div>

                  {/* Signature Canvas */}
                  {consentGiven && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-lg">
                        Patient Signature
                      </h3>
                      <SignatureStep onSaveSignature={handleSignatureSave} />
                    </div>
                  )}
                  {uploadingSignature && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Uploading signature…
                    </p>
                  )}

                  {/* Show thumbnail or link once uploaded */}
                  {signature && typeof signature === "string" && (
                    <div className="mt-3">
                      <p className="text-xs text-green-700">
                        Signature uploaded.
                      </p>
                      <img
                        src={signature}
                        alt="Signature"
                        className="border border-gray-300 h-20 mt-1"
                      />
                    </div>
                  )}
                  {/* API status */}
                  {(apiError || apiSuccess) && (
                    <div
                      className={`mt-3 text-sm rounded p-3 ${
                        apiError
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-green-50 text-green-700 border border-green-200"
                      }`}
                    >
                      {apiError || apiSuccess}
                    </div>
                  )}
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
                <div className="ml-auto">
                  {step < 5 && step !== 4 && (
                    <Button
                      onClick={handleNext}
                      className="bg-amber-600 hover:bg-amber-700"
                      disabled={submitting}
                    >
                      Next →
                    </Button>
                  )}
                  {step === 5 && (
                    <div className="flex flex-wrap gap-4 mt-4">
                      <Button
                        onClick={handlePrint}
                        className="bg-yellow-500 hover:bg-yellow-600"
                        disabled={submitting}
                      >
                        🖨 Print Form
                      </Button>

                      <Button
                        onClick={() => submitFinal()}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-60"
                        disabled={submitting || !consentGiven || !signature}
                      >
                        {submitting ? "Submitting…" : "➡ Forward to Doctor"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wood texture shadow effect */}
        <div className="absolute -bottom-2 left-4 right-4 h-4 bg-amber-900 rounded-b-lg opacity-30 blur-sm"></div>
      </div>
    </div>
  );
};

export default PatientRegistrationForm;
