import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Bell,
  CheckCircle2,
  Stethoscope,
  Search,
  X,
} from "lucide-react";
import { getPatients, updateAppointment, getBackendToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "rescheduled"
  | "no_show";

interface Appointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM
  status: AppointmentStatus;
  notes: string | null;
  is_read: boolean;
}

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
  { value: "rescheduled", label: "Rescheduled" },
  { value: "no_show", label: "No Show" },
];

const statusClasses: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  confirmed: "bg-green-100 text-green-800 border border-green-300",
  cancelled: "bg-red-100 text-red-800 border border-red-300",
  completed: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  rescheduled: "bg-violet-100 text-violet-800 border border-violet-300",
  no_show: "bg-orange-100 text-orange-800 border border-orange-300",
};

const StatusBadge = ({ value }: { value: AppointmentStatus }) => (
  <Badge className={`${statusClasses[value]} capitalize`}>
    {value.replace("_", " ")}
  </Badge>
);

const DoctorDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const DOCTOR_ID = localStorage.getItem("doctor_id") || "doctor123";
  const SOCKET_URL = "https://api.ikshanaturopathy.com";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [patientLoading, setPatientLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const unreadAppointments = useMemo(
    () => appointments.filter((apt) => !apt.is_read),
    [appointments]
  );

  // --- Fetch appointments (extracted so we can call it after updates) ---
  const fetchAppointments = useCallback(async () => {
    try {
      setLoadingAppointments(true);
      const token = getBackendToken();
      const res = await fetch(
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

      const mapped: Appointment[] = (data?.data || []).map((a: any) => {
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
          appointment_date: iso.split("T")[0] || "",
          appointment_time: time,
          status: (a.status ||
            "pending") as AppointmentStatus, // server status mapping
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
        variant: "destructive",
      });
    } finally {
      setLoadingAppointments(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // --- Fetch patients on search ---
  useEffect(() => {
    const loadPatients = async () => {
      setPatientLoading(true);
      try {
        const res = await getPatients(searchTerm);
        setPatients(res?.data ?? []);
      } catch (err) {
        toast({
          title: "Error fetching patients",
          description: "Unable to load patients from the server.",
          variant: "destructive",
        });
      } finally {
        setPatientLoading(false);
      }
    };
    loadPatients();
  }, [searchTerm, toast]);

  // --- Status change handler ---
  const handleStatusChange = async (
    apt: Appointment,
    nextStatus: AppointmentStatus
  ) => {
    const prev = appointments; // snapshot for rollback
    try {
      setUpdatingStatusId(apt.id);

      // optimistic update
      setAppointments((cur) =>
        cur.map((a) => (a.id === apt.id ? { ...a, status: nextStatus } : a))
      );

      await updateAppointment(apt.id, { status: nextStatus });

      toast({
        title: "Status updated",
        description: `${apt.patient_name} marked as ${nextStatus.replace(
          "_",
          " "
        )}.`,
      });

      // Optionally re-sync from server
      await fetchAppointments();
    } catch (e: any) {
      console.error(e);
      setAppointments(prev); // rollback
      toast({
        title: "Failed to update status",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const markAsRead = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId ? { ...apt, is_read: true } : apt
      )
    );
  };

  // --- Socket setup for real-time appointments ---
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("✅ Connected with id:", socket.id);
      socket.emit("registerDoctor", DOCTOR_ID);
    });

    socket.on("newAppointment", (data) => {
      const iso = data.date || "";
      const newAppointment: Appointment = {
        id: data.id,
        patient_name: data.patientName || "Unknown",
        patient_phone: data.patientPhone || "—",
        appointment_date: iso.split("T")[0] || "",
        appointment_time: iso
          ? new Date(iso).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        status: (data.status || "pending") as AppointmentStatus,
        notes: data.note || null,
        is_read: false,
      };
      setAppointments((prev) => [newAppointment, ...prev]);
      setShowNotifications(true);
    });

    socket.on("disconnect", () => console.log("Disconnected from socket"));
    return () => {
      socket.disconnect();
    };
  }, [DOCTOR_ID]);

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
              onClick={() => setShowNotifications((s) => !s)}
            >
              <Bell className="h-4 w-4" />
              {unreadAppointments.length} New
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
      </div>

      <div className="flex flex-row w-full gap-6 ">
        {/* Appointments Section */}
        <Card className="shadow-card w-[50%]">
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
              appointments.map((apt) => (
                <Card
                  key={apt.id}
                  className={`transition-all hover:shadow-elevated ${
                    !apt.is_read ? "border-primary border-2 shadow-lg" : "shadow-card"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <div className="rounded-full bg-primary/10 p-2">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          {apt.patient_name}
                          {!apt.is_read && (
                            <Badge className="ml-2 bg-notification text-white">
                              New
                            </Badge>
                          )}
                          {/* Status badge next to name */}
                          <div className="ml-2">
                            <StatusBadge value={apt.status} />
                          </div>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {apt.patient_phone}
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        {!apt.is_read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(apt.id)}
                            className="hover:bg-success/10 hover:text-success"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Mark as
                            Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-md">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      <span className="font-medium">{apt.appointment_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-md">
                      <Clock className="h-4 w-4 text-info" />
                      <span className="font-medium">{apt.appointment_time}</span>
                    </div>
                    {apt.notes && (
                      <div className="bg-info/10 border border-info/20 rounded-md p-3">
                        <p className="text-sm">
                          <strong>Notes:</strong> {apt.notes}
                        </p>
                      </div>
                    )}

                    {/* Status dropdown + quick action */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between">
                      <div className="w-full sm:w-64">
                        <Label className="text-xs text-gray-500">
                          Update Status
                        </Label>
                        <Select
                          value={apt.status}
                          onValueChange={(val) =>
                            handleStatusChange(apt, val as AppointmentStatus)
                          }
                          disabled={updatingStatusId === apt.id}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/patient/${apt.id}`)}
                        >
                          View Patient
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </CardContent>
        </Card>

        {/* Patients Section */}
        <motion.div className="space-y-4 w-[50%]">
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-sky-50 flex justify-between items-center">
              <CardTitle className="text-lg">Patients</CardTitle>
              <p className="text-xs text-muted-foreground">
                {patients.length} record{patients.length !== 1 ? "s" : ""}
              </p>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {patientLoading && (
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-muted animate-pulse" />
                  <div className="h-16 rounded-lg bg-muted animate-pulse" />
                </div>
              )}
              {!patientLoading && patients.length === 0 && (
                <p className="text-center text-muted-foreground">
                  No patients found.
                </p>
              )}
              {!patientLoading &&
                patients.map((p) => (
                  <Card
                    key={p.id || p._id}
                    className="border-l-4 border-indigo-400 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/patient/${p.id || p._id}`)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
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
                          <div>Phone: {p.contactNumber || "—"}</div>
                          <div>Reference: {p.reference || "—"}</div>
                          <div>
                            DOB:{" "}
                            {p.dateOfBirth
                              ? new Date(p.dateOfBirth).toLocaleDateString()
                              : "—"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && unreadAppointments.length > 0 && (
        <div className="fixed top-20 right-6 w-96 max-h-[500px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-sm">
          <div className="bg-gradient-to-r from-primary to-info p-4 text-white flex justify-between items-center">
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
                      <span className="font-semibold text-gray-800 block">
                        {apt.patient_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {apt.patient_phone}
                      </span>
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
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span className="font-medium text-gray-700">
                      {apt.appointment_date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-info/5 p-2 rounded-md">
                    <Clock className="h-4 w-4 text-info" />
                    <span className="font-medium text-gray-700">
                      {apt.appointment_time}
                    </span>
                  </div>
                  {apt.notes && (
                    <div className="bg-amber-50 border border-amber-200 p-2 rounded-md">
                      <p className="text-xs text-amber-900 leading-relaxed">
                        {apt.notes}
                      </p>
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
