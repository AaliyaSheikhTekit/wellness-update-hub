import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPatient } from "@/lib/api"; // <-- uses your Bearer token internally

type ServerPatient = {
  id: string;
  fullName: string;
  age?: number | string;
  sex?: string;
  fatherOrHusbandName?: string;
  contactNumber?: string;
  maritalStatus?: string;
  dateOfBirth?: string;
  bloodType?: string;
  occupation?: string;
  reference?: string | null;
  registrationDate?: string | null;
  address?: string;
  primaryHealthConcern?: string;
  chronicIllnesses?: string;
  surgeriesOrInjuries?: string | null;
  allergies?: string | null;
  familyHistory?: string | null;
  signature?: string | null;
  bloodPressure?: string | null;
  pulse?: string | number | null;
  weight?: string | number | null;
  height?: string | number | null;
  BMI?: string | number | null;
  temperature?: string | number | null;
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
    date: string; // ISO
    status?: string; // pending/confirmed/...
    notes?: string;
    type?: string;
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
                  <p>Registered: {fmtDate(patient.registrationDate)}</p>
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
            <Card>
              <CardHeader>
                <CardTitle>Medical History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Primary Health Concern</p>
                  <p className="text-muted-foreground">{patient.primaryHealthConcern || "—"}</p>
                </div>
                <div>
                  <p className="font-medium">Chronic Illnesses</p>
                  <p className="text-muted-foreground">{patient.chronicIllnesses || "—"}</p>
                </div>
                <div>
                  <p className="font-medium">Surgeries / Injuries</p>
                  <p className="text-muted-foreground">{patient.surgeriesOrInjuries || "—"}</p>
                </div>
                <div>
                  <p className="font-medium">Allergies</p>
                  <p className="text-muted-foreground">{patient.allergies || "—"}</p>
                </div>
                <div>
                  <p className="font-medium">Family History</p>
                  <p className="text-muted-foreground">{patient.familyHistory || "—"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vitals */}
          <TabsContent value="vitals">
            <Card>
              <CardHeader>
                <CardTitle>Vitals & Anthropometrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  <div className="border rounded p-3">
                    <p className="font-medium">Blood Pressure</p>
                    <p className="text-muted-foreground">{patient.bloodPressure || "—"}</p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="font-medium">Pulse (bpm)</p>
                    <p className="text-muted-foreground">{patient.pulse ?? "—"}</p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="font-medium">Weight (kg)</p>
                    <p className="text-muted-foreground">{patient.weight ?? "—"}</p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="font-medium">Height (cm)</p>
                    <p className="text-muted-foreground">{patient.height ?? "—"}</p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="font-medium">BMI</p>
                    <p className="text-muted-foreground">{patient.BMI ?? "—"}</p>
                  </div>
                  <div className="border rounded p-3">
                    <p className="font-medium">Temperature (°F)</p>
                    <p className="text-muted-foreground">{patient.temperature ?? "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consent & Signature */}
          <TabsContent value="consent">
            <Card>
              <CardHeader>
                <CardTitle>Consent & Signature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Consent</p>
                  <Badge variant={patient.consent ? "default" : "secondary"}>
                    {patient.consent ? "Given" : "Not Given"}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium mb-2">Signature</p>
                  {patient.signature ? (
                    <img
                      src={patient.signature}
                      alt="Signature"
                      className="h-24 border rounded bg-white"
                    />
                  ) : (
                    <p className="text-muted-foreground">No signature on file.</p>
                  )}
                </div>
              </CardContent>
            </Card>
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
                    <p className="text-muted-foreground">{patient.paymentMethod || "—"}</p>
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
                            {a.notes && (
                              <p className="text-muted-foreground">Notes: {a.notes}</p>
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
