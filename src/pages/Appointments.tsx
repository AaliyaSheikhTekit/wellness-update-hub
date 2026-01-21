import { useEffect, useMemo, useState } from "react";
import { Clock, User, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { appointmentPost, getBackendToken, getDoctors } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { StatusButtons } from "@/components/StatusButtons";

/* ------------------------ Types ------------------------ */
interface Doctor {
  id: string;
  username: string;
  status?: string;
  role?: string;
}
interface Appointment {
  id: string;
  patient?: { id: string; fullName: string; contactNumber?: string } | null;
  doctor?: Doctor | null;
  date: string; // yyyy-MM-dd
  time?: string; // hh:mm
  status: AppointmentStatus;
  note?: string;
  prescriptions?: any[];
  consultationType?: string;
  phoneNo?: string;
}
type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "rescheduled"
  | "no_show";

type TabKey =
  | "all"
  | "today"
  | "upcoming"
  | "calendar"
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "rescheduled"
  | "no_show";

/* ------------------------ Status UI ------------------------ */
const statusClasses: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  confirmed: "bg-green-100 text-green-800 border border-green-300",
  cancelled: "bg-red-100 text-red-800 border border-red-300",
  completed: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  rescheduled: "bg-violet-100 text-violet-800 border border-violet-300",
  no_show: "bg-orange-100 text-orange-800 border border-orange-300",
};

const StatusBadge = ({ value }: { value: string }) => {
  const v = (value as AppointmentStatus) || "pending";
  return (
    <Badge
      className={`${
        statusClasses[v] ?? "bg-gray-100 text-gray-800 border"
      } capitalize`}
    >
      {v.replace("_", " ")}
    </Badge>
  );
};

