import React, { useEffect, useState, useMemo } from "react";
import { Calendar, Users, Clock, Search, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { getBackendToken, getPatients } from "@/lib/api";
import { useNavigate } from "react-router-dom";

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
  const pages = useMemo(() => {
    const arr: (number | string)[] = [];
    const add = (v: number | string) => arr.push(v);

    const window = 1;
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

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Prev</span>
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((p, i) =>
            typeof p === "number" ? (
              <Button
                key={`${p}-${i}`}
                variant={p === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(p)}
                className="h-8 min-w-8 px-2"
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
          className="h-8"
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {onLimitChange && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Per page</span>
            <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
              <SelectTrigger className="h-8 w-[70px] sm:w-[78px]">
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

const ReceptionDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "today" | "pending">("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [patients, setPatients] = useState<any[]>([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientPage, setPatientPage] = useState(1);
  const [patientLimit, setPatientLimit] = useState(8);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      const token = getBackendToken();
      try {
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
        const response = await res.json();
        setAppointments(Array.isArray(response?.data) ? response.data : []);
      } catch (err) {
        toast({
          title: "Error fetching appointments",
          description: "Unable to load appointments from the server.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [page, filter]);

  useEffect(() => {
    const loadPatients = async () => {
      setPatientLoading(true);
      try {
        const res = await getPatients(searchTerm);
        setPatients(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        toast({
          title: "Error fetching patients",
          description: "Unable to load patients from the server.",
        });
      } finally {
        setPatientLoading(false);
      }
    };
    loadPatients();
  }, [searchTerm]);

  const handleFilterChange = (newFilter: "all" | "today" | "pending") => {
    setFilter(newFilter);
    setPage(1);
  };

  const filteredAppointments = appointments?.filter((apt) => {
    const patientName = apt.patient?.fullName?.toLowerCase() || "";
    const doctorName = apt.doctor?.username?.toLowerCase() || "";
    return (
      patientName.includes(searchTerm.toLowerCase()) ||
      doctorName.includes(searchTerm.toLowerCase())
    );
  });

  const today = new Date();
  const todaysAppointments = appointments?.filter((apt) => {
    const aptDate = new Date(apt.date + "T00:00:00");
    return (
      aptDate.getFullYear() === today.getFullYear() &&
      aptDate.getMonth() === today.getMonth() &&
      aptDate.getDate() === today.getDate()
    );
  });

  const paginatedPatients = patients.slice(
    (patientPage - 1) * patientLimit,
    patientPage * patientLimit
  );

  const patientTotalPages = Math.max(1, Math.ceil(patients.length / patientLimit));

  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  const recentPatients = patients?.filter((p) => {
    if (!p.createdAt) return false;
    const patientDate = new Date(p.createdAt);
    return patientDate >= oneWeekAgo;
  });

  const upcomingAppointments = appointments
    .filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate >= today && (apt.status === "pending" || apt.status === "available");
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextAvailableTime =
    upcomingAppointments.length > 0
      ? new Date(upcomingAppointments[0].date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  const availableSlots = todaysAppointments?.filter(
    (apt) => apt.status === "pending" || apt.status === "confirmed"
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-100 via-pink-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white border-b shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col lg:flex-row justify-between gap-4 lg:items-center">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Reception Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">Wellness Healthcare Center</p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search patients..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Dashboard Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <motion.div
            className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl shadow-lg p-4 sm:p-6 text-white"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-xs sm:text-sm font-medium">Today's Appointments</h3>
            <div className="flex items-center mt-2 space-x-2">
              <span className="text-xl sm:text-2xl font-bold">
                {todaysAppointments.length}
              </span>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-xs sm:text-sm mt-1">
              {todaysAppointments?.filter((a) => a.status === "pending").length} pending
              confirmations
            </p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl shadow-lg p-4 sm:p-6 text-white"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-xs sm:text-sm font-medium">Total Patients</h3>
            <div className="flex items-center mt-2 space-x-2">
              <span className="text-xl sm:text-2xl font-bold">{patients.length}</span>
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-xs sm:text-sm mt-1">+{recentPatients.length} this week</p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-blue-400 to-green-400 rounded-xl shadow-lg p-4 sm:p-6 text-white"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-xs sm:text-sm font-medium">Available Slots</h3>
            <div className="flex items-center mt-2 space-x-2">
              <span className="text-xl sm:text-2xl font-bold">{nextAvailableTime}</span>
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-xs sm:text-sm mt-1">
              {availableSlots.length > 0
                ? availableSlots
                    .slice(0, 3)
                    .map((slot) =>
                      new Date(slot.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    )
                    .join(", ")
                : "No available slots"}
            </p>
            {availableSlots.length > 3 && (
              <p className="text-xs text-yellow-100 mt-1">
                +{availableSlots.length - 3} more slots available
              </p>
            )}
          </motion.div>
        </section>

        {/* Appointments + Patients */}
        <section className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            {/* ============== Latest Appointments ============== */}
            <motion.section
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <Card className="shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-yellow-50 to-orange-50 p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                      <CardTitle className="text-base sm:text-lg">
                        Latest Appointments
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {appointments.length} total • {todaysAppointments.length} today •{" "}
                        {appointments?.filter((a) => a.status === "pending").length} pending
                      </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-xs text-muted-foreground">Filter</span>
                      <Select
                        onValueChange={(val) => handleFilterChange(val as any)}
                        value={filter}
                      >
                        <SelectTrigger className="w-full sm:w-36 h-8">
                          <SelectValue placeholder="Filter appointments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-3">
                    {loading && (
                      <div className="space-y-2">
                        <div className="h-16 rounded-lg bg-muted animate-pulse" />
                        <div className="h-16 rounded-lg bg-muted animate-pulse" />
                        <div className="h-16 rounded-lg bg-muted animate-pulse" />
                      </div>
                    )}

                    {!loading && filteredAppointments.length === 0 && (
                      <div className="rounded-lg border p-6 text-sm text-center text-muted-foreground bg-white">
                        No appointments match your filters.
                      </div>
                    )}

                    {!loading &&
                      filteredAppointments.map((latestAppointment, index) => (
                        <motion.div
                          key={latestAppointment.id}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: index * 0.05 }}
                        >
                          <Card className="border-l-4 border-yellow-400 hover:shadow-md transition-shadow">
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                                  <div className="w-2.5 h-2.5 rounded-full mt-1.5 bg-yellow-400 flex-shrink-0" />
                                  <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium">
                                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500 flex-shrink-0" />
                                      <span className="break-words">
                                        {latestAppointment.patient?.fullName || "Unknown"} •{" "}
                                        <span className="text-muted-foreground">
                                          {latestAppointment.doctor?.username || "N/A"}
                                        </span>
                                      </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                      <span className="inline-flex items-center gap-1">
                                        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600 flex-shrink-0" />
                                        {new Date(latestAppointment.date).toLocaleDateString()}
                                      </span>
                                      <span className="inline-flex items-center gap-1">
                                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-600 flex-shrink-0" />
                                        {new Date(latestAppointment.date).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                      {latestAppointment.status && (
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                            latestAppointment.status === "pending"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : latestAppointment.status === "confirmed"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-gray-100 text-gray-700"
                                          }`}
                                        >
                                          {latestAppointment.status}
                                        </span>
                                      )}
                                    </div>

                                    {latestAppointment.notes && (
                                      <p className="text-xs text-gray-600 truncate">
                                        Notes: {latestAppointment.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                  </div>

                  {/* Simple Pagination for Appointments */}
                  <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-5">
                    <Button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1 || loading}
                      variant="outline"
                      className="h-8 text-xs sm:text-sm"
                    >
                      Previous
                    </Button>
                    <div className="inline-flex items-center justify-center h-8 min-w-8 px-2 text-xs sm:text-sm rounded border bg-white">
                      {page}
                    </div>
                    <Button
                      onClick={() => setPage((prev) => prev + 1)}
                      disabled={loading}
                      variant="outline"
                      className="h-8 text-xs sm:text-sm"
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* ============== Patients with Advanced Pagination ============== */}
            <motion.section
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="space-y-4"
            >
              <Card className="shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-sky-50 p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                      <CardTitle className="text-base sm:text-lg">Patients</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {patients.length} record{patients.length === 1 ? "" : "s"} • Search to
                        filter
                      </p>
                    </div>

                    <div className="relative w-full sm:w-auto hidden sm:block">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search patients…"
                        className="pl-9 h-9 w-full sm:w-56"
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3 sm:p-4">
                  {patientLoading && (
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-muted animate-pulse" />
                      <div className="h-16 rounded-lg bg-muted animate-pulse" />
                      <div className="h-16 rounded-lg bg-muted animate-pulse" />
                    </div>
                  )}

                  {!patientLoading && patients.length === 0 && (
                    <div className="rounded-lg border p-6 text-sm text-center text-muted-foreground bg-white">
                      No patients found.
                    </div>
                  )}

                  {!patientLoading && patients.length > 0 && (
                    <div className="space-y-3">
                      {paginatedPatients.map((p: any) => (
                        <Card
                          key={p.id || p._id}
                          className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                          onClick={() => navigate(`/patient/${p.id || p._id}`)}
                        >
                          <div className="absolute left-0 top-0 h-full w-1 bg-indigo-400" />
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start gap-3">
                              <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100">
                                <span className="text-xs sm:text-sm font-semibold">
                                  {(p.fullName || p.name || "?")
                                    .split(" ")
                                    .map((s: string) => s[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase()}
                                </span>
                                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-white ring-2 ring-white">
                                  <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-500" />
                                </div>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="truncate text-sm sm:text-base font-semibold text-gray-900">
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

                                <div className="mt-2 grid gap-1.5 text-xs text-gray-600 grid-cols-1 sm:grid-cols-3">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 flex-shrink-0">
                                      📞
                                    </span>
                                    <span className="truncate">{p.contactNumber || "—"}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 flex-shrink-0">
                                      🆔
                                    </span>
                                    <span className="truncate">{p.reference || "—"}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 flex-shrink-0">
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
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Advanced Pagination for Patients */}
                  {!patientLoading && patients.length > 0 && (
                    <div className="mt-4">
                      <PaginationBar
                        page={patientPage}
                        totalPages={patientTotalPages}
                        total={patients.length}
                        limit={patientLimit}
                        limits={[8, 16, 24]}
                        onPageChange={(p) => setPatientPage(p)}
                        onLimitChange={(lim) => {
                          setPatientLimit(lim);
                          setPatientPage(1);
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReceptionDashboard;