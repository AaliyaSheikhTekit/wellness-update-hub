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
  Phone,
  Cake,
  ArrowRight,
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
 const filteredTherapies = useMemo(() => {
  const searchText = search.toLowerCase().trim();

  return therapyList.filter((t: any) => {
    const treatment = (t.treatment || t.title || "")
      .toString()
      .toLowerCase();

    const shortForm = (t.shortForm || "")
      .toString()
      .toLowerCase();

    return (
      treatment.includes(searchText) ||
      shortForm.includes(searchText)
    );
  });
}, [therapyList, search]);
console.log("DoctorDashboard selectedTherapies:", filteredTherapies,therapyList);
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

const pd = Array.isArray(resp?.data)
  ? resp.data[0]
  : resp?.data || resp;

console.log("Fetched patient response:", pd);

setPatientFullData(pd);
setPatient(pd);

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
    toast({
      title: "No patient selected",
      variant: "destructive",
    });
    return;
  }

  try {
    const latestAppointment =
      patientFullData?.appointment?.length > 0
        ? patientFullData.appointment.reduce(
            (latest: any, current: any) =>
              new Date(current.date) >
              new Date(latest.date)
                ? current
                : latest
          )
        : null;

    const consultationId =
      latestAppointment?.consultation?.length > 0
        ? latestAppointment.consultation[
            latestAppointment.consultation.length - 1
          ]?.id
        : null;

    const appointmentId =
      latestAppointment?.id ||
      selectedPatient?.aptId;

    const recommendation = {
      title: selectedTherapies.map(
        (t: any) =>
          t.id ||
          t._id ||
          t.treatment ||
          t.title
      ),
      duration: totalSelectedDuration
        ? `${totalSelectedDuration} min`
        : "",
    };

    const payload = {
       patientId: selectedPatient?.id,
  appointmentId: latestAppointment?.id,

      treatment: {
        recommendation,
      },

      treatmentPlan:
        treatmentPlanData?.length > 0
          ? treatmentPlanData
          : [],
    };

    console.log(
      "Saving treatment",
      consultationId,
      payload
    );

    await updatePatientConsult(
      consultationId || "",
      payload
    );

    toast({
      title: "Treatment saved successfully",
    });

    setOpenTreatmentModal(false);

    await fetchAppointments();

    const refreshed =
      await getPatientById(
        selectedPatient.id
      );

    const patientData = Array.isArray(
      refreshed?.data
    )
      ? refreshed.data[0]
      : refreshed?.data;

    setPatient(patientData);
    setPatientFullData(patientData);
  } catch (err: any) {
    console.error(
      "Error saving treatment",
      err
    );

    toast({
      title: "Failed to save treatment",
      description:
        err?.message ||
        "Please try again",
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

const pd = Array.isArray(resp?.data)
  ? resp.data[0]
  : resp?.data || resp;

console.log("Fetched patient response:", pd);

setPatientFullData(pd);
setPatient(pd);
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
        recommendation: {
          dietChart: doctorData.treatment?.dietChart,
        },
      };
     const latestAppointment =
  patientFullData?.appointment?.length
    ? patientFullData.appointment.reduce(
        (latest: any, current: any) =>
          new Date(current.date) >
          new Date(latest.date)
            ? current
            : latest
      )
    : null;

const consultationId =
  latestAppointment?.consultation?.length > 0
    ? latestAppointment.consultation[
        latestAppointment.consultation.length - 1
      ]?.id
    : null;

console.log("Consultation Id:", consultationId);
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


const patientId = patient?.id || selectedPatient?.id || null;



const latestAppointment =
  patientFullData?.appointment?.length
    ? patientFullData.appointment.reduce(
        (latest: any, current: any) =>
          new Date(current.date) >
          new Date(latest.date)
            ? current
            : latest
      )
    : null;
const appointmentId =
  latestAppointment?.id ||
  selectedPatient?.aptId ||
  null;
const consultationId =
  latestAppointment?.consultation?.length > 0
    ? latestAppointment.consultation[
        latestAppointment.consultation.length - 1
      ]?.id
    : null;

console.log("Diet/Treatment IDs", {
  patientId,
  appointmentId,
  consultationId,
});
console.log(patient, patientFullData, selectedPatient,'------------------');
const handleOpenCaseSheet = async (apt: Appointment) => {
  try {
    const resp = await getPatient(apt.patientId || "");

    const pd = Array.isArray(resp?.data)
      ? resp.data[0]
      : resp?.data || resp;

    setPatient(pd);
    setDialogOpen(true);
  } catch (err) {
    console.error(err);

    toast({
      title: "Error",
      description: "Unable to load patient details",
      variant: "destructive",
    });
  }
};
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
      className={`group relative overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
        !apt.is_read
          ? "border-primary/40 shadow-md shadow-primary/5"
          : "border-border/60 shadow-sm"
      }`}
    >
      {/* Accent bar */}
      <div
        className={`absolute left-0 top-0 h-full w-1 ${
          !apt.is_read ? "bg-primary" : "bg-muted"
        }`}
      />

      {/* "New" ribbon */}
      {apt.status === "pending" && (
        <div className="absolute left-3 top-3 z-10">
          <Badge className="bg-primary text-primary-foreground shadow-sm">
            New
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/5">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold leading-tight text-foreground">
                {apt.patient_name}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {apt.patient_phone}
              </p>
              <Badge
                variant="outline"
                className="mt-2 rounded-full border-border/70 px-2 py-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
              >
                {apt.status}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full hover:bg-muted"
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => handleOpenCaseSheet(apt)}>
                View Case Sheet
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleOpenAddTreatment(apt)}>
                Add Treatment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenAddDiet(apt)}>
                Add Diet
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  navigate(`/patient/${apt.patientId}?tab=treatmentplan`)
                }
              >
                View Treatment
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate(`/patient/${apt.patientId}?tab=prescription`)
                }
              >
                View Prescription
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pl-6">
        {/* Date / Time pills */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/40 px-3 py-2.5">
            <CalendarIcon className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Date
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {apt.appointment_date}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/40 px-3 py-2.5">
            <Clock className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Time
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {apt.appointment_time}
              </p>
            </div>
          </div>
        </div>

        {apt.notes && (
          <div className="rounded-xl border-l-2 border-primary/40 bg-primary/5 px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wide text-primary/80">
              Notes
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
              {apt.notes}
            </p>
          </div>
        )}

        {/* Status updater */}
        <div className="border-t border-border/50 pt-3">
          <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Update Status
          </Label>
          <Select
            value={apt.status}
            onValueChange={(val) =>
              handleStatusChange(apt, val as AppointmentStatus)
            }
            disabled={updatingStatusId === apt.id}
          >
            <SelectTrigger className="mt-1.5 h-10 rounded-lg">
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
  pagedPatients.map((p) => {
    const id = p.id || p._id;
    const name = p.fullName || p.name || "—";
    const initials = (p.fullName || p.name || "?")
      .split(" ")
      .map((s: string) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    const canConsult = ["Naturopathy Doctor", "superAdmin"].includes(
      localStorage.getItem("userName") || ""
    );

    return (
      <Card
        key={id}
        onClick={() => navigate(`/patient/${id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && navigate(`/patient/${id}`)
        }
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        {/* Gradient accent bar */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />

        {/* Decorative blob */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60" />

        <CardContent className="relative p-5 sm:p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200 ring-4 ring-white">
                <span className="text-base font-bold tracking-wide">
                  {initials}
                </span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            {/* Main */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-slate-900">
                    {name}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    Patient ID · {p.reference || "N/A"}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>

              {/* Info grid */}
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  <Phone className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="truncate font-medium">
                    {p.contactNumber || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  <Cake className="h-3.5 w-3.5 text-pink-500" />
                  <span className="truncate font-medium">
                    {p.dateOfBirth
                      ? new Date(p.dateOfBirth).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
                {canConsult && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/patient-form/${id}`);
                    }}
                    className="h-8 border-indigo-200 bg-indigo-50/50 text-xs font-medium text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800"
                  >
                    Give Consultancy
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/patient/${id}`);
                  }}
                  className="h-8 bg-slate-900 text-xs font-medium text-white hover:bg-slate-800"
                >
                  View Patient
                  <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  })}


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
    <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-5xl max-h-[92vh] p-0 overflow-hidden flex flex-col gap-0">
      {/* Sticky Header */}
      <DialogHeader className="px-5 sm:px-8 py-5 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center text-xl shrink-0">
            🩺
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-base sm:text-lg font-semibold truncate">
              Treatment Plan
            </DialogTitle>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              For <span className="font-medium text-foreground">{selectedPatient.name}</span>
            </p>
          </div>
        </div>
      </DialogHeader>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-6 bg-muted/20">
        {/* Existing Treatments */}
        <section className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <header className="px-4 py-3 border-b bg-muted/40">
            <h3 className="text-sm font-semibold">Existing Treatment Plan</h3>
          </header>
          <div className="p-4 overflow-x-auto">
             <TreatmentPlanTable
                  value={treatmentPlanData}
                  onChange={setTreatmentPlanData}
                  includeYoga={true}
                />
          </div>
        </section>

        {/* Treatment Details */}
        <section className="rounded-xl border bg-card shadow-sm">
          <header className="px-4 py-3 border-b bg-muted/40 flex items-center gap-2">
            <span>🩺</span>
            <h3 className="text-sm font-semibold">Treatment Details</h3>
          </header>

          <div className="p-4 sm:p-5 grid gap-5 sm:grid-cols-2">
            {/* Therapies */}
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Select Therapies
              </Label>
              <Popover open={opentherapies} onOpenChange={setOpenTherapies}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-auto min-h-10 py-2 text-left"
                  >
                    <span className="truncate whitespace-normal text-sm">
                      {selectedTherapies.length > 0
                        ? selectedTherapies.map((t) => t.treatment || t.title).join(", ")
                        : <span className="text-muted-foreground">Select therapies…</span>}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-2 w-[--radix-popover-trigger-width] max-h-[60vh]"
                  align="start"
                >
                  <Input
                    placeholder="Search therapy…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mb-2 h-9"
                  />
                  <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                    {filteredTherapies.map((therapy: any) => {
                      const selected = selectedTherapies.some((t) => t.id === therapy.id);
                      return (
                        <div
                          key={therapy.id}
                          onClick={() => toggleTherapy(therapy)}
                          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${
                            selected
                              ? "bg-primary/15 text-foreground"
                              : "hover:bg-accent"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">
                              {therapy.treatment || therapy.title}
                            </div>
                            <div className="text-xs text-muted-foreground flex gap-2">
                              {therapy.shortForm && <span>{therapy.shortForm}</span>}
                              {therapy.duration && <span>· {therapy.duration} min</span>}
                            </div>
                          </div>
                          {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                        </div>
                      );
                    })}
                    {filteredTherapies.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground py-6">
                        No results
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Selected chips */}
              {selectedTherapies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedTherapies.map((t: any) => (
                    <Badge
                      key={t.id}
                      variant="secondary"
                      className="gap-1 pl-2 pr-1 py-1"
                    >
                      {t.treatment || t.title}
                      <button
                        type="button"
                        onClick={() => toggleTherapy(t)}
                        className="hover:bg-background/60 rounded p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Total Therapy Duration
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={
                    selectedTherapies.length > 0
                      ? `${totalSelectedDuration} min`
                      : doctorData.recommandationduration || ""
                  }
                  readOnly={selectedTherapies.length > 0}
                  placeholder="e.g. 45 min"
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
        </section>
      </div>

      {/* Sticky Footer */}
      <div className="px-5 sm:px-8 py-4 border-t bg-background flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setOpenTreatmentModal(false)}
          className="sm:w-32"
        >
          Cancel
        </Button>
        <Button onClick={handleSaveTreatment} className="sm:w-40">
          Save Treatment
        </Button>
      </div>
    </DialogContent>
  </Dialog>
)}


      {/* Add Diet Modal */}
{openDietModal && selectedPatient && (
  <Dialog open={openDietModal} onOpenChange={setOpenDietModal}>
    <DialogContent
      className="
        p-0 gap-0 overflow-hidden rounded-2xl border border-border
        bg-background shadow-2xl
        w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw]
        max-w-4xl max-h-[90vh]
        flex flex-col
      "
    >
      {/* Sticky gradient header */}
      <DialogHeader
        className="
          sticky top-0 z-10 px-6 py-5
          bg-gradient-to-r from-emerald-500/10 via-primary/5 to-transparent
          border-b border-border
        "
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 text-2xl">
            🥗
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground">
              Diet Chart
            </DialogTitle>
            <p className="mt-0.5 text-sm text-muted-foreground truncate">
              Personalized plan for{" "}
              <span className="font-medium text-foreground">
                {selectedPatient.name}
              </span>
            </p>
          </div>
        </div>
      </DialogHeader>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/20 px-4 sm:px-6 py-5 space-y-5">
        {/* Title card */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Diet Plan Title
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Input
              placeholder="e.g. High-protein vegetarian diet"
              className="h-10 bg-background"
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
            <p className="mt-2 text-xs text-muted-foreground">
              Give this diet chart a short, descriptive name.
            </p>
          </CardContent>
        </Card>

        {/* Existing diet table */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Current Diet Plan
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
              Live
            </Badge>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="rounded-lg border border-border bg-background overflow-hidden">
              <DietTableView
                patientId={patientId}
                latestAppointmentId={appointmentId}
                consultationId={consultationId}
                patientName={selectedPatient.name}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky footer */}
      <div
        className="
          sticky bottom-0 z-10
          flex flex-col-reverse sm:flex-row sm:justify-end gap-2
          border-t border-border bg-background/95 backdrop-blur
          px-4 sm:px-6 py-3
        "
      >
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => setOpenDietModal(false)}
        >
          Cancel
        </Button>
        <Button
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-600/90 text-white"
          onClick={() => setOpenDietModal(false)}
        >
          Save Diet Chart
        </Button>
      </div>
    </DialogContent>
  </Dialog>
)}

    {dialogOpen && patientFullData && (
  <CaseSheetView
    open={dialogOpen}
    onOpenChange={setDialogOpen}
    patient={patientFullData}
  />
)}
      
    </div>
  );
};

export default DoctorDashboard;
