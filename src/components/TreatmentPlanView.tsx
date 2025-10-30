import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import {
  getAllTherapist,
  getTreatmentAll,
  updatePatient,
  assignTherapist,
  getAllYoga,
  generatetTreatmentPDF,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";

// -------------------- TYPES -------------------- //
type TreatmentOption = {
  id: string;
  title: string;
  subTitle?: string;
  duration?: string | number;
  days?: string;
  treatment?: string;
};

type TreatmentPlanEntry = {
  id?: string;
  timeSlot?: string; // e.g. "09:30 – 10:15"
  treatments?: string[]; // older shape if treatments array
  treatmentAssign?: any[]; // new shape from your API
  yogaPlan?: string | null;
  asanas?: { id: string; name: string }[];
  date: string; // ISO or YYYY-MM-DD
};

type Patient = {
  id: string;
  fullName: string;
  age?: number;
  sex?: string;
  treatmentPlan: TreatmentPlanEntry[];
  // plus any other fields your API returns
};

type Therapist = {
  id: string;
  name: string;
  skills?: string[];
};

export type TreatmentSession = {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24h)
  durationMin: number; // minutes
  treatmentId: string;
  treatmentTitle: string;
  therapistId?: string;
  therapistName?: string;
  status?:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "rescheduled"
    | "no_show";
  note?: string;
};