/* ------------------------ Simple Calendar ------------------------ */
interface SimpleCalendarProps {
  appointments: Appointment[];
  onEventClick?: (apt: Appointment) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

const SimpleCalendar = ({
  appointments,
  onEventClick,
  selectedDate,
  setSelectedDate,
}: SimpleCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (dir: number) => {
    setCurrentDate((prev) => {
      const nd = new Date(prev);
      nd.setMonth(prev.getMonth() + dir);
      return nd;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(day);
    return days;
  };

  const getAppointmentsForDay = (day: number | null) => {
    if (!day) return [] as Appointment[];
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date + "T00:00:00");
      return (
        aptDate.getFullYear() === currentDate.getFullYear() &&
        aptDate.getMonth() === currentDate.getMonth() &&
        aptDate.getDate() === day
      );
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 border-green-300 text-green-800";
      case "pending":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "cancelled":
        return "bg-red-100 border-red-300 text-red-800";
      case "completed":
        return "bg-emerald-100 border-emerald-300 text-emerald-800";
      case "rescheduled":
        return "bg-violet-100 border-violet-300 text-violet-800";
      case "no_show":
        return "bg-orange-100 border-orange-300 text-orange-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={() => navigateMonth(-1)}>
          ← Previous
        </Button>
        <h2 className="text-xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <Button variant="outline" onClick={() => navigateMonth(1)}>
          Next →
        </Button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map((day) => (
          <div key={day} className="text-center font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {getDaysInMonth(currentDate).map((day, index) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isToday =
            !!day &&
            currentDate.getMonth() === new Date().getMonth() &&
            currentDate.getFullYear() === new Date().getFullYear() &&
            day === new Date().getDate();

          const dateStr = day
            ? `${currentDate.getFullYear()}-${String(
                currentDate.getMonth() + 1
              ).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            : "";

          return (
            <div
              key={index}
              className={`min-h-32 p-1 border rounded-lg ${
                day
                  ? "bg-white hover:bg-gray-50 cursor-pointer"
                  : "bg-transparent"
              } ${isToday ? "ring-2 ring-blue-500" : ""} ${
                selectedDate === dateStr ? "ring-2 ring-indigo-500" : ""
              }`}
              onClick={() => day && setSelectedDate(dateStr)}
            >
              {day && (
                <>
                  <div
                    className={`font-medium text-sm mb-1 p-1 ${
                      isToday
                        ? "bg-blue-500 text-white rounded text-center"
                        : ""
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {dayAppointments.slice(0, 3).map((apt, i) => (
                      <div
                        key={i}
                        className={`text-xs p-2 rounded border hover:opacity-80 transition-opacity ${getStatusColor(
                          apt.status
                        )}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(apt);
                        }}
                        title={`${apt.patient?.fullName || "Unknown"} - ${
                          apt.time || "N/A"
                        }`}
                      >
                        <div className="font-medium truncate">
                          {apt.patient?.fullName || "Unknown"}
                        </div>
                        <div className="truncate opacity-75">
                          {apt.time || "N/A"}
                        </div>
                        {apt.note && (
                          <div className="truncate text-xs opacity-60">
                            {apt.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------ Main Component ------------------------ */
const Appointments = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Collections
  const [appointmentsPage, setAppointmentsPage] = useState<Appointment[]>([]);
  const [appointmentsAll, setAppointmentsAll] = useState<Appointment[]>([]);

  // Calendar
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Pagination (for All tab list)
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Tabs
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  // Dialogs
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [editAppointmentOpen, setEditAppointmentOpen] = useState(false);
  const [viewAppointmentOpen, setViewAppointmentOpen] = useState(false);

  // Selected event
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);

  // Form states
  const [patientName, setPatientName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("");
  const [doctor, setDoctors] = useState<Doctor[]>([]);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorId, setDoctorId] = useState<string>("");
  const [doctorDisplay, setDoctorDisplay] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [patientNumber, setPatientNumber] = useState("");

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ------------------------ Doctors fetch ------------------------ */
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await getDoctors(doctorSearch);
        if (!ignore) setDoctors(res?.data ?? []);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [doctorSearch]);

  /* ------------------------ Appointments: fetch (paged list) ------------------------ */
  const mapApiAppointment = (appt: any): Appointment => ({
    id: appt.id,
    patient: appt.patient
      ? {
          id: appt.patient.id || "unknown",
          fullName: appt.patient.fullName || appt.patientName || "Unknown",
          contactNumber: appt.patient.contactNumber || "",
        }
      : {
          id: "unknown",
          fullName: appt.patientName || "Unknown",
          contactNumber: "",
        },
    doctor: appt.doctor
      ? {
          id: appt.doctor.id || "unknown",
          username: appt.doctor.username || "N/A",
        }
      : {
          id: "unknown",
          username: typeof appt.doctor === "string" ? appt.doctor : "N/A",
        },
    date: appt.date ? appt.date.split("T")[0] : "",
    time: appt.date
      ? new Date(appt.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    status: (appt.status ?? "pending") as AppointmentStatus,
    note: appt.note,
    prescriptions: appt.prescriptions || [],
    consultationType: appt.consultationType,
    phoneNo: appt.phoneNo,
  });

  const fetchAppointmentsPage = async () => {
    try {
      const token = getBackendToken();
      const filter = activeTab === "today" ? "today" : "all";
      const res = await fetch(
        `https://api.ikshanaturopathy.com/v1/appointment/get?page=${page}&limit=${limit}&filter=${filter}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await res.json();

      const mapped = (result.data || []).map(mapApiAppointment);
      setAppointmentsPage(mapped);
      setTotalPages(result.meta?.totalPages || 1);
    } catch (e) {
      console.error(e);
    }
  };

  /* ------------------------ Appointments: fetch (all pages, for calendar/upcoming/status) ------------------------ */
  const fetchAppointmentsAll = async (filter: "all" | "today" = "all") => {
    try {
      const token = getBackendToken();

      // Get page 1 to learn total pages
      const firstRes = await fetch(
        `https://api.ikshanaturopathy.com/v1/appointment/get?page=1&limit=${limit}&filter=${filter}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const firstJson = await firstRes.json();
      const total = firstJson.meta?.totalPages || 1;

      let all: Appointment[] = (firstJson.data || []).map(mapApiAppointment);

      // Fetch remaining pages in parallel if any
      if (total > 1) {
        const promises = [];
        for (let p = 2; p <= total; p++) {
          promises.push(
            fetch(
              `https://api.ikshanaturopathy.com/v1/appointment/get?page=${p}&limit=${limit}&filter=${filter}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            ).then((r) => r.json())
          );
        }
        const pages = await Promise.all(promises);
        for (const pg of pages) {
          all = all.concat((pg.data || []).map(mapApiAppointment));
        }
      }

      // De-duplicate by id
      const dedup = Array.from(new Map(all.map((a) => [a.id, a])).values());
      setAppointmentsAll(dedup);
    } catch (e) {
      console.error(e);
    }
  };

  // Initial & reactive fetches
  useEffect(() => {
    // For list
    fetchAppointmentsPage();
    // For calendar/upcoming/status buckets
    fetchAppointmentsAll(activeTab === "today" ? "today" : "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTab]);

  /* ------------------------ Derived Lists ------------------------ */
  const todayISO = useMemo(() => new Date().toISOString().split("T")[0], []);
  const todaysAppointments = useMemo(
    () => appointmentsAll.filter((a) => a.date === todayISO),
    [appointmentsAll, todayISO]
  );
  const upcomingAppointments = useMemo(
    () => appointmentsAll.filter((a) => new Date(a.date) >= new Date(todayISO)),
    [appointmentsAll, todayISO]
  );
  // Status buckets
  const pendingAppointments = useMemo(
    () => appointmentsAll.filter((a) => a.status === "pending"),
    [appointmentsAll]
  );
  const confirmedAppointments = useMemo(
    () => appointmentsAll.filter((a) => a.status === "confirmed"),
    [appointmentsAll]
  );
  const cancelledAppointments = useMemo(
    () => appointmentsAll.filter((a) => a.status === "cancelled"),
    [appointmentsAll]
  );
  const completedAppointments = useMemo(
    () => appointmentsAll.filter((a) => a.status === "completed"),
    [appointmentsAll]
  );
  const rescheduledAppointments = useMemo(
    () => appointmentsAll.filter((a) => a.status === "rescheduled"),
    [appointmentsAll]
  );
  const noShowAppointments = useMemo(
    () => appointmentsAll.filter((a) => a.status === "no_show"),
    [appointmentsAll]
  );

  /* ------------------------ Validation ------------------------ */
 

  const refetchForActiveTab = async () => {
    if (activeTab === "all") {
      await fetchAppointmentsPage();
      await fetchAppointmentsAll("all");
    } else if (activeTab === "today") {
      await fetchAppointmentsAll("today");
      await fetchAppointmentsPage();
    } else {
      await fetchAppointmentsAll("all");
      await fetchAppointmentsPage();
    }
  };


const validateAppointment = () => {
  const newErrors: any = {};

  // ✅ Patient name: required + min 2 chars
  if (!patientName.trim()) {
    newErrors.patientName = "Patient name is required.";
  } else if (patientName.trim().length < 2) {
    newErrors.patientName = "Name must be at least 2 characters.";
  }

  // ✅ Patient number: must be valid 10-digit phone number
  if (!patientNumber.trim()) {
    newErrors.patientNumber = "Patient mobile number is required.";
  } else if (!/^[6-9]\d{9}$/.test(patientNumber)) {
    newErrors.patientNumber = "Enter a valid 10-digit Indian mobile number.";
  }

  // ✅ Date: required + not past date
  if (!date) {
    newErrors.date = "Date is required.";
  } else {
    const today = new Date();
    const selected = new Date(date);
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      newErrors.date = "Date cannot be in the past.";
    }
  }

  // ✅ Time: required
  if (!time) {
    newErrors.time = "Time is required.";
  }

  // ✅ Doctor: required
  if (!doctorId) {
    newErrors.doctorId = "Please select a doctor.";
  }

  // ✅ Appointment type: required
  if (!type) {
    newErrors.type = "Appointment type is required.";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  /* ------------------------ Handlers ------------------------ */
  const handleBookAppointment = async () => {
    if (!validateAppointment()) return;

    const payload = {
      date: new Date(`${date}T${time}`).toISOString(),
      consultationType: type,
      patient: patientName,
      phoneNo: patientNumber,
      doctor: doctorId,
      type: "Consultation",
      note: notes || "New appointment",
    };

    try {
      const res = await appointmentPost("/appointment/create", payload);
      if ((res as any)?.id) {
        await refetchForActiveTab();
        toast({
          title: "Appointment booked",
          description: "Successfully added.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to book appointment." });
    } finally {
      setNewAppointmentOpen(false);
    }
  };

  const handleUpdateAppointment = async () => {
    if (!selectedEvent || !validateAppointment()) return;

    const payload: any = {
      date: new Date(`${date}T${time}`).toISOString(),
      type: "Consultation",
    };
    if (type) payload.consultationType = type;
    if (notes) payload.note = notes;

    try {
      const token = getBackendToken();
      const response = await fetch(
        `https://api.ikshanaturopathy.com/v1/appointment/update/${selectedEvent.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Update failed: ${response.statusText} - ${errorText}`);
      }

      await response.json();
      await refetchForActiveTab();
      toast({
        title: "Appointment updated",
        description: "Changes saved successfully.",
      });
      setEditAppointmentOpen(false);
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update appointment",
      });
    }
  };

  const openEditDialog = (apt: Appointment) => {
    setSelectedEvent(apt);
    setPatientName(apt.patient?.fullName || "");
    setPatientNumber(apt.phoneNo || "");
    setDate(apt.date);
    setTime(apt.time || "");
    setType(apt.consultationType || "");
    setNotes(apt.note || "");
    setDoctorId(apt.doctor?.id || "");
    setEditAppointmentOpen(true);
  };

  const openView = (appointment: Appointment) => {
    setSelectedEvent(appointment);
    setViewAppointmentOpen(true);
  };

  const handleDeleteAppointment = () => {
    if (!selectedEvent) return;
    // client-only removal; if you add API delete, call it here
    setAppointmentsPage((prev) =>
      prev.filter((appt) => appt.id !== selectedEvent.id)
    );
    setAppointmentsAll((prev) =>
      prev.filter((appt) => appt.id !== selectedEvent.id)
    );
    setEditAppointmentOpen(false);
  };
  const [expandedNotes, setExpandedNotes] = useState<{ [id: string]: boolean }>(
    {}
  );

  const toggleExpanded = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  /* ------------------------ Reusable List Renderer ------------------------ */

  const renderAppointmentList = (
    list: Appointment[],
    tabKey: TabKey,
    title: string
  ) => {
    // ✅ Move expanded state outside the map
    const [expandedNotes, setExpandedNotes] = useState<{
      [id: string]: boolean;
    }>({});

    const toggleExpanded = (id: string) => {
      setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
      <TabsContent value={tabKey} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>

        {list.length > 0 ? (
          <div className="grid gap-4">
            {list.map((appointment) => {
              const note = appointment.note || "No notes";
              const isLong = note.length > 120;
              const expanded = expandedNotes[appointment.id] || false;
              const displayNote = expanded
                ? note
                : isLong
                ? note.slice(0, 120) + "..."
                : note;

              return (
                <Card key={appointment.id} className="shadow-sm">
                  <CardContent className="p-6 flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">
                            {appointment.patient?.fullName || "Unknown Patient"}
                          </h3>
                        </div>
                        <StatusBadge value={appointment.status} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              {appointment.date}{" "}
                              {appointment.time ? `• ${appointment.time}` : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {appointment.doctor?.username ||
                                "No doctor assigned"}
                            </span>
                          </div>
                        </div>

                        {/* ✅ Notes Section */}
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 break-words whitespace-pre-wrap max-w-full">
                            <strong>Notes:</strong> {displayNote}
                            {isLong && (
                              <button
                                className="ml-2 text-blue-600 text-xs underline"
                                onClick={() => toggleExpanded(appointment.id)}
                              >
                                {expanded ? "Show less" : "Show more"}
                              </button>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(appointment)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/add-patient/${appointment.patient?.id}`)
                        }
                      >
                        Add Detail
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openView(appointment)}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 italic">No records.</p>
        )}
      </TabsContent>
    );
  };

  /* ------------------------ Render ------------------------ */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Appointments
            </h1>
            <p className="text-gray-600">
              Manage patient appointments and schedules
            </p>
          </div>

          {/* Add Appointment Dialog */}
          <Dialog
            open={newAppointmentOpen}
            onOpenChange={setNewAppointmentOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-foreground text-white hover:bg-gray-800">
                + Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[480px] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Schedule Appointment
                </DialogTitle>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleBookAppointment();
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    placeholder="Enter patient name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />
                  {errors.patientName && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.patientName}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="patientNumber">Patient Mobile Number</Label>
                  <Input
                    id="patientNumber"
                    type="tel"
                    placeholder="Enter patient Mobile Number"
                    value={patientNumber}
                    onChange={(e) => setPatientNumber(e.target.value)}
                    required
                  />
                  {errors.patientNumber && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.patientNumber}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="appointmentDate">Date</Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                  {errors.date && (
                    <p className="text-xs text-red-600 mt-1">{errors.date}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="appointmentTime">Time</Label>
                  <Input
                    id="appointmentTime"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                  {errors.time && (
                    <p className="text-xs text-red-600 mt-1">{errors.time}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="doctor">Doctor</Label>

                  {/* search box for server-side filtering */}
                  <Input
                    id="doctor-search"
                    placeholder="Search doctor…"
                    className="mb-2"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                  />

                  <Select
                    value={doctorId}
                    onValueChange={(val) => {
                      setDoctorId(val);
                      const doc = doctor.find((d) => d.id === val);
                      setDoctorDisplay(doc?.username || "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctor.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="appointmentType">Appointment Type</Label>
                  <Select value={type} onValueChange={(val) => setType(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="regular_checkup">
                        Regular Checkup
                      </SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-xs text-red-600 mt-1">{errors.type}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="note">Notes (Optional)</Label>
                  <Textarea
                    id="note"
                    placeholder="Appointment details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-foreground text-white hover:bg-gray-800"
                >
                  Schedule
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* ------------------------ Tabs ------------------------ */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val as TabKey);
            setPage(1);
          }}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-10 overflow-x-auto gap-2">
            <TabsTrigger value="all" className="font-[12px]">All</TabsTrigger>
            <TabsTrigger value="today" className="font-[12px]">Today</TabsTrigger>
            <TabsTrigger value="upcoming" className="font-[12px]">Upcoming</TabsTrigger>
            <TabsTrigger value="calendar" className="font-[12px]">Calendar</TabsTrigger>
            <TabsTrigger value="pending" className="font-[12px]">Pending</TabsTrigger>
            <TabsTrigger value="confirmed" className="font-[12px]">Confirmed</TabsTrigger>
            <TabsTrigger value="cancelled" className="font-[12px]">Cancelled</TabsTrigger>
            <TabsTrigger value="completed" className="font-[12px]">Completed</TabsTrigger>
            <TabsTrigger value="rescheduled" className="font-[12px]">Rescheduled</TabsTrigger>
            <TabsTrigger value="no_show" className="font-[12px]">No Show</TabsTrigger>
          </TabsList>

          {/* ALL (paged) */}
          <TabsContent value="all" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">All Appointments</h2>
            </div>

            <div className="grid gap-4">
              {appointmentsPage.map((appointment) => (
                <Card key={appointment.id} className="shadow-sm">
                  <CardContent className="p-6 flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">
                            {appointment.patient?.fullName}
                          </h3>
                        </div>
                        <div className="mt-3">
                          <label className="text-xs text-gray-500 block mb-1">
                            Update Status
                          </label>
                        </div>{" "}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              {appointment.date}{" "}
                              {appointment.time ? `• ${appointment.time}` : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {appointment.doctor?.username ||
                                "No doctor assigned"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 break-words whitespace-pre-wrap max-w-full">
                            <strong>Notes:</strong>{" "}
                            {(() => {
                              const note = appointment.note || "No notes";
                              const isLong = note.length > 120;
                              const expanded =
                                expandedNotes[appointment.id] || false;
                              const displayNote = expanded
                                ? note
                                : isLong
                                ? note.slice(0, 120) + "..."
                                : note;

                              return (
                                <>
                                  {displayNote}
                                  {isLong && (
                                    <button
                                      className="ml-2 text-blue-600 text-xs underline"
                                      onClick={() =>
                                        toggleExpanded(appointment.id)
                                      }
                                    >
                                      {expanded ? "Show less" : "Show more"}
                                    </button>
                                  )}
                                </>
                              );
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-6">
                      {" "}
                      <div className="flex gap-2 ml-4 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(appointment)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/add-patient/${appointment.patient?.id}`)
                          }
                        >
                          Add Detail
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openView(appointment)}
                        >
                          View
                        </Button>
                      </div>
                      <div>
                        {" "}
                        <StatusButtons
                          apt={{
                            id: appointment.id,
                            status: appointment.status,
                          }}
                          fetchAppointments={refetchForActiveTab} // refreshes current tab + calendar
                          onChanged={(next) => {
                            // optional local UI update (snappier)
                            setAppointmentsPage((prev) =>
                              prev.map((a) =>
                                a.id === appointment.id
                                  ? { ...a, status: next }
                                  : a
                              )
                            );
                            setAppointmentsAll((prev) =>
                              prev.map((a) =>
                                a.id === appointment.id
                                  ? { ...a, status: next }
                                  : a
                              )
                            );
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="mt-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </TabsContent>

          {/* TODAY */}
          {renderAppointmentList(
            todaysAppointments,
            "today",
            `Today - ${todayISO}`
          )}

          {/* UPCOMING */}
          {renderAppointmentList(
            upcomingAppointments,
            "upcoming",
            "Upcoming Appointments"
          )}

          {/* CALENDAR */}
          <TabsContent value="calendar" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" /> Calendar View
              </h2>
            </div>
            <SimpleCalendar
              appointments={appointmentsAll}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onEventClick={(apt) => openView(apt)}
            />
          </TabsContent>

          {/* STATUS TABS */}
          {renderAppointmentList(
            pendingAppointments,
            "pending",
            "Pending Appointments"
          )}
          {renderAppointmentList(
            confirmedAppointments,
            "confirmed",
            "Confirmed Appointments"
          )}
          {renderAppointmentList(
            cancelledAppointments,
            "cancelled",
            "Cancelled Appointments"
          )}
          {renderAppointmentList(
            completedAppointments,
            "completed",
            "Completed Appointments"
          )}
          {renderAppointmentList(
            rescheduledAppointments,
            "rescheduled",
            "Rescheduled Appointments"
          )}
          {renderAppointmentList(
            noShowAppointments,
            "no_show",
            "No Show Appointments"
          )}
        </Tabs>

        {/* Edit Appointment Dialog */}
        <Dialog
          open={editAppointmentOpen}
          onOpenChange={setEditAppointmentOpen}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-patient-name">Patient Name</Label>
                <Input
                  id="edit-patient-name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="patientNumber">Patient Mobile Number</Label>
                <Input
                  id="patientNumber"
                  type="tel"
                  placeholder="Enter patient Mobile Number"
                  value={patientNumber}
                  onChange={(e) => setPatientNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-time">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Service Type</Label>
                <Input
                  id="edit-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="doctor">Doctor</Label>

                <Input
                  id="doctor-search"
                  placeholder="Search doctor…"
                  className="mb-2"
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                />

                <Select
                  value={doctorId}
                  onValueChange={(val) => {
                    setDoctorId(val);
                    const doc = doctor.find((d) => d.id === val);
                    setDoctorDisplay(doc?.username || "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctor.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button variant="destructive" onClick={handleDeleteAppointment}>
                Delete
              </Button>
              <Button
                onClick={handleUpdateAppointment}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Appointment Dialog */}
        <Dialog
          open={viewAppointmentOpen}
          onOpenChange={setViewAppointmentOpen}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>
            {selectedEvent ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">
                    {selectedEvent.patient?.fullName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {selectedEvent.date} • {selectedEvent.time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedEvent.doctor?.username}</span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  <StatusBadge value={selectedEvent.status} />
                </div>
                {selectedEvent.consultationType && (
                  <div>
                    <span className="font-medium">Type:</span>{" "}
                    {selectedEvent.consultationType}
                  </div>
                )}
                <div>
                  <span className="font-medium">Notes:</span>{" "}
                  {selectedEvent.note || "—"}
                </div>
              </div>
            ) : (
              <div>No appointment selected.</div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setViewAppointmentOpen(false)}
              >
                Close
              </Button>
              {selectedEvent && (
                <Button
                  onClick={() => {
                    setViewAppointmentOpen(false);
                    openEditDialog(selectedEvent);
                  }}
                >
                  Edit
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Appointments;
