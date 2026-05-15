import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Edit3,
  Check,
  X,
  UserPlus,
  Clock,
  Calendar,
  User,
  Stethoscope,
  ArrowUpDown,
} from "lucide-react";
import {
  getTreatmentTable,
  updatePatientTreatmentTable,
  getAllTherapist,
  assignTherapist,
  getTreatmentAll,
  getTherapyList,
} from "@/lib/api";
interface Treatment {
  id: string;
  patientId: string;
  patientName: string;
  treatmentPlanId: string;
  treatmentIds: string[];
  treatmentName: string;
  therapistId?: string;
  therapistName: string;
  timeSlot: string;
  inTime: string;
  outTime: string;
  remark: string;
  totalDuration?: string;
}


interface Therapist {
  id: string;
  name: string;
}

interface MasterTreatment {
  _id: string;
  treatmentName: string;
  duration: string;
}

export default function ReceptionTreatmentTable() {
  const { toast } = useToast();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [masterTreatments, setMasterTreatments] = useState<MasterTreatment[]>([]);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<keyof Treatment>("patientName");
  const [sortAsc, setSortAsc] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Treatment>>({});

  useEffect(() => {
    const loadData = async () => {
      await fetchMasterTreatments();
      await fetchTherapists();
      await fetchTreatments();
    };
    loadData();
  }, []);

  const fetchMasterTreatments = async () => {
    try {
      const [treatmentRes, therapyRes] = await Promise.all([
        getTreatmentAll(),
        getTherapyList(),
      ]);

      const treatmentData = Array.isArray(treatmentRes?.data)
        ? treatmentRes.data.map((pkg: any) => ({
            _id: pkg.id,
            treatmentName: pkg.title || pkg.treatment,
            duration: pkg.duration || "",
          }))
        : [];

      const therapyData = Array.isArray(therapyRes?.data)
        ? therapyRes.data.map((t: any) => ({
            _id: t.id,
            treatmentName: t.title || t.treatment,
            duration: t.duration || "",
          }))
        : [];

      setMasterTreatments([...treatmentData, ...therapyData]);
    } catch (error) {
      console.error(error);
      toast({ 
        title: "Error fetching master treatments", 
        variant: "destructive" 
      });
    }
  };

  const getTreatmentDetails = (ids: string[]) => {
    if (!Array.isArray(ids)) return "";
    return ids
      .map((id) => {
        const t = masterTreatments.find((m) => m._id === id);
        return t ? `${t.treatmentName} (${t.duration})` : id;
      })
      .filter(Boolean)
      .join(", ");
  };

const fetchTreatments = async () => {
  try {
    const res = await getTreatmentTable();
    const patients = res.data || [];

    const formatted = patients.flatMap((patient: any) => {
      const patientName = patient.fullName;
      return patient.appointment.flatMap((appt: any) => {
        return appt.consultation
          .filter((c: any) => c.treatment?.recommendation)
          .map((c: any) => {
            const ids = Array.isArray(c.treatment.recommendation.title)
              ? c.treatment.recommendation.title
              : [c.treatment.recommendation.title].filter(Boolean);

            const therapistId = c.treatment.recommendation.therapist;
            const therapistName =
              therapists.find((th) => th.id === therapistId)?.name || "";

            const inTime = c.treatment.recommendation.inTime || "";
            const outTime = c.treatment.recommendation.outTime || "";

            // find treatment duration from treatment or therapy list
            const matched = masterTreatments.find((m) =>
              ids.includes(m._id)
            );

            // calculate timeslot using inTime + duration if not already available
            let calculatedTimeSlot = "";
            if (inTime && matched?.duration) {
              const [inH, inM, inP] =
                inTime.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) || [];
              if (inH) {
                const durationMinutes = parseInt(
                  matched.duration.replace(/\D/g, "") || "0",
                  10
                );
                const date = new Date();
                date.setHours(
                  (+inH % 12) + (inP.toUpperCase() === "PM" ? 12 : 0),
                  +inM
                );
                const endDate = new Date(date.getTime() + durationMinutes * 60000);
                const hours24 = endDate.getHours();
                const minutes = endDate.getMinutes();
                const endPeriod = hours24 >= 12 ? "PM" : "AM";
                const hours12 = hours24 % 12 || 12;
                const formattedMinutes = minutes.toString().padStart(2, "0");
                calculatedTimeSlot = `${inTime} - ${hours12}:${formattedMinutes} ${endPeriod}`;
              }
            }

           return {
  id: c.id,
  patientId: patient.id,
  treatmentPlanId: appt.id, // FIX
  patientName,
  treatmentIds: ids,
  treatmentName: getTreatmentDetails(ids),
  therapistId,
  therapistName,
  inTime,
  outTime,
  timeSlot:
    c.treatment.recommendation.timeSlot ||
    calculatedTimeSlot ||
    "",
  remark: c.treatment.recommendation.remark || "",
  totalDuration:
    matched?.duration ||
    c.treatment?.recommendation?.duration ||
    "",
};
          });
      });
    });

    setTreatments(formatted);
  } catch (error) {
    console.error(error);
    toast({
      title: "Error fetching treatments",
      variant: "destructive",
    });
  }
};



  const fetchTherapists = async () => {
    try {
      const res = await getAllTherapist();
      setTherapists(res.data || []);
    } catch (error) {
      console.error(error);
      toast({ 
        title: "Error fetching therapists", 
        variant: "destructive" 
      });
    }
  };