// -------------------- UTIL -------------------- //
const IN_TZ = "Asia/Kolkata";
function formatDate(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("en-IN", {
    timeZone: IN_TZ,
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
const toYMD = (iso: string | Date) => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};
function parseTimeSlot(slot?: string): {
  start?: string;
  durationMin?: number;
} {
  if (!slot) return {};
  const m = slot.replace(/\s+/g, "").match(/(\d{2}:\d{2})[–-](\d{2}:\d{2})/);
  if (!m) return {};
  const [_, s, e] = m;
  const [sh, sm] = s.split(":").map(Number);
  const [eh, em] = e.split(":").map(Number);
  const durationMin = eh * 60 + em - (sh * 60 + sm);
  return { start: s, durationMin: Math.max(durationMin, 0) };
}

// -------------------- CONTEXT -------------------- //
const SessionsContext = React.createContext<{
  sessions: TreatmentSession[];
  setSessions: React.Dispatch<React.SetStateAction<TreatmentSession[]>>;
  therapists: Therapist[];
  treatments: TreatmentOption[];
}>({
  sessions: [],
  setSessions: () => {},
  therapists: [],
  treatments: [],
});

// -------------------- CALENDAR COMPONENT -------------------- //
type SimpleCalendarProps = {
  appointments: any[];
  onEventClick?: (e: TreatmentSession) => void;
  selectedDate?: string | null;
  setSelectedDate?: (v: string) => void;
};
function mapTreatmentPlansToSessions(plans: any[], patientName = "") {
  const sessions: any[] = [];

  for (const plan of plans) {
    const [start] = (plan.timeSlot || "").split(" - ");
    const { date, id: treatmentPlanId } = plan; // ✅ extract plan ID here

    // ---- Map all treatments ----
    for (const assign of plan.treatmentAssign || []) {
      const treatment = assign.treatment;
      const therapist = assign.therapist;

      sessions.push({
        id: assign.id,
        treatmentPlanId, // ✅ associate session with its plan
        date,
        time: start || "09:00AM",
        durationMin: Number(treatment?.duration?.replace(/\D/g, "")) || 60,
        treatmentId: treatment?.id,
        treatmentTitle: treatment?.title || "Untitled Treatment",
        therapistId: therapist?.id,
        therapistName: therapist?.name || "Unassigned",
        patientName,
        status: therapist ? "confirmed" : "pending",
      });
    }

    // ---- Map asanas as separate "Yoga Sessions" ----
    for (const asana of plan.asanas || []) {
      sessions.push({
        id: `asana-${asana.id}`,
        treatmentPlanId, // ✅ link yoga to plan too
        date,
        time: start || "09:00AM",
        treatmentId: asana.id,
        treatmentTitle: asana.name,
        therapistName: "Yoga Instructor",
        patientName,
        status: "confirmed",
      });
    }
  }

  return sessions;
}

const SimpleCalendar: React.FC<SimpleCalendarProps> = ({
  appointments,
  onEventClick,
  selectedDate,
  setSelectedDate,
}) => {
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

  // 🔹 Automatically flatten treatmentPlan-style data
  const normalizeAppointments = (input: any[]) => {
    if (!input?.length) return [];

    // detect nested structure like your JSON
    const looksNested = input[0]?.treatmentAssign && input[0]?.timeSlot;

    if (!looksNested) return input; // already flat sessions

    const all: any[] = [];
    input.forEach((plan) => {
      const [start] = (plan.timeSlot || "").split(" - ");
      (plan.treatmentAssign || []).forEach((assign: any) => {
        all.push({
          id: assign.id,
          date: plan.date,
          time: start || "09:00AM",
          treatmentTitle: assign.treatment?.title || "Unknown Treatment",
          therapistName: assign.therapist?.name || "Unassigned",
          patientName: "Patient",
          status: "pending",
        });
      });

      (plan.asanas || []).forEach((asana: any) => {
        all.push({
          id: `asana-${asana.id}`,
          date: plan.date,
          time: start || "09:00AM",
          treatmentTitle: asana.name,
          therapistName: "Yoga Instructor",
          patientName: "Patient",
          status: "confirmed",
        });
      });
    });

    return all;
  };

  const flatAppointments = normalizeAppointments(appointments);

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
    return flatAppointments.filter((apt) => {
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
      <div className="flex justify-between items-center mb-4">
        <button
          className="px-3 py-1.5 rounded border"
          onClick={() => navigateMonth(-1)}
        >
          ← Previous
        </button>
        <h2 className="text-xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          className="px-3 py-1.5 rounded border"
          onClick={() => navigateMonth(1)}
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map((day) => (
          <div key={day} className="text-center font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {getDaysInMonth(currentDate).map((day, idx) => {
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
              key={idx}
              className={`min-h-32 p-1 border rounded-lg ${
                day
                  ? "bg-white hover:bg-gray-50 cursor-pointer"
                  : "bg-transparent"
              } ${isToday ? "ring-2 ring-blue-500" : ""} ${
                selectedDate === dateStr ? "ring-2 ring-indigo-500" : ""
              }`}
              onClick={() => day && setSelectedDate && setSelectedDate(dateStr)}
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
                    {dayAppointments.slice(0, 4).map((apt) => (
                      <div
                        key={apt.id}
                        className={`text-xs p-2 rounded-lg border hover:opacity-90 transition-all ${getStatusColor(
                          apt.status
                        )} shadow-sm`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(apt);
                        }}
                        title={`${apt.treatmentTitle} • ${apt.time} • ${
                          apt.therapistName || "Unassigned"
                        }`}
                      >
                        <div className="font-semibold truncate text-amber-800 flex items-center gap-1">
                          💆‍♀️{" "}
                          <span>
                            {apt.treatmentTitle || "Untitled Treatment"}
                          </span>
                        </div>
                        <div className="truncate text-sky-800 flex items-center gap-1">
                          👤{" "}
                          <span>
                            {apt.therapistName || "No Therapist Assigned"}
                          </span>
                        </div>
                        <div className="truncate text-gray-700 flex items-center gap-1">
                          🕒 <span>{apt.time}</span> · 🧍{" "}
                          <span>{apt.patientName}</span>
                        </div>
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
interface SessionEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (session: TreatmentSession) => void;
  treatments: any[];
  therapists: any[];
  initial: any;
  patient: any;
}

interface TreatmentUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  patient: any;
  treatments: any[];

  initial: {
    patientId: string;
    treatmentPlanId: string;
    treatmentAssignId: string;
  };
}

export const TreatmentUpdateDialog: React.FC<TreatmentUpdateDialogProps> = ({
  open,
  onClose,
  onSave,
  patient,
  treatments,
  initial,
}) => {
  const [newTreatmentId, setNewTreatmentId] = useState("");
  const [currentTreatmentTitle, setCurrentTreatmentTitle] = useState("");
  const [yogaCategories, setYogaCategories] = useState([]); // 🔹 New state for yoga list
  const [selectedYoga, setSelectedYoga] = useState("");
  // 🔹 Fetch yoga data on mount
  useEffect(() => {
    const fetchYoga = async () => {
      try {
        const res = await getAllYoga();
        setYogaCategories(res.data || []);
      } catch (err) {
        console.error("Error fetching yoga data:", err);
      }
    };
    fetchYoga();
  }, []);
  // 🔹 Find current treatment info
  useEffect(() => {
    if (!open || !patient?.treatmentPlan) return;

    const assign = patient.treatmentPlan
      .flatMap((plan) => plan.treatmentAssign)
      .find((a) => a.id === initial.treatmentAssignId);

    if (assign) {
      setCurrentTreatmentTitle(assign.treatment.title);
    }
  }, [open, patient, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Update Treatment</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Current treatment:{" "}
            <strong>{currentTreatmentTitle || "Unknown"}</strong>
          </p>

          <label className="text-sm">
            New Treatment
            <select
              className="mt-1 w-full border rounded-lg p-2"
              value={newTreatmentId}
              onChange={(e) => setNewTreatmentId(e.target.value)}
            >
              <option value="">— Select New Treatment —</option>
              {treatments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} — {t.subTitle}
                </option>
              ))}
            </select>
          </label>
          {/* 🔹 Yoga Dropdown */}
          <label className="text-sm">
            Yoga / Asana Plan
            <select
              className="mt-1 w-full border rounded-lg p-2"
              value={selectedYoga}
              onChange={(e) => setSelectedYoga(e.target.value)}
            >
              <option value="">— Select Yoga Plan —</option>
              {yogaCategories.map((cat) => (
                <optgroup key={cat.id} label={cat.name}>
                  {cat.subCategories.flatMap((sub) =>
                    sub.items.length > 0 ? (
                      sub.items.map((item) => (
                        <option
                          key={item.id}
                          value={`${cat.name} › ${sub.name} › ${item.name}`}
                        >
                          {sub.name} › {item.name}
                        </option>
                      ))
                    ) : (
                      <option key={sub.id} value={`${cat.name} › ${sub.name}`}>
                        {sub.name}
                      </option>
                    )
                  )}
                </optgroup>
              ))}
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button className="px-3 py-2 rounded-lg border" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-3 py-2 rounded-lg bg-emerald-600 text-white disabled:bg-gray-300"
            disabled={!newTreatmentId && !selectedYoga}
            onClick={async () => {
              try {
                // ✅ 1. Update local structure
                const updatedPlans = patient.treatmentPlan.map((plan) =>
                  plan.id === initial.treatmentPlanId
                    ? {
                        ...plan,
                        yogaPlan: selectedYoga, // update yoga
                        treatmentAssign: plan.treatmentAssign.map((ta) =>
                          ta.id === initial.treatmentAssignId
                            ? {
                                ...ta,
                                treatment: treatments.find(
                                  (t) => t.id === newTreatmentId
                                ),
                              }
                            : ta
                        ),
                      }
                    : plan
                );

                // ✅ 2. Build payload for backend
                const treatmentPlanData = updatedPlans.map((plan) => ({
                  id: plan.id,
                  date: plan.date,
                  timeSlot: plan.timeSlot,
                  yogaPlan: plan.yogaPlan || "",
                  asanas: plan.asanas?.map((a) =>
                    typeof a === "string" ? a : a.id
                  ),
                  treatmentAssign: plan.treatmentAssign.map((ta) => ({
                    id: ta.id,
                    treatment: ta.treatment?.id,
                    therapist: ta.therapist?.id,
                  })),
                }));

                const payload = {
                  treatmentPlan:
                    treatmentPlanData.length > 0
                      ? treatmentPlanData
                      : undefined,
                };

                console.log("🧘 Updating consultation with payload:", payload);

                // ✅ 3. Send update request
                await updatePatient(patient.id, payload);

                console.log("✅ Treatment & Yoga updated successfully!");
                onSave(); // refresh parent
                onClose();
              } catch (err) {
                console.error("Error updating treatment:", err);
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export const SessionEditor: React.FC<SessionEditorProps> = ({
  open,
  onClose,
  therapists,
  treatments,
  initial,
  onSave,
  patient,
}) => {
  console.log("SessionEditor initial:", initial, patient);
  const [date, setDate] = useState(
    initial.date || new Date().toISOString().slice(0, 10)
  );
  const [time, setTime] = useState(initial.time || "09:00");
  const [durationMin, setDurationMin] = useState<number>(
    initial.durationMin || 45
  );
  const [treatmentId, setTreatmentId] = useState(initial.treatmentId || "");
  const [therapistId, setTherapistId] = useState(initial.therapistId || "");

  // ✅ 1. Show only treatments assigned to this patient
  const patientTreatments: any[] = useMemo(() => {
    if (!patient?.treatmentPlan) return [];
    const allAssigns = patient.treatmentPlan.flatMap(
      (plan: any) => plan.treatmentAssign || []
    );
    const uniqueTreatments = Array.from(
      new Map(
        allAssigns
          .filter((a: any) => a.treatment && a.treatment.id)
          .map((a: any) => [a.treatment.id, a.treatment])
      ).values()
    );
    return uniqueTreatments;
  }, [patient]);

  // ✅ 2. Auto-select current treatment & therapist when editing
  useEffect(() => {
    if (!open || !initial?.treatmentAssignId || !patient?.treatmentPlan) return;

    const assign = patient.treatmentPlan
      .flatMap((plan) => plan.treatmentAssign)
      .find((a) => a.id === initial.treatmentAssignId);

    if (assign) {
      setTreatmentId(assign.treatment.id);
      setTherapistId(assign.therapist?.id || "");
    }
  }, [open, initial, patient]);

  // ✅ 3. Update duration based on treatment
  useEffect(() => {
    if (!open) return;
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
          <h3 className="text-lg font-semibold">
            {initial.id ? "Edit Session" : "Assign Therapist"}
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* FORM FIELDS */}
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            Treatment
            <select
              className="mt-1 w-full border rounded-lg p-2"
              value={treatmentId}
              onChange={(e) => setTreatmentId(e.target.value)}
            >
              {patientTreatments.length === 0 ? (
                <option value="">No treatments assigned</option>
              ) : (
                patientTreatments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} — {t.subTitle}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="text-sm">
            Therapist
            <select
              className="mt-1 w-full border rounded-lg p-2"
              value={therapistId}
              onChange={(e) => setTherapistId(e.target.value)}
            >
              <option value="">— Select —</option>
              {therapists.map((th) => (
                <option key={th.id} value={th.id}>
                  {th.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            Date
            <input
              type="date"
              className="mt-1 w-full border rounded-lg p-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label className="text-sm">
            Start Time
            <input
              type="time"
              className="mt-1 w-full border rounded-lg p-2"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>

          <label className="text-sm col-span-2">
            Duration (minutes)
            <input
              type="number"
              min={10}
              step={5}
              className="mt-1 w-full border rounded-lg p-2"
              value={durationMin}
              onChange={(e) =>
                setDurationMin(Math.max(0, Number(e.target.value)))
              }
            />
          </label>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-2 mt-5">
          <button className="px-3 py-2 rounded-lg border" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-3 py-2 rounded-lg bg-amber-500 text-white"
            onClick={async () => {
              const t = treatments.find((x) => x.id === treatmentId);
              const th = therapists.find((x) => x.id === therapistId);

              const full: TreatmentSession = {
                id:
                  initial.id ||
                  `sess-${Math.random().toString(36).slice(2, 9)}`,
                patientId: initial.patientId!,
                patientName: initial.patientName!,
                date,
                time,
                durationMin,
                treatmentId: t?.id!,
                treatmentTitle: t?.title ?? "Unknown Treatment",
                therapistId: therapistId || undefined,
                therapistName: th?.name,
                status: initial.status || "pending",
                note: initial.note,
              };

              try {
                // ✅ Assign therapist to this specific treatmentAssign
                await assignTherapist(
                  therapistId!,
                  initial.treatmentPlanId!,
                  initial.treatmentAssignId!
                );

                // ✅ Update local patient structure
                const updatedTreatmentPlan = patient.treatmentPlan.map((plan) =>
                  plan.id === initial.treatmentPlanId
                    ? {
                        ...plan,
                        treatmentAssign: plan.treatmentAssign.map((ta) =>
                          ta.id === initial.treatmentAssignId
                            ? {
                                ...ta,
                                therapist: { id: therapistId, name: th?.name },
                              }
                            : ta
                        ),
                      }
                    : plan
                );

                // ✅ Persist to backend
                await updatePatient(initial.patientId!, {
                  treatmentPlan: updatedTreatmentPlan.map((plan) => ({
                    id: plan.id,
                    date: plan.date,
                    timeSlot: plan.timeSlot,
                    asanas: plan.asanas?.map((a) =>
                      typeof a === "string" ? a : a.id
                    ),
                    treatmentAssign: plan.treatmentAssign.map((ta) => ({
                      id: ta.id,
                      treatment: ta.treatment?.id,
                      therapist: ta.therapist?.id,
                    })),
                  })),
                });
              } catch (err) {
                console.error("Error assigning therapist:", err);
              }

              onSave(full);
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------- TREATMENT PLAN VIEW -------------------- //

export function TreatmentPlanView({ patient }) {
  console.log("Rendering TreatmentPlanView for patient:", patient);
  const { sessions, setSessions, therapists, treatments } =
    useContext(SessionsContext);
  const [draft, setDraft] = useState<{
    open: boolean;
    initial?: Partial<TreatmentSession> & {
      treatmentId?: string;
      treatmentPlanId?: string;
    };
  }>({ open: false });

  // 🔹 New: state for update dialog
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateInitial, setUpdateInitial] = useState<{
    patientId: string;
    treatmentPlanId: string;
    treatmentAssignId: string;
  } | null>(null);

  const getTreatmentDetails = (treatmentId: string) =>
    treatments.find((t) => t.id === treatmentId);

  const openAssign = (plan, treatmentId) => {
    const { start, durationMin } = parseTimeSlot(plan.timeSlot);
    const t = getTreatmentDetails(treatmentId);

    setDraft({
      open: true,
      initial: {
        patientId: patient.id,
        patientName: patient.fullName,
        treatmentPlanId: plan.id, // ✅ crucial line
        treatmentId,
        date: toYMD(plan.date),
        time: start || "09:00",
        durationMin:
          durationMin ||
          Number((t?.duration || "45").toString().replace(/\D/g, "")),
        status: "pending",
      },
    });
  };

  const refreshPatientData = () => {
    // 🔹 You can replace this with your actual refetch function
    console.log("Refetch patient data after treatment update...");
  };

  return (
    <div className="bg-white p-4 shadow rounded-xl border">
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-2xl font-semibold">Treatment Plan</h2>
      </div>

      <div className="mt-4">
        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <strong>Patient Name:</strong> {patient.fullName}
            </div>
            <div>
              <strong>Patient ID:</strong> {patient.id}
            </div>
            <div>
              <strong>Age/Gender:</strong> {patient.age ?? "N/A"}Y /{" "}
              {patient.sex || "N/A"}
            </div>
         <button
  className="px-2.5 py-1.5 rounded-lg border text-sm bg-green-50 hover:bg-green-100"
  onClick={async () => {
    try {
      const appointmentId = patient?.appointment?.[0]?.id;
      if (!appointmentId) {
        alert("No appointment ID found for this patient.");
        return;
      }

      // 🔹 Call the updated binary-safe function
      const blob = await generatetTreatmentPDF(appointmentId);

      // 🔹 Convert blob to a downloadable link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${patient.fullName.replace(/\s+/g, "_")}_treatment_plan.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 🔹 Optionally open in new tab instead:
      // window.open(url, "_blank");

      toast({
        title: "Treatment PDF generated!",
        description: "File downloaded successfully.",
      });
    } catch (err) {
      console.error("Error generating treatment PDF:", err);
      toast({
        title: "Error generating PDF",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  }}
>
  📄 PDF
</button>

          </div>
        </div>

        <div className="text-center mb-4">
          <h3 className="text-xl font-bold bg-gray-200 py-2 rounded">
            Treatment Plan Overview
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-2 border-gray-800 text-sm">
            <thead>
              <tr>
                <th className="border-2 border-gray-800 bg-gray-200 p-3 text-left">
                  Date
                </th>
                <th className="border-2 border-gray-800 bg-gray-200 p-3 text-left">
                  Time Slot
                </th>
                <th className="border-2 border-gray-800 bg-gray-200 p-3 text-left">
                  Yoga/Asanas
                </th>
                <th className="border-2 border-gray-800 bg-gray-200 p-3 text-left">
                  Treatments
                </th>
              </tr>
            </thead>
            <tbody>
              {patient.treatmentPlan.map((plan, idx) => (
                <tr key={plan.id ?? `plan-${idx}`}>
                  <td className="border-2 border-gray-800 p-3 font-semibold">
                    {formatDate(plan.date)}
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    {plan.timeSlot || "N/A"}
                  </td>
                  <td className="border-2 border-gray-800 p-3 whitespace-pre-line">
                    {plan.yogaPlan ||
                      (plan.asanas?.length
                        ? plan.asanas.map((a) => a.name).join(", ")
                        : "N/A")}
                  </td>
                  <td className="border-2 border-gray-800 p-3">
                    {plan.treatmentAssign?.length ? (
                      <div className="space-y-3">
                        {plan.treatmentAssign.map((assign, tIdx) => {
                          const t = assign.treatment;
                          const therapist = assign.therapist;
                          const existing = sessions.find(
                            (s) =>
                              s.treatmentId === t.id &&
                              s.date === toYMD(plan.date)
                          );

                          return (
                            <div
                              key={assign.id}
                              className="border-l-4 border-amber-500 pl-3 py-2 bg-gray-50 rounded"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-gray-800">
                                    {t?.title || `Treatment ${tIdx + 1}`}
                                  </div>
                                  {t?.subTitle && (
                                    <div className="text-xs text-gray-600 mt-1">
                                      {t.subTitle}
                                    </div>
                                  )}
                                  {existing && (
                                    <div className="mt-2 text-xs text-emerald-700">
                                      Assigned: {existing.time} ·{" "}
                                      {existing.therapistName ||
                                        "(No therapist)"}
                                    </div>
                                  )}
                                  {therapist && !existing && (
                                    <div className="mt-2 text-xs text-emerald-700">
                                      Assigned to: {therapist.name}
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    className="px-2.5 py-1.5 rounded-lg border text-sm"
                                    onClick={() => openAssign(plan, t.id)}
                                  >
                                    {existing ? "Edit" : "Assign"}
                                  </button>

                                  {/* 🟢 Change Treatment Button */}
                                  <button
                                    className="px-2.5 py-1.5 rounded-lg border text-sm bg-blue-50 hover:bg-blue-100"
                                    onClick={() => {
                                      setUpdateInitial({
                                        patientId: patient.id,
                                        treatmentPlanId: plan.id,
                                        treatmentAssignId: assign.id,
                                      });
                                      setUpdateOpen(true);
                                    }}
                                  >
                                    Change
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        No treatments assigned
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🧩 Session Editor Modal */}
        <SessionEditor
          open={draft.open}
          onClose={() => setDraft({ open: false })}
          therapists={therapists}
          treatments={treatments}
          initial={draft.initial || {}}
          onSave={(sess) => {
            setSessions((prev) => {
              const exists = prev.some((p) => p.id === sess.id);
              return exists
                ? prev.map((p) => (p.id === sess.id ? sess : p))
                : [...prev, sess];
            });
          }}
          patient={patient}
        />

        {/* 🧩 Treatment Update Dialog */}
        {updateInitial && (
          <TreatmentUpdateDialog
            open={updateOpen}
            onClose={() => setUpdateOpen(false)}
            onSave={refreshPatientData}
            patient={patient}
            treatments={treatments}
            initial={updateInitial}
          />
        )}
      </div>
    </div>
  );
}

// -------------------- SCHEDULER COMPONENTS & ROOT -------------------- //
function SchedulerLeft({ patient }: { patient: Patient }) {
  const [treatments, setTreatments] = useState<TreatmentOption[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [sessions, setSessions] = useState<TreatmentSession[]>([]);

  // fetch treatments & therapists
  useEffect(() => {
    (async () => {
      try {
        const [trRes, thRes] = await Promise.all([
          getTreatmentAll(),
          getAllTherapist(),
        ]);
        setTreatments(trRes.data || []);
        setTherapists(thRes.data || []);
      } catch (err) {
        console.error("Error loading treatments/therapists:", err);
      }
    })();
  }, []);

  // seed sessions from patient.treatmentPlan
  useEffect(() => {
    if (!treatments.length || !patient.treatmentPlan) return;
    const seed: TreatmentSession[] = [];
    patient.treatmentPlan.forEach((plan, pIdx) => {
      const { start, durationMin } = parseTimeSlot(plan.timeSlot);
      const baseDate = toYMD(plan.date);
      (plan.treatmentAssign || []).forEach((assign, tIdx) => {
        const t = assign.treatment;
        const therapist = assign.therapist;
        seed.push({
          id: assign.id || `sess-${pIdx}-${tIdx}`,
          patientId: patient.id,
          patientName: patient.fullName,
          date: baseDate,
          time: start || "09:00",
          durationMin:
            durationMin ||
            Number((t?.duration || "45").toString().replace(/\D/g, "")),
          treatmentId: t.id,
          treatmentTitle: t.title,
          therapistId: therapist?.id,
          therapistName: therapist?.name,
          status: "pending",
        });
      });
    });
    setSessions(seed);
  }, [patient, treatments]);

  return (
    <SessionsContext.Provider
      value={{ sessions, setSessions, therapists, treatments }}
    >
      <TreatmentPlanView patient={patient} />
    </SessionsContext.Provider>
  );
}

function SchedulerRight({ patient }: { patient: Patient }) {
  const { sessions, setSessions, therapists, treatments } =
    useContext(SessionsContext);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editing, setEditing] = useState<TreatmentSession | null>(null);

  // ✅ Map treatmentPlan → sessions for calendar display
  const appointments = mapTreatmentPlansToSessions(
    patient.treatmentPlan,
    patient.fullName
  );

  return (
    <div className="bg-white p-4 shadow rounded-xl border">
      <div className="flex items-center justify-between pb-3 border-b mb-3">
        <h2 className="text-xl font-semibold">Clinic Calendar</h2>
        <div className="text-sm text-gray-500">
          Click a session to edit or assign therapist
        </div>
      </div>

      {/* ✅ Use mapped appointments, not raw treatmentPlan */}
      <SimpleCalendar
        appointments={appointments}
        onEventClick={(sess) => setEditing(sess)}
        selectedDate={selectedDate}
        setSelectedDate={(d) => setSelectedDate(d)}
      />

      <SessionEditor
        open={!!editing}
        onClose={() => setEditing(null)}
        therapists={therapists}
        treatments={treatments}
        initial={editing || {}}
        onSave={(updated) => {
          setSessions((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s))
          );
        }}
        patient={patient}
      />
    </div>
  );
}

export default function TreatmentSchedulerOneFileDemo({
  patient,
}: {
  patient: Patient;
}) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto  gap-4">
        <SchedulerLeft patient={patient} />
        <SchedulerRight patient={patient} />
      </div>
    </div>
  );
}
//schecdular left and right components
