import { useState } from "react";
import { Calendar, Clock, User, Phone, Mail, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockAppointments = [
  {
    id: 1,
    patientName: "Rahul Sharma",
    patientPhone: "+91 98765 43210",
    patientEmail: "rahul.sharma@email.com",
    date: "2024-01-15",
    time: "10:00 AM",
    service: "Initial Consultation",
    status: "confirmed",
    duration: "60 mins",
    notes: "First-time patient with digestive issues"
  },
  {
    id: 2,
    patientName: "Priya Patel",
    patientPhone: "+91 87654 32109",
    patientEmail: "priya.patel@email.com",
    date: "2024-01-15",
    time: "11:30 AM",
    service: "Panchakarma Therapy",
    status: "confirmed",
    duration: "90 mins",
    notes: "Follow-up session for stress management"
  },
  {
    id: 3,
    patientName: "Amit Kumar",
    patientPhone: "+91 76543 21098",
    patientEmail: "amit.kumar@email.com",
    date: "2024-01-15",
    time: "2:00 PM",
    service: "Mud Therapy",
    status: "pending",
    duration: "45 mins",
    notes: "Skin condition treatment"
  },
  {
    id: 4,
    patientName: "Sunita Devi",
    patientPhone: "+91 65432 10987",
    patientEmail: "sunita.devi@email.com",
    date: "2024-01-16",
    time: "9:00 AM",
    service: "Diet Consultation",
    status: "confirmed",
    duration: "30 mins",
    notes: "Weight management program"
  },
  {
    id: 5,
    patientName: "Rajesh Gupta",
    patientPhone: "+91 54321 09876",
    patientEmail: "rajesh.gupta@email.com",
    date: "2024-01-16",
    time: "3:30 PM",
    service: "Hydrotherapy",
    status: "cancelled",
    duration: "60 mins",
    notes: "Patient requested to reschedule"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState("2024-01-15");

  const filteredAppointments = mockAppointments.filter(
    (appointment) => appointment.date === selectedDate
  );

  const upcomingAppointments = mockAppointments.filter(
    (appointment) => new Date(appointment.date) >= new Date()
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Appointments</h1>
          <p className="text-muted-foreground">Manage patient appointments and schedules</p>
        </div>

        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today's Appointments</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Today - January 15, 2024</h2>
              <Button className="bg-primary hover:bg-primary-dark">
                Add New Appointment
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="shadow-natural">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-foreground">{appointment.patientName}</h3>
                          </div>
                          <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.time} ({appointment.duration})</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{appointment.patientPhone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <span>{appointment.patientEmail}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{appointment.service}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <strong>Notes:</strong> {appointment.notes}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
              <Button className="bg-primary hover:bg-primary-dark">
                Add New Appointment
              </Button>
            </div>

            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="shadow-natural">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-foreground">{appointment.patientName}</h3>
                          </div>
                          <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(appointment.date).toLocaleDateString('en-IN', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.time} ({appointment.duration})</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{appointment.patientPhone}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{appointment.service}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <strong>Notes:</strong> {appointment.notes}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Calendar View</h3>
              <p className="text-muted-foreground">Calendar integration coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Appointments;