import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Bell, CheckCircle2, Stethoscope, Search } from "lucide-react";
import { format } from "date-fns";
import { getBackendToken, getPatients } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";

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
const [searchTerm, setSearchTerm] = useState("");
  const markAsRead = (appointmentId: string) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, is_read: true } : apt
    ));
  };
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

  const unreadCount = appointments.filter(apt => !apt.is_read).length;

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
        </div>
        {unreadCount > 0 && (
          <Badge className="flex items-center gap-1 bg-red-400 text-white shadow-lg animate-pulse">
            <Bell className="h-4 w-4" />
            {unreadCount} New
          </Badge>
        )}
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
      </div>
  );
};

export default DoctorDashboard;
