import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Bell, CheckCircle2, Stethoscope, Search, X } from "lucide-react";
import { format } from "date-fns";
import { getBackendToken, getPatients } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { io } from "socket.io-client"; 
import { c } from "node_modules/framer-motion/dist/types.d-Cjd591yU";
interface Appointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  is_read: boolean;
}


const DoctorDashboard = () => {
      const { toast } = useToast();
const [appointments, setAppointments] = useState<any[]>([]); // below existing useState declarations
  const [patients, setPatients] = useState<any[]>([]);
  const [patientLoading, setPatientLoading] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
const DOCTOR_ID = localStorage.getItem("doctor_id") || "doctor123"; // Replace with actual doctor ID
  const SOCKET_URL = "https://api.ikshanaturopathy.com"; // Replace with your actual socket server URL
const [searchTerm, setSearchTerm] = useState("");

    const [loadingAppointments, setLoadingAppointments] = useState(false);
   // ===== Fetch appointments (same API style as Reception) =====
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoadingAppointments(true);
        const token = getBackendToken();
        const res = await fetch(
          // you can add ?filter=today if you only want today's; keeping "all" here
          `https://api.ikshanaturopathy.com/v1/appointment/get?filter=all&page=1&limit=20`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();

        // Normalize to DoctorDashboard card shape
        const mapped: any[] = (data?.data || []).map((a: any) => {
          const iso = a.date || "";
          const time = iso
            ? new Date(iso).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";
          return {
            id: a.id,
            patient_name: a.patient?.fullName || a.patientName || "Unknown",
            patient_phone: a.patient?.contactNumber || "—",
            appointment_date: (iso || "").split("T")[0] || "",
            appointment_time: time,
            status: a.status || "pending",
            notes: a.note || a.notes || null,
            is_read: false,
          };
        });

        setAppointments(mapped);
      } catch (e) {
        console.error(e);
        toast({
          title: "Error fetching appointments",
          description: "Unable to load appointments from the server.",
        });
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [toast]);
 const markAsRead = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, is_read: true } : apt))
    );
  };

  // Socket setup
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("✅ Connected with id:", socket.id);
      socket.emit("registerDoctor", DOCTOR_ID);
    });

    socket.on("newAppointment", (data) => {
      console.log("📅 New appointment received:", data);
      // Append new appointment to state
      const iso = data.date || "";
      const newAppointment: Appointment = {
        id: data.id,
        patient_name: data.patientName || "Unknown",
        patient_phone: data.patientPhone || "—",
        appointment_date: iso.split("T")[0] || "",
        appointment_time: iso
          ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "",
        status: data.status || "pending",
        notes: data.note || null,
        is_read: false,
      };
      setAppointments((prev) => [newAppointment, ...prev]);
      setShowNotifications(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const unreadAppointments = appointments.filter((apt) => !apt.is_read);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-primary to-info p-3 shadow-lg">
            <Stethoscope className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage your appointments & patients
            </p>
          </div>
           {unreadAppointments.length > 0 && (
          <Badge
            className="flex items-center gap-1 bg-red-400 text-white shadow-lg animate-pulse cursor-pointer"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-4 w-4" />
            {unreadAppointments.length} New
          </Badge>
        )}
        </div>
        
      </div>

      {/* Search patients */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search patients…"
          className="pl-9 h-10"
        />
      </div>

      {/* Appointments */}
      <div className="grid gap-4">
        <Card className="shadow-card">
          <CardHeader className="border-b">
            <CardTitle>Appointments</CardTitle>
            <p className="text-xs text-muted-foreground">
              {loadingAppointments
                ? "Loading…"
                : `${appointments.length} total appointments`}
            </p>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {loadingAppointments && (
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-muted animate-pulse" />
                <div className="h-20 rounded-lg bg-muted animate-pulse" />
              </div>
            )}

            {!loadingAppointments && appointments.length === 0 && (
              <p className="text-center text-muted-foreground">
                No appointments scheduled
              </p>
            )}

            {!loadingAppointments &&
              appointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  className={`transition-all hover:shadow-elevated ${
                    !appointment.is_read
                      ? "border-primary border-2 shadow-lg"
                      : "shadow-card"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <div className="rounded-full bg-primary/10 p-2">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          {appointment.patient_name}
                          {!appointment.is_read && (
                            <Badge className="ml-2 bg-notification text-white">
                              New
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {appointment.patient_phone}
                        </p>
                      </div>
                      {!appointment.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(appointment.id)}
                          className="hover:bg-success/10 hover:text-success"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-md">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {appointment.appointment_date
                          ? format(
                              new Date(appointment.appointment_date),
                              "MMMM dd, yyyy"
                            )
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-md">
                      <Clock className="h-4 w-4 text-info" />
                      <span className="font-medium">
                        {appointment.appointment_time || "—"}
                      </span>
                    </div>
                    {appointment.notes && (
                      <div className="bg-info/10 border border-info/20 rounded-md p-3">
                        <p className="text-sm">
                          <strong className="text-info">Notes:</strong>{" "}
                          {appointment.notes}
                        </p>
                      </div>
                    )}
                    <Badge
                      variant={
                        appointment.status === "scheduled"
                          ? "default"
                          : "secondary"
                      }
                      className="mt-2"
                    >
                      {appointment.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
          </CardContent>
        </Card>
   
      </div>
       {showNotifications && unreadAppointments.length > 0 && (
        <div className="fixed top-20 right-6 w-96 max-h-[500px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-sm">
          <div className="bg-gradient-to-r from-primary to-info p-4 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 animate-pulse" />
                <h2 className="font-bold text-lg">New Appointments</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
                className="hover:bg-white/20 text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-white/80 mt-1">
              {unreadAppointments.length} unread appointment{unreadAppointments.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="overflow-y-auto max-h-[400px] p-4 space-y-3 bg-gray-50">
            {unreadAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white p-4 border border-primary/20 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/40"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800 block">{apt.patient_name}</span>
                      <span className="text-xs text-gray-500">{apt.patient_phone}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAsRead(apt.id)}
                    className="hover:bg-success/10 text-success -mt-1"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm bg-primary/5 p-2 rounded-md">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium text-gray-700">{apt.appointment_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-info/5 p-2 rounded-md">
                    <Clock className="h-4 w-4 text-info" />
                    <span className="font-medium text-gray-700">{apt.appointment_time}</span>
                  </div>
                  {apt.notes && (
                    <div className="bg-amber-50 border border-amber-200 p-2 rounded-md">
                      <p className="text-xs text-amber-900 leading-relaxed">{apt.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
  );
};

export default DoctorDashboard;
