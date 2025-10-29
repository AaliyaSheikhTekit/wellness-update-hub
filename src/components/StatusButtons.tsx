// src/components/StatusButtons.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getBackendToken } from "@/lib/api";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "rescheduled"
  | "no_show";

type AppointmentLite = {
  id: string;
  status?: AppointmentStatus | null;
};

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
  { value: "rescheduled", label: "Rescheduled" },
  { value: "no_show", label: "No Show" },
];

const SELECTED_STYLE: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-green-800 text-white",
  rescheduled: "bg-violet-100 text-violet-800",
  no_show: "bg-gray-200 text-gray-700",
};

export function StatusButtons({
  apt,
  fetchAppointments,
  onChanged,
}: {
  apt?: AppointmentLite;
  fetchAppointments?: () => Promise<any> | void;
  onChanged?: (next: AppointmentStatus) => void;
}) {
  const { toast } = useToast();

  // No appointment yet? render nothing (prevents undefined.status crash)
  if (!apt?.id) return null;

  const [updating, setUpdating] = useState(false);
  const currentStatus: AppointmentStatus = (apt.status as AppointmentStatus) ?? "pending";

  const handleChange = async (newStatus: AppointmentStatus) => {
    if (currentStatus === newStatus) return;
    try {
      setUpdating(true);

      const token = getBackendToken();
      // Your backend uses PUT /v1/appointment/update/:id to update fields
      const response = await fetch(
        `https://api.ikshanaturopathy.com/v1/appointment/update/${apt.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Update failed: ${response.status} ${txt}`);
      }

      onChanged?.(newStatus);
      toast({
        title: "Status updated",
        description: `Appointment marked as ${newStatus.replace("_", " ")}.`,
      });

      await fetchAppointments?.(); // refresh lists
    } catch (err: any) {
      toast({
        title: "Failed to update",
        description: err?.message ?? "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {STATUS_OPTIONS.map((opt) => {
        const selected = currentStatus === opt.value;
        return (
          <Button
            key={opt.value}
            size="sm"
            type="button"
            disabled={updating || selected}
            onClick={() => handleChange(opt.value)}
            className={`rounded-full text-xs px-3 py-1 border ${
  selected
    ? `${SELECTED_STYLE[opt.value]} border-transparent`
    : `text-white border-gray-300 hover:bg-${SELECTED_STYLE[opt.value]
        .split(" ")[0]
        .replace("bg-", "")}-50`
}`}
            aria-pressed={selected}
          >
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}
