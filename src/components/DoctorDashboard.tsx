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
  ChevronLeft,
  ChevronRight,
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

/* ----------------------------- Types ----------------------------- */

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
  <Badge className={`${statusClasses[value]} capitalize`}>{value.replace("_", " ")}</Badge>
);

/* ------------------------ Small Pagination UI ------------------------ */

type PaginationBarProps = {
  page: number;
  totalPages: number;
  total?: number;
  limit: number;
  limits?: number[];
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  className?: string;
};

const PaginationBar = ({
  page,
  totalPages,
  total,
  limit,
  limits = [10, 20, 50],
  onPageChange,
  onLimitChange,
  className = "",
}: PaginationBarProps) => {
  // generate a compact page list (1 ... n)
  const pages = useMemo(() => {
    const arr: (number | string)[] = [];
    const add = (v: number | string) => arr.push(v);

    const window = 1; // pages around current
    const start = Math.max(1, page - window);
    const end = Math.min(totalPages, page + window);

    add(1);
    if (start > 2) add("…");
    for (let p = start; p <= end; p++) add(p);
    if (end < totalPages - 1) add("…");
    if (totalPages > 1) add(totalPages);
    return Array.from(new Set(arr)).filter(Boolean);
  }, [page, totalPages]);

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="text-xs text-muted-foreground">
        {typeof total === "number" ? `Total: ${total}` : null}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((p, i) =>
            typeof p === "number" ? (
              <Button
                key={`${p}-${i}`}
                variant={p === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            ) : (
              <span key={`dots-${i}`} className="px-2 text-xs text-muted-foreground">
                {p}
              </span>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>

        {onLimitChange && (
          <div className="ml-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Per page</span>
            <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
              <SelectTrigger className="h-8 w-[78px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {limits.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------------------- Main Screen ---------------------------- */

const DoctorDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const DOCTOR_ID = localStorage.getItem("doctor_id") || "doctor123";
  const SOCKET_URL = "https://api.ikshanaturopathy.com";

  // data
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  // loading
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [patientLoading, setPatientLoading] = useState(false);

  // filters / search
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // optimistic update guard
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // -------- APPOINTMENT PAGINATION (server-side) --------
  const [aptPage, setAptPage] = useState(1);
  const [aptLimit, setAptLimit] = useState(10);
  const [aptTotal, setAptTotal] = useState(0);
  const [aptTotalPages, setAptTotalPages] = useState(1);

  // -------- PATIENT PAGINATION (client-side) --------
  const [patPage, setPatPage] = useState(1);
  const [patLimit, setPatLimit] = useState(10);

  // unread
  const unreadAppointments = useMemo(
    () => appointments.filter((apt) => !apt.is_read),
    [appointments]
  );

  /* --------------------- Fetch Appointments (server) --------------------- */
  const fetchAppointments = useCallback(async () => {
    try {
      setLoadingAppointments(true);
      const token = getBackendToken();
      const res = await fetch(
        `https://api.ikshanaturopathy.com/v1/appointment/get?filter=all&page=${aptPage}&limit=${aptLimit}`,
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
          status: (a.status || "pending") as AppointmentStatus,
          notes: a.note || a.notes || null,
          is_read: false,
        };
      });

      setAppointments(mapped);
      setAptTotal(data?.meta?.total ?? mapped.length);
      setAptTotalPages(data?.meta?.totalPages ?? 1);
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
  }, [aptLimit, aptPage, toast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  /* ---------------------- Fetch Patients (on search) --------------------- */
  useEffect(() => {
    const loadPatients = async () => {
      setPatientLoading(true);
      try {
        const res = await getPatients(searchTerm); // assuming this returns full list by query
        setPatients(res?.data ?? []);
        setPatPage(1); // reset to first page when search changes
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

  /* ------------------------ Update Appointment Status ------------------------ */
  const handleStatusChange = async (apt: Appointment, nextStatus: AppointmentStatus) => {
    const prev = appointments;
    try {
      setUpdatingStatusId(apt.id);
      setAppointments((cur) => cur.map((a) => (a.id === apt.id ? { ...a, status: nextStatus } : a)));
      await updateAppointment(apt.id, { status: nextStatus });
      toast({
        title: "Status updated",
        description: `${apt.patient_name} marked as ${nextStatus.replace("_", " ")}.`,
      });
      // Re-sync current page from server
      await fetchAppointments();
    } catch (e: any) {
      console.error(e);
      setAppointments(prev);
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
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, is_read: true } : apt))
    );
  };

  /* ---------------------------- Realtime Socket ---------------------------- */
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      // console.log("✅ Connected:", socket.id);
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
          ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "",
        status: (data.status || "pending") as AppointmentStatus,
        notes: data.note || null,
        is_read: false,
      };
      // Prepend only if it belongs to the current server page OR simply increase attention
      setAppointments((prev) => [newAppointment, ...prev]);
      setShowNotifications(true);
    });

    socket.on("disconnect", () => {});
    return () => {
      socket.disconnect();
    };
  }, [DOCTOR_ID]);

  /* ----------------------- Derived Patient Pagination ----------------------- */

  const patTotal = patients.length;
  const patTotalPages = Math.max(1, Math.ceil(patTotal / patLimit));
  const pagedPatients = useMemo(() => {
    const start = (patPage - 1) * patLimit;
    return patients.slice(start, start + patLimit);
  }, [patients, patPage, patLimit]);

  /* --------------------------------- UI --------------------------------- */

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
            <p className="text-sm text-muted-foreground">Manage your appointments & patients</p>
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
              {loadingAppointments ? "Loading…" : `Page ${aptPage} of ${aptTotalPages} • ${aptTotal} total`}
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
              <p className="text-center text-muted-foreground">No appointments found</p>
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
                          {!apt.is_read && <Badge className="ml-2 bg-notification text-white">New</Badge>}
                          <div className="ml-2">
                            <StatusBadge value={apt.status} />
                          </div>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{apt.patient_phone}</p>
                      </div>

                      <div className="flex items-start gap-3">
                        {!apt.is_read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(apt.id)}
                            className="hover:bg-success/10 hover:text-success"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Mark as Read
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

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between">
                      <div className="w-full sm:w-64">
                        <Label className="text-xs text-gray-500">Update Status</Label>
                        <Select
                          value={apt.status}
                          onValueChange={(val) => handleStatusChange(apt, val as AppointmentStatus)}
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
                    </div>
                  </CardContent>
                </Card>
              ))}

            {/* Appointments Pagination */}
            <PaginationBar
              page={aptPage}
              totalPages={aptTotalPages}
              total={aptTotal}
              limit={aptLimit}
              onPageChange={(p) => setAptPage(p)}
              onLimitChange={(lim) => {
                setAptLimit(lim);
                setAptPage(1);
              }}
              className="pt-2"
            />
          </CardContent>
        </Card>

        {/* Patients Section */}
        <motion.div className="space-y-4 w-[50%]">
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-sky-50 flex justify-between items-center">
              <CardTitle className="text-lg">Patients</CardTitle>
              <p className="text-xs text-muted-foreground">
                Page {patPage} of {Math.max(1, Math.ceil(patTotal / patLimit))} • {patTotal} total
              </p>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {patientLoading && (
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-muted animate-pulse" />
                  <div className="h-16 rounded-lg bg-muted animate-pulse" />
                </div>
              )}

              {!patientLoading && pagedPatients.length === 0 && (
                <p className="text-center text-muted-foreground">No patients found.</p>
              )}

              {!patientLoading &&
                pagedPatients.map((p) => (
                  <Card
                    key={p.id || p._id}
                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    onClick={() => navigate(`/patient/${p.id || p._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") && navigate(`/patient/${p.id || p._id}`)
                    }
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-indigo-400" />
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-4 sm:gap-5">
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100">
                          <span className="text-sm font-semibold">
                            {(p.fullName || p.name || "?")
                              .split(" ")
                              .map((s: string) => s[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </span>
                          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-white ring-2 ring-white">
                            <User className="h-3.5 w-3.5 text-indigo-500" />
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="truncate text-base font-semibold text-gray-900">
                                  {p.fullName || p.name || "—"}
                                </span>
                                {p.bloodType && (
                                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                                    {p.bloodType}
                                  </span>
                                )}
                                {p.reference && (
                                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700 ring-1 ring-inset ring-sky-200">
                                    Ref: {p.reference}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/patient/${p.id || p._id}`);
                                }}
                              >
                                View Patient
                              </Button>
                            </div>
                          </div>

                          <div className="mt-3 grid gap-2 text-xs text-gray-600 sm:mt-4 sm:grid-cols-3">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                                📞
                              </span>
                              <span className="truncate">{p.contactNumber || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                                🆔
                              </span>
                              <span className="truncate">{p.reference || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                                🎂
                              </span>
                              <span className="truncate">
                                {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pointer-events-none mt-4 hidden items-center justify-end text-[11px] text-gray-400 sm:flex">
                        <span className="transition-opacity group-hover:opacity-100">
                          Press Enter to open
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {/* Patients Pagination (client-side) */}
              <PaginationBar
                page={patPage}
                totalPages={patTotalPages}
                total={patTotal}
                limit={patLimit}
                onPageChange={(p) => setPatPage(p)}
                onLimitChange={(lim) => {
                  setPatLimit(lim);
                  setPatPage(1);
                }}
              />
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
                    <CalendarIcon className="h-4 w-4 text-primary" />
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
