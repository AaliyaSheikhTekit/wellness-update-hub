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

// Validation helper functions
const validators = {
  required: (value: any) => {
    if (typeof value === "string") return value.trim() !== "";
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && value !== "";
  },

  phone: (value: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(value.replace(/\s+/g, ""));
  },

  age: (value: string) => {
    const age = parseInt(value);
    return !isNaN(age) && age > 0 && age < 150;
  },

  bloodPressure: (value: string) => {
    const bpRegex = /^\d{2,3}[\s\/\-\:]\d{2,3}$/;
    return bpRegex.test(value.trim());
  },

  number: (value: any) => {
    if (value === null || value === undefined) return false;
    const str = String(value).trim();
    if (str === "") return false;
    const num = Number(str);
    return Number.isFinite(num) && num > 0; // ✅ pulse must be > 0
  },

  date: (value: string) => {
    if (!value) return false;
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  },
};

// Field validation rules
const FIELD_VALIDATIONS: Record<
  string,
  { required: boolean; validator?: (v: any) => boolean; label: string }
> = {
  name: { required: true, label: "Full Name" },
  age: { required: true, validator: validators.age, label: "Age" },
  sex: { required: true, label: "Sex" },
  fatherOrHusbandName: { required: true, label: "Father/Husband Name" },
  contactNumber: {
    required: true,
    validator: validators.phone,
    label: "Contact Number",
  },
  maritalStatus: { required: true, label: "Marital Status" },
  dateOfBirth: {
    required: true,
    validator: validators.date,
    label: "Date of Birth",
  },
  bloodType: { required: true, label: "Blood Type" },
  occupation: { required: true, label: "Occupation" },
  reference: { required: true, label: "Reference" },
  address: { required: true, label: "Address" },
  primaryHealthConcern: { required: true, label: "Primary Health Concern" },

  // Vitals
  "Blood Pressure": {
    required: true,
    validator: validators.bloodPressure,
    label: "Blood Pressure",
  },
  Pulse: { required: true, validator: validators.number, label: "Pulse" },


};

const VITALS_FIELDS = [
  {
    label: "Blood Pressure",
    unit: "mmHg",
    normal: "90-120/60-80",
    auto: false,
  },
  { label: "Pulse", unit: "Beat/min", normal: "60-100", auto: false },
  {
    label: "Weight",
    unit: "Kg",
    normal: "Varies by height (use BMI)",
    auto: false,
  },
  { label: "Height", unit: "Cm", normal: "-", auto: false },
  { label: "BMI", unit: "kg/m²", normal: "18.5–24.9", auto: true },
  { label: "Temperature", unit: "°F", normal: "98.6", auto: false },
  { label: "Pain Scale", unit: "", normal: "-", auto: false },
  {
    label: "Mid-Upper Arm Circumference",
    unit: "Cm",
    normal: "22–32 cm",
    auto: false,
  },
  {
    label: "Waist Circumference",
    unit: "Cm",
    normal: "Men < 94 cm, Women < 80 cm",
    auto: false,
  },
  { label: "Hip Circumference", unit: "Cm", normal: "-", auto: false },
  {
    label: "Waist-Hip Ratio (WHR)",
    unit: "-",
    normal: "Men < 0.90, Women < 0.85",
    auto: true,
  },
  {
    label: "Skinfold Thickness (Triceps)",
    unit: "Mm",
    normal: "Men: 6–13 mm, Women: 12–23 mm",
    auto: false,
  },
  {
    label: "Skinfold Thickness (Biceps)",
    unit: "Mm",
    normal: "Men: 4–12 mm, Women: 9–18 mm",
    auto: false,
  },
  {
    label: "Skinfold (Subscapular)",
    unit: "Mm",
    normal: "Men: 10–18 mm, Women: 12–25 mm",
    auto: false,
  },
  {
    label: "Skinfold (Suprailiac)",
    unit: "Mm",
    normal: "Men: 8–15 mm, Women: 11–22 mm",
    auto: false,
  },
  {
    label: "Body Fat %",
    unit: "%",
    normal: "Men: 10–20%, Women: 18–28%",
    auto: true,
  },
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
  bowelMovements: {
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
    options: ["Smoking", "Alcohol", "Tobacco", "Tea", "Coffee", "none"],
    other: true,
  },
  physicalActivity: {
    options: ["Sedentary", "Active", "Walking", "Yoga", "Exercise"],
    other: true,
  },
  waterIntake: {
    options: [
      "Low - Less than 1.5 ltr",
      "Normal - 1.5 to 3 ltr",
      "Excess - Above 3.5 ltr",
    ], other: true
  },
  stress: { options: ["Low", "Moderate", "High"], other: false },
  mentalState: {
    options: ["Calm", "Anxious", "Irritable", "Unhappy"],
    other: false,
  },
};

const PatientRegistrationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [showPrint, setShowPrint] = useState(false);
  const printRef = useRef<HTMLDivElement | null>(null);
  const [cashAmount, setCashAmount] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [lifestyle, setLifestyle] = useState<Record<string, any>>({
    diet: [],                 // ✅ because UI uses checkbox array
    appetite: [],
    taste: [],
    bowelMovements: [],       // ✅ FIXED (was bowelmovements)
    sleep: [],
    addictions: [],
    physicalActivity: [],
    waterIntake: [],

    stress: [],
    mentalState: [],

    wakeTime: "",
    sleepTime: "",

    otherDiet: "",
    otherAddictions: "",
    otherBowelMovements: "",
    otherSleep: "",
    otherPhysicalActivity: "",
    otherWaterIntake: "",

    frequency_bowelMovements: "", // ✅ because UI uses `frequency_${key}`
  });


  const [formData, setFormData] = useState<Record<string, any>>({
    name: "",
    age: "",
    sex: "",
    fatherOrHusbandName: "",
    address: "",
    contactNumber: "",
    maritalStatus: "",
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
  const [language, setLanguage] = useState("en");
  const [vitals, setVitals] = useState<Record<string, any>>({});
  // const [consentGiven, setConsentGiven] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  // const [signature, setSignature] = useState("");
  // const [uploadingSignature, setUploadingSignature] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [qr, setQr] = useState<{
    imageUrl?: string;
    upiId?: string;
    id?: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  // Auto-calculate vitals
  useEffect(() => {
    const newVitals = { ...vitals };
    let updated = false;

    // BMI
    const weight = parseFloat(vitals["Weight"]);
    const heightCm = parseFloat(vitals["Height"]);
    if (weight && heightCm) {
      const heightM = heightCm / 100;
      const bmi = (weight / (heightM * heightM)).toFixed(2);
      if (newVitals["BMI"] !== bmi) {
        newVitals["BMI"] = bmi;
        updated = true;
      }
    }

    // WHR
    const waist = parseFloat(vitals["Waist Circumference"]);
    const hip = parseFloat(vitals["Hip Circumference"]);
    if (waist && hip) {
      const whr = (waist / hip).toFixed(2);
      if (newVitals["Waist-Hip Ratio (WHR)"] !== whr) {
        newVitals["Waist-Hip Ratio (WHR)"] = whr;
        updated = true;
      }
    }

    // Body Fat %
    const triceps = parseFloat(vitals["Skinfold Thickness (Triceps)"]);
    const biceps = parseFloat(vitals["Skinfold Thickness (Biceps)"]);
    const subscapular = parseFloat(vitals["Skinfold (Subscapular)"]);
    const suprailiac = parseFloat(vitals["Skinfold (Suprailiac)"]);

    if (triceps && biceps && subscapular && suprailiac) {
      const sumOfSkinfolds = triceps + biceps + subscapular + suprailiac;
      const logSum = Math.log10(sumOfSkinfolds);
      const gender = formData.sex?.toLowerCase() || "male";
      let bodyDensity: number;
      if (gender === "male") {
        bodyDensity = 1.1765 - 0.0744 * logSum;
      } else {
        bodyDensity = 1.1567 - 0.0717 * logSum;
      }
      const bodyFat = (4.95 / bodyDensity - 4.5) * 100;
      const bodyFatStr = bodyFat.toFixed(1);
      if (newVitals["Body Fat %"] !== bodyFatStr) {
        newVitals["Body Fat %"] = bodyFatStr;
        updated = true;
      }
    }

    if (updated) {
      setVitals(newVitals);
    }
  }, [
    vitals["Weight"],
    vitals["Height"],
    vitals["Waist Circumference"],
    vitals["Hip Circumference"],
    vitals["Skinfold Thickness (Triceps)"],
    vitals["Skinfold Thickness (Biceps)"],
    vitals["Skinfold (Subscapular)"],
    vitals["Skinfold (Suprailiac)"],
    formData.sex,
  ]);

  // Validate single field
  const validateField = (fieldName: string, value: any): string => {
    const validation = FIELD_VALIDATIONS[fieldName];
    if (!validation) return "";

    if (validation.required && !validators.required(value)) {
      return `${validation.label} is required`;
    }

    if (validation.validator && !validation.validator(value)) {
      switch (fieldName) {
        case "contactNumber":
          return "Please enter a valid 10-digit phone number starting with 6-9";
        case "age":
          return "Please enter a valid age (1-150)";
        case "Blood Pressure":
          return "Format: 120/80 or 120-80 or 120 80";

        case "Temperature":
          return "Please enter a valid positive number";
        case "dateOfBirth":
          return "Please enter a valid date";
        default:
          return `Invalid ${validation.label}`;
      }
    }

    return "";
  };

  // Validate current step
  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {};
    let fieldsToValidate: string[] = [];

    switch (stepNum) {
      case 1:
        fieldsToValidate = [
          "name",
          "age",
          "sex",
          "fatherOrHusbandName",
          "contactNumber",
          "maritalStatus",
          "dateOfBirth",
          "bloodType",
          "occupation",
          "reference",
          "address",
          "primaryHealthConcern",
        ];
        fieldsToValidate.forEach((field) => {
          const error = validateField(field, formData[field]);
          if (error) newErrors[field] = error;
        });
        break;

      case 3:
        const requiredVitals = [
          "Blood Pressure",
          "Pulse",

        ];
        requiredVitals.forEach((field) => {
          const error = validateField(field, vitals[field]);
          if (error) newErrors[field] = error;
        });
        break;

      // case 5:
      //   if (!consentGiven) {
      //     newErrors["consent"] = "You must give consent to proceed";
      //   }
      //   if (!signature) {
      //     newErrors["signature"] = "Signature is required";
      //   }
      //   break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field blur for real-time validation
  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    const isVital = VITALS_FIELDS.some((v) => v.label === fieldName);
    const value = isVital ? vitals[fieldName] : formData[fieldName];

    const error = validateField(fieldName, value);

    setErrors((prev) => {
      const next = { ...prev };
      if (error) next[fieldName] = error;
      else delete next[fieldName];
      return next;
    });
  };


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error on change
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleVitalsChange = (field: string, value: any) => {
    setVitals({ ...vitals, [field]: value });

    // Clear error on change
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };



  const toISODate = (d: string) =>
    d ? new Date(d).toISOString().slice(0, 10) : "";
  const toNumberOrNull = (value: any) =>
    value !== undefined && value !== "" ? Number(value) : null;
  const toStringOrNull = (value: any) =>
    value !== undefined && value !== null ? String(value) : "";


  const buildUpdatePayload = (opts: { includeConsent?: boolean } = {}) => {
    return {
      fullName: toStringOrNull(formData.name),
      age: toNumberOrNull(formData.age),
      sex: toStringOrNull(formData.sex),
      fatherHusbandName: toStringOrNull(formData.fatherOrHusbandName),
      contactNumber: toStringOrNull(formData.contactNumber),
      maritalStatus: toStringOrNull(formData.maritalStatus),
      dateOfBirth:
        typeof formData.dateOfBirth === "string"
          ? formData.dateOfBirth
          : new Date(formData.dateOfBirth).toISOString().split("T")[0],

      bloodType: toStringOrNull(formData.bloodType),
      occupation: toStringOrNull(formData.occupation),
      reference: toStringOrNull(formData.reference),
      address: toStringOrNull(formData.address),
      primaryHealthConcern: toStringOrNull(formData.primaryHealthConcern),
      chronicIllnesses: toStringOrNull(formData.chronicIllnesses),
      surgeriesOrInjuries: toStringOrNull(formData.surgeriesOrInjuries),
      allergies: toStringOrNull(formData.allergies),
      familyHistory: formData.familyHistory,
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
      diet: (lifestyle.otherDiet || "").trim()
        ? lifestyle.otherDiet
        : Array.isArray(lifestyle.diet)
          ? (lifestyle.diet[0] || "")
          : String(lifestyle.diet || ""),

      otherDiet: toStringOrNull(lifestyle.otherDiet),

      appetite: Array.isArray(lifestyle.appetite) && lifestyle.appetite.length
        ? lifestyle.appetite[0]
        : null,

      taste: Array.isArray(lifestyle.taste) && lifestyle.taste.length
        ? lifestyle.taste[0]
        : null,

      bowel: Array.isArray(lifestyle.bowelMovements)
        ? lifestyle.bowelMovements.join(", ")
        : String(lifestyle.bowelMovements || ""),

      otherBowel: toStringOrNull(lifestyle.otherBowelMovements),

      bowelFrequency: toStringOrNull(lifestyle.frequency_bowelMovements),

      sleep: Array.isArray(lifestyle.sleep) && lifestyle.sleep.length
        ? lifestyle.sleep[0]
        : null,

      sleepWakeUpTime: toStringOrNull(lifestyle.wakeTime),
      sleepTime: toStringOrNull(lifestyle.sleepTime),

      addictions: Array.isArray(lifestyle.addictions) ? lifestyle.addictions : [],
      otherAddictions: toStringOrNull(lifestyle.otherAddictions),

      physicalActivity: Array.isArray(lifestyle.physicalActivity)
        ? lifestyle.physicalActivity
        : [],
      otherPhysicalActivity: toStringOrNull(lifestyle.otherPhysicalActivity),

      waterIntakeLiters: toNumberOrNull(lifestyle.waterIntake),
      otherWaterIntake: toStringOrNull(lifestyle.otherWaterIntake),

      stress: Array.isArray(lifestyle.stress) && lifestyle.stress.length
        ? lifestyle.stress[0]
        : null,

      mentalState: Array.isArray(lifestyle.mentalState) && lifestyle.mentalState.length
        ? lifestyle.mentalState[0]
        : null,
      // signature: toStringOrNull(signature),
      // consent: opts.includeConsent ? !!consentGiven : null,
      paymentMethod: toStringOrNull(paymentMethod),
      upiId: qr?.upiId ? toStringOrNull(qr.upiId) : null,
      qrId: qr?.id ? qr.id : "",
    };
  };

  const normalizeBloodPressure = (value: string): string | null => {
    if (!value) return null;
    const compact = String(value).trim().replace(/\s+/g, "");
    const m = compact.match(/^(\d{2,3})[\/\-\:](\d{2,3})$/);
    if (m) return `${m[1]}/${m[2]}`;
    const nums = String(value).match(/\d{2,3}/g);
    if (nums && nums.length >= 2) return `${nums[0]}/${nums[1]}`;
    return null;
  };

  const isBloodPressureInPlausibleRange = (bp: string): boolean => {
    const m = bp.match(/^(\d{2,3})\/(\d{2,3})$/);
    if (!m) return false;
    const sys = parseInt(m[1], 10);
    const dia = parseInt(m[2], 10);
    return sys >= 70 && sys <= 250 && dia >= 40 && dia <= 150 && sys > dia;
  };

  const handleNext = async () => {
    if (!validateStep(step)) {
      if (step === 1) markTouched(STEP1_FIELDS);
      if (step === 3) markTouched(["Pulse", "weight", "height"]); // optional
      if (step === 3) {
        const w = vitals["Weight"];
        const h = vitals["Height"];

        // if user enters one, force the other
        if ((w && !h) || (!w && h)) {
          setErrors((prev) => ({
            ...prev,
            Weight: !w ? "Weight is required for BMI" : prev.Weight,
            Height: !h ? "Height is required for BMI" : prev.Height,
          }));
          return;
        }
      }

      setApiError("Please fix the errors before proceeding");
      return;
    }

    try {
      setApiError("");

      if (step === 1) {
        setSubmitting(true);
        await updatePatient(id, buildUpdatePayload({ includeConsent: false }));
        setSubmitting(false);

        setPatientId(id);
        setApiSuccess("Patient created.");
      }

      if (step === 3) {
        try {
          const qrRes = await getPaymentQr();
          console.log(qrRes)
          const raw = qrRes?.data?.qrCodeUrl || "";

          // keep the last https://... part (works even if backend concatenates)
          const fixedQrUrl = raw.includes("https://")
            ? "https://" + raw.split("https://").pop()
            : raw;
          setQr({
            imageUrl: fixedQrUrl || fixedQrUrl,
            upiId: qrRes?.data?.upi || qrRes?.upi,
            id: qrRes?.data?.id || qrRes?.id,
          });
        } catch (e) {
          console.error(e);
        }
      }

      if (step === 4 && id) {
        setSubmitting(true);
        await updatePatient(id, buildUpdatePayload({ includeConsent: false }));
        setSubmitting(false);
      }
      if (step === 4) {
        await submitFinal();
        return;
      }
      setStep(step + 1);
    } catch (err: any) {
      console.error(err);
      setSubmitting(false);
      setApiError(err?.message || "Something went wrong.");
    }
  };
  const STEP1_FIELDS = [
    "name",
    "age",
    "sex",
    "fatherOrHusbandName",
    "contactNumber",
    "maritalStatus",
    "dateOfBirth",
    "bloodType",
    "occupation",
    "reference",
    "address",
    "primaryHealthConcern",
  ];

  const markTouched = (fields: string[]) => {
    setTouched((prev) => {
      const next = { ...prev };
      fields.forEach((f) => (next[f] = true));
      return next;
    });
  };

  const dataUrlToFile = async (
    dataUrl: string,
    fileName = "signature.jpg"
  ): Promise<File> => {
    const blob = await (await fetch(dataUrl)).blob();
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



  const submitFinal = async () => {
    if (!patientId)
      return setApiError("No patient id. Please complete Step 1 again.");
    // if (!consentGiven) return setApiError("Consent is required.");

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

    // const sigToSend = signatureOverride ?? signature;
    // if (!sigToSend)
    //   return setApiError("Signature is required. Please sign first.");

    setSubmitting(true);
    setApiError("");
    setApiSuccess("");
    try {
      const payload = buildUpdatePayload({ includeConsent: true });
      payload.bloodPressure = normalizedBP;
      // payload.signature = sigToSend;

      await updatePatient(id, payload);
      // setSignature(sigToSend);
      setApiSuccess("Patient updated & forwarded successfully.");
      navigate(`/patient/${id}`);
    } catch (err: any) {
      setApiError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const mapPatientToFormState = (p: any) => ({
    name: p.fullName || "",
    age: p.age ?? "",
    sex: p.sex || "",
    fatherOrHusbandName: p.fatherHusbandName || p.fatherOrHusbandName || "",
    address: p.address || "",
    contactNumber: p.contactNumber || "",
    maritalStatus: p.maritalStatus || "",
    dateOfBirth: p.dateOfBirth || "",
    bloodType: p.bloodType || "",
    occupation: p.occupation || "",
    reference: p.reference || "",
    primaryHealthConcern: p.primaryHealthConcern || "",
    chronicIllnesses: p.chronicIllnesses || "",
    surgeriesOrInjuries: p.surgeriesOrInjuries || "",
    allergies: p.allergies || "",
    familyHistory: p.familyHistory || "",
  });


  const mapPatientToVitals = (p: any) => ({
    "Blood Pressure": p.bloodPressure || "",
    Pulse: p.pulse ?? "",
    Weight: p.weightKg ?? "",
    Height: p.heightCm ?? "",
    BMI: p.bmi ?? "",
    Temperature: p.temperatureF ?? "",
  });

  const mapPatientToLifestyle = (p: any) => ({
    diet: p.diet || "",
    appetite: p.appetite ? p.appetite.split(",") : [],
    taste: p.taste ? p.taste.split(",") : [],
    bowelmovements: p.bowelmovements ? p.bowelmovements.split(",") : [],
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
        setFormData(mapPatientToFormState(data[0]));
        setLifestyle(mapPatientToLifestyle(data[0]));
        setVitals(mapPatientToVitals(data[0]));
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [id]);


  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto relative">
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-12 bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-lg shadow-xl z-10">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-6 bg-gray-600 rounded shadow-inner"></div>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-amber-100 to-amber-200 shadow-2xl border-8 border-amber-800 rounded-lg overflow-hidden">
          <CardContent className="p-4 md:p-8">
            <div className="bg-white rounded shadow-inner p-6 md:p-8">
              <div className="text-center mb-6 border-b-4 border-amber-600 pb-4 flex flex-col items-center">
                <div className="mb-6 h-12 flex items-center">
                  <img
                    src={IkshaLogo}
                    alt="Iksha Naturopathy Logo"
                    className="h-36 w-auto object-contain"
                  />
                </div>
                <p className="text-gray-600 text-sm">
                  Connect • Consult • Cure
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  📞 +91 9343922950 | 📧 admin@ikshanaturopathy.com
                </p>
              </div>

              <div className="relative mb-12">
                <div
                  className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full"
                  style={{ left: "20px", right: "20px" }}
                ></div>
                <div
                  className="absolute top-5 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
                  style={{
                    left: "20px",
                    width: `calc(${((step - 1) / 4) * 100}% - ${step === 1 ? 20 : 0
                      }px)`,
                  }}
                ></div>

                <div className="relative flex justify-between">
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex flex-col items-center">
                      <button
                        onClick={() => setStep(s)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 transform hover:scale-110 ${step >= s
                          ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/50"
                          : "bg-white border-2 border-gray-300 text-gray-400 hover:border-amber-400"
                          } ${step === s ? "ring-4 ring-amber-200 scale-110" : ""
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
                        className={`mt-3 text-xs font-medium transition-colors duration-300 text-center ${step >= s ? "text-amber-600" : "text-gray-400"
                          }`}
                      >
                        {s === 1 && "Patient Info"}
                        {s === 2 && "Lifestyle"}
                        {s === 3 && "Vitals"}
                        {s === 4 && "Payment"}

                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1: Patient Info with Validation */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Patient Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        name="name"
                        placeholder="Full Name *"
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("name")}
                        className={
                          errors.name && touched.name ? "border-red-500" : ""
                        }
                      />
                      {errors.name && touched.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        name="age"
                        placeholder="Age *"
                        value={formData.age}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("age")}
                        className={
                          errors.age && touched.age ? "border-red-500" : ""
                        }
                      />
                      {errors.age && touched.age && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.age}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        name="sex"
                        placeholder="Sex *"
                        value={formData.sex}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("sex")}
                        className={
                          errors.sex && touched.sex ? "border-red-500" : ""
                        }
                      />
                      {errors.sex && touched.sex && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.sex}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        name="fatherOrHusbandName"
                        placeholder="Father/Husband Name *"
                        value={formData.fatherOrHusbandName}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("fatherOrHusbandName")}
                        className={
                          errors.fatherOrHusbandName &&
                            touched.fatherOrHusbandName
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors.fatherOrHusbandName &&
                        touched.fatherOrHusbandName && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.fatherOrHusbandName}
                          </p>
                        )}
                    </div>

                    <div>
                      <Input
                        name="contactNumber"
                        placeholder="Contact Number *"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("contactNumber")}
                        className={
                          errors.contactNumber && touched.contactNumber
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors.contactNumber && touched.contactNumber && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.contactNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        name="maritalStatus"
                        placeholder="Marital Status *"
                        value={formData.maritalStatus}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("maritalStatus")}
                        className={
                          errors.maritalStatus && touched.maritalStatus
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors.maritalStatus && touched.maritalStatus && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.maritalStatus}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label
                        htmlFor="dateOfBirth"
                        className="text-sm text-gray-500"
                      >
                        Date of Birth *
                      </label>
                      <Input
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("dateOfBirth")}
                        className={
                          errors.dateOfBirth && touched.dateOfBirth
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors.dateOfBirth && touched.dateOfBirth && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.dateOfBirth}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        name="bloodType"
                        placeholder="Blood Type *"
                        value={formData.bloodType}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("bloodType")}
                        className={
                          errors.bloodType && touched.bloodType
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors.bloodType && touched.bloodType && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.bloodType}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        name="occupation"
                        placeholder="Occupation *"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("occupation")}
                        className={
                          errors.occupation && touched.occupation
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors.occupation && touched.occupation && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.occupation}
                        </p>
                      )}
                    </div>

                    <div>
                      <Input
                        name="reference"
                        placeholder="Reference *"
                        value={formData.reference}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("reference")}
                        className={
                          errors.reference && touched.reference
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors.reference && touched.reference && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.reference}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Textarea
                      name="address"
                      placeholder="Address *"
                      value={formData.address}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur("address")}
                      className={
                        errors.address && touched.address
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {errors.address && touched.address && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div>

                    <h4 className="font-semibold text-amber-700 mt-4">
                      Your primary health concern and please specify how long you
                      have had this condition.
                    </h4>
                    <Textarea
                      name="primaryHealthConcern"
                      placeholder="Primary Health Concern *"
                      value={formData.primaryHealthConcern}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur("primaryHealthConcern")}
                      rows={3}
                      className={
                        errors.primaryHealthConcern &&
                          touched.primaryHealthConcern
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {errors.primaryHealthConcern &&
                      touched.primaryHealthConcern && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.primaryHealthConcern}
                        </p>
                      )}
                  </div>

                  <Textarea
                    name="surgeriesOrInjuries"
                    placeholder="Surgeries or Injuries"
                    value={formData.surgeriesOrInjuries}
                    onChange={handleInputChange}
                    rows={3}
                  />
                  <Textarea
                    name="allergies"
                    placeholder="Allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    rows={3}
                  />
                  <Textarea
                    name="familyHistory"
                    placeholder="Family History"
                    value={formData.familyHistory}
                    onChange={handleInputChange}
                    rows={3}
                  />

                  <Textarea
                    name="chronicIllnesses"
                    placeholder="Any Other Concern"
                    value={formData.chronicIllnesses}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              {/* Step 2: Lifestyle */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Lifestyle Information
                  </h3>
                  {Object.entries(LIFESTYLE_FIELDS).map(([key, config]) => (
                    <div key={key}>
                      <p className="font-semibold capitalize">
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
                          value={
                            key === "diet"
                              ? lifestyle.otherDiet || ""
                              : key === "addictions"
                                ? lifestyle.otherAddictions || ""
                                : key === "bowelMovements"
                                  ? lifestyle.otherBowelMovements || ""
                                  : key === "physicalActivity"
                                    ? lifestyle.otherPhysicalActivity || ""
                                    : ""
                          }
                          onChange={(e) => {
                            const v = e.target.value;
                            setLifestyle((prev) => ({
                              ...prev,
                              ...(key === "diet" ? { otherDiet: v } : {}),
                              ...(key === "addictions" ? { otherAddictions: v } : {}),
                              ...(key === "bowelMovements" ? { otherBowelMovements: v } : {}),
                              ...(key === "physicalActivity" ? { otherPhysicalActivity: v } : {}),
                            }));
                          }}
                          className="mb-2"
                        />
                      )}

                      {config.frequency && (
                        <Input
                          placeholder="Frequency"
                          value={lifestyle.frequency_bowelMovements || ""}
                          onChange={(e) =>
                            setLifestyle((prev) => ({
                              ...prev,
                              frequency_bowelMovements: e.target.value,
                            }))
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
                            value={Array.isArray(lifestyle.waterIntake) ? "" : lifestyle.waterIntake}
                            onChange={(e) =>
                              setLifestyle({
                                ...lifestyle,
                                waterIntake: e.target.value,
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
              {/* Step 3: Vitals with Validation & Auto-calculation */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Vitals & Anthropometric Measurements
                  </h3>

                  {/* Helper text */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm mb-4">
                    <p className="font-semibold text-blue-800 mb-2">
                      📊 Auto-Calculations:
                    </p>
                    <ul className="space-y-1 text-blue-700 text-xs">
                      <li>
                        • <strong>BMI</strong> = Weight (kg) ÷ Height² (m²)
                      </li>
                      <li>
                        • <strong>WHR</strong> = Waist ÷ Hip circumference
                      </li>
                      <li>
                        • <strong>Body Fat %</strong> = Calculated from 4-site
                        skinfold measurements
                      </li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {VITALS_FIELDS.map((v) => {
                      const isAuto = v.auto;
                      return (
                        <div key={v.label} className="space-y-1">
                          <label className="font-medium text-sm flex items-center gap-2">
                            {v.label} {v.unit && `(${v.unit})`}
                            {isAuto && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                Auto
                              </span>
                            )}
                          </label>
                          <p className="text-xs text-gray-500">
                            Normal: {v.normal}
                          </p>
                          <Input
                            value={vitals[v.label] || ""}
                            onChange={(e) =>
                              handleVitalsChange(v.label, e.target.value)
                            }
                            onBlur={() => handleBlur(v.label)}
                            disabled={isAuto}
                            placeholder={
                              isAuto ? "Auto-calculated" : "Enter value"
                            }
                            className={`${errors[v.label]
                              ? "border-red-500"
                              : ""
                              } ${isAuto ? "bg-gray-50 cursor-not-allowed" : ""}`}
                          />
                          {errors[v.label] &&
                            !["BMI", "Temperature", "Weight", "Height"].includes(v.label) && (
                              <p className="text-red-500 text-xs mt-1">{errors[v.label]}</p>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Step 4: Payment */}
              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="font-bold text-2xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Select Payment Method
                  </h3>

                  {/* UPI/QR Payment Option */}
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-amber-400 transition-all">
                    <button
                      onClick={() => {
                        setPaymentMethod("UPI");
                        // setStep(5);
                      }}
                      className="w-full p-6 bg-white hover:bg-amber-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-4xl">💳</div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-800">
                            UPI/QR Payment
                          </h4>
                          <p className="text-sm text-gray-600">
                            Scan & pay using any UPI app
                          </p>
                        </div>
                      </div>

                      {qr?.imageUrl && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-600 mb-3 font-medium">
                            Scan QR Code • UPI ID: eanaturopathyindia@oksbi
                          </p>
                          <div className="flex justify-center">
                            <img
                              src={qr.imageUrl}
                              alt="Payment QR"
                              className="max-w-[200px] border-4 border-white shadow-md rounded"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-3 text-center">
                            Google Pay • PhonePe • Paytm • Any UPI App
                          </p>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Cash Payment Option */}
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-amber-400 transition-all">
                    <div className="w-full p-6 bg-white hover:bg-amber-50 transition-colors text-left">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">💵</div>
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-gray-800">Cash Payment</h4>
                          <p className="text-sm text-gray-600">Pay with cash at the counter</p>

                          {/* ✅ Amount input */}
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Amount to be paid
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={cashAmount}
                              onChange={(e) => setCashAmount(e.target.value)}
                              className="w-full border rounded-md px-3 py-2 text-sm"
                              placeholder="Enter amount"
                            />
                          </div>
                        </div>
                      </div>

                      {/* ✅ Action button */}
                      <button
                        type="button"
                        disabled={!Number(cashAmount) || Number(cashAmount) <= 0}
                        onClick={() => {
                          setPaymentMethod("Cash");

                          navigate("/dashboard", {
                            state: {
                              openTab: "invoices",
                              invoicePayload: {
                                from: "patient-registration",
                                patientId: id,
                                patientName: formData.name,
                                patientPhone: formData.contactNumber,
                                invoiceType: "consultancy",
                                paymentMethod: "Cash",
                                amount: Number(cashAmount), // ✅ send amount
                              },
                            },
                          });
                        }}
                        className={`mt-4 w-full px-4 py-3 rounded-md text-white font-semibold transition ${!Number(cashAmount) || Number(cashAmount) <= 0
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-amber-500 hover:bg-amber-600"
                          }`}
                      >
                        Continue with Cash
                      </button>
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
                  {step !== 4 ? (
                    <Button
                      onClick={handleNext}
                      className="bg-amber-600 hover:bg-amber-700"
                      disabled={submitting}
                    >
                      {submitting ? "Processing..." : "Next →"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext} // this will run your step === 4 updatePatient
                      className="bg-green-600 hover:bg-green-700"
                      disabled={submitting || !paymentMethod}
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="absolute -bottom-2 left-4 right-4 h-4 bg-amber-900 rounded-b-lg opacity-30 blur-sm"></div>
      </div>
    </div>
  );
};

export default PatientRegistrationForm;
