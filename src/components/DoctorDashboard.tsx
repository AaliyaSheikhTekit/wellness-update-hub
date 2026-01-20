// DoctorDashboard.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Bell,
  CheckCircle2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import {
  getPatients,
  updateAppointment,
  getBackendToken,
  getTherapyList,
  getPatient,
  getPatientById,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import CaseSheetView from "./CaseSheetView";
import TreatmentPlanTable from "./TreatmentPlanTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { updatePatientConsult, uploadConsultationReport } from "./DoctoreForm";
import DietTableView from "./Dietician/DietTableView";
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
  patientId?: string;
  patient_name: string;
  patient_phone: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM
  status: AppointmentStatus;
  notes: string | null;
  is_read: boolean;
}

/* ---------------------------- Helpers ---------------------------- */

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

/* ---------------------------- Component --------------------------- */

const DoctorDashboard: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const DOCTOR_ID = localStorage.getItem("doctor_id") || "doctor123";
  const SOCKET_URL = "https://api.ikshanaturopathy.com";

  // Data & loading
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [patientLoading, setPatientLoading] = useState(false);

  // pagination / filters
  const [aptPage, setAptPage] = useState(1);
  const [aptLimit, setAptLimit] = useState(10);
  const [aptTotal, setAptTotal] = useState(0);
  const [aptTotalPages, setAptTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // treatment modal state
  const [openTreatmentModal, setOpenTreatmentModal] = useState(false);
  const [openDietModal, setOpenDietModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [patientFullData, setPatientFullData] = useState<any | null>(null); // fetched patient details
  const [patient, setPatient] = useState<any | null>(null);
  console.log("DoctorDashboard selectedPatient:", selectedPatient);
  const [dialogOpen, setDialogOpen] = useState(false);      
  // doctor form data (keeps minimal fields used here)
  const [doctorData, setDoctorData] = useState<any>({
    treatment: {
      treatmentPlan: { title: "", date: "", timeSlot: "", duration: "" },
      dietChart: { title: "" },
      yogaChart: { title: "" },
    },
    recommandationduration: "",
  });

  // therapy list & selection
  const [therapyList, setTherapyList] = useState<any[]>([]);
  const [opentherapies, setOpenTherapies] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTherapies, setSelectedTherapies] = useState<any[]>([]);
  const filteredTherapies = useMemo(
    () =>
      therapyList.filter((t: any) =>
        (t.treatment || t.title || "")
          .toString()
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [therapyList, search]
  );

  // treatment plan rows
  const [treatmentPlanData, setTreatmentPlanData] = useState<any[]>([]);

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
          patientId: a.patient?.id || a.patientId || a.patient?._id,
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

  /* ------------------------ Fetch therapy list ------------------------ */
  useEffect(() => {
    (async () => {
      try {
        const data = await getTherapyList();
        setTherapyList(data?.data || []);
      } catch (err) {
        console.error("Error fetching therapies:", err);
      }
    })();
  }, []);
  useEffect(() => {
    if (!selectedPatient?.id) return;
    const fetchPatient = async () => {
      try {
        const res = await getPatientById(selectedPatient?.id);
        console.log("Fetched patient response:", res);
        const p = Array.isArray(res?.data) ? res.data[0] : res?.data || res;
        setPatient(p || null);
      } catch (e: any) {
        console.error("Error fetching patient:", e);
      }
    };

    fetchPatient();
  }, [selectedPatient?.id]);
  /* ------------------------ Update Appointment Status ------------------------ */
  const handleStatusChange = async (
    apt: Appointment,
    nextStatus: AppointmentStatus
  ) => {
    const prev = appointments;
    try {
      setUpdatingStatusId(apt.id);
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
      prev.map((apt) =>
        apt.id === appointmentId ? { ...apt, is_read: true } : apt
      )
    );
  };

  /* ---------------------------- Realtime Socket ---------------------------- */
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      socket.emit("registerDoctor", DOCTOR_ID);
    });

    socket.on("newAppointment", (data) => {
      const iso = data.date || "";
      const newAppointment: Appointment = {
        id: data.id,
        patientId: data.patient?.id || data.patientId,
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

    socket.on("disconnect", () => {});
    return () => {
      socket.disconnect();
    };
  }, [DOCTOR_ID]);

  /* ----------------------- Patient pagination derived ----------------------- */
  const patTotal = patients.length;
  const patTotalPages = Math.max(1, Math.ceil(patTotal / 10));
  const patPage = 1;
  const patLimit = 10;
  const pagedPatients = useMemo(() => patients.slice(0, patLimit), [patients]);

  /* ------------------------ Selection helpers ------------------------ */
  const toggleTherapy = (therapy: any) => {
    setSelectedTherapies((prev) => {
      const exists = prev.some((t: any) => t.id === therapy.id);
      if (exists) return prev.filter((t: any) => t.id !== therapy.id);
      return [...prev, therapy];
    });
  };

  const totalSelectedDuration = useMemo(() => {
    return selectedTherapies.reduce(
      (sum, t) => sum + (parseInt(t.duration || t.durationMinutes || "0") || 0),
      0
    );
  }, [selectedTherapies]);

  /* ------------------------ Open Add Treatment ------------------------ */
  const handleOpenAddTreatment = async (apt: Appointment) => {
    // fetch fresh patient data and consultation/treatment details
    try {
      setSelectedPatient({
        id: apt.patientId,
        name: apt.patient_name,
        aptId: apt.id,
      });
      const pId = apt.patientId;
      if (!pId) {
        toast({ title: "Missing patient id", variant: "destructive" });
        return;
      }
      const resp = await getPatient(pId);
      const pd = resp?.data || resp;
      setPatientFullData(pd || null);

      // try to extract existing treatmentPlan and treatment rows
      const existingTreatmentPlan =
        pd?.treatmentPlan ||
        pd?.treatment?.treatmentPlan ||
        pd?.treatment?.recommendation?.treatmentPlan ||
        [];
      const existingRows =
        pd?.treatmentPlanRows ||
        pd?.treatment?.treatmentPlan ||
        pd?.treatmentPlan ||
        [];
      setTreatmentPlanData(Array.isArray(existingRows) ? existingRows : []);

      // set any doctorData.treatment defaults from fetched
      setDoctorData((prev: any) => ({
        ...prev,
        treatment: {
          ...prev.treatment,
          treatmentPlan: {
            title:
              pd?.treatment?.treatmentPlan?.title ||
              pd?.treatmentPlan?.title ||
              prev.treatment?.treatmentPlan?.title ||
              "",
            date:
              pd?.treatment?.treatmentPlan?.date ||
              prev.treatment?.treatmentPlan?.date ||
              "",
            timeSlot:
              pd?.treatment?.treatmentPlan?.timeSlot ||
              prev.treatment?.treatmentPlan?.timeSlot ||
              "",
            duration:
              pd?.treatment?.treatmentPlan?.duration ||
              prev.treatment?.treatmentPlan?.duration ||
              "",
          },
          dietChart: {
            title:
              pd?.treatment?.dietChart?.title ||
              prev.treatment?.dietChart?.title ||
              "",
          },
        },
      }));

      // pre-select therapies if there are existing ones
      const existingTherapyIds =
        (pd?.treatment?.recommendation?.title &&
        Array.isArray(pd.treatment.recommendation.title)
          ? pd.treatment.recommendation.title
          : []) || [];
      const preSelected = therapyList.filter(
        (t) =>
          existingTherapyIds.includes(t.id) ||
          existingTherapyIds.includes(t._id) ||
          existingTherapyIds.includes(t.title)
      );
      setSelectedTherapies(preSelected);

      setOpenTreatmentModal(true);
    } catch (err: any) {
      console.error("Failed to load patient details:", err);
      toast({
        title: "Error",
        description: "Unable to load patient details.",
        variant: "destructive",
      });
    }
  };

  /* ------------------------ Save Treatment (calls update API) ------------------------ */
  const handleSaveTreatment = async () => {
    if (!selectedPatient?.id) {
      toast({ title: "No patient selected", variant: "destructive" });
      return;
    }

    try {
      // Build recommendation object
      const recommendation = {
        treatmentPlan: {
          title: doctorData.treatment?.treatmentPlan?.title || "",
          date: doctorData.treatment?.treatmentPlan?.date || "",
          timeSlot: doctorData.treatment?.treatmentPlan?.timeSlot || "",
          duration:
            doctorData.treatment?.treatmentPlan?.duration ||
            (totalSelectedDuration ? `${totalSelectedDuration} min` : ""),
        },
        // store therapy ids/titles in recommendation.title (as earlier code uses)
        title: selectedTherapies.map(
          (t) => t.id || t._id || t.treatment || t.title
        ),
        duration: totalSelectedDuration ? `${totalSelectedDuration} min` : "",
      };

      const payload: any = {
        recommandation: recommendation,
        treatmentPlan:
          treatmentPlanData && treatmentPlanData.length
            ? treatmentPlanData
            : undefined,
      };

      // If you require a consultationId you can derive from patientFullData
      const consultationId =
        patientFullData?.consultation?.id ||
        patientFullData?.consultationId ||
        patientFullData?.latestConsultationId;

      let result;
      if (consultationId) {
        result = await updatePatientConsult(consultationId, payload);
      }
      toast({ title: "Treatment saved" });
      setOpenTreatmentModal(false);

      // refresh appointments/patient info
      await fetchAppointments();
    } catch (err: any) {
      console.error("Error saving treatment", err);
      toast({
        title: "Failed to save treatment",
        description: err?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  /* ------------------------ Save Diet ------------------------ */
  const handleOpenAddDiet = async (apt: Appointment) => {
    setSelectedPatient({
      id: apt.patientId,
      name: apt.patient_name,
      aptId: apt.id,
    });
    try {
      const resp = await getPatient(apt.patientId || "");
      setPatientFullData(resp?.data || resp);
      // populate doctorData dietChart if existing
      setDoctorData((prev: any) => ({
        ...prev,
        treatment: {
          ...prev.treatment,
          dietChart: {
            title:
              resp?.data?.treatment?.dietChart?.title ||
              prev.treatment?.dietChart?.title ||
              "",
          },
        },
      }));
      setOpenDietModal(true);
    } catch (err) {
      console.error(err);
      toast({ title: "Error loading patient", variant: "destructive" });
    }
  };

  const handleSaveDiet = async () => {
    if (!selectedPatient?.id) return;
    try {
      const payload = {
        recommandation: {
          dietChart: doctorData.treatment?.dietChart,
        },
      };
      const consultationId =
        patientFullData?.consultation?.id ||
        patientFullData?.consultationId ||
        patientFullData?.latestConsultationId;
      if (consultationId) {
        await updatePatientConsult(consultationId, payload);
      }
      toast({ title: "Diet saved" });
      setOpenDietModal(false);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to save diet", variant: "destructive" });
    }
  };
  const latestAppointment =
    Array.isArray(patient?.appointment) && patient.appointment.length > 0
      ? patient.appointment.reduce((latest, current) => {
          const latestDate = new Date(latest.date);
          const currentDate = new Date(current.date);
          return currentDate > latestDate ? current : latest;
        })
      : null;

  const latestAppointmentId = latestAppointment?.id ?? null;
  /* --------------------------- Render UI --------------------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mt-4 gap-4">
        <div className="flex items-center gap-3">
          {appointments.filter((a) => !a.is_read).length > 0 && (
            <Badge
              className="flex items-center gap-1 bg-red-400 text-white shadow-lg animate-pulse cursor-pointer"
              onClick={() => setShowNotifications((s) => !s)}
            >
              <Bell className="h-4 w-4" />
              {appointments.filter((a) => !a.is_read).length} New
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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Appointments Column */}
        <Card className="shadow-card w-full lg:w-1/2">
          <CardHeader className="border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle>Appointments</CardTitle>
              <p className="text-xs text-muted-foreground">
                {loadingAppointments
                  ? "Loading…"
                  : `Page ${aptPage} of ${aptTotalPages} • ${aptTotal} total`}
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {loadingAppointments && (
              <div className="space-y-2 animate-pulse">
                <div className="h-20 rounded-lg bg-muted" />
                <div className="h-20 rounded-lg bg-muted" />
              </div>
            )}

            {!loadingAppointments && appointments.length === 0 && (
              <p className="text-center text-muted-foreground">
                No appointments found
              </p>
            )}

            {!loadingAppointments &&
              appointments.map((apt) => (
                <Card
                  key={apt.id}
                  className={`transition-all rounded-xl border shadow-md hover:shadow-lg ${
                    !apt.is_read ? "border-primary/70" : "border-muted"
                  }`}
                >
                  <CardHeader className="flex justify-between items-start">
                    <div className="w-full">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 flex-wrap">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {apt.patient_name}
                          </span>
                          {!apt.is_read && (
                            <Badge className="ml-2 bg-primary text-white">
                              New
                            </Badge>
                          )}
                          <Badge variant="secondary" className="ml-2">
                            {apt.status}
                          </Badge>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full hover:bg-muted ml-auto"
                            >
                              <MoreVertical className="h-5 w-5 text-gray-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                        View Case Sheet
                      </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleOpenAddTreatment(apt)}
                            >
                              Add Treatment
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleOpenAddDiet(apt)}
                            >
                              Add Diet
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => navigate(`/patient/${apt.patientId}?tab=treatmentplan`)}
                            >
                              View Treatment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/patient/${apt.patientId}?tab=prescription`)}
                            >
                              View Prescription
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="text-sm text-muted-foreground mt-1">
                        {apt.patient_phone}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-md">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {apt.appointment_date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-md">
                      <Clock className="h-4 w-4 text-info" />
                      <span className="font-medium">
                        {apt.appointment_time}
                      </span>
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
                    </div>
                  </CardContent>
                </Card>
              ))}

            {/* Pagination UI simplified */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-muted-foreground">{`Total: ${aptTotal}`}</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAptPage(Math.max(1, aptPage - 1))}
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <div className="text-sm">Page {aptPage}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAptPage(aptPage + 1)}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients Column (keeps same look) */}
        <motion.div className="space-y-4 w-full lg:w-1/2">
          <Card className="shadow-lg">
            <CardHeader className="border-b flex justify-between items-center">
              <CardTitle className="text-lg">Patients</CardTitle>
              <p className="text-xs text-muted-foreground">
                Page {patPage} • {patTotal} total
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
                <p className="text-center text-muted-foreground">
                  No patients found.
                </p>
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
                      (e.key === "Enter" || e.key === " ") &&
                      navigate(`/patient/${p.id || p._id}`)
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
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="truncate text-base font-semibold text-gray-900">
                                  {p.fullName || p.name || "—"}
                                </span>
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
                              <span className="truncate">
                                {p.contactNumber || "—"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                                🆔
                              </span>
                              <span className="truncate">
                                {p.reference || "—"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                                🎂
                              </span>
                              <span className="truncate">
                                {p.dateOfBirth
                                  ? new Date(p.dateOfBirth).toLocaleDateString()
                                  : "—"}
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

              {/* Patients Pagination */}
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Total: {patTotal}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Notifications Panel */}
      {showNotifications &&
        appointments.filter((a) => !a.is_read).length > 0 && (
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
              {appointments
                .filter((a) => !a.is_read)
                .map((apt) => (
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

      {/* Add Treatment Modal */}
      {openTreatmentModal && selectedPatient && (
        <Dialog open={openTreatmentModal} onOpenChange={setOpenTreatmentModal}>
          <DialogContent
            className="
    max-w-3xl 
    w-[95%] sm:w-[85%] md:w-[75%] lg:w-[62%]
    bg-white p-6 rounded-xl 
       max-h-[85vh]        /* 👈 prevents modal from growing too tall */
    overflow-y-auto     /* 👈 scroll content inside */
    overflow-x-hidden 
  "
          >
            <DialogHeader>
              <DialogTitle>
                🩺 Treatment Plan for {selectedPatient.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 w-full overflow-x-hidden">
              {/* Existing Treatments table (component) */}
              <div>
                <TreatmentPlanTable
                  value={treatmentPlanData}
                  onChange={setTreatmentPlanData}
                  includeYoga={true}
                />
              </div>

              {/* Treatment Details */}
              <div className="space-y-6 border-t pt-6 mt-6">
                <h2 className="text-xl font-bold text-amber-700 flex items-center gap-2">
                  🩺 Treatment Details
                </h2>

                <div className="space-y-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <label className="font-semibold text-gray-700 block mb-2">
                    Select Therapies
                  </label>

                  <Popover open={opentherapies} onOpenChange={setOpenTherapies}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {selectedTherapies.length > 0
                          ? selectedTherapies
                              .map((t) => t.treatment || t.title)
                              .join(", ")
                          : "Select therapies"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-[300px] p-2">
                      <Input
                        placeholder="Search therapy..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-2"
                      />
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {filteredTherapies.map((therapy: any) => {
                          const selected = selectedTherapies.some(
                            (t) => t.id === therapy.id
                          );
                          return (
                            <div
                              key={therapy.id}
                              onClick={() => toggleTherapy(therapy)}
                              className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer hover:bg-amber-100 ${
                                selected ? "bg-amber-200" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm">
                                  {therapy.treatment || therapy.title}
                                </span>
                                {therapy.duration && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({therapy.duration} min)
                                  </span>
                                )}
                              </div>
                              {selected && (
                                <Check className="h-4 w-4 text-amber-600" />
                              )}
                            </div>
                          );
                        })}
                        {filteredTherapies.length === 0 && (
                          <div className="text-sm text-gray-500 px-2 py-2">
                            No results
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Duration Calculation */}
                  <div className="mt-4 space-y-3">
                    <h4 className="font-semibold text-gray-800">
                      Therapy Durations
                    </h4>
                    <Input
                      placeholder="Duration (e.g. 60 min)"
                      value={
                        selectedTherapies.length > 0
                          ? `${totalSelectedDuration} min`
                          : doctorData.recommandationduration || ""
                      }
                      readOnly={selectedTherapies.length > 0}
                      onChange={(e) =>
                        setDoctorData((prev: any) => ({
                          ...prev,
                          recommandationduration: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Save */}
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  onClick={handleSaveTreatment}
                >
                  Save Treatment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOpenTreatmentModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Diet Modal */}
      {openDietModal && selectedPatient && (
        <Dialog open={openDietModal} onOpenChange={setOpenDietModal}>
          <DialogContent
            className="
    max-w-3xl 
    w-[95%] sm:w-[85%] md:w-[75%] lg:w-[62%]
    bg-white p-6 rounded-xl 
       max-h-[85vh]        /* 👈 prevents modal from growing too tall */
    overflow-y-auto     /* 👈 scroll content inside */
    overflow-x-hidden 
  "
          >
            <DialogHeader>
              <DialogTitle>
                🥗 Diet Chart for {selectedPatient.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                placeholder="e.g. High-protein vegetarian diet"
                value={doctorData.treatment?.dietChart?.title || ""}
                onChange={(e) =>
                  setDoctorData((prev: any) => ({
                    ...prev,
                    treatment: {
                      ...prev.treatment,
                      dietChart: {
                        ...(prev.treatment?.dietChart || {}),
                        title: e.target.value,
                      },
                    },
                  }))
                }
              />

              {/* show existing diet table for patient */}
              {selectedPatient && (
                <DietTableView
                  patientId={selectedPatient.id}
                  latestAppointmentId={latestAppointmentId}
                  consultationId=""
                  patientName=""
                />
              )}

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleSaveDiet}
                >
                  Save Diet
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOpenDietModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
       {/* ✅ Dialog at parent level */}
     {dialogOpen && patient && (
        <CaseSheetView
          open={dialogOpen} 
          onOpenChange={setDialogOpen}
          patient={patient} 
        />)}
      
    </div>
  );
};

export default DoctorDashboard;
