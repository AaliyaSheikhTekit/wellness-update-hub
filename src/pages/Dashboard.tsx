import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";

import PatientForm from "@/components/PatientForm";
import {
  FileText,
  Pill,
  Calendar,
  Search,
  LogOut,
  Menu,
  X,
  Phone,
  Mail,
  Leaf,
  Plus,
  Stethoscope,
  UserCheck,
  ChartArea,
} from "lucide-react";
import { Users } from "lucide-react";
import { signOut } from "aws-amplify/auth";
import IkshaLogo from "../assets/iksha_logo.png"; // Ensure you have the logo image in the specified path
import Appointments from "./Appointments";
import Prescriptions from "./Prescriptions";
import Invoices from "./Invoices";
import Dietitians from "./Dietitians";

// Mock patient data
const mockPatients = [
  {
    id: "1",
    name: "Sarah Johnson",
    age: 34,
    phone: "+91 98765 43201",
    email: "sarah.j@email.com",
    condition: "Chronic Fatigue",
    lastVisit: "2024-01-15",
    status: "Active",
    nextAppointment: "2024-02-01",
  },
  {
    id: "2",
    name: "Michael Chen",
    age: 42,
    phone: "+91 98765 43202",
    email: "m.chen@email.com",
    condition: "Digestive Issues",
    lastVisit: "2024-01-20",
    status: "Active",
    nextAppointment: "2024-01-30",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    age: 28,
    phone: "+91 98765 43203",
    email: "emily.r@email.com",
    condition: "Stress Management",
    lastVisit: "2024-01-18",
    status: "Completed",
    nextAppointment: null,
  },
  {
    id: "4",
    name: "David Wilson",
    age: 55,
    phone: "+91 98765 43204",
    email: "d.wilson@email.com",
    condition: "Pain Management",
    lastVisit: "2024-01-22",
    status: "Active",
    nextAppointment: "2024-02-05",
  },
];

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();


  // Derive role based on email
// Get role from localStorage
const userName = localStorage.getItem("userName") || "";

let userRole = "Naturopathy doctor"; // default

if (userName.includes("superAdmin")) {
  userRole = "superAdmin";
} else if (userName.includes("Naturopathy Recptionist")) {
  userRole = "Naturopathy Recptionist";
} else if (userName.includes("Naturopathy doctor")) {
  userRole = "Naturopathy doctor";
}

