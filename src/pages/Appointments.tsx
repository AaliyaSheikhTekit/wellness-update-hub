import { useEffect, useState } from "react";
import { Clock, User, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectContent } from "@radix-ui/react-select";
import { Textarea } from "@/components/ui/textarea";

const mockAppointments = [
  {
    id: 1,
    patientName: "Rahul Sharma",
    patientPhone: "+91 9343922950",
    patientEmail: "rahul.sharma@email.com",
    date: "2024-01-15",
    time: "10:00 AM",
    service: "Initial Consultation",
    status: "confirmed",
    duration: "60 mins",
    notes: "First-time patient with digestive issues"
  },
  {
    id: 2,
    patientName: "Priya Patel",
    patientPhone: "+91 87654 32109",
    patientEmail: "priya.patel@email.com",
    date: "2024-01-15",
    time: "11:30 AM",
    service: "Panchakarma Therapy",
    status: "confirmed",
    duration: "90 mins",
    notes: "Follow-up session for stress management"
  },
  {
    id: 3,
    patientName: "Amit Kumar",
    patientPhone: "+91 76543 21098",
    patientEmail: "amit.kumar@email.com",
    date: "2024-01-15",
    time: "2:00 PM",
    service: "Mud Therapy",
    status: "pending",
    duration: "45 mins",
    notes: "Skin condition treatment"
  },
  {
    id: 4,
    patientName: "Sunita Devi",
    patientPhone: "+91 65432 10987",
    patientEmail: "sunita.devi@email.com",
    date: "2024-01-16",
    time: "9:00 AM",
    service: "Diet Consultation",
    status: "confirmed",
    duration: "30 mins",
    notes: "Weight management program"
  },
  {
    id: 5,
    patientName: "Rajesh Gupta",
    patientPhone: "+91 54321 09876",
    patientEmail: "rajesh.gupta@email.com",
    date: "2024-01-16",
    time: "3:30 PM",
    service: "Hydrotherapy",
    status: "cancelled",
    duration: "60 mins",
    notes: "Patient requested to reschedule"
  }
];

