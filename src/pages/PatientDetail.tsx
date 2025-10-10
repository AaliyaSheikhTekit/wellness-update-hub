import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Activity, Heart, Droplet, Ruler, Weight, Thermometer, Target, Utensils, Moon, Brain, Dumbbell, AlertTriangle, AlertCircle, Stethoscope } from 'lucide-react';
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
  Send
} from "lucide-react";
import { Scissors, Users, FileText,  } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPatient } from "@/lib/api"; // <-- uses your Bearer token internally

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
    consent?: boolean;
    note?: string;
    signature?: string | null;
    createdAt?: string;
    updatedAt?: string;
  }>;
};


const naturopathyMedicines = [
  "Aloe Vera Juice",
  "Ashwagandha",
  "Neem Capsules",
  "Tulsi Drops",
  "Triphala Powder",
  "Brahmi",
  "Giloy",
  "Moringa",
  "Shatavari",
  "Turmeric Capsules",
];

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString() : "—";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<ServerPatient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>("");

  const [newPrescriptionOpen, setNewPrescriptionOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!id) return;
      setLoading(true);
      setErr("");
      try {
        const res = await getPatient(id);
        // API returns { data: [ {...} ] } per your sample
        const p: ServerPatient =
          Array.isArray(res?.data) ? res.data[0] : res?.data || res;
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

  const initials = useMemo(() => {
    const name = patient?.fullName || "";
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PT";
  }, [patient]);

  const handlePrescribeMedicine = () => {
    toast({
      title: "Prescription Sent",
      description: "Prescription details sent to patient's WhatsApp",
    });
    setNewPrescriptionOpen(false);
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
          <h2 className="text-2xl font-bold text-foreground">Patient Not Found</h2>
          {err && <p className="text-sm text-muted-foreground">{err}</p>}
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const VitalItem = ({ icon: Icon, label, value, unit = "", color = "blue" }) => (
    <div className="group relative bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white border border-gray-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-gray-300">
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600 group-hover:bg-${color}-100 transition-colors`}>
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
    <div className={`flex items-center gap-3 mb-4 pb-3 border-b-2 border-${color}-100`}>
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
 const MedicalItem = ({ icon: Icon, label, value, color = "blue", iconBg = "blue" }) => {
    const hasValue = value && value !== "—";
    
    return (
      <div className={`group relative bg-gradient-to-br from-white to-${color}-50 hover:from-${color}-50 hover:to-white border-2 border-${color}-100 hover:border-${color}-300 rounded-xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
        {/* Icon Badge */}
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-${iconBg}-500 to-${iconBg}-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Label */}
            <div className="flex items-center gap-2 mb-2">
              <p className={`text-sm font-bold text-${color}-900 uppercase tracking-wide`}>
                {label}
              </p>
              {hasValue && (
                <Badge variant="secondary" className={`text-xs bg-${color}-100 text-${color}-700 border-${color}-200`}>
                  Recorded
                </Badge>
              )}
            </div>
            
            {/* Value */}
            <div className={`text-gray-700 leading-relaxed ${!hasValue ? 'italic text-gray-400' : ''}`}>
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
        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-${color}-100 to-transparent rounded-bl-full opacity-30 group-hover:opacity-50 transition-opacity`}></div>
      </div>
    );
  };

  // Check if patient has any critical information
  const hasCriticalInfo = patient.allergies && patient.allergies !== "—";
  const hasChronicIllness = patient.chronicIllnesses && patient.chronicIllnesses !== "—";

  const bmiStatus = getBMIStatus(patient.bmi);
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

            <div className="flex items-center space-x-3">
              {/* New Prescription */}
              <Dialog open={newPrescriptionOpen} onOpenChange={setNewPrescriptionOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Pill className="h-4 w-4" />
                    <span>Prescribe Medicine</span>
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Prescription</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="medicineSelect">Select Medicine</Label>
                      <Select>
                        <SelectTrigger id="medicineSelect" className="w-full mt-2">
                          <SelectValue placeholder="Choose a medicine" />
                        </SelectTrigger>
                        <SelectContent>
                          {naturopathyMedicines.map((med, idx) => (
                            <SelectItem key={idx} value={med}>
                              {med}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="medicines">Medicines</Label>
                      <Textarea id="medicines" placeholder="List medicines with dosage..." className="min-h-[100px]" />
                    </div>

                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input id="duration" placeholder="e.g., 30 days" />
                    </div>

                    <div>
                      <Label htmlFor="instructions">Instructions</Label>
                      <Textarea id="instructions" placeholder="Usage instructions..." />
                    </div>

                    <Button onClick={handlePrescribeMedicine} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Send to WhatsApp
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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
                          Age: {patient.age ?? "—"} • {patient.sex ?? "—"} • Blood: {patient.bloodType ?? "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {patient.contactNumber || "—"}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{patient.address || "—"}</p>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-2">
                <Badge variant="outline">{patient.paymentMethod || "—"}</Badge>
                <div className="text-sm">
                  <p>DOB: {fmtDate(patient.dateOfBirth)}</p>
                  <p>Registered: {fmtDate(patient.formDate || patient.createdAt)}</p>
                 <p className="text-sm text-muted-foreground">Father/Husband: {patient.fatherHusbandName || "—"}</p>
  <p className="text-sm text-muted-foreground">Occupation: {patient.occupation || "—"}</p>
  <p className="text-sm text-muted-foreground">Reference: {patient.reference || "—"}</p>

                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="history">Medical History</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="consent">Consent & Signature</TabsTrigger>
            <TabsTrigger value="payments">UPI / Payments</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          {/* Medical History */}
          <TabsContent value="history">
         <Card className="shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white pb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-white opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
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
            color="rose"
            iconBg="rose"
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
            value={patient.surgeriesOrInjuries}
            color="blue"
            iconBg="blue"
          />

          {/* Allergies - Highlighted as critical */}
          <div className={`relative ${hasCriticalInfo ? 'ring-2 ring-red-300 ring-offset-2' : ''}`}>
            <MedicalItem
              icon={AlertTriangle}
              label="Allergies"
              value={patient.allergies}
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
            value={patient.familyHistory}
            color="purple"
            iconBg="purple"
          />
        </div>

        {/* Additional Info Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FileText className="h-4 w-4" />
            <p>Medical history is critical for accurate diagnosis and treatment planning</p>
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
        </CardTitle>
        <p className="text-blue-100 text-sm mt-2">Comprehensive health measurements and lifestyle data</p>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        {/* Primary Vitals */}
        <div>
          <SectionHeader icon={Heart} title="Primary Vitals" color="red" />
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
          <SectionHeader icon={Ruler} title="Body Measurements" color="indigo" />
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
          <SectionHeader icon={Ruler} title="Skinfold Thickness" color="emerald" />
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
          <SectionHeader icon={Utensils} title="Lifestyle & Habits" color="amber" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Utensils className="h-5 w-5 text-amber-600" />
                <p className="text-xs font-medium text-gray-500">Diet & Appetite</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {patient.diet || "—"} {patient.otherDiet && `(${patient.otherDiet})`}
              </p>
              <p className="text-xs text-gray-600">
                Appetite: <span className="font-medium">{patient.appetite || "—"}</span>
                {" • "}
                Taste: <span className="font-medium">{patient.taste || "—"}</span>
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Droplet className="h-5 w-5 text-blue-600" />
                <p className="text-xs font-medium text-gray-500">Bowel Health</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {patient.bowel || "—"} {patient.otherBowel && `(${patient.otherBowel})`}
              </p>
              <p className="text-xs text-gray-600">
                Frequency: <span className="font-medium">{patient.bowelFrequency || "—"}</span>
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Moon className="h-5 w-5 text-purple-600" />
                <p className="text-xs font-medium text-gray-500">Sleep Pattern</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                Quality: {patient.sleep || "—"}
              </p>
              <p className="text-xs text-gray-600">
                {patient.sleepTime || "—"} → {patient.sleepWakeUpTime || "—"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className="h-5 w-5 text-green-600" />
                <p className="text-xs font-medium text-gray-500">Physical Activity</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {patient.physicalActivity?.join(", ") || "—"}
              </p>
              {patient.otherPhysicalActivity && (
                <p className="text-xs text-gray-600 mt-1">({patient.otherPhysicalActivity})</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-5 w-5 text-red-600" />
                <p className="text-xs font-medium text-gray-500">Addictions</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {patient.addictions?.join(", ") || "—"}
              </p>
              {patient.otherAddictions && (
                <p className="text-xs text-gray-600 mt-1">({patient.otherAddictions})</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-200 rounded-xl p-4 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5 text-cyan-600" />
                <p className="text-xs font-medium text-gray-500">Mental Health</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                Stress: {patient.stress || "—"}
              </p>
              <p className="text-xs text-gray-600">
                State: <span className="font-medium">{patient.mentalState || "—"}</span>
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
          <Badge variant={patient.consent ? "default" : "secondary"}>
            {patient.consent ? "Given" : "Not Given"}
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
        {patient.signature ? (
          <img
            src={patient.signature}
            alt="Signature"
            className="h-32 w-full object-contain border rounded bg-white"
          />
        ) : (
          <p className="text-muted-foreground">No signature on file.</p>
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
                        ? patient.appointment[0].paymentMethod || "—"
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
  <p className="text-muted-foreground">{patient.qrPayments ? JSON.stringify(patient.qrPayments) : "—"}</p>
</div>

                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
               {patient.appointment && patient.appointment.length > 0 ? (
  patient.appointment.map((a, idx) => (
    <div key={a.id || idx} className="p-3 border rounded">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-green-600" />
          <div className="text-sm">
            <p className="font-medium">{fmtDate(a.date)}</p>
            {a.note && <p className="text-muted-foreground">Notes: {a.note}</p>}
            <p className="text-muted-foreground">Consultation Type: {a.consultationType || "—"}</p>
            <p className="text-muted-foreground">Consent: {a.consent ? "Given" : "Not Given"}</p>
            {a.signature && (
              <img src={a.signature} alt="Signature" className="h-16 mt-1 border rounded bg-white" />
            )}
          </div>
        </div>
        <Badge
          className={
            a.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : a.status === "confirmed"
              ? "bg-green-100 text-green-800"
              : ""
          }
          variant="outline"
        >
          {a.status || "—"}
        </Badge>
      </div>
    </div>
  ))
) : (
  <p className="text-sm text-muted-foreground">No appointments found.</p>
)}

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDetail;