console.log("userName:", userName, "→ role:", userRole);
  // Load patients from localStorage
  useEffect(() => {
    const storedPatients = JSON.parse(localStorage.getItem("patients") || "[]");
    setPatients([...mockPatients, ...storedPatients]);
  }, []);

  const handlePatientAdded = (newPatient: any) => {
    setPatients((prev) => [...prev, newPatient]);
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.condition &&
        patient.condition.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.currentCondition &&
        patient.currentCondition
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

 const sidebarItems =
  userName === "superAdmin"
    ? [
        { name: "Overview", icon: Users, path: "/dashboard", active: activeTab === "overview" },
        { name: "Add Patient", icon: Plus, path: "/dashboard", active: activeTab === "add-patient" },
        { name: "Appointments", icon: Calendar, path: "/appointments", active: activeTab === "appointments" },
        { name: "Prescriptions", icon: Pill, path: "/prescriptions", active: activeTab === "prescriptions" },
        { name: "Dietitans", icon: ChartArea, path: "/dietitans", active: activeTab === "dietitans" },
        { name: "Invoices", icon: FileText, path: "/invoices", active: activeTab === "invoices" },
      ]
    : userName === "Naturopathy Recptionist"
    ? [
        { name: "Add Patient", icon: Plus, path: "/dashboard", active: activeTab === "add-patient" },
        { name: "Appointments", icon: Calendar, path: "/appointments", active: activeTab === "appointments" },
        { name: "Prescriptions", icon: Pill, path: "/prescriptions", active: activeTab === "prescriptions" },
        { name: "Invoices", icon: FileText, path: "/invoices", active: activeTab === "invoices" },
      ]
    : userName === "Naturopathy doctor"
    ? [
        { name: "Overview", icon: Users, path: "/dashboard", active: activeTab === "overview" },
        { name: "Prescriptions", icon: Pill, path: "/prescriptions", active: activeTab === "prescriptions" },
      ]
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-wellness-sage-light text-wellness-sage-dark border-wellness-sage/30";
      case "Completed":
        return "bg-wellness-beige-light text-wellness-beige-dark border-wellness-beige/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const handleLogout = async () => {
    try {
      // Call Amplify signOut (clears Cognito session: idToken, accessToken, refreshToken)
      await signOut();

      // Clear ALL localStorage (not just role/email/name)
      localStorage.clear();

      // If you also use sessionStorage
      sessionStorage.clear();

      // Redirect to login
      navigate("/login");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-border/50 transform wellness-transition duration-300 z-30 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <img
                  src={IkshaLogo}
                  alt="Iksha Naturopathy Logo"
                  className="h-16 w-auto object-contain" // larger height
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
        {sidebarItems.map((item,id) => (
  <button
    key={id}
    onClick={() => setActiveTab(item.name.toLowerCase().replace(" ", "-"))}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg wellness-transition w-full text-left ${
      item.active
        ? "bg-wellness-sage-light/20 text-wellness-sage border border-wellness-sage/20"
        : "text-muted-foreground hover:bg-wellness-sage-light/10 hover:text-foreground"
    }`}
  >
    <item.icon className="h-5 w-5" />
    <span>{item.name}</span>
  </button>
))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-wellness-sage-light/10 rounded-lg wellness-transition w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-white border-b border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
               <h1 className="font-display text-3xl font-bold text-foreground">
  {userName === "superAdmin"
    ? "Admin Dashboard"
    : userName === "Naturopathy Recptionist"
    ? "Receptionist Dashboard"
    : userName === "Naturopathy doctor"
    ? "Doctor Dashboard"
    : "Dashboard"}
</h1>

                <div className="flex items-center space-x-2 mt-1">
                  {userName === "doctor" ? (
                    <Stethoscope className="h-4 w-4 text-wellness-sage" />
                  ) : (
                    <UserCheck className="h-4 w-4 text-wellness-sage" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    Welcome back, {userName}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 bg-white">
          {activeTab === "overview" ? (
            <>
              {/* Search and Stats */}
              <div className="mb-6 space-y-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="shadow-xl relative overflow-hidden wellness-card-gradient border-0 wellness-shadow-soft hover:wellness-shadow rounded-2xl"
                  >
                    {/* Gradient Glow Overlay */}

                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center space-x-4">
                        {/* Animated Icon */}
                        <motion.div
                          whileHover={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 0.6 }}
                          className="p-3 rounded-xl bg-primary/10 text-primary"
                        >
                          <Users className="h-6 w-6" />
                        </motion.div>

                        {/* Text Content */}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Total Patients
                          </p>
                          <motion.p
                            key={patients.length} // animates when value changes
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="text-3xl font-bold text-foreground"
                          >
                            {patients.length}
                          </motion.p>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="shadow-xl relative overflow-hidden wellness-card-gradient border-0 wellness-shadow-soft hover:wellness-shadow rounded-2xl"
                  >
                    <Card>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-wellness-beige-light/40 to-transparent pointer-events-none" />
                      <CardContent className="p-6 relative z-10">
                        <div className="flex items-center space-x-4">
                          <motion.div
                            whileHover={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.6 }}
                            className="p-3 rounded-xl bg-primary/10 text-primary"
                          >
                            <Calendar className="h-6 w-6" />
                          </motion.div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Active Cases
                            </p>
                            <motion.p
                              key={
                                patients.filter((p) => p.status === "Active")
                                  .length
                              }
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4 }}
                              className="text-3xl font-bold text-foreground"
                            >
                              {
                                patients.filter((p) => p.status === "Active")
                                  .length
                              }
                            </motion.p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Prescriptions */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="shadow-xl relative overflow-hidden wellness-card-gradient border-0 wellness-shadow-soft hover:wellness-shadow rounded-2xl"
                  >
                    <Card>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-wellness-beige-light/40 to-transparent pointer-events-none" />
                      <CardContent className="p-6 relative z-10">
                        <div className="flex items-center space-x-4">
                          <motion.div
                            whileHover={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.6 }}
                            className="p-3 rounded-xl bg-primary/10 text-primary"
                          >
                            <Pill className="h-6 w-6" />
                          </motion.div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Prescriptions
                            </p>
                            <motion.p
                              key={12}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4 }}
                              className="text-3xl font-bold text-foreground"
                            >
                              12
                            </motion.p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Pending Invoices */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className=" shadow-xl relative overflow-hidden wellness-card-gradient border-0 wellness-shadow-soft hover:wellness-shadow rounded-2xl"
                  >
                    <Card>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-wellness-beige-light/40 to-transparent pointer-events-none" />
                      <CardContent className="p-6 relative z-10">
                        <div className="flex items-center space-x-4">
                          <motion.div
                            whileHover={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.6 }}
                            className="p-3 rounded-xl bg-primary/10 text-primary"
                          >
                            <FileText className="h-6 w-6" />
                          </motion.div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Pending Invoices
                            </p>
                            <motion.p
                              key={3}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4 }}
                              className="text-3xl font-bold text-foreground"
                            >
                              3
                            </motion.p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>

              {/* Patient List */}
              <Card className="bg-white border-0 wellness-shadow-xl hover:wellness-shadow rounded-2xl">
                <CardHeader>
                  <CardTitle className="font-display text-2xl text-foreground flex items-center justify-between">
                    <span>Patient List</span>
                    {userName === "receptionist" && (
                      <Button
                        variant="wellness"
                        onClick={() => setActiveTab("add-patient")}
                        className="ml-auto bg-foreground hover:bg-foreground/90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Patient
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          onClick={() => navigate(`/patient/${patient.id}`)}
                          className="p-4 border border-border/100 rounded-lg hover:bg-wellness-sage-light/10 cursor-pointer wellness-transition shadow-xl"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar>
                                <AvatarFallback className="bg-wellness-sage-light/20 text-wellness-sage">
                                  {patient.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <h3 className="font-semibold text-foreground">
                                  {patient.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Age: {patient.age}
                                </p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <div className="flex items-center space-x-1">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      {patient.phone}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      {patient.email}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="text-right space-y-2">
                              <Badge
                                className={`${getStatusColor(patient.status)}`}
                              >
                                {patient.status}
                              </Badge>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {patient.condition ||
                                    patient.currentCondition}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Last visit:{" "}
                                  {patient.lastVisit || patient.dateAdded}
                                </p>
                                {patient.nextAppointment && (
                                  <p className="text-xs text-wellness-sage">
                                    Next: {patient.nextAppointment}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No patients found.{" "}
                        {userName === "receptionist" &&
                          "Click 'Add New Patient' to get started."}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : activeTab === "add-patient" ? (
  <PatientForm onPatientAdded={handlePatientAdded} />
) : activeTab === "appointments" ? (
  <Appointments />
) : activeTab === "prescriptions" ? (
  <Prescriptions />
) : activeTab === "dietitans" ? (
  <Dietitians />
): activeTab === "invoices" ? (
  <Invoices />
) : null}
          
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
