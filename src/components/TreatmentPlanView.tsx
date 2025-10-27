import { getTreatmentAll } from "@/lib/api";
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * ONE-FILE DEMO
 * - TreatmentPlanView: shows plan with Assign/Edit buttons
 * - SimpleCalendar: shows sessions with treatment + therapist
 * - SessionEditor: receptionist form to assign therapist and set date/time/duration
 * - Mock data (patient, treatments, therapists) — replace with your API
 *
 * Drop this into a TSX file and render <TreatmentSchedulerOneFileDemo />
 */

// -------------------- TYPES -------------------- //
type TreatmentOption = {
  id: string;
  title: string;
  subTitle?: string;
  duration?: string | number; // default in minutes as string or number (e.g., "45" or 45)
  days?: string;
  treatment?: string;
};

type TreatmentPlanEntry = {
  id?: string;
  timeSlot?: string; // "09:30 – 10:15" or "09:30-10:15"
  treatments: string[];
  yogaPlan?: string;
  date: string; // ISO
};

type Appointment = {
  id: string;
  date: string; // ISO
  consultationType?: string;
  treatmentPlan: TreatmentPlanEntry[];
};

type Patient = {
  id: string;
  fullName: string;
  age?: number;
  sex?: string;
  appointment?: Appointment[];
};

type Therapist = { id: string; name: string; skills?: string[] };

export type TreatmentSession = {
  id: string;
  patientId: string;
  patientName: string;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:mm (24h)
  durationMin: number; // minutes
  treatmentId: string;
  treatmentTitle: string;
  therapistId?: string;
  therapistName?: string;
  status?: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled" | "no_show";
  note?: string;
};


const MOCK_THERAPISTS: Therapist[] = [
  { id: "th-1", name: "Priya Verma", skills: ["Abhyanga", "Shirodhara"] },
  { id: "th-2", name: "Rohit Mehra", skills: ["Shirodhara"] },
  { id: "th-3", name: "Kavya Rao", skills: ["Abhyanga"] },
];
const MOCK_TREATMENTS: TreatmentOption[] = [
  { id: "128a1d4c-b140-47d8-949c-ff81130ca722", title: "Abhyanga", subTitle: "Full-body oil massage", duration: 60 },
  { id: "1979c4c4-c673-45e8-8b19-91096c8a2967", title: "Shirodhara", subTitle: "Oil stream therapy", duration: 45 },
  { id: "TRT-STEAM", title: "Steam Therapy", subTitle: "Herbal steam", duration: 20 },
  { id: "TRT-PRANAYAMA", title: "Pranayama", subTitle: "Breath work", duration: 30 },
];

const MOCK_PATIENT: Patient = {
  id: "PT-001",
  fullName: "Aarav Gupta",
  age: 34,
  sex: "M",
  appointment: [
    {
      id: "apt-1001",
      date: "2025-05-24T09:30:00.000Z",
      consultationType: "IN_PERSON",
      treatmentPlan: [
        {
          id: "666b4cfb-6dd7-4579-b971-7406e87070b5",
          timeSlot: "09:30 – 10:15",
          treatments: [
            "128a1d4c-b140-47d8-949c-ff81130ca722",
            "1979c4c4-c673-45e8-8b19-91096c8a2967",
          ],
          yogaPlan: "Morning Surya Namaskar x6 rounds; Anulom-Vilom 10 min",
          date: "2025-05-25T00:00:00.000Z",
        },
        {
          timeSlot: "10:30 – 11:15",
          treatments: [
            "128a1d4c-b140-47d8-949c-ff81130ca722",
            "1979c4c4-c673-45e8-8b19-91096c8a2967",
          ],
          yogaPlan: "Evening gentle stretches; Box breathing 5-5-5-5",
          date: "2025-05-25T00:00:00.000Z",
        },
      ],
    },
  ],
};

// Simulate API call for treatments
async function fetchTreatmentAll(): Promise<{ data: TreatmentOption[] }> {
  // Replace with your real API
  return { data: MOCK_TREATMENTS };
}

// -------------------- UTIL -------------------- //
const IN_TZ = "Asia/Kolkata";
function formatDate(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("en-IN", { timeZone: IN_TZ, year: "numeric", month: "short", day: "2-digit" });
}
const toYMD = (iso: string | Date) => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
function parseTimeSlot(slot?: string): { start?: string; durationMin?: number } {
  if (!slot) return {};
  const m = slot.replace(/\s+/g, "").match(/(\d{2}:\d{2})[–-](\d{2}:\d{2})/);
  if (!m) return {};
  const [_, s, e] = m;
  const [sh, sm] = s.split(":").map(Number);
  const [eh, em] = e.split(":").map(Number);
  const durationMin = (eh*60+em) - (sh*60+sm);
  return { start: s, durationMin: Math.max(durationMin, 0) };
}