const getStatusColor = (status) => {
  switch (status) {
    case "confirmed":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

// Enhanced Calendar Component
const SimpleCalendar = ({ appointments, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };
  
  const getAppointmentsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(apt => apt.date === dateStr);
  };

  const getStatusColorForCalendar = (status) => {
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
  
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={() => navigateMonth(-1)} size="sm">
          ← Previous
        </Button>
        <h2 className="text-xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <Button variant="outline" onClick={() => navigateMonth(1)} size="sm">
          Next →
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
          <span>Cancelled</span>
        </div>
      </div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map(day => (
          <div key={day} className="text-center font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {getDaysInMonth(currentDate).map((day, index) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isToday = day && 
            currentDate.getMonth() === new Date().getMonth() && 
            currentDate.getFullYear() === new Date().getFullYear() && 
            day === new Date().getDate();
          
          return (
            <div
              key={index}
              className={`min-h-32 p-1 border rounded-lg ${
                day 
                  ? `bg-white hover:bg-gray-50 cursor-pointer ${isToday ? 'ring-2 ring-blue-500' : ''}` 
                  : 'bg-transparent'
              }`}
            >
              {day && (
                <>
                  <div className={`font-medium text-sm mb-1 p-1 ${isToday ? 'bg-blue-500 text-white rounded text-center' : ''}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.map((apt, i) => (
                      <div
                        key={i}
                        className={`text-xs p-2 rounded border cursor-pointer hover:opacity-80 transition-opacity ${getStatusColorForCalendar(apt.status)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(apt);
                        }}
                        title={`${apt.patientName} - ${apt.service} at ${apt.time}`}
                      >
                        <div className="font-medium truncate">{apt.patientName}</div>
                        <div className="truncate opacity-75">{apt.time}</div>
                        <div className="truncate text-xs opacity-60">{apt.service}</div>
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
  const [selectedDate, setSelectedDate] = useState("2024-01-15");
  const [appointments, setAppointments] = useState(mockAppointments);
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [editAppointmentOpen, setEditAppointmentOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Form states
  const [patientName, setPatientName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("");
  
  const filteredAppointments = appointments.filter(
    (appointment) => appointment.date === selectedDate
  );

  const upcomingAppointments = appointments.filter(
    (appointment) => new Date(appointment.date) >= new Date()
  );

  // Add appointment
  const handleBookAppointment = () => {
    if (!patientName || !date || !time || !type) return;
    
    const newAppt = {
      id: Date.now(),
      patientName,
      patientPhone: "+91 00000 00000",
      patientEmail: `${patientName.toLowerCase().replace(' ', '.')}@email.com`,
      date,
      time,
      service: type,
      status: "confirmed",
      duration: "30 mins",
      notes: "New appointment"
    };

    setAppointments([...appointments, newAppt]);
    setNewAppointmentOpen(false);
    setPatientName("");
    setDate("");
    setTime("");
    setType("");
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
    setAppointments((prev) => prev.filter((appt) => appt.id !== selectedEvent.id));
    setEditAppointmentOpen(false);
  };

  const handleEventClick = (appointment) => {
    setSelectedEvent(appointment);
    setPatientName(appointment.patientName);
    setType(appointment.service);
    setDate(appointment.date);
    setTime(appointment.time);
    setEditAppointmentOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments</h1>
          <p className="text-gray-600">Manage patient appointments and schedules</p>
        </div>

        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today's Appointments</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Today - January 15, 2024</h2>
              <Button onClick={() => setNewAppointmentOpen(true)} className="bg-foreground text-white hover:bg-gray-800">
                + Book Appointment
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                          </div>
                          <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.time} ({appointment.duration})</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span>{appointment.patientPhone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span>{appointment.patientEmail}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{appointment.service}</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              <strong>Notes:</strong> {appointment.notes}
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
              <Button 
                onClick={() => setNewAppointmentOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add New Appointment
              </Button>
            </div>

            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                          </div>
                          <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(appointment.date).toLocaleDateString('en-IN', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.time} ({appointment.duration})</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span>{appointment.patientPhone}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{appointment.service}</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              <strong>Notes:</strong> {appointment.notes}
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Calendar View</h2>
              <Button 
                onClick={() => setNewAppointmentOpen(true)}
                className="bg-foreground text-white hover:bg-gray-800"
              >
                + Book Appointment
              </Button>
            </div>
            
            <SimpleCalendar 
              appointments={appointments} 
              onEventClick={handleEventClick}
            />
          </TabsContent>
        </Tabs>

        {/* Add Appointment Dialog */}
        <Dialog open={newAppointmentOpen} onOpenChange={setNewAppointmentOpen}>
             <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-card transition-all duration-300 bg-white border-0 shadow-soft">
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Schedule Appointment</h3>
                        <p className="text-muted-foreground">Book a new appointment for a patient</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">Schedule Appointment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBookAppointment} className="space-y-4">
                  <div>
                    <Label htmlFor="patientName">Patient Name</Label>
                    <Input id="patientName" placeholder="Search or enter patient name" required />
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
                        <SelectItem value="dr-smith">Dr. Smith - General Medicine</SelectItem>
                        <SelectItem value="dr-johnson">Dr. Johnson - Cardiology</SelectItem>
                        <SelectItem value="dr-williams">Dr. Williams - Pediatrics</SelectItem>
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
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="checkup">Regular Checkup</SelectItem>
                        <SelectItem value="followup">Follow-up</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="appointmentNotes">Notes (Optional)</Label>
                    <Textarea id="appointmentNotes" placeholder="Appointment details..." />
                  </div>
                  <Button type="submit" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </form>
              </DialogContent>
        </Dialog>

        {/* Edit Appointment Dialog */}
        <Dialog open={editAppointmentOpen} onOpenChange={setEditAppointmentOpen}>
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
              <Button onClick={handleUpdateAppointment} className="bg-blue-600 hover:bg-blue-700">
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