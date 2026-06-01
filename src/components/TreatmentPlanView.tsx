import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import {
  getAllTherapist,
  getTreatmentAll,
  updatePatient,
  assignTherapist,
  getAllYoga,
  generatetTreatmentPDF,
  getPatientById,
  createTherapist,
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
  setTherapists: React.Dispatch<React.SetStateAction<Therapist[]>>;
  treatments: TreatmentOption[];
}>({
  sessions: [],
  setSessions: () => {},
  therapists: [],
  setTherapists: () => {},
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
  const { sessions } = useContext(SessionsContext);
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // 🧩 Normalize appointments only once
  const normalizeAppointments = (input: any[]) => {
    if (!input?.length) return [];
    const looksNested = input[0]?.treatmentAssign && input[0]?.timeSlot;
    if (!looksNested) return input;

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
          status: assign.therapist ? "confirmed" : "pending",
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

  // ✅ Use live sessions if available, otherwise fallback
  const flatAppointments = useMemo(
    () => (sessions?.length ? sessions : normalizeAppointments(appointments)),
    [sessions, appointments]
  );

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
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header */}
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

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map((day) => (
          <div key={day} className="text-center font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
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
              className={`min-h-32 p-2 border rounded-lg flex flex-col ${
                day ? "bg-white hover:bg-gray-50 cursor-pointer" : "bg-transparent"
              } ${isToday ? "ring-2 ring-blue-500" : ""} ${
                selectedDate === dateStr ? "ring-2 ring-indigo-500" : ""
              }`}
              onClick={() => day && setSelectedDate && setSelectedDate(dateStr)}
            >
              {/* 📅 Date Header */}
              {day && (
                <div
                  className={`font-semibold text-sm mb-2 ${
                    isToday
                      ? "bg-blue-500 text-white rounded text-center py-1"
                      : "text-gray-800 text-center"
                  }`}
                >
                  {day}
                </div>
              )}

              {/* 🧾 Treatments in same row (grouped) */}
              <div className="flex flex-col gap-1 overflow-y-auto">
                {dayAppointments.length === 0 && (
                  <div className="text-xs text-gray-400 text-center">No treatments</div>
                )}

                {dayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className={`text-xs p-2 rounded-lg border ${getStatusColor(
                      apt.status
                    )} hover:opacity-90 transition-all`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(apt);
                    }}
                    title={`${apt.treatmentTitle} • ${apt.time} • ${
                      apt.therapistName || "Unassigned"
                    }`}
                  >
                    <div className="truncate font-semibold text-amber-800 flex items-center gap-1">
                      💆‍♀️ <span>{apt.treatmentTitle}</span>
                    </div>
                    <div className="truncate text-sky-800 flex items-center gap-1">
                      👤 <span>{apt.therapistName || "Unassigned"}</span>
                    </div>
                    <div className="truncate text-gray-700 flex items-center gap-1">
                      🕒 <span>{apt.time}</span>
                    </div>
                  </div>
                ))}
              </div>
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
  setTherapists: React.Dispatch<React.SetStateAction<any[]>>;
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
  const [selectedTreatmentIds, setSelectedTreatmentIds] = useState<string[]>([]);
  const [currentTreatmentTitle, setCurrentTreatmentTitle] = useState("");
  const [yogaCategories, setYogaCategories] = useState<any[]>([]);
  const [selectedAsanaIds, setSelectedAsanaIds] = useState<string[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState("");

  // 🔹 Fetch Yoga Categories
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

  // 🔹 Prefill current treatment info
  useEffect(() => {
    if (!open || !patient?.treatmentPlan) return;

    const plan = patient.treatmentPlan.find(
      (p) => p.id === initial.treatmentPlanId
    );
    const assign = plan?.treatmentAssign.find(
      (a) => a.id === initial.treatmentAssignId
    );

    if (assign) setCurrentTreatmentTitle(assign.treatment?.title || "");
    if (plan) {
      setNewDate(plan.date ? plan.date.split("T")[0] : "");
      setNewTimeSlot(plan.timeSlot || "");
      setSelectedTreatmentIds(
        plan.treatmentAssign.map((t: any) => t.treatment?.id).filter(Boolean)
      );
      setSelectedAsanaIds(plan.asanas?.map((a: any) => (typeof a === "string" ? a : a.id)) || []);
    }
  }, [open, patient, initial]);

  const toggleTreatment = (id: string) => {
    setSelectedTreatmentIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleAsana = (id: string) => {
    setSelectedAsanaIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Update Treatment Plan</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-700">
          Current Treatment: <strong>{currentTreatmentTitle || "Unknown"}</strong>
        </p>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm">
            Date
            <input
              type="date"
              className="mt-1 w-full border rounded-lg p-2"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </label>

          <label className="text-sm">
            Time Slot
            <input
              type="text"
              placeholder="07:00PM - 08:00PM"
              className="mt-1 w-full border rounded-lg p-2"
              value={newTimeSlot}
              onChange={(e) => setNewTimeSlot(e.target.value)}
            />
          </label>
        </div>

        {/* Treatments */}
        <div>
          <label className="text-sm font-medium">Select Treatments</label>
          <div className="border rounded-lg p-2 max-h-40 overflow-y-auto mt-2">
            {treatments.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedTreatmentIds.includes(t.id)}
                  onChange={() => toggleTreatment(t.id)}
                />
                {t.title} — {t.subTitle}
              </label>
            ))}
          </div>
        </div>

        {/* Yoga / Asanas */}
        <div>
          <label className="text-sm font-medium">Select Asanas</label>
          <div className="border rounded-lg p-2 max-h-40 overflow-y-auto mt-2">
            {yogaCategories.map((cat) => (
              <div key={cat.id}>
                <p className="font-semibold text-gray-700 mt-2">{cat.name}</p>
                {cat.subCategories.map((sub) => (
                  <div key={sub.id} className="ml-3">
                    <p className="text-gray-600 font-medium mt-1">{sub.name}</p>
                    {sub.items.map((item: any) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-2 text-sm ml-4"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAsanaIds.includes(item.id)}
                          onChange={() => toggleAsana(item.id)}
                        />
                        {item.name}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            disabled={!newDate || !newTimeSlot || selectedTreatmentIds.length === 0}
            onClick={async () => {
              try {
                const payload = {
                  timeSlot: newTimeSlot,
                  treatments: selectedTreatmentIds,
                  asanas: selectedAsanaIds,
                  date: new Date(newDate).toISOString(),
                };

                console.log("🧘 Payload for update:", payload);

                await updatePatient(patient.id, payload);
                onSave();
                onClose();
              } catch (err) {
                console.error("Error updating treatment:", err);
              }
            }}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-300"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};


export const SessionEditor: React.FC<SessionEditorProps> = ({
  open,
  onClose,
  setTherapists,
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
const [showCreateTherapist, setShowCreateTherapist] = useState(false);
const [newTherapistName, setNewTherapistName] = useState("");
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

          <div className="col-span-2">
  <label className="text-sm font-medium">Therapist</label>

  <div className="flex gap-2 mt-1">
    <select
      className="w-full border rounded-lg p-2"
      value={therapistId}
      onChange={(e) => setTherapistId(e.target.value)}
    >
      <option value="">— Select Therapist —</option>

      {therapists.map((th) => (
        <option key={th.id} value={th.id}>
          {th.name}
        </option>
      ))}
    </select>

    <button
      type="button"
      onClick={() => setShowCreateTherapist(true)}
      className="px-3 py-2 rounded-lg bg-blue-600 text-white whitespace-nowrap"
    >
      + Add
    </button>
  </div>
</div>
{showCreateTherapist && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-5 rounded-2xl w-full max-w-md shadow-xl">
      <h2 className="text-lg font-semibold mb-4">
        Create Therapist
      </h2>

      <input
        type="text"
        placeholder="Enter therapist name"
        value={newTherapistName}
        onChange={(e) => setNewTherapistName(e.target.value)}
        className="w-full border rounded-lg p-2 mb-4"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowCreateTherapist(false)}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
          onClick={async () => {
           try {
  const res = await createTherapist({
    name: newTherapistName,
  });

  const created = res.data?.data || res.data;

  console.log("Created therapist:", created);

  setTherapists((prev) => [...prev, created]);

  setTherapistId(created.id);

  setShowCreateTherapist(false);
  setNewTherapistName("");

  toast({
    title: "Therapist created successfully",
  });
} catch (err) {
  console.error(err);
}
          }}
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
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
  const { sessions, setSessions, therapists, treatments,setTherapists } =
    useContext(SessionsContext);

  const [localPatient, setLocalPatient] = useState(patient);
  const [draft, setDraft] = useState({
    open: false,
    initial: undefined,
  });
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateInitial, setUpdateInitial] = useState(null);

  // 🔹 Sync localPatient when patient prop changes
  useEffect(() => {
    if (patient) {
      setLocalPatient(patient);
    }
  }, [patient]);

  // 🔹 Get treatment details
  const getTreatmentDetails = (treatmentId) =>
    treatments.find((t) => t.id === treatmentId);

  // 🔹 Assign dialog opener
  const openAssign = (plan, treatmentId) => {
    const { start, durationMin } = parseTimeSlot(plan.timeSlot);
    const t = getTreatmentDetails(treatmentId);

    setDraft({
      open: true,
      initial: {
        patientId: localPatient.id,
        patientName: localPatient.fullName,
        treatmentPlanId: plan.id,
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

  // 🔹 Refresh patient data after update
  const refreshPatientData = async () => {
    try {
      const res = await getPatientById(localPatient.id);
      setLocalPatient(res.data); // ✅ update state properly
      setSessions(
        mapTreatmentPlansToSessions(res.data.treatmentPlan, res.data.fullName)
      );
    } catch (err) {
      console.error("Failed to refresh patient:", err);
    }
  };

  // 🧩 Group all plans by date (for single-row-per-date)
  const groupedPlans = useMemo(() => {
    const groups = {};
    (localPatient.treatmentPlan || []).forEach((plan) => {
      const date = plan.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(plan);
    });
    return groups;
  }, [localPatient.treatmentPlan]);

  return (
    <div className="bg-white p-4 shadow rounded-xl border">
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-2xl font-semibold">Treatment Plan</h2>
        <button
          className="px-3 py-1.5 rounded-lg border bg-green-50 hover:bg-green-100"
          onClick={async () => {
            try {
              const appointmentId = localPatient?.appointment?.[0]?.id;
              if (!appointmentId) {
                alert("No appointment ID found for this patient.");
                return;
              }

              const blob = await generatetTreatmentPDF(appointmentId);
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `${localPatient.fullName.replace(
                /\s+/g,
                "_"
              )}_treatment_plan.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

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

      {/* Patient Info */}
      <div className="bg-gray-50 p-4 rounded-lg mt-4 text-sm grid sm:grid-cols-3 gap-4">
        <div>
          <strong>Patient Name:</strong> {localPatient.fullName}
        </div>
        <div>
          <strong>Patient Contact number:</strong> {localPatient.contactNumber || "N/A"}
        </div>
        <div>
          <strong>Age/Gender:</strong>{" "}
          {localPatient.age ?? "N/A"}Y / {localPatient.sex || "N/A"}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
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
            {Object.entries(groupedPlans).map(([date, plansRaw], idx) => {
              const plans = plansRaw as TreatmentPlanEntry[];
              // combine all plans of the same date
              const allTimeSlots = plans.map((p) => p.timeSlot || "N/A").join(", ");
              const allAsanas =
                plans
                  .map(
                    (p) =>
                      p.yogaPlan ||
                      (p.asanas?.length ? p.asanas.map((a) => a.name).join(", ") : "")
                  )
                  .filter(Boolean)
                  .join(", ") || "N/A";

              // collect all treatments across all plans of same date
              const allTreatments = plans.flatMap((plan:any) => {
                if (!plan.treatmentAssign?.length)
                  return [
                    <span
                      key={plan.id}
                      className="text-gray-500 italic block"
                    >
                      No treatments assigned
                    </span>,
                  ];

                return plan.treatmentAssign.map((assign, tIdx) => {
                  const t = assign.treatment;
                  const therapist = assign.therapist;
                  const existing = sessions.find(
                    (s) => s.treatmentId === t.id && s.date === toYMD(plan.date)
                  );

                  return (
                    <div
                      key={assign.id}
                      className="border-l-4 border-amber-500 pl-3 py-2 bg-gray-50 rounded mb-2 last:mb-0"
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
                       
                          {existing && therapist && (
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
                          <button
                            className="px-2.5 py-1.5 rounded-lg border text-sm bg-blue-50 hover:bg-blue-100"
                            onClick={() => {
                              setUpdateInitial({
                                patientId: localPatient.id,
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
                });
              });

              return (
                <tr key={date}>
                  <td className="border-2 border-gray-800 p-3 font-semibold">
                    {formatDate(date)}
                  </td>
                  <td className="border-2 border-gray-800 p-3">{allTimeSlots}</td>
                  <td className="border-2 border-gray-800 p-3 whitespace-pre-line">
                    {allAsanas}
                  </td>
                  <td className="border-2 border-gray-800 p-3">{allTreatments}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 🧩 Modals */}
      <SessionEditor
        open={draft.open}
        onClose={() => setDraft({ open: false, initial: undefined })}
        therapists={therapists}
        setTherapists={setTherapists}
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
        patient={localPatient}
      />

      {updateInitial && (
        <TreatmentUpdateDialog
          open={updateOpen}
          onClose={() => setUpdateOpen(false)}
          onSave={refreshPatientData}
          patient={localPatient}
          treatments={treatments}
          initial={updateInitial}
        />
      )}
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
      value={{ sessions, setSessions, therapists, treatments,setTherapists }}
    >
      <TreatmentPlanView patient={patient} />
    </SessionsContext.Provider>
  );
}

function SchedulerRight({ patient }: { patient: Patient }) {
  const { sessions, setSessions, therapists, treatments,setTherapists } =
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
        setTherapists={setTherapists}
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
