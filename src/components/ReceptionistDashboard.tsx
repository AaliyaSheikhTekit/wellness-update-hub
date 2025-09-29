import React, { useState } from "react";
import { Calendar, Users, Plus, Clock, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const ReceptionDashboard = () => {
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Patient Added Successfully",
      description: "New patient has been registered in the system.",
    });
    setIsPatientDialogOpen(false);
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Appointment Scheduled",
      description: "New appointment has been added to the calendar.",
    });
    setIsAppointmentDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="bg-white border-b shadow-soft">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Reception Dashboard</h1>
                <p className="text-muted-foreground">Wellness Healthcare Center</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search patients..." className="pl-10 w-64" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          

            {/* Add Appointment Card */}
            <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-card transition-all duration-300 bg-white border-0 shadow-soft">
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Schedule Appointment</h3>
                        <p className="text-muted-foreground">Book a new appointment for a patient</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Schedule Appointment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddAppointment} className="space-y-4">
                  <div>
                    <Label htmlFor="patientName">Patient Name</Label>
                    <Input id="patientName" placeholder="Search or enter patient name" required />
                  </div>
                  <div>
                    <Label htmlFor="appointmentDate">Date</Label>
                    <Input id="appointmentDate" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="appointmentTime">Time</Label>
                    <Input id="appointmentTime" type="time" required />
                  </div>
                  <div>
                    <Label htmlFor="doctor">Doctor</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dr-smith">Dr. Smith - General Medicine</SelectItem>
                        <SelectItem value="dr-johnson">Dr. Johnson - Cardiology</SelectItem>
                        <SelectItem value="dr-williams">Dr. Williams - Pediatrics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="appointmentType">Appointment Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select appointment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="checkup">Regular Checkup</SelectItem>
                        <SelectItem value="followup">Follow-up</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="appointmentNotes">Notes (Optional)</Label>
                    <Textarea id="appointmentNotes" placeholder="Appointment details..." />
                  </div>
                  <Button type="submit" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* Dashboard Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-foreground">12</div>
                <Clock className="w-5 h-5 text-healthcare-blue" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">3 pending confirmations</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-foreground">1,247</div>
                <Users className="w-5 h-5 text-healthcare-blue" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">+23 this week</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-foreground">8</div>
                <Calendar className="w-5 h-5 text-healthcare-blue" />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Next available at 2:00 PM</p>
            </CardContent>
          </Card>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Recent Activity</h2>
          <Card className="bg-white border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <div>
                      <p className="font-medium">New patient registered</p>
                      <p className="text-sm text-muted-foreground">Sarah Johnson - 10:30 AM</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-healthcare-blue rounded-full"></div>
                    <div>
                      <p className="font-medium">Appointment scheduled</p>
                      <p className="text-sm text-muted-foreground">Michael Brown with Dr. Smith - 10:15 AM</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <div>
                      <p className="font-medium">Appointment reminder sent</p>
                      <p className="text-sm text-muted-foreground">Emma Davis - 10:00 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default ReceptionDashboard;