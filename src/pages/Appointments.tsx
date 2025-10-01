import { useEffect, useState } from "react";
import { Clock, User, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectContent } from "@radix-ui/react-select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { appointmentPost } from "@/lib/api";
interface Appointment {
  id: string;
  patientName?: string;
  doctor?: string;
  date: string;
  time?: string;
  status: string;
  note?: string;
  prescriptions?: any[];
  consultationType?: string;
}

// Enhanced Calendar Component
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
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + dir);
      return newDate;
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
    if (!day) return [];
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date + "T00:00:00"); // force local midnight
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
        <Button onClick={() => navigateMonth(-1)}>← Previous</Button>
        <h2 className="text-xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <Button onClick={() => navigateMonth(1)}>Next →</Button>
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
            day &&
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
              className={`min-h-32 p-1 border rounded-lg cursor-pointer ${
                day ? "bg-white hover:bg-gray-50" : "bg-transparent"
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
                        className={`text-xs p-2 rounded border cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(
                          apt.status
                        )}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(apt);
                        }}
                        title={`${apt.patientName || "Unknown"} - ${
                          apt.time || "N/A"
                        }`}
                      >
                        <div className="font-medium truncate">
                          {apt.patientName || "Unknown"}
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

const Appointments = () => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Tabs
  const [activeTab, setActiveTab] = useState("today");

  // Dialogs
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [editAppointmentOpen, setEditAppointmentOpen] = useState(false);

  // Selected event for editing
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);

  // Form states
  const [patientName, setPatientName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("");
  const [doctor, setDoctor] = useState("");
  const [notes, setNotes] = useState("");
  // Fetch appointments dynamically based on tab and page
  const fetchAppointments = async () => {
    try {
      const filter = activeTab === "today" ? "today" : "upcoming";
      const res = await fetch(
        `https://api.ikshanaturopathy.com/v1/appointment/get?page=${page}&limit=${limit}&filter=${filter}`
      );
      const data = await res.json();

      const mappedAppointments = data.data.map((appt: any) => ({
        id: appt.id,
        patientName: appt.patientName || "Unknown",
        doctor: appt.doctor || "N/A",
        date: appt.date.split("T")[0],
        time: new Date(appt.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: appt.status,
        note:
          appt.note ||
          "No notes",
      }));

      setAppointments(mappedAppointments);
      setTotalPages(data.meta.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab, page]);

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

  // Add appointment
  const handleBookAppointment = async () => {
    // Validate required fields
    if (!patientName || !date || !time || !type) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required appointment details.",
        // variant: "error",
      });
      return;
    }

    // API payload
    const payload = {
      date: new Date(`${date}T${time}`).toISOString(),
      type,
      patientName,
      doctor: type, // Replace if you have separate doctor state
      consultationType: type,
      // notes: notes || "New appointment",
    };

    toast({
      title: "Scheduling...",
      description: "Your appointment is being scheduled.",
    });

    try {
      const result = await appointmentPost("/appointment/create", payload);

      // Add to local state
      const newAppt = {
        id: Date.now().toString(),
        patientName,
        patientPhone: "+91 00000 00000",
        doctor, // Matches payload
        date,
        time,
        service: type, // Appointment type
        status: "confirmed", // or set to "pending" as needed
        notes: "",
      };

      setAppointments([...appointments, newAppt]);
      setNewAppointmentOpen(false);

      // Reset form fields
      setPatientName("");
      setDate("");
      setTime("");
      setType("");
      setNotes("");

      toast({
        title: "Appointment Scheduled",
        description: "Your appointment has been successfully created.",
        // variant: "success",
      });

      console.log("Appointment created:", result);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again later.",
        // variant: "error",
      });
    }
  };

  // Update appointment
  const handleUpdateAppointment = () => {
    if (!selectedEvent) return;
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === selectedEvent.id
          ? { ...appt, patientName, date, time, service: type }
          : appt
      )
    );
    setEditAppointmentOpen(false);
  };

  // Delete appointment
  const handleDeleteAppointment = () => {
    if (!selectedEvent) return;
    setAppointments((prev) =>
      prev.filter((appt) => appt.id !== selectedEvent.id)
    );
  };

  function handleEventClick(appointment: Appointment): void {
    // Set form state for editing
    setSelectedEvent(appointment);
    setPatientName(appointment.patientName || "");
    setDate(appointment.date);
    setTime(appointment.time || "");
    setType((appointment as any).service || appointment.consultationType || "");
    setDoctor(appointment.doctor || "");
    setEditAppointmentOpen(true);
  }
  const filteredAppointments = appointments.filter(
    (appointment) => appointment.date === selectedDate
  );

  // Upcoming appointments (today and future)
  const upcomingAppointments = appointments.filter(
    (appointment) => new Date(appointment.date) >= new Date()
  );
  const capitalize = (str?: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            {" "}
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
            <DialogContent className="max-w-md">
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
                    placeholder="Search or enter patient name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />
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
                </div>

                <div>
                  <Label htmlFor="doctor">Doctor</Label>
                  <Input
                    id="doctor"
                    placeholder="Enter doctor name"
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="appointmentType">Appointment Type</Label>
                  <Select value={type} onValueChange={(val) => setType(val)}>
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
    <Label htmlFor="note">Notes (Optional)</Label>
    <Textarea
      id="note"
      placeholder="Appointment details..."
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
    />
  </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
            setPage(1);
          }}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today's Appointments</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Today - {selectedDate}</h2>
            </div>

            <div className="grid gap-4">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="shadow-sm">
                  <CardContent className="p-6 flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">
                            {appointment.patientName}
                          </h3>
                        </div>
                        <Badge
                          className={`${getStatusColor(
                            appointment.status
                          )} text-white`}
                        >
                          {capitalize(appointment.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{appointment.doctor}</span>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEventClick(appointment)}
                      >
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
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
                            {appointment.patientName}
                          </h3>
                        </div>
                        <Badge
                          className={`${getStatusColor(
                            appointment.status
                          )} text-white`}
                        >
                          {capitalize(appointment.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{appointment.doctor}</span>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEventClick(appointment)}
                      >
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Calendar View</h2>
            </div>

            <SimpleCalendar
              appointments={appointments}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onEventClick={(apt) => console.log(apt)}
            />
          </TabsContent>
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
      </div>
    </div>
  );
};

export default Appointments;
