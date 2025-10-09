import { useEffect, useMemo, useState } from "react";
import { Clock, User, MapPin, Calendar } from "lucide-react";
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
import { appointmentPost, getBackendToken } from "@/lib/api";

interface Patient {
  id: string;
  fullName: string;
  age?: number;
  sex?: string;
  // add other fields if needed
}

interface Doctor {
  id: string;
  username: string;
  status?: string;
  role?: string;
}

interface Appointment {
  id: string;
  patient?: Patient | null;
  doctor?: Doctor | null;
  date: string; // ISO date
  time?: string;
  status: string;
  note?: string;
  prescriptions?: any[];
  consultationType?: string;
}

// ------------------------- SimpleCalendar -------------------------
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
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={() => navigateMonth(-1)}>← Previous</Button>
        <h2 className="text-xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <Button variant="outline" onClick={() => navigateMonth(1)}>Next →</Button>
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
                day ? "bg-white hover:bg-gray-50 cursor-pointer" : "bg-transparent"
              } ${isToday ? "ring-2 ring-blue-500" : ""} ${
                selectedDate === dateStr ? "ring-2 ring-indigo-500" : ""
              }`}
              onClick={() => day && setSelectedDate(dateStr)}
            >
              {day && (
                <>
                  <div
                    className={`font-medium text-sm mb-1 p-1 ${
                      isToday ? "bg-blue-500 text-white rounded text-center" : ""
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
                        title={`${apt.patient.fullName || "Unknown"} - ${
                          apt.time || "N/A"
                        }`}
                      >
                        <div className="font-medium truncate">
                          {apt.patient.fullName  || "Unknown"}
                        </div>
                        <div className="truncate opacity-75">{apt.time || "N/A"}</div>
                        {apt.note && (
                          <div className="truncate text-xs opacity-60">{apt.note}</div>
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

// --------------------------- Appointments ---------------------------
const Appointments = () => {
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // ✅ ensure a default limit (avoid "undefined")
  const [totalPages, setTotalPages] = useState(1);

  // Tabs — default to "all" as requested
  const [activeTab, setActiveTab] = useState<"all" | "today" | "upcoming" | "calendar">("all");

  // Dialogs
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [editAppointmentOpen, setEditAppointmentOpen] = useState(false);
  const [viewAppointmentOpen, setViewAppointmentOpen] = useState(false);

  // Selected event for editing / viewing
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);

  // Form states
  const [patientName, setPatientName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("");
  const [doctor, setDoctor] = useState("");
  const [notes, setNotes] = useState("");

  // --------------------------- Data Fetch ---------------------------
  const fetchAppointments = async () => {
    try {
      const token = getBackendToken();
      // API supports filter=all|today (based on your code). We use today for Today tab; all for others.
      const filter = activeTab === "today" ? "today" : "all";
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
      const data = await res.json();

      const mappedAppointments: Appointment[] = (data?.data || []).map((appt: any) => ({
  id: appt.id,
  patient: appt.patient || { id: "unknown", fullName: appt.patientName || "Unknown" },
  doctor: appt.doctor || { id: "unknown", username: appt.doctor || "N/A" },
  date: (appt.date || "").split("T")[0],
  time: appt.date
    ? new Date(appt.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : undefined,
  status: appt.status || "pending",
  note: appt.note || "No notes",
  consultationType: appt.consultationType,
}));

      setAppointments(mappedAppointments);
      setTotalPages(data?.meta?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast({ title: "Error", description: "Failed to fetch appointments." });
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page]);

  // --------------------------- Helpers ---------------------------
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const capitalize = (str?: string) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

  // Derived lists
  const todayISO = useMemo(() => new Date().toISOString().split("T")[0], []);

  const todaysAppointments = useMemo(
    () => appointments.filter((a) => a.date === todayISO),
    [appointments, todayISO]
  );

  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => new Date(a.date) >= new Date(todayISO)),
    [appointments, todayISO]
  );

  const filteredBySelectedDate = useMemo(
    () => appointments.filter((a) => a.date === selectedDate),
    [appointments, selectedDate]
  );

  // --------------------------- CRUD ---------------------------
  const handleBookAppointment = async () => {
    if (!patientName || !date || !time || !type) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required appointment details.",
      });
      return;
    }

    const payload = {
      date: new Date(`${date}T${time}`).toISOString(),
      consultationType: type,
      patientName,
      doctor,
      type: "Consultation",
      note: notes || "New appointment",
    };

    toast({ title: "Scheduling...", description: "Your appointment is being scheduled." });

    try {
      const result = await appointmentPost("/appointment/create", payload);

      // locally append (optimistic)
      const newAppt: Appointment = {
        id: String(Date.now()),
        patient: { id: "unknown", fullName: patientName },
        doctor: { id: "unknown", username: doctor },
        date,
        time,
        status: "confirmed",
        note: notes || "New appointment",
        consultationType: type,
      };

      setAppointments((prev) => [newAppt, ...prev]);
      setNewAppointmentOpen(false);

      // reset
      setPatientName("");
      setDate("");
      setTime("");
      setType("");
      setDoctor("");
      setNotes("");

      toast({ title: "Appointment Scheduled", description: "Appointment created successfully." });
      console.log("Appointment created:", result);
    } catch (error) {
      toast({ title: "Error", description: "Failed to schedule appointment. Please try again." });
    }
  };

  const handleUpdateAppointment = () => {
    if (!selectedEvent) return;
    setAppointments((prev:any) =>
      prev.map((appt) =>
        appt.id === selectedEvent.id
          ? { ...appt, patientName, date, time, consultationType: type, doctor }
          : appt
      )
    );
    setEditAppointmentOpen(false);
  };

  const handleDeleteAppointment = () => {
    if (!selectedEvent) return;
    setAppointments((prev) => prev.filter((appt) => appt.id !== selectedEvent.id));
    setEditAppointmentOpen(false);
  };

  function openEdit(appointment: Appointment) {
    setSelectedEvent(appointment);
    setPatientName(appointment.patient?.fullName || "");
    setDate(appointment.date);
    setTime(appointment.time || "");
    setType(appointment.consultationType || (appointment as any).service || "");
    setDoctor(
      typeof appointment.doctor === "string"
        ? appointment.doctor
        : appointment.doctor?.username || ""
    );
    setEditAppointmentOpen(true);
  }

  function openView(appointment: Appointment) {
    setSelectedEvent(appointment);
    setViewAppointmentOpen(true);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments</h1>
            <p className="text-gray-600">Manage patient appointments and schedules</p>
          </div>

          {/* Add Appointment Dialog */}
          <Dialog open={newAppointmentOpen} onOpenChange={setNewAppointmentOpen}>
            <DialogTrigger asChild>
              <Button className="bg-foreground text-white hover:bg-gray-800">+ Book Appointment</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[480px] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Schedule Appointment</DialogTitle>
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
                  <Input id="patientName" placeholder="Enter patient name" value={patientName} onChange={(e) => setPatientName(e.target.value)} required />
                </div>

                <div>
                  <Label htmlFor="appointmentDate">Date</Label>
                  <Input id="appointmentDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>

                <div>
                  <Label htmlFor="appointmentTime">Time</Label>
                  <Input id="appointmentTime" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                </div>

                <div>
                  <Label htmlFor="doctor">Doctor</Label>
                  <Input id="doctor" placeholder="Enter doctor name" value={doctor} onChange={(e) => setDoctor(e.target.value)} required />
                </div>

                <div>
                  <Label htmlFor="appointmentType">Appointment Type</Label>
                  <Select value={type} onValueChange={(val) => setType(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="regular_checkup">Regular Checkup</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="note">Notes (Optional)</Label>
                  <Textarea id="note" placeholder="Appointment details..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                <Button type="submit" className="w-full bg-foreground text-white hover:bg-gray-800">Schedule</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val as any);
            setPage(1);
          }}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          {/* ALL */}
          <TabsContent value="all" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">All Appointments</h2>
            </div>

            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="shadow-sm">
                  <CardContent className="p-6 flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">{appointment.patient?.fullName}</h3>
                        </div>
                        <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                          {capitalize(appointment.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              {appointment.date} {appointment.time ? `• ${appointment.time}` : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{appointment.doctor.username}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <strong>Notes:</strong> {appointment.note}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => openEdit(appointment)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openView(appointment)}>
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-4">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="mt-2">Page {page} of {totalPages}</span>
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
<TabsContent value="today" className="space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-semibold">Today - {todayISO}</h2>
  </div>

  <div className="grid gap-4">
    {todaysAppointments.map((appointment) => (
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
              <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                {capitalize(appointment.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{appointment.time || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{appointment.doctor?.username || "No doctor assigned"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Notes:</strong> {appointment.note || "No notes"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="sm" onClick={() => openEdit(appointment)}>
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => openView(appointment)}>
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</TabsContent>

{/* UPCOMING */}
<TabsContent value="upcoming" className="space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
  </div>

  <div className="grid gap-4">
    {upcomingAppointments.map((appointment) => (
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
              <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                {capitalize(appointment.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    {appointment.date
                      ? `${new Date(appointment.date).toLocaleDateString()}${appointment.time ? ` • ${appointment.time}` : ""}`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{appointment.doctor?.username || "No doctor assigned"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Notes:</strong> {appointment.note || "No notes"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="sm" onClick={() => openEdit(appointment)}>
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => openView(appointment)}>
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</TabsContent>

{/* CALENDAR */}
<TabsContent value="calendar" className="space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-semibold flex items-center gap-2">
      <Calendar className="h-5 w-5" /> Calendar View
    </h2>
  </div>

  <SimpleCalendar
    appointments={appointments}
    selectedDate={selectedDate}
    setSelectedDate={setSelectedDate}
    onEventClick={(apt) => openView(apt)}
  />
</TabsContent>

        </Tabs>

        {/* Edit Appointment Dialog */}
        <Dialog open={editAppointmentOpen} onOpenChange={setEditAppointmentOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-patient-name">Patient Name</Label>
                <Input id="edit-patient-name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-date">Date</Label>
                <Input id="edit-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-time">Time</Label>
                <Input id="edit-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-type">Service Type</Label>
                <Input id="edit-type" value={type} onChange={(e) => setType(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-doctor">Doctor</Label>
                <Input id="edit-doctor" value={doctor} onChange={(e) => setDoctor(e.target.value)} />
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button variant="destructive" onClick={handleDeleteAppointment}>Delete</Button>
              <Button onClick={handleUpdateAppointment} className="bg-blue-600 hover:bg-blue-700">Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Appointment Dialog (from calendar slot click or list "View") */}
        <Dialog open={viewAppointmentOpen} onOpenChange={setViewAppointmentOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>
            {selectedEvent ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2"><User className="h-4 w-4" /><span className="font-medium">{selectedEvent.patient?.fullName}</span></div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{selectedEvent.date} • {selectedEvent.time}</span></div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{selectedEvent.doctor.username}</span></div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  <Badge className={`${getStatusColor(selectedEvent.status)} text-white ml-2`}>
                    {capitalize(selectedEvent.status)}
                  </Badge>
                </div>
                {selectedEvent.consultationType && (
                  <div>
                    <span className="font-medium">Type:</span> {selectedEvent.consultationType}
                  </div>
                )}
                <div>
                  <span className="font-medium">Notes:</span> {selectedEvent.note || "—"}
                </div>
              </div>
            ) : (
              <div>No appointment selected.</div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewAppointmentOpen(false)}>Close</Button>
              {selectedEvent && (
                <Button onClick={() => { setViewAppointmentOpen(false); openEdit(selectedEvent); }}>Edit</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Appointments;