const calculateOutTime = (inTime: string, duration: string): string => {
  if (!inTime || !duration) return "";

  // Parse duration: "1h 30m" or "45m"
  const match = duration.match(/(?:(\d+)h)?\s*(?:(\d+)m)?/i);
  const hours = match?.[1] ? parseInt(match[1]) : 0;
  const mins = match?.[2] ? parseInt(match[2]) : 0;

  // Parse inTime: "9:00 AM"
  const [h, m, p] = inTime.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) || [];
  if (!h || !p) return "";

  const date = new Date();
  date.setHours((+h % 12) + (p.toUpperCase() === "PM" ? 12 : 0), +m);

  // Add duration
  date.setMinutes(date.getMinutes() + hours * 60 + mins);

  // Convert to 12-hour time
  let outH = date.getHours();
  const outM = date.getMinutes();
  const period = outH >= 12 ? "PM" : "AM";
  outH = outH % 12 || 12;

  return `${outH}:${outM.toString().padStart(2, "0")} ${period}`;
};

 const handleUpdate = async (id: string) => {
  try {
    const selectedTherapist = therapists.find(
      (th) => th.id === editData.therapistId
    );

 const payload = {
  recommendation: {
    inTime: editData.inTime,
    outTime: editData.outTime,
    therapist: editData.therapistId,
    timeSlot: `${editData.inTime} - ${editData.outTime}`,
    remark: editData.remark,
  },
};


    await updatePatientTreatmentTable(id, payload);
    if (editData.therapistId) {
  await assignTherapist(
    editData.therapistId,
    editData.treatmentPlanId!,
    id
  );
}
    toast({
      title: "Treatment updated successfully",
      description: `Therapist: ${selectedTherapist?.name || "N/A"}`,
    });
    setEditingId(null);
    fetchTreatments();
  } catch (error) {
    console.error(error);
    toast({
      title: "Error updating treatment",
      variant: "destructive",
    });
  }
};

  const handleAssignTherapist = async (
    therapistId: string,
    treatmentPlanId: string,
    treatmentId: string
  ) => {
    try {
      await assignTherapist(therapistId, treatmentPlanId, treatmentId);
      toast({ 
        title: "Therapist assigned successfully",
        description: "The therapist has been assigned to this treatment"
      });
      fetchTreatments();
    } catch (error) {
      console.error(error);
      toast({ 
        title: "Error assigning therapist", 
        variant: "destructive" 
      });
    }
  };

  const calculateDuration = (inTime: string, outTime: string): string => {
    if (!inTime || !outTime) return "";
    const [inH, inM, inP] = inTime.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) || [];
    const [outH, outM, outP] = outTime.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) || [];
    if (!inH || !outH) return "";
    const inDate = new Date();
    const outDate = new Date();
    inDate.setHours((+inH % 12) + (inP.toUpperCase() === "PM" ? 12 : 0), +inM);
    outDate.setHours((+outH % 12) + (outP.toUpperCase() === "PM" ? 12 : 0), +outM);
    const diff = (outDate.getTime() - inDate.getTime()) / (1000 * 60);
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins}m`;
  };

  const filteredData = treatments
    .map((t) => ({
      ...t,
      treatmentName: getTreatmentDetails(t.treatmentIds),
    }))
    .filter((t) =>
      Object.values(t).some((v) =>
        v?.toString().toLowerCase().includes(filter.toLowerCase())
      )
    )
    .sort((a, b) => {
      const valA = a[sortKey]?.toString().toLowerCase() || "";
      const valB = b[sortKey]?.toString().toLowerCase() || "";
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  const handleSort = (key: keyof Treatment) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="w-full p-6 bg-gradient-to-br from-background via-background to-secondary/20 min-h-screen">
      <Card className="shadow-xl border-border/50 backdrop-blur-sm bg-card/95">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Reception Treatments Log
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage and track patient treatments
                </p>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patients, treatments..."
                className="pl-10 w-full md:w-80 bg-background border-border/50 focus:border-primary transition-all"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-table-header border-b border-border">
                  {[
                    { key: "patientName", label: "Patient", icon: User },
                    { key: "treatmentName", label: "Treatment", icon: Stethoscope },
                    { key: "therapistName", label: "Therapist", icon: User },
                    { key: "timeSlot", label: "Time Slot", icon: Calendar },
                    { key: "inTime", label: "Check In", icon: Clock },
                    { key: "outTime", label: "Check Out", icon: Clock },
                    { key: "totalDuration", label: "Duration", icon: Clock },
                    { key: "remark", label: "Notes", icon: null },
                    { key: "actions", label: "Actions", icon: null },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="px-6 py-4 text-left text-xs font-semibold text-foreground/80 uppercase tracking-wider"
                    >
                      <button
                        onClick={() => col.key !== "actions" && handleSort(col.key as keyof Treatment)}
                        className="flex items-center gap-2 hover:text-primary transition-colors group"
                        disabled={col.key === "actions"}
                      >
                        {col.icon && <col.icon className="w-4 h-4" />}
                        <span>{col.label}</span>
                        {col.key !== "actions" && (
                          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border/50">
                {filteredData.map((t, i) => (
                  <tr
                    key={t.id}
                    className={`transition-all duration-200 hover:bg-table-hover ${
                      i % 2 === 0 ? "bg-background" : "bg-table-stripe"
                    } ${editingId === t.id ? "ring-2 ring-primary/20" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {t.patientName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">
                          {t.patientName}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-foreground/80 line-clamp-2">
                          {t.treatmentName || "—"}
                        </p>
                      </div>
                    </td>

                   <td className="px-6 py-4">
  {editingId === t.id ? (
   <select
  value={editData.therapistId || ""}
  onChange={(e) => {
    const selected = therapists.find((th) => th.id === e.target.value);
    setEditData({
      ...editData,
      therapistId: selected?.id,
      therapistName: selected?.name || "",
    });
  }}
  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
>
  <option value="">Select Therapist</option>
  {therapists.map((th) => (
    <option key={th.id} value={th.id}>
      {th.name}
    </option>
  ))}
</select>

  ) : t.therapistName ? (
    <Badge variant="secondary" className="font-normal">
      {t.therapistName}
    </Badge>
  ) : (
    <span className="text-muted-foreground text-sm">—</span>
  )}
</td>


                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground/80">
                        {t.timeSlot || "—"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {editingId === t.id ? (
                       <Input
  placeholder="9:00 AM"
  value={editData.inTime || ""}
  onChange={(e) => {
    const newInTime = e.target.value;
    const duration =
      editData.totalDuration ||
      masterTreatments.find((m) =>
        editData.treatmentIds?.includes(m._id)
      )?.duration ||
      "";
    const newOutTime = calculateOutTime(newInTime, duration);
    setEditData({
      ...editData,
      inTime: newInTime,
      outTime: newOutTime,
      timeSlot: `${newInTime} - ${newOutTime}`,
    });
  }}
  className="w-28 text-sm"
/>

                      ) : (
                        <span className="text-sm text-foreground/80">
                          {t.inTime || "—"}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {editingId === t.id ? (
                        <Input
                          placeholder="10:00 AM"
                          value={editData.outTime || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, outTime: e.target.value })
                          }
                          className="w-28 text-sm"
                        />
                      ) : (
                        <span className="text-sm text-foreground/80">
                          {t.outTime || "—"}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {calculateDuration(t.inTime, t.outTime) ? (
                        <Badge variant="outline" className="font-mono text-xs">
                          {calculateDuration(t.inTime, t.outTime)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {editingId === t.id ? (
                        <Input
                          placeholder="Add notes..."
                          value={editData.remark || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, remark: e.target.value })
                          }
                          className="w-full text-sm"
                        />
                      ) : (
                        <span className="text-sm text-foreground/70">
                          {t.remark || "—"}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {editingId === t.id ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(t.id)}
                            className="bg-success hover:bg-success/90 text-success-foreground shadow-sm"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            className="border-border hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(t.id);
                              setEditData({
  ...t,
  therapistId: t.therapistId || "",
  treatmentPlanId: t.treatmentPlanId,
});
                            }}
                            className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                         
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  No treatments found
                </h3>
                <p className="text-sm text-muted-foreground">
                  {filter
                    ? "Try adjusting your search terms"
                    : "Start by adding new treatments"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
