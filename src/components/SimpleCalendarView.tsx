"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  getPatientTreatmentCalendar,
  getTreatmentAll,
  getTherapyList,
} from "@/lib/api";

interface Appointment {
  date: string;
  consultationId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  includeYoga: boolean;
  dietChart: string;
  yogaChart: string;
  treatmentIds: string[];
  treatmentDuration: string;
  createdAt: string;
}

const SimpleCalendar = ({
  appointments,
  onEventClick,
  selectedDate,
  setSelectedDate,
}: {
  appointments: Appointment[];
  onEventClick?: (apt: Appointment) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthNames = [
    "January","February","March","April","May","June","July","August","September","October","November","December",
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
    if (!day) return [];
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date + "T00:00:00");
      return (
        aptDate.getFullYear() === currentDate.getFullYear() &&
        aptDate.getMonth() === currentDate.getMonth() &&
        aptDate.getDate() === day
      );
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={() => navigateMonth(-1)}>←</Button>
        <h2 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <Button variant="outline" onClick={() => navigateMonth(1)}>→</Button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map((d) => (
          <div key={d} className="text-center font-medium text-gray-500">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {getDaysInMonth(currentDate).map((day, i) => {
          const dayAppointments = getAppointmentsForDay(day);
          const dateStr = day
            ? `${currentDate.getFullYear()}-${String(
                currentDate.getMonth() + 1
              ).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            : "";

          return (
            <div
              key={i}
              className={`min-h-32 p-1 border rounded-lg ${
                day ? "hover:bg-gray-50 cursor-pointer" : "bg-transparent"
              } ${selectedDate === dateStr ? "ring-2 ring-indigo-500" : ""}`}
              onClick={() => day && setSelectedDate(dateStr)}
            >
              {day && (
                <>
                  <div className="font-medium text-sm mb-1 text-center">{day}</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {dayAppointments.slice(0, 3).map((apt, j) => (
                      <div
                        key={j}
                        className="text-xs p-1 rounded border bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(apt);
                        }}
                      >
                        <div className="font-semibold truncate">
                          {apt.treatmentIds?.length
                            ? apt.treatmentIds.join(", ")
                            : "No Recommendations"}
                        </div>
                        <div className="text-[10px] text-gray-600">
                          {apt.treatmentDuration
                            ? `Duration: ${apt.treatmentDuration}`
                            : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SimpleCalendarView = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  const fetchAppointments = async () => {
    try {
      const [calendarRes, treatmentRes, therapyRes] = await Promise.all([
        getPatientTreatmentCalendar("2024-11-01", "2026-11-08"),
        getTreatmentAll(),
        getTherapyList(),
      ]);

      const treatmentMap = new Map(
        (treatmentRes?.data || []).map((t: any) => [t.id, t.title || t.treatment])
      );

      const therapyMap = new Map(
        (therapyRes?.data || []).map((t: any) => [t.id, t.title || t.treatment])
      );

      const data = calendarRes?.data?.data || {};

      const formatted = Object.entries(data).flatMap(
        ([date, consultations]: any) =>
          consultations.map((c: any) => {
            const recIds = Array.isArray(c.treatment?.recommendation?.title)
              ? c.treatment?.recommendation?.title
              : [c.treatment?.recommendation?.title].filter(Boolean);

            const readableNames = recIds.map(
              (id: string) =>
                treatmentMap.get(id) || therapyMap.get(id) || id
            );

            return {
              date,
              consultationId: c.consultationId,
              patientId: c.patientId,
              patientName: c.fullName,
              doctorName: c.doctorName || "",
              includeYoga: c.includeYoga || false,
              dietChart: c.treatment?.dietChart?.title || "",
              yogaChart: c.treatment?.yogaChart?.title || "",
              treatmentIds: readableNames,
              treatmentDuration: c.treatment?.recommendation?.duration || "",
              createdAt: c.createdAt,
            };
          })
      );

      setAppointments(formatted);
    } catch (err) {
      console.error("Calendar fetch error:", err);
      toast({
        title: "Error loading calendar",
        description: String(err),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Treatment Calendar</h2>
        <Button variant="outline" onClick={fetchAppointments}>
          Refresh
        </Button>
      </div>
      <SimpleCalendar
        appointments={appointments}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onEventClick={(apt) => {
          toast({
            title: `Patient: ${apt.patientName}`,
            description: apt.treatmentIds.join(", "),
          });
        }}
      />
    </div>
  );
};