// -------------------- CALENDAR -------------------- //
type SimpleCalendarProps = {
  appointments: TreatmentSession[];
  onEventClick?: (e: TreatmentSession) => void;
  selectedDate?: string | null;
  setSelectedDate?: (v: string) => void;
};

const SimpleCalendar: React.FC<SimpleCalendarProps> = ({
  appointments, onEventClick, selectedDate, setSelectedDate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
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
    if (!day) return [] as TreatmentSession[];
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
      case "confirmed": return "bg-green-100 border-green-300 text-green-800";
      case "pending": return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "cancelled": return "bg-red-100 border-red-300 text-red-800";
      case "completed": return "bg-emerald-100 border-emerald-300 text-emerald-800";
      case "rescheduled": return "bg-violet-100 border-violet-300 text-violet-800";
      case "no_show": return "bg-orange-100 border-orange-300 text-orange-800";
      default: return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button className="px-3 py-1.5 rounded border" onClick={() => navigateMonth(-1)}>← Previous</button>
        <h2 className="text-xl font-semibold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button className="px-3 py-1.5 rounded border" onClick={() => navigateMonth(1)}>Next →</button>
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
            ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            : "";

          return (
            <div
              key={index}
              className={`min-h-32 p-1 border rounded-lg ${
                day ? "bg-white hover:bg-gray-50 cursor-pointer" : "bg-transparent"
              } ${isToday ? "ring-2 ring-blue-500" : ""} ${
                selectedDate === dateStr ? "ring-2 ring-indigo-500" : ""
              }`}
              onClick={() => day && setSelectedDate && setSelectedDate(dateStr)}
            >
              {day && (
                <>
                  <div className={`font-medium text-sm mb-1 p-1 ${
                    isToday ? "bg-blue-500 text-white rounded text-center" : ""
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {dayAppointments.slice(0, 4).map((apt) => (
                      <div
                        key={apt.id}
                        className={`text-xs p-2 rounded border hover:opacity-80 transition-opacity ${getStatusColor(
                          apt.status
                        )}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(apt);
                        }}
                        title={`${apt.patientName} · ${apt.time} · ${apt.treatmentTitle}${apt.therapistName ? " · " + apt.therapistName : ""}`}
                      >
                        <div className="font-semibold truncate">{apt.treatmentTitle}</div>
                        <div className="truncate opacity-80">{apt.time} · {apt.patientName}</div>
                        {apt.therapistName && <div className="truncate opacity-70">👤 {apt.therapistName}</div>}
                      </div>
                    ))}
                  </div>
                  {dayAppointments.length > 4 && (
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      +{dayAppointments.length - 4} more
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

// -------------------- SESSION EDITOR -------------------- //
type SessionEditorProps = {
  open: boolean;
  onClose: () => void;
  therapists: Therapist[];
  treatments: TreatmentOption[];
  initial: Partial<TreatmentSession> & { treatmentId?: string; patientId?: string; patientName?: string };
  onSave: (session: TreatmentSession) => void;
};

const SessionEditor: React.FC<SessionEditorProps> = ({
  open, onClose, therapists, treatments, initial, onSave
}) => {
  const [date, setDate] = useState(initial.date || toYMD(new Date().toISOString()));
  const [time, setTime] = useState(initial.time || "09:00");
  const [durationMin, setDurationMin] = useState<number>(initial.durationMin || 45);
  const [treatmentId, setTreatmentId] = useState(initial.treatmentId || treatments[0]?.id);
  const [therapistId, setTherapistId] = useState(initial.therapistId || "");

  useEffect(() => {
    if (!open) return;
    // update default duration when treatment changes and no explicit duration present
    const t = treatments.find((x) => x.id === treatmentId);
    if (!initial.durationMin && t?.duration && !isNaN(Number(t.duration))) {
      setDurationMin(Number(t.duration));
    }
  }, [open, treatmentId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{initial.id ? "Edit Session" : "Assign Therapist"}</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">Treatment
            <select className="mt-1 w-full border rounded-lg p-2" value={treatmentId} onChange={(e) => setTreatmentId(e.target.value)}>
              {treatments.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </label>

          <label className="text-sm">Therapist
            <select className="mt-1 w-full border rounded-lg p-2" value={therapistId} onChange={(e) => setTherapistId(e.target.value)}>
              <option value="">— Select —</option>
              {therapists.map((th) => (
                <option key={th.id} value={th.id}>{th.name}</option>
              ))}
            </select>
          </label>

          <label className="text-sm">Date
            <input type="date" className="mt-1 w-full border rounded-lg p-2" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <label className="text-sm">Start Time
            <input type="time" className="mt-1 w-full border rounded-lg p-2" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>

          <label className="text-sm col-span-2">Duration (minutes)
            <input type="number" min={10} step={5} className="mt-1 w-full border rounded-lg p-2"
              value={durationMin} onChange={(e) => setDurationMin(Math.max(0, Number(e.target.value)))} />
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button className="px-3 py-2 rounded-lg border" onClick={onClose}>Cancel</button>
          <button
            className="px-3 py-2 rounded-lg bg-amber-500 text-white"
            onClick={() => {
            // inside SessionEditor "Save" onClick
const t = treatments.find((x) => x.id === treatmentId);
const th = therapists.find((x) => x.id === therapistId);

const full: TreatmentSession = {
  id: initial.id || `sess-${Math.random().toString(36).slice(2, 9)}`,
  patientId: initial.patientId!,
  patientName: initial.patientName!,
  date, time, durationMin,
  treatmentId: treatmentId!,
  treatmentTitle: t?.title ?? "Unknown Treatment",
  therapistId: therapistId || undefined,
  therapistName: th?.name,
  status: (initial.status as any) || "pending",
  note: initial.note,
};

              onSave(full);
              onClose();
            }}
          >Save</button>
        </div>
      </div>
    </div>
  );
};

// -------------------- CONTEXT -------------------- //
const SessionsContext = React.createContext<{
  sessions: TreatmentSession[];
  setSessions: React.Dispatch<React.SetStateAction<TreatmentSession[]>>;
  therapists: Therapist[];
  treatments: TreatmentOption[];
}>({ sessions: [], setSessions: () => {}, therapists: [], treatments: [] });

// -------------------- ROOT DEMO -------------------- //
export default function TreatmentSchedulerOneFileDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-4">
        <SchedulerLeft patient={MOCK_PATIENT} />
        <SchedulerRight />
      </div>
    </div>
  );
}

function SchedulerLeft({ patient }: { patient: Patient }) {
  const [treatments, setTreatments] = useState<TreatmentOption[]>([]);
  const [sessions, setSessions] = useState<TreatmentSession[]>([]);

  useEffect(() => { (async () => {
    const res = await fetchTreatmentAll();
    setTreatments(res.data);
  })(); }, []);

  // Seed sessions from treatment plan (one per treatment)
  useEffect(() => {
    if (!treatments.length) return;
    const appts = patient.appointment ?? [];
    const seed: TreatmentSession[] = [];
    appts.forEach((apt) => {
      (apt.treatmentPlan ?? []).forEach((plan, idx) => {
        const { start, durationMin } = parseTimeSlot(plan.timeSlot);
        const baseDate = toYMD(plan.date);
        (plan.treatments ?? []).forEach((tId, tIdx) => {
          const t = treatments.find((x) => x.id === tId);
          seed.push({
            id: `seed-${apt.id}-${idx}-${tIdx}`,
            patientId: patient.id,
            patientName: patient.fullName,
            date: baseDate,
            time: start || "09:00",
            durationMin: durationMin || Number(t?.duration || 45),
            treatmentId: tId,
            treatmentTitle: t?.title || `Treatment ${tIdx + 1}`,
            status: "pending",
          });
        });
      });
    });
    setSessions(seed);
  }, [patient, treatments]);

  return (
    <SessionsContext.Provider value={{ sessions, setSessions, therapists: MOCK_THERAPISTS, treatments }}>
      <TreatmentPlanView patient={patient} />
    </SessionsContext.Provider>
  );
}

function SchedulerRight() {
  const { sessions, setSessions, therapists, treatments } = React.useContext(SessionsContext);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editing, setEditing] = useState<TreatmentSession | null>(null);

  return (
    <div className="bg-white p-4 shadow rounded-xl border">
      <div className="flex items-center justify-between pb-3 border-b mb-3">
        <h2 className="text-xl font-semibold">Clinic Calendar</h2>
        <div className="text-sm text-gray-500">Click a card to edit</div>
      </div>

      <SimpleCalendar
        appointments={sessions}
        onEventClick={(sess) => setEditing(sess)}
        selectedDate={selectedDate || undefined}
        setSelectedDate={(d) => setSelectedDate(d)}
      />

      <SessionEditor
        open={!!editing}
        onClose={() => setEditing(null)}
        therapists={therapists}
        treatments={treatments}
        initial={editing || {}}
        onSave={(updated) => {
          setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        }}
      />
    </div>
  );
}

// -------------------- TREATMENT PLAN VIEW -------------------- //
// ---- types you likely already have; adjust if needed ----


// ---- optional: a mock for getTreatmentAll() while backend is down ----
async function getTreatmentAllMock() {
  // mimic your real API shape { data: TreatmentOption[] }
  return new Promise<{ data: TreatmentOption[] }>((resolve) =>
    setTimeout(() => resolve({ data: MOCK_TREATMENTS }), 250)
  );
}

// ---- hook: tries real API, falls back to mock when empty/error ----
function useTreatmentOptions() {
  const [treatmentOptions, setTreatmentOptions] = React.useState<TreatmentOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const fetchedRef = React.useRef(false);

  React.useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async () => {
      try {
        // swap these lines depending on what you want during dev:
        // const result = await getTreatmentAll(); // <- real API
        const result = await getTreatmentAllMock(); // <- mocked API

        const list = Array.isArray(result?.data) ? result.data : [];
        setTreatmentOptions(list.length ? list : MOCK_TREATMENTS);
      } catch (e) {
        // hard fallback to mock on any error
        setTreatmentOptions(MOCK_TREATMENTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { treatmentOptions, loading };
}

// ---- tiny helpers used by your component (same as your originals) ----

// ---- your component, minimally changed ----
// ---- your component, minimally changed ----
export function TreatmentPlanView({ patient }: { patient: any }) {
  // ✅ Mock appointment data for demo
  const MOCK_APPOINTMENTS = [
    {
      id: "apt-demo-1",
      date: "2025-10-28T09:30:00.000Z",
      consultationType: "IN_PERSON",
      treatmentPlan: [
        {
          id: "plan-1",
          date: "2025-10-28T00:00:00.000Z",
          timeSlot: "09:30 - 10:15",
          yogaPlan: "Morning Surya Namaskar x6 rounds; Anulom-Vilom 10 min",
          treatments: [
            "128a1d4c-b140-47d8-949c-ff81130ca722", // Abhyanga
            "1979c4c4-c673-45e8-8b19-91096c8a2967", // Shirodhara
          ],
        },
        {
          id: "plan-2",
          date: "2025-10-29T00:00:00.000Z",
          timeSlot: "10:30 - 11:15",
          yogaPlan: "Evening gentle stretches; Box breathing 5-5-5-5",
          treatments: ["1979c4c4-c673-45e8-8b19-91096c8a2967"], // Shirodhara
        },
      ],
    },
  ];

  // ✅ Use mock appointments instead of API
  const appointments = MOCK_APPOINTMENTS;

  const appointmentsWithTreatment = React.useMemo(
    () => appointments.filter((apt) => apt.treatmentPlan && apt.treatmentPlan.length > 0),
    [appointments]
  );

  console.log("appointmentsWithTreatment", appointmentsWithTreatment);

  const [selectedAppointmentIndex, setSelectedAppointmentIndex] = React.useState(0);

  // Pull from context (treatments + therapists)
  const { sessions, setSessions, therapists, treatments } = React.useContext(SessionsContext);

  React.useEffect(() => {
    if (selectedAppointmentIndex >= appointmentsWithTreatment.length) setSelectedAppointmentIndex(0);
  }, [appointmentsWithTreatment.length, selectedAppointmentIndex]);

  const getTreatmentDetails = (treatmentId: string) =>
    treatments.find((t) => t.id === treatmentId);

  const selectedAppointment = appointmentsWithTreatment[selectedAppointmentIndex];
  const treatmentPlan: TreatmentPlanEntry[] = selectedAppointment?.treatmentPlan ?? [];

  const [draft, setDraft] = React.useState<{
    open: boolean;
    initial?: Partial<TreatmentSession> & { treatmentId?: string };
  }>({ open: false });

  const openAssign = (plan: TreatmentPlanEntry, treatmentId: string) => {
    const { start, durationMin } = parseTimeSlot(plan.timeSlot);
    const t = getTreatmentDetails(treatmentId);
    setDraft({
      open: true,
      initial: {
        patientId: patient.id,
        patientName: patient.fullName,
        treatmentId,
        date: toYMD(plan.date),
        time: start || "09:00",
        durationMin: durationMin || Number(t?.duration || 45),
        status: "pending",
      },
    });
  };
  return (
    <div className="bg-white p-4 shadow rounded-xl border">
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-2xl font-semibold">Treatment Plan</h2>
        {/* {loading && <span className="text-sm text-gray-500">Loading treatments…</span>} */}
      </div>

      {appointmentsWithTreatment.length > 1 && (
        <div className="mt-4">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Select Appointment:</label>
          <div className="flex gap-2 flex-wrap">
            {appointmentsWithTreatment.map((apt: any, idx: number) => (
              <button
                key={apt.id ?? `apt-${idx}`}
                onClick={() => setSelectedAppointmentIndex(idx)}
                className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                  selectedAppointmentIndex === idx ? "bg-amber-500 text-white border-amber-600" : "hover:bg-gray-50"
                }`}
              >
                📅 {formatDate(apt.date)}{" "}
                {apt.consultationType && (
                  <span className="opacity-80 text-xs">({apt.consultationType.replace(/_/g, " ")})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        {/* Patient Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><strong>Patient Name:</strong> {patient?.fullName || "N/A"}</div>
            <div><strong>Patient ID:</strong> {patient?.id || "N/A"}</div>
            <div><strong>Age/Gender:</strong> {patient?.age ?? "N/A"}Y / {patient?.sex || "N/A"}</div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold bg-gray-200 py-2 rounded">Treatment Plan</h3>
          {selectedAppointment && (
            <p className="text-sm text-gray-600 mt-1">Appointment Date: {formatDate(selectedAppointment.date)}</p>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-2 border-gray-800 text-sm">
            <thead>
              <tr>
                <th className="border-2 border-gray-800 bg-gray-200 p-3 text-left">Date</th>
                <th className="border-2 border-gray-800 bg-gray-200 p-3 text-left">Time Slot</th>
                <th className="border-2 border-gray-800 bg-gray-200 p-3 text-left">Yoga Plan</th>
                <th className="border-2 border-gray-800 bg-gray-200 p-3 text-left">Treatments</th>
              </tr>
            </thead>
            <tbody>
              {treatmentPlan.map((plan, idx) => (
                <tr key={plan.id ?? `plan-${idx}`}>
                  <td className="border-2 border-gray-800 p-3 font-semibold">{formatDate(plan.date)}</td>
                  <td className="border-2 border-gray-800 p-3">{plan.timeSlot || "N/A"}</td>
                  <td className="border-2 border-gray-800 p-3 whitespace-pre-line">{plan.yogaPlan || "N/A"}</td>
                  <td className="border-2 border-gray-800 p-3">
                    {plan.treatments?.length ? (
                      <div className="space-y-3">
                        {plan.treatments.map((treatmentId, tIdx) => {
                          const t = getTreatmentDetails(treatmentId);
                          const existing = sessions.find(
                            (s: any) => s.date === toYMD(plan.date) && s.treatmentId === treatmentId
                          );
                          return (
                            <div key={`${treatmentId}-${tIdx}`} className="border-l-4 border-amber-500 pl-3 py-2 bg-gray-50 rounded">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-gray-800">{t?.title || `Treatment ${tIdx + 1}`}</div>
                                  {t?.subTitle && <div className="text-xs text-gray-600 mt-1">{t.subTitle}</div>}
                                  {existing && (
                                    <div className="mt-2 text-xs text-emerald-700">
                                      Assigned: {existing.time} · {existing.therapistName || "(No therapist)"}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    className="px-2.5 py-1.5 rounded-lg border text-sm"
                                    onClick={() => openAssign(plan, treatmentId)}
                                  >
                                    {existing ? "Edit" : "Assign"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-500">No treatments assigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Draft modal */}
        <SessionEditor
          open={draft.open}
          onClose={() => setDraft({ open: false })}
          therapists={therapists}
          treatments={treatments}
          initial={draft.initial || {}}
          onSave={(sess) => {
            setSessions((prev: any[]) => {
              const exists = prev.some((p) => p.id === sess.id);
              return exists ? prev.map((p) => (p.id === sess.id ? sess : p)) : [...prev, sess];
            });
          }}
        />
      </div>
    </div>
  );
}

