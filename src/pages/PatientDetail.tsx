import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import IkshaLogo from "../assets/iksha_logo.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Activity,
  Heart,
  Droplet,
  Ruler,
  Weight,
  Thermometer,
  Target,
  Utensils,
  Moon,
  Brain,
  Dumbbell,
  AlertTriangle,
  AlertCircle,
  Stethoscope,
  Download,
  Loader2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Calendar,
  Pill,
  Phone,
  User,
  Clock,
  Send,
} from "lucide-react";
import { Scissors, Users, FileText } from "lucide-react";

import {
  generatePDF,
  getMedicines,
  getPatient,
  postData,
  updatePatient,
} from "@/lib/api"; // <-- uses your Bearer token internally
import PrescriptionPrint from "@/components/PrescriptionPrint";
import { useReactToPrint } from "react-to-print";
import DietChartView from "@/components/Dietician/DietChartView";
import ConsultationHistory from "@/components/ConsultationHistory";
import TreatmentSchedulerOneFile from "@/components/TreatmentPlanView";
import PrescriptionDialog from "./Prescriptions";

type ServerPatient = {
  id: string;
  fullName: string;
  age?: number | string;
  sex?: string;
  fatherHusbandName?: string;
  contactNumber?: string;
  maritalStatus?: string;
  dateOfBirth?: string;
  bloodType?: string;
  occupation?: string;
  reference?: string | null;
  formDate?: string; // registration date from API
  address?: string;
  primaryHealthConcern?: string;
  chronicIllnesses?: string;
  surgeriesOrInjuries?: string | null;
  allergies?: string | null;
  familyHistory?: string | null;
  signature?: string | null;

  // Vitals & Anthropometrics
  bloodPressure?: string | null;
  pulse?: number | null;
  weightKg?: number | null;
  heightCm?: number | null;
  bmi?: number | null;
  temperatureF?: number | null;
  painScale?: string;
  midUpperArmCircumferenceCm?: number;
  waistCircumferenceCm?: number;
  hipCircumferenceCm?: number;
  whr?: number;
  skinfoldTricepsMm?: number;
  skinfoldBicepsMm?: number;
  skinfoldSubscapularMm?: number;
  skinfoldSuprailiacMm?: number;
  bodyFatPercent?: number;

  // Diet & Lifestyle
  diet?: string;
  otherDiet?: string;
  appetite?: string;
  taste?: string;
  bowel?: string;
  otherBowel?: string;
  bowelFrequency?: string;
  sleep?: string;
  sleepTime?: string;
  sleepWakeUpTime?: string;
  addictions?: string[];
  otherAddictions?: string;
  physicalActivity?: string[];
  otherPhysicalActivity?: string;
  waterIntakeLiters?: number;
  otherWaterIntake?: string;
  stress?: string;
  mentalState?: string;

  consent?: boolean;
  paymentMethod?: "UPI" | "Cash" | string;

  createdAt?: string;
  updatedAt?: string;

  qrPayments?: any;
  upiPayments?: {
    id: string;
    upiId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  } | null;

  appointment?: Array<{
    id?: string;
    paymentMethod?: "CASH" | "QR" | string;
    date: string; // ISO
    status?: string; // pending/confirmed
    consultationType?: string;
    consultation: any[];
    consent?: boolean;
    note?: string;
    signature?: string | null;
    createdAt?: string;
    updatedAt?: string;
    prescriptions?: {
      id?: string;
      duration?: string;
      instructions?: string;
      quantity?: number;
      medicine?: { name?: string };
    }[];
  }>;

  treatmentPlan?: any[]; // Add this line to match the Patient type in TreatmentPlanView
};

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString() : "—";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // --- Hooks must come first ---
  const [patient, setPatient] = useState<ServerPatient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>("");

  const printRef = useRef<HTMLDivElement>(null);

  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(
    null
  );
  console.log("Selected Appointment for Prescription:", selectedAppointment);
  const [pdfReadyAppointmentId, setPdfReadyAppointmentId] = useState<
    string | null
  >(null);

  const initials = useMemo(() => {
    const name = patient?.fullName || "";
    return (
      name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "PT"
    );
  }, [patient]);

  // --- Effects ---
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!id) return;
      setLoading(true);
      setErr("");
      try {
        const res = await getPatient(id);
        const p: ServerPatient = Array.isArray(res?.data)
          ? res.data[0]
          : res?.data || res;
        if (mounted) setPatient(p || null);
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Failed to fetch patient.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [id]);

  // ---- Safe state + helpers at top of component ----
  const appointments = useMemo(
    () => (patient?.appointment ?? []) as Array<any>,
    [patient?.appointment]
  );

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort(
        (a, b) =>
          new Date(b.date || b.createdAt).getTime() -
          new Date(a.date || a.createdAt).getTime()
      ),
    [appointments]
  );

  // activeAppointment starts as null; we set it from sortedAppointments later
  const [activeAppointment, setActiveAppointment] = useState<any | null>(null);

  // Whenever patient/appointments change, pick the most recent by default.
  // If the current active appointment still exists in the new list, keep it.
  useEffect(() => {
    if (sortedAppointments.length === 0) {
      setActiveAppointment(null);
      return;
    }
    setActiveAppointment((prev) =>
      prev && sortedAppointments.some((a) => a.id === prev.id)
        ? prev
        : sortedAppointments[0]
    );
  }, [sortedAppointments]);

  // Optional tiny helper
  const fmtDate = (v?: string) =>
    v
      ? new Date(v).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";
  // Consultations derived from the selected appointment
  const consultations = useMemo(
    () => (activeAppointment?.consultation ?? []) as Array<any>,
    [activeAppointment]
  );

  const sortedConsultations = useMemo(
    () =>
      [...consultations].sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
      ),
    [consultations]
  );

  // tiny date helper you can reuse
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    bloodPressure: "",
    pulse: "",
    temperatureF: "",
    weightKg: "",
    heightCm: "",
    bmi: "",
  });
  // --- Latest appointment (by date/createdAt) ---
  const latestAppointment = useMemo(() => {
    const list = patient?.appointment ?? [];
    if (!Array.isArray(list) || list.length === 0) return null;
    return [...list].sort(
      (a, b) =>
        new Date(b?.date || b?.createdAt || 0).getTime() -
        new Date(a?.date || a?.createdAt || 0).getTime()
    )[0];
  }, [patient]);

  // --- Latest consultation (inside the latest appointment) ---
  const latestConsultation = useMemo(() => {
    const cons = latestAppointment?.consultation ?? [];
    if (!Array.isArray(cons) || cons.length === 0) return null;
    return [...cons].sort(
      (a, b) =>
        new Date(b?.createdAt || b?.date || 0).getTime() -
        new Date(a?.createdAt || a?.date || 0).getTime()
    )[0];
  }, [latestAppointment]);

  // Convenience values: prefer latestConsultation.* -> fallback to patient.*
  const vPrimaryHealthConcern =
    latestConsultation?.primaryHealthConcern ?? patient?.primaryHealthConcern;

  const vChronicIllnesses =
    latestConsultation?.chronicIllnesses ?? patient?.chronicIllnesses;

  const vSurgeriesOrInjuries =
    latestConsultation?.surgeriesOrInjuries ?? patient?.surgeriesOrInjuries;

  const vAllergies = latestConsultation?.allergies ?? patient?.allergies;

  const vFamilyHistory =
    latestConsultation?.familyHistory ?? patient?.familyHistory;

  // badges / alerts should use the *merged* values
  const hasCriticalInfo = !!vAllergies && String(vAllergies).trim().length > 0;
  const hasChronicIllness =
    !!vChronicIllnesses && String(vChronicIllnesses).trim().length > 0;

  const fmtDT = (v?: string) =>
    v
      ? new Date(v).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  // An optional helper to show a tiny “source” hint
  const sourceHint = latestConsultation
    ? ` (latest consultation • ${fmtDT(
        latestConsultation.createdAt || latestConsultation.date
      )})`
    : "";

  useEffect(() => {
    if (patient) {
      setForm({
        bloodPressure: patient.bloodPressure || "",
        pulse:
          patient.pulse !== undefined && patient.pulse !== null
            ? String(patient.pulse)
            : "",
        temperatureF:
          patient.temperatureF !== undefined && patient.temperatureF !== null
            ? String(patient.temperatureF)
            : "",
        weightKg:
          patient.weightKg !== undefined && patient.weightKg !== null
            ? String(patient.weightKg)
            : "",
        heightCm:
          patient.heightCm !== undefined && patient.heightCm !== null
            ? String(patient.heightCm)
            : "",
        bmi:
          patient.bmi !== undefined && patient.bmi !== null
            ? String(patient.bmi)
            : "",
      });
    }
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const updated = await updatePatient(patient.id, { ...patient, ...form });
    setOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-3 w-full max-w-lg p-6">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-24 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (err || !patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-foreground">
            Patient Not Found
          </h2>
          {err && <p className="text-sm text-muted-foreground">{err}</p>}
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const VitalItem = ({
    icon: Icon,
    label,
    value,
    unit = "",
    color = "blue",
  }) => (
    <div className="group relative bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white border border-gray-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-gray-300">
      <div className="flex items-start justify-between mb-2">
        <div
          className={`p-2 rounded-lg bg-${color}-50 text-${color}-600 group-hover:bg-${color}-100 transition-colors`}
        >
          <Icon className="h-5 w-5" />
        </div>
        {value !== "—" && value !== null && value !== undefined && (
          <Badge variant="secondary" className="text-xs font-medium">
            {unit}
          </Badge>
        )}
      </div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value || "—"}</p>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, color = "blue" }) => (
    <div
      className={`flex items-center gap-3 mb-4 pb-3 border-b-2 border-${color}-100`}
    >
      <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    </div>
  );

  const getBMIStatus = (bmi) => {
    if (!bmi || bmi === "—") return { status: "—", color: "gray" };
    const value = parseFloat(bmi);
    if (value < 18.5) return { status: "Underweight", color: "yellow" };
    if (value < 25) return { status: "Normal", color: "green" };
    if (value < 30) return { status: "Overweight", color: "orange" };
    return { status: "Obese", color: "red" };
  };
  const colorMap = {
    red: {
      text: "text-red-900",
      gradient: "from-red-500 to-red-600",
      badgeBg: "bg-red-100",
      badgeText: "text-red-700",
      badgeBorder: "border-red-200",
      cardBg:
        "from-white to-red-50 hover:from-red-50 hover:to-white border-red-100 hover:border-red-300",
      corner: "from-red-100",
    },
    blue: {
      text: "text-blue-900",
      gradient: "from-blue-500 to-blue-600",
      badgeBg: "bg-blue-100",
      badgeText: "text-blue-700",
      badgeBorder: "border-blue-200",
      cardBg:
        "from-white to-blue-50 hover:from-blue-50 hover:to-white border-blue-100 hover:border-blue-300",
      corner: "from-blue-100",
    },
    orange: {
      text: "text-orange-900",
      gradient: "from-orange-500 to-orange-600",
      badgeBg: "bg-orange-100",
      badgeText: "text-orange-700",
      badgeBorder: "border-orange-200",
      cardBg:
        "from-white to-orange-50 hover:from-orange-50 hover:to-white border-orange-100 hover:border-orange-300",
      corner: "from-orange-100",
    },
    purple: {
      text: "text-purple-900",
      gradient: "from-purple-500 to-purple-600",
      badgeBg: "bg-purple-100",
      badgeText: "text-purple-700",
      badgeBorder: "border-purple-200",
      cardBg:
        "from-white to-purple-50 hover:from-purple-50 hover:to-white border-purple-100 hover:border-purple-300",
      corner: "from-purple-100",
    },
  };

  const MedicalItem = ({
    icon: Icon,
    label,
    value,
    color = "blue",
    iconBg = "blue",
  }) => {
    const hasValue = value && value !== "—";
    const c = colorMap[color] || colorMap.blue;
    const i = colorMap[iconBg] || colorMap.blue;

    return (
      <div
        className={`group relative rounded-xl p-5 border-2 ${c.cardBg} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
      >
        {/* Icon Badge */}
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 p-3 rounded-xl ${i.gradient} text-black shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-6 w-6" />
          </div>

          {/* Label + Value */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <p
                className={`text-sm font-bold uppercase tracking-wide ${c.text}`}
              >
                {label}
              </p>
              {hasValue && (
                <Badge
                  variant="secondary"
                  className={`text-xs ${c.badgeBg} ${c.badgeText} ${c.badgeBorder}`}
                >
                  Recorded
                </Badge>
              )}
            </div>

            <div
              className={`text-gray-700 leading-relaxed ${
                !hasValue ? "italic text-gray-400" : ""
              }`}
            >
              {hasValue ? (
                <p className="text-base">{value}</p>
              ) : (
                <p className="text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                  No data recorded
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Decorative corner accent */}
        <div
          className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${c.corner} to-transparent rounded-bl-full opacity-30 group-hover:opacity-50 transition-opacity`}
        ></div>
      </div>
    );
  };

  // Check if patient has any critical information

  const bmiStatus = getBMIStatus(patient.bmi);

const handleGeneratePdf = async (appointmentId: string) => {
  setIsGeneratingPdf(true);
  try {
    const blob = await generatePDF(appointmentId); // 🔥 now correctly returns blob

    const url = window.URL.createObjectURL(blob);
    setPdfUrl(url);

    // Auto-download after generation
    handleDownloadPdf(url);

    toast({
      title: "PDF generated successfully!",
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    toast({
      title: "Please Try Again!",
    });
  } finally {
    setIsGeneratingPdf(false);
  }
};


  const handleDownloadPdf = (url: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = `${patient.fullName.replace(/\s+/g, "_")}_report.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast({ title: "PDF downloaded!" });
};


  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-3xl font-bold">Patient Details</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-6 py-6">
        {/* Patient Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-indigo-50 text-indigo-700 text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h2 className="text-3xl font-bold">{patient.fullName}</h2>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Age: {patient.age ?? "—"} • {patient.sex ?? "—"} •
                          Blood: {patient.bloodType ?? "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {patient.contactNumber || "—"}
                        </span>
                      </div>
                      {/* Conditionally render button */}
                      {["Naturopathy Doctor", "SuperAdmin"].includes(
                        localStorage.getItem("userName") || ""
                      ) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(`/patient-form/${patient.id}`)
                          }
                          className="ml-2"
                        >
                          Give Consultancy
                        </Button>
                      )}
                   
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {patient.address || "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-2">
                <Badge variant="outline">
                  {activeAppointment?.paymentMethod || "—"}
                </Badge>
                <div className="text-sm">
                  <p>DOB: {fmtDate(patient.dateOfBirth)}</p>
                  <p>
                    Registered: {fmtDate(patient.formDate || patient.createdAt)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Father/Husband: {patient.fatherHusbandName || "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Occupation: {patient.occupation || "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Reference: {patient.reference || "—"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList
            className="
    flex gap-1 sm:gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
    border-b border-gray-200 bg-white sticky top-0 z-10
    [&::-webkit-scrollbar]:h-1.5
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:bg-gray-300
    [&::-webkit-scrollbar-track]:bg-transparent
  "
          >
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="prescription">Prescription</TabsTrigger>
            <TabsTrigger value="history" disabled={!activeAppointment}>
              Personal and lifestyle history
            </TabsTrigger>
            <TabsTrigger value="vitals" disabled={!activeAppointment}>
              Vitals and anthropometric measurement
            </TabsTrigger>
            <TabsTrigger value="consent" disabled={!activeAppointment}>
              Consent & Signature
            </TabsTrigger>
            <TabsTrigger value="payments" disabled={!activeAppointment}>
              UPI / Payments
            </TabsTrigger>
            <TabsTrigger value="dietchart" disabled={!activeAppointment}>
              Diet Chart
            </TabsTrigger>
            <TabsTrigger value="treatmentplan" disabled={!activeAppointment}>
              Treatment Plan
            </TabsTrigger>
            <TabsTrigger value="consultations">Consultations</TabsTrigger>
          </TabsList>

          {/* Medical History */}
          <TabsContent value="history">
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white pb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-white opacity-10">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 20px 20px, white 2px, transparent 0)",
                      backgroundSize: "40px 40px",
                    }}
                  ></div>
                </div>

                <div className="relative z-10">
                  <CardTitle className="text-3xl font-bold flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                      <Stethoscope className="h-8 w-8" />
                    </div>
                    Medical History
                  </CardTitle>
                  <p className="text-purple-100 text-sm">
                    Comprehensive health background and medical records
                  </p>

                  {/* Critical alerts */}
                  {(hasCriticalInfo || hasChronicIllness) && (
                    <div className="flex gap-2 mt-4">
                      {hasCriticalInfo && (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Allergies Present
                        </Badge>
                      )}
                      {hasChronicIllness && (
                        <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Chronic Conditions
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-5">
                  {/* Primary Health Concern */}
                  <MedicalItem
                    icon={Heart}
                    label="Primary Health Concern"
                    value={patient.primaryHealthConcern}
                    color="red"
                    iconBg="red"
                  />

                  {/* Chronic Illnesses */}
                  <MedicalItem
                    icon={AlertCircle}
                    label="Chronic Illnesses"
                    value={patient.chronicIllnesses}
                    color="orange"
                    iconBg="orange"
                  />

                  {/* Surgeries / Injuries */}
                  <MedicalItem
                    icon={Scissors}
                    label="Surgeries / Injuries"
                    value={vSurgeriesOrInjuries}
                    color="blue"
                    iconBg="blue"
                  />

                  {/* Allergies - Highlighted as critical */}
                  <div
                    className={`relative ${
                      hasCriticalInfo ? "ring-2 ring-red-300 ring-offset-2" : ""
                    }`}
                  >
                    <MedicalItem
                      icon={AlertTriangle}
                      label="Allergies"
                      value={vAllergies}
                      color="red"
                      iconBg="red"
                    />
                    {hasCriticalInfo && (
                      <div className="absolute -top-2 -right-2">
                        <span className="relative flex h-5 w-5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500"></span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Family History */}
                  <MedicalItem
                    icon={Users}
                    label="Family History"
                    value={vFamilyHistory}
                    color="purple"
                    iconBg="purple"
                  />
                </div>

                {/* Additional Info Footer */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FileText className="h-4 w-4" />
                    <p>
                      Medical history is critical for accurate diagnosis and
                      treatment planning
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vitals */}
          <TabsContent value="vitals">
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pb-8">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Activity className="h-7 w-7" />
                  Vitals & Anthropometrics
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white text-blue-700 hover:bg-blue-50"
                      >
                        Update Vitals
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Update Vitals</DialogTitle>
                      </DialogHeader>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Blood Pressure
                          </label>
                          <Input
                            id="bloodPressure"
                            defaultValue={patient.bloodPressure || ""}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Pulse
                          </label>
                          <Input
                            id="pulse"
                            defaultValue={patient.pulse || ""}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Temperature (°F)
                          </label>
                          <Input
                            id="temperatureF"
                            defaultValue={patient.temperatureF || ""}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Weight (kg)
                          </label>
                          <Input
                            id="weightKg"
                            defaultValue={patient.weightKg || ""}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Height (cm)
                          </label>
                          <Input
                            id="heightCm"
                            defaultValue={patient.heightCm || ""}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            BMI
                          </label>
                          <Input id="bmi" defaultValue={patient.bmi || ""} />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                          onClick={async () => {
                            const updatedVitals = {
                              bloodPressure: (
                                document.getElementById(
                                  "bloodPressure"
                                ) as HTMLInputElement
                              ).value,
                              pulse: (
                                document.getElementById(
                                  "pulse"
                                ) as HTMLInputElement
                              ).value,
                              temperatureF: (
                                document.getElementById(
                                  "temperatureF"
                                ) as HTMLInputElement
                              ).value,
                              weightKg: (
                                document.getElementById(
                                  "weightKg"
                                ) as HTMLInputElement
                              ).value,
                              heightCm: (
                                document.getElementById(
                                  "heightCm"
                                ) as HTMLInputElement
                              ).value,
                              bmi: (
                                document.getElementById(
                                  "bmi"
                                ) as HTMLInputElement
                              ).value,
                            };
                            await updatePatient(patient.id, {
                              ...patient,
                              ...updatedVitals,
                            });
                            window.location.reload(); // quick refresh to show updated data
                          }}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <p className="text-blue-100 text-sm mt-2">
                  Comprehensive health measurements and lifestyle data
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {/* Primary Vitals */}
                <div>
                  <SectionHeader
                    icon={Heart}
                    title="Primary Vitals"
                    color="red"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <VitalItem
                      icon={Heart}
                      label="Blood Pressure"
                      value={patient.bloodPressure}
                      unit="mmHg"
                      color="red"
                    />
                    <VitalItem
                      icon={Activity}
                      label="Pulse"
                      value={patient.pulse}
                      unit="bpm"
                      color="pink"
                    />
                    <VitalItem
                      icon={Thermometer}
                      label="Temperature"
                      value={patient.temperatureF}
                      unit="°F"
                      color="orange"
                    />
                    <VitalItem
                      icon={Droplet}
                      label="Water Intake"
                      value={patient.waterIntakeLiters}
                      unit="L/day"
                      color="blue"
                    />
                  </div>
                </div>

                {/* Body Measurements */}
                <div>
                  <SectionHeader
                    icon={Ruler}
                    title="Body Measurements"
                    color="indigo"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <VitalItem
                      icon={Weight}
                      label="Weight"
                      value={patient.weightKg}
                      unit="kg"
                      color="indigo"
                    />
                    <VitalItem
                      icon={Ruler}
                      label="Height"
                      value={patient.heightCm}
                      unit="cm"
                      color="purple"
                    />
                    <div className="relative">
                      <VitalItem
                        icon={Target}
                        label="BMI"
                        value={patient.bmi}
                        unit={bmiStatus.status}
                        color={bmiStatus.color}
                      />
                    </div>
                    <VitalItem
                      icon={Ruler}
                      label="Waist"
                      value={patient.waistCircumferenceCm}
                      unit="cm"
                      color="violet"
                    />
                    <VitalItem
                      icon={Ruler}
                      label="Hip"
                      value={patient.hipCircumferenceCm}
                      unit="cm"
                      color="fuchsia"
                    />
                    <VitalItem
                      icon={Target}
                      label="WHR"
                      value={patient.whr}
                      unit=""
                      color="pink"
                    />
                    <VitalItem
                      icon={Ruler}
                      label="Mid Upper Arm"
                      value={patient.midUpperArmCircumferenceCm}
                      unit="cm"
                      color="blue"
                    />
                    <VitalItem
                      icon={Target}
                      label="Body Fat"
                      value={patient.bodyFatPercent}
                      unit="%"
                      color="cyan"
                    />
                  </div>
                </div>

                {/* Skinfold Measurements */}
                <div>
                  <SectionHeader
                    icon={Ruler}
                    title="Skinfold Thickness"
                    color="emerald"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <VitalItem
                      icon={Ruler}
                      label="Triceps"
                      value={patient.skinfoldTricepsMm}
                      unit="mm"
                      color="emerald"
                    />
                    <VitalItem
                      icon={Ruler}
                      label="Biceps"
                      value={patient.skinfoldBicepsMm}
                      unit="mm"
                      color="teal"
                    />
                    <VitalItem
                      icon={Ruler}
                      label="Subscapular"
                      value={patient.skinfoldSubscapularMm}
                      unit="mm"
                      color="cyan"
                    />
                    <VitalItem
                      icon={Ruler}
                      label="Suprailiac"
                      value={patient.skinfoldSuprailiacMm}
                      unit="mm"
                      color="sky"
                    />
                  </div>
                </div>

                {/* Lifestyle & Habits */}
                <div>
                  <SectionHeader
                    icon={Utensils}
                    title="Lifestyle & Habits"
                    color="amber"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <Utensils className="h-5 w-5 text-amber-600" />
                        <p className="text-xs font-medium text-gray-500">
                          Diet & Appetite
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {patient.diet || "—"}{" "}
                        {patient.otherDiet && `(${patient.otherDiet})`}
                      </p>
                      <p className="text-xs text-gray-600">
                        Appetite:{" "}
                        <span className="font-medium">
                          {patient.appetite || "—"}
                        </span>
                        {" • "}
                        Taste:{" "}
                        <span className="font-medium">
                          {patient.taste || "—"}
                        </span>
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <Droplet className="h-5 w-5 text-blue-600" />
                        <p className="text-xs font-medium text-gray-500">
                          Bowel Health
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {patient.bowel || "—"}{" "}
                        {patient.otherBowel && `(${patient.otherBowel})`}
                      </p>
                      <p className="text-xs text-gray-600">
                        Frequency:{" "}
                        <span className="font-medium">
                          {patient.bowelFrequency || "—"}
                        </span>
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <Moon className="h-5 w-5 text-purple-600" />
                        <p className="text-xs font-medium text-gray-500">
                          Sleep Pattern
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Quality: {patient.sleep || "—"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {patient.sleepTime || "—"} →{" "}
                        {patient.sleepWakeUpTime || "—"}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <Dumbbell className="h-5 w-5 text-green-600" />
                        <p className="text-xs font-medium text-gray-500">
                          Physical Activity
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {patient.physicalActivity?.join(", ") || "—"}
                      </p>
                      {patient.otherPhysicalActivity && (
                        <p className="text-xs text-gray-600 mt-1">
                          ({patient.otherPhysicalActivity})
                        </p>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="h-5 w-5 text-red-600" />
                        <p className="text-xs font-medium text-gray-500">
                          Addictions
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {patient.addictions?.join(", ") || "—"}
                      </p>
                      {patient.otherAddictions && (
                        <p className="text-xs text-gray-600 mt-1">
                          ({patient.otherAddictions})
                        </p>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="h-5 w-5 text-cyan-600" />
                        <p className="text-xs font-medium text-gray-500">
                          Mental Health
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Stress: {patient.stress || "—"}
                      </p>
                      <p className="text-xs text-gray-600">
                        State:{" "}
                        <span className="font-medium">
                          {patient.mentalState || "—"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consent & Signature */}
          <TabsContent value="consent">
            <div className="space-y-4">
              {/* Consent Card */}
              <Card className="border rounded-lg shadow-sm">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Consent
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Consent Status</p>
                    <Badge
                      variant={
                        activeAppointment?.consent ? "default" : "secondary"
                      }
                    >
                      {activeAppointment?.consent ? "Given" : "Not Given"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Signature Card */}
              <Card className="border rounded-lg shadow-sm">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Signature
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-sm">
                  {activeAppointment?.signature ? (
                    <img
                      src={activeAppointment.signature}
                      alt="Signature"
                      className="h-32 w-full object-contain border rounded bg-white"
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      No signature on file.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="border rounded p-3">
                    <p className="font-medium">Payment Method</p>
                    <p className="text-muted-foreground">
                      {patient.appointment && patient.appointment.length > 0
                        ? activeAppointment?.paymentMethod || "—"
                        : "—"}
                    </p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="font-medium">UPI Status</p>
                    <p className="text-muted-foreground">
                      {patient.upiPayments?.status || "—"}
                    </p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="font-medium">UPI ID</p>
                    <p className="text-muted-foreground">
                      {patient.upiPayments?.upiId || "—"}
                    </p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="font-medium">UPI Ref</p>
                    <p className="text-muted-foreground">
                      {patient.upiPayments?.id || "—"}
                    </p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="font-medium">QR Payments</p>
                    <p className="text-muted-foreground">
                      {patient.qrPayments
                        ? JSON.stringify(patient.qrPayments)
                        : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Appointments
                  <Badge variant="outline" className="text-sm">
                    {patient.appointment?.length || 0} Total
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
              {patient.appointment && patient.appointment.length > 0 ? (
  patient.appointment
    .sort(
      (a, b) =>
        new Date(b.date || b.createdAt).getTime() -
        new Date(a.date || a.createdAt).getTime()
    )
    .map((a, idx) => (
      <div
        key={a.id || idx}
        onClick={() => setActiveAppointment(a)}
        className={`p-4 border rounded cursor-pointer transition-all ${
          activeAppointment?.id === a.id
            ? "bg-blue-50 border-blue-400 shadow-sm"
            : "hover:bg-muted/40"
        }`}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">
              {new Date(a.date || a.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-sm text-muted-foreground">
              {a.consultationType || "—"}
            </p>
          </div>
          <Badge
            className={
              a.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : a.status === "confirmed"
                ? "bg-green-100 text-green-800"
                : a.status === "completed"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }
            variant="outline"
          >
            {a.status || "unknown"}
          </Badge>
        </div>

        {/* ✅ Generate PDF Button */}
        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={async (e) => {
              e.stopPropagation(); // prevent triggering setActiveAppointment
              await handleGeneratePdf(a.id);
            }}
            disabled={isGeneratingPdf}
            className="shadow-sm"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate PDF
              </>
            )}
          </Button>
        </div>
      </div>
    ))
) : (
  <p className="text-sm text-muted-foreground">
    No appointments found for this patient.
  </p>
)}

              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="prescription">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Prescriptions
                  <Badge variant="outline" className="text-sm">
                    {patient.appointment?.length || 0} Appointments
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {patient.appointment && patient.appointment.length > 0 ? (
                  patient.appointment.map((a, idx) => (
                    <div
                      key={a.id || idx}
                      className="border rounded-lg p-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left section: appointment details */}
                      <div>
                        <div className="font-semibold text-gray-800">
                          Appointment on{" "}
                          {new Date(a.date || a.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {a.consultationType || "—"} · {a.status}
                        </div>
                      </div>

                      {/* Right section: action buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 🟢 Add Prescription Button */}
                        <button
                          onClick={() => {
                            setSelectedAppointment(a); // keep full object, not just ID
                            setPrescriptionDialogOpen(true);
                          }}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition"
                        >
                          + Add Prescription
                        </button>

                        {/* 🧾 Generate PDF button (visible only if prescription created for this appointment) */}
                        {pdfReadyAppointmentId === a.id && (
                          <button
                            onClick={async () => {
                              try {
                                console.log(
                                  "🧾 Generating PDF for appointment:",
                                  a.id
                                );
                                const res = await generatePDF(a.id); // ✅ send the appointment ID only
                                console.log("PDF generation response:", res);
                              } catch (err) {
                                console.error("Error generating PDF:", err);
                                alert(
                                  "Failed to generate PDF. Check console for details."
                                );
                              }
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                          >
                            📄 Generate PDF
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No appointments available for prescriptions.
                  </p>
                )}
              </CardContent>

              {/* Prescription Dialog */}
              {selectedAppointment && (
                <PrescriptionDialog
                  open={!!prescriptionDialogOpen}
                  onClose={() => {
                    setPrescriptionDialogOpen(false);
                    setSelectedAppointment(null);
                  }}
                  patient={{ ...patient, appointment: [selectedAppointment] }}
                  onPrescriptionCreated={() => {
                    // mark that this appointment now has a ready prescription
                    setPdfReadyAppointmentId(selectedAppointment.id);
                  }}
                />
              )}
            </Card>

            {/* 🔹 Prescription Dialog (only opens when appointment is selected) */}
            {selectedAppointment && (
              <PrescriptionDialog
                open={!!prescriptionDialogOpen}
                onClose={() => {
                  setPrescriptionDialogOpen(false);
                  setSelectedAppointment(null);
                }}
                patient={{ ...patient, appointment: [selectedAppointment] }}
                // 🧩 New callback to tell parent when prescription succeeds
                onPrescriptionCreated={() => {
                  setPdfReadyAppointmentId(selectedAppointment.id);
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="dietchart">
            <DietChartView patient={patient} />
          </TabsContent>
          <TabsContent value="treatmentplan">
            <div>
              <TreatmentSchedulerOneFile patient={patient as any} />
            </div>
          </TabsContent>
          <TabsContent value="consultations">
            <ConsultationHistory
              consultations={sortedConsultations}
              appointment={activeAppointment}
              dateFormatter={fmtDT}
              showHeader={true}
              embedded={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDetail;
