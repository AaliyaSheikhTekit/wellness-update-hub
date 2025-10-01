import React, { useEffect, useState } from "react";
import { Calendar, Users, Clock, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const ReceptionDashboard = () => {
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.ikshanaturopathy.com/v1/appointment/get?page=1&limit=11&filter=today`
        );
        const response = await res.json();
        setAppointments(response.data);
      } catch (err) {
        toast({
          title: "Error fetching appointments",
          description: "Unable to load appointments from the server.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const today = new Date();
  const todaysAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date + "T00:00:00");
    return (
      aptDate.getFullYear() === today.getFullYear() &&
      aptDate.getMonth() === today.getMonth() &&
      aptDate.getDate() === today.getDate()
    );
  });

  const pendingAppointments = appointments.filter((apt) => apt.status === "pending");

  const filteredAppointments = pendingAppointments
    .filter((apt) =>
      apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctor?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
    <div className="min-h-screen bg-gradient-to-r from-purple-100 via-pink-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white border-b shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Reception Dashboard</h1>
              <p className="text-gray-500">Wellness Healthcare Center</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search patients..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Schedule Appointment Card */}
            <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
              <DialogTrigger asChild>
                <motion.div
                  className="cursor-pointer rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 bg-gradient-to-r from-green-400 to-blue-400 text-white"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center space-x-4">
                    <Calendar className="w-10 h-10" />
                    <div>
                      <h3 className="text-lg font-semibold">Schedule Appointment</h3>
                      <p className="text-sm">Book a new appointment for a patient</p>
                    </div>
                  </div>
                </motion.div>
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
                  <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* Dashboard Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl shadow-lg p-6 text-white" whileHover={{ scale: 1.05 }}>
            <h3 className="text-sm font-medium">Today's Appointments</h3>
            <div className="flex items-center mt-2 space-x-2">
              <span className="text-2xl font-bold">{todaysAppointments.length}</span>
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-sm mt-1">{todaysAppointments.filter((a) => a.status === "pending").length} pending confirmations</p>
          </motion.div>

          <motion.div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl shadow-lg p-6 text-white" whileHover={{ scale: 1.05 }}>
            <h3 className="text-sm font-medium">Total Patients</h3>
            <div className="flex items-center mt-2 space-x-2">
              <span className="text-2xl font-bold">1,247</span>
              <Users className="w-5 h-5" />
            </div>
            <p className="text-sm mt-1">+23 this week</p>
          </motion.div>

          <motion.div className="bg-gradient-to-r from-blue-400 to-green-400 rounded-xl shadow-lg p-6 text-white" whileHover={{ scale: 1.05 }}>
            <h3 className="text-sm font-medium">Available Slots</h3>
            <div className="flex items-center mt-2 space-x-2">
              <span className="text-2xl font-bold">8</span>
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-sm mt-1">Next available at 2:00 PM</p>
          </motion.div>
        </section>

        {/* Latest Appointments */}
        <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Latest Appointments</h2>
          <div className="space-y-4">
            {filteredAppointments.map((latestAppointment, index) => (
              <motion.div
                key={latestAppointment.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border-l-4 border-yellow-400 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <CardContent className="p-4 flex items-start space-x-4 bg-gradient-to-r from-white to-yellow-50 rounded-r-md">
                    <div className="w-3 h-3 rounded-full mt-1 bg-yellow-400"></div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <User className="w-4 h-4 text-indigo-500" />
                        <span>
                          {latestAppointment.patientName || "Unknown"} - {latestAppointment.doctor || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-green-500" />
                          <span>{new Date(latestAppointment.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-yellow-500" />
                          <span>{new Date(latestAppointment.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                      {latestAppointment.notes && (
                        <p className="text-xs text-gray-600 truncate mt-1">Notes: {latestAppointment.notes}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default ReceptionDashboard;
