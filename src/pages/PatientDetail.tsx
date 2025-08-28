import { useState } from "react";
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
  FileText,
  Phone,
  Mail,
  User,
  Clock,
  Send
} from "lucide-react";

// Mock patient data with detailed information
const mockPatientData = {
  "1": {
    id: "1",
    name: "Sarah Johnson",
    age: 34,
    phone: "+91 98765 43201",
    email: "sarah.j@email.com",
    address: "123 Health Lane, Wellness City, 400001",
    condition: "Chronic Fatigue",
    status: "Active",
    joinDate: "2023-06-15",
    lastVisit: "2024-01-15",
    nextAppointment: "2024-02-01",
    medicalHistory: [
      {
        date: "2024-01-15",
        complaint: "Persistent fatigue and low energy levels",
        diagnosis: "Chronic Fatigue Syndrome",
        treatment: "Detox therapy, stress management counseling"
      },
      {
        date: "2023-12-20",
        complaint: "Sleep disturbances and morning fatigue",
        diagnosis: "Sleep quality issues",
        treatment: "Natural sleep aids, lifestyle modification"
      }
    ],
    prescriptions: [
      {
        id: "P001",
        date: "2024-01-15",
        medicines: "Ashwagandha 500mg, Rhodiola Extract 200mg",
        duration: "30 days",
        instructions: "Take twice daily with meals",
        status: "Active"
      },
      {
        id: "P002",
        date: "2023-12-20",
        medicines: "Valerian Root Tea, Magnesium Supplement",
        duration: "21 days",
        instructions: "Tea before bedtime, supplement with dinner",
        status: "Completed"
      }
    ],
    appointments: [
      {
        date: "2024-02-01",
        time: "10:00 AM",
        type: "Follow-up",
        status: "Scheduled"
      },
      {
        date: "2024-01-15",
        time: "2:00 PM",
        type: "Consultation",
        status: "Completed"
      },
      {
        date: "2023-12-20",
        time: "11:00 AM",
        type: "Initial Consultation",
        status: "Completed"
      }
    ]
  }
};

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [newPrescriptionOpen, setNewPrescriptionOpen] = useState(false);

  const patient = mockPatientData[id as keyof typeof mockPatientData];

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Patient Not Found</h2>
          <Button onClick={() => navigate("/dashboard")} variant="wellness">Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleBookAppointment = () => {
    toast({
      title: "Appointment Booked",
      description: "WhatsApp confirmation sent to patient",
    });
    setNewAppointmentOpen(false);
  };

  const handlePrescribeMedicine = () => {
    toast({
      title: "Prescription Sent",
      description: "Prescription details sent to patient's WhatsApp",
    });
    setNewPrescriptionOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 wellness-card-gradient">
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
              <h1 className="font-display text-3xl font-bold text-foreground">Patient Details</h1>
            </div>

            <div className="flex items-center space-x-3">
              <Dialog open={newAppointmentOpen} onOpenChange={setNewAppointmentOpen}>
                <DialogTrigger asChild>
                  <Button variant="wellness" className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Book Appointment</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="wellness-card-gradient border-0">
                  <DialogHeader>
                    <DialogTitle>Book New Appointment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="appointment-date">Date</Label>
                      <Input id="appointment-date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="appointment-time">Time</Label>
                      <Input id="appointment-time" type="time" />
                    </div>
                    <div>
                      <Label htmlFor="appointment-type">Type</Label>
                      <Input id="appointment-type" placeholder="e.g., Follow-up, Consultation" />
                    </div>
                    <Button onClick={handleBookAppointment} variant="wellness" className="w-full">
                      Book & Send WhatsApp
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={newPrescriptionOpen} onOpenChange={setNewPrescriptionOpen}>
                <DialogTrigger asChild>
                  <Button variant="wellnessOutline" className="flex items-center space-x-2">
                    <Pill className="h-4 w-4" />
                    <span>Prescribe Medicine</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="wellness-card-gradient border-0">
                  <DialogHeader>
                    <DialogTitle>New Prescription</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="medicines">Medicines</Label>
                      <Textarea
                        id="medicines"
                        placeholder="List medicines with dosage..."
                        className="min-h-[100px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input id="duration" placeholder="e.g., 30 days" />
                    </div>
                    <div>
                      <Label htmlFor="instructions">Instructions</Label>
                      <Textarea
                        id="instructions"
                        placeholder="Usage instructions..."
                      />
                    </div>
                    <Button onClick={handlePrescribeMedicine} variant="wellness" className="w-full">
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

      <div className="container mx-auto px-6 py-6">
        {/* Patient Header */}
        <Card className="mb-6 wellness-card-gradient border-0 wellness-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-wellness-sage-light/20 text-wellness-sage text-2xl">
                    {patient.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h2 className="font-display text-4xl font-bold text-foreground">{patient.name}</h2>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Age: {patient.age}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{patient.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{patient.email}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{patient.address}</p>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-2">
                <Badge className="bg-wellness-sage-light text-wellness-sage-dark border-wellness-sage/30">
                  {patient.status}
                </Badge>
                <div>
                  <p className="text-sm font-medium text-foreground">{patient.condition}</p>
                  <p className="text-xs text-muted-foreground">Last visit: {patient.lastVisit}</p>
                  <p className="text-xs text-wellness-sage">Next: {patient.nextAppointment}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Details Tabs */}
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 wellness-card-gradient">
            <TabsTrigger value="history">Medical History</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <Card className="wellness-card-gradient border-0 wellness-shadow">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Medical History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {patient.medicalHistory.map((record, index) => (
                    <div key={index} className="border-l-2 border-wellness-sage/30 pl-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{record.date}</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-medium text-foreground">Chief Complaint</h4>
                          <p className="text-sm text-muted-foreground">{record.complaint}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">Diagnosis</h4>
                          <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">Treatment</h4>
                          <p className="text-sm text-muted-foreground">{record.treatment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions">
            <Card className="wellness-card-gradient border-0 wellness-shadow">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Prescriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patient.prescriptions.map((prescription) => (
                    <div key={prescription.id} className="p-4 border border-border/30 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-foreground">Prescription #{prescription.id}</h4>
                          <p className="text-sm text-muted-foreground">{prescription.date}</p>
                        </div>
                        <Badge className={
                          prescription.status === "Active"
                            ? "bg-wellness-sage-light text-wellness-sage-dark border-wellness-sage/30"
                            : "bg-wellness-beige-light text-wellness-beige-dark border-wellness-beige/30"
                        }>
                          {prescription.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h5 className="text-sm font-medium text-foreground">Medicines</h5>
                          <p className="text-sm text-muted-foreground">{prescription.medicines}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-foreground">Duration</h5>
                            <p className="text-sm text-muted-foreground">{prescription.duration}</p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-foreground">Instructions</h5>
                            <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card className="wellness-card-gradient border-0 wellness-shadow">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patient.appointments.map((appointment, index) => (
                    <div key={index} className="p-4 border border-border/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Calendar className="h-5 w-5 text-wellness-sage" />
                          <div>
                            <h4 className="font-medium text-foreground">{appointment.type}</h4>
                            <p className="text-sm text-muted-foreground">
                              {appointment.date} at {appointment.time}
                            </p>
                          </div>
                        </div>
                        <Badge className={
                          appointment.status === "Scheduled"
                            ? "bg-wellness-sage-light text-wellness-sage-dark border-wellness-sage/30"
                            : "bg-wellness-beige-light text-wellness-beige-dark border-wellness-beige/30"
                        }>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDetail;