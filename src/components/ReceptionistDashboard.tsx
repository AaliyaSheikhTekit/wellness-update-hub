import React, { useEffect, useState } from "react";
import { Calendar, Users, Clock, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { getBackendToken, getPatients } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const ReceptionDashboard = () => {
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate=useNavigate(); // <-- add this
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "today" | "pending">("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      const token = getBackendToken();
      console.log("Using backend token:", token);
      try {
        const res = await fetch(
          `https://api.ikshanaturopathy.com/v1/appointment/get?page=${page}&limit=${limit}&filter=${filter}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // <-- send token here
            },
          }
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
  }, [page, filter]);

  const handleFilterChange = (newFilter: "all" | "today" | "pending") => {
    setFilter(newFilter);
    setPage(1); // reset page when filter changes
  };

  const filteredAppointments = appointments.filter((apt) => {
    const patientName = apt.patient?.fullName?.toLowerCase() || "";
    const doctorName = apt.doctor?.username?.toLowerCase() || "";
    return (
      patientName.includes(searchTerm.toLowerCase()) ||
      doctorName.includes(searchTerm.toLowerCase())
    );
  });

  const today = new Date();
  const todaysAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date + "T00:00:00");
    return (
      aptDate.getFullYear() === today.getFullYear() &&
      aptDate.getMonth() === today.getMonth() &&
      aptDate.getDate() === today.getDate()
    );
  });

  const pendingAppointments = appointments.filter(
    (apt) => apt.status === "pending"
  );
  // below existing useState declarations
  const [patients, setPatients] = useState<any[]>([]);
  const [patientLoading, setPatientLoading] = useState(false);

  // reuse the same header searchTerm for server-side patient search,
  // or make a separate state if you want different searches.
  useEffect(() => {
    const loadPatients = async () => {
      setPatientLoading(true);
      try {
        const res = await getPatients(searchTerm); // <-- calls api.ts
        setPatients(res?.data ?? []);
      } catch (err) {
        toast({
          title: "Error fetching patients",
          description: "Unable to load patients from the server.",
        });
      } finally {
        setPatientLoading(false);
      }
    };

    loadPatients();
  }, [searchTerm]); // refetch when the header search changes

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
              <h1 className="text-2xl font-bold text-gray-800">
                Reception Dashboard
              </h1>
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
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Schedule Appointment Card */}
            <Dialog
              open={isAppointmentDialogOpen}
              onOpenChange={setIsAppointmentDialogOpen}
            >
              <DialogTrigger asChild>
                <motion.div
                  className="cursor-pointer rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 bg-gradient-to-r from-green-400 to-blue-400 text-white"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center space-x-4">
                    <Calendar className="w-10 h-10" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        Schedule Appointment
                      </h3>
                      <p className="text-sm">
                        Book a new appointment for a patient
                      </p>
                    </div>
                  </div>
                </motion.div>
              </DialogTrigger>

              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">
                    Schedule Appointment
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddAppointment} className="space-y-4">
                  <div>
                    <Label htmlFor="patientName">Patient Name</Label>
                    <Input
                      id="patientName"
                      placeholder="Search or enter patient name"
                      required
                    />
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
                        <SelectItem value="dr-smith">
                          Dr. Smith - General Medicine
                        </SelectItem>
                        <SelectItem value="dr-johnson">
                          Dr. Johnson - Cardiology
                        </SelectItem>
                        <SelectItem value="dr-williams">
                          Dr. Williams - Pediatrics
                        </SelectItem>
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
                        <SelectItem value="consultation">
                          Consultation
                        </SelectItem>
                        <SelectItem value="checkup">Regular Checkup</SelectItem>
                        <SelectItem value="followup">Follow-up</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="appointmentNotes">Notes (Optional)</Label>
                    <Textarea
                      id="appointmentNotes"
                      placeholder="Appointment details..."
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
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
          <motion.div
            className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl shadow-lg p-6 text-white"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-sm font-medium">Today's Appointments</h3>
            <div className="flex items-center mt-2 space-x-2">
              <span className="text-2xl font-bold">
                {todaysAppointments.length}
              </span>
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-sm mt-1">
              {todaysAppointments.filter((a) => a.status === "pending").length}{" "}
              pending confirmations
            </p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl shadow-lg p-6 text-white"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-sm font-medium">Total Patients</h3>
            <div className="flex items-center mt-2 space-x-2">
              <span className="text-2xl font-bold">1,247</span>
              <Users className="w-5 h-5" />
            </div>
            <p className="text-sm mt-1">+23 this week</p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-blue-400 to-green-400 rounded-xl shadow-lg p-6 text-white"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-sm font-medium">Available Slots</h3>
            <div className="flex items-center mt-2 space-x-2">
              <span className="text-2xl font-bold">8</span>
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-sm mt-1">Next available at 2:00 PM</p>
          </motion.div>
        </section>

        {/* Appointments + Patients */}
        <section className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* ============== Latest Appointments ============== */}
            <motion.section
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <Card className="shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-yellow-50 to-orange-50">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">
                        Latest Appointments
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {appointments.length} total •{" "}
                        {todaysAppointments.length} today •{" "}
                        {
                          appointments.filter((a) => a.status === "pending")
                            .length
                        }{" "}
                        pending
                      </p>
                    </div>
                    {/* Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Filter
                      </span>
                      <Select
                        onValueChange={(val) => handleFilterChange(val as any)}
                        value={filter}
                      >
                        <SelectTrigger className="w-36 h-8">
                          <SelectValue placeholder="Filter appointments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    {loading && (
                      <div className="space-y-2">
                        <div className="h-16 rounded-lg bg-muted animate-pulse" />
                        <div className="h-16 rounded-lg bg-muted animate-pulse" />
                        <div className="h-16 rounded-lg bg-muted animate-pulse" />
                      </div>
                    )}

                    {!loading && filteredAppointments.length === 0 && (
                      <div className="rounded-lg border p-6 text-sm text-muted-foreground bg-white">
                        No appointments match your filters.
                      </div>
                    )}

                    {!loading &&
                      filteredAppointments.map((latestAppointment, index) => (
                        <motion.div
                          key={latestAppointment.id}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: index * 0.05 }}
                        >
                          <Card className="border-l-4 border-yellow-400 hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <div className="w-2.5 h-2.5 rounded-full mt-1.5 bg-yellow-400" />
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                                      <User className="h-4 w-4 text-indigo-500" />
                                      <span>
                                        {latestAppointment.patient?.fullName ||
                                          "Unknown"}{" "}
                                        •{" "}
                                        <span className="text-muted-foreground">
                                          {latestAppointment.doctor?.username ||
                                            "N/A"}
                                        </span>
                                      </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                      <span className="inline-flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5 text-green-600" />
                                        {new Date(
                                          latestAppointment.date
                                        ).toLocaleDateString()}
                                      </span>
                                      <span className="inline-flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5 text-yellow-600" />
                                        {new Date(
                                          latestAppointment.date
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                      {latestAppointment.status && (
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                            latestAppointment.status ===
                                            "pending"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : latestAppointment.status ===
                                                "confirmed"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-gray-100 text-gray-700"
                                          }`}
                                        >
                                          {latestAppointment.status}
                                        </span>
                                      )}
                                    </div>

                                    {latestAppointment.notes && (
                                      <p className="text-xs text-gray-600 truncate">
                                        Notes: {latestAppointment.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-center gap-3 mt-5">
                    <Button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1 || loading}
                      variant="outline"
                      className="h-8"
                    >
                      Previous
                    </Button>
                    <div className="inline-flex items-center justify-center h-8 min-w-8 px-2 text-sm rounded border bg-white">
                      {page}
                    </div>
                    <Button
                      onClick={() => setPage((prev) => prev + 1)}
                      disabled={loading}
                      variant="outline"
                      className="h-8"
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* ============== Patients ============== */}
            <motion.section
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="space-y-4"
            >
              <Card className="shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-sky-50">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Patients</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {patients.length} record
                        {patients.length === 1 ? "" : "s"} • Search to filter
                      </p>
                    </div>

                    {/* Uses your header searchTerm already bound to the top search input */}
                    <div className="relative hidden sm:block">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search patients…"
                        className="pl-9 h-9 w-56"
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  {patientLoading && (
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-muted animate-pulse" />
                      <div className="h-16 rounded-lg bg-muted animate-pulse" />
                      <div className="h-16 rounded-lg bg-muted animate-pulse" />
                    </div>
                  )}

                  {!patientLoading && patients.length === 0 && (
                    <div className="rounded-lg border p-6 text-sm text-muted-foreground bg-white">
                      No patients found.
                    </div>
                  )}

                  {!patientLoading && patients.length > 0 && (
                    <div className="space-y-3">
                      {patients.map((p: any) => (
                        <Card
                          key={p.id || p._id}
                          className="border-l-4 border-indigo-400 hover:shadow-md transition-shadow"
                         onClick={() => navigate(`/patient/${p.id || p._id}`)}   // <-- go to detail
      
                       >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                                {(p.fullName || p.name || "?")
                                  .split(" ")
                                  .map((s: string) => s[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                                  <User className="h-4 w-4 text-indigo-500" />
                                  <span>{p.fullName || p.name || "—"}</span>
                                  {p.bloodType && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700">
                                      {p.bloodType}
                                    </span>
                                  )}
                                </div>

                                <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                                  <div>
                                    <span className="font-medium text-foreground">
                                      Phone:
                                    </span>{" "}
                                    {p.contactNumber || "—"}
                                  </div>
                                   <div>
                                    <span className="font-medium text-foreground">
                                      Reference:
                                    </span>{" "}
                                    {p.reference || "—"}
                                  </div>
                                  
                                  <div>
                                    <span className="font-medium text-foreground">
                                      DOB:
                                    </span>{" "}
                                    {p.dateOfBirth
                                      ? new Date(
                                          p.dateOfBirth
                                        ).toLocaleDateString()
                                      : "—"}
                                  </div>
                                  <div className="truncate sm:text-right sm:pr-1">
                                    <span className="font-medium text-foreground">
                                      ID:
                                    </span>{" "}
                                    {p.id || p._id || "—"}
                                  </div>
                                  {p.primaryHealthConcern && (
                                    <div className="sm:col-span-3">
                                      <span className="font-medium text-foreground">
                                        Concern:
                                      </span>{" "}
                                      {p.primaryHealthConcern}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReceptionDashboard;
