import React, { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Edit3,
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
  getPatientById,
  createTherapist,
} from "@/lib/api";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface TreatmentRow {
  id: string;
  patientId: string;
  patientName: string;
  treatmentAssignId?: string;
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

// ─────────────────────────────────────────────
// Assign Therapist Modal
// Identical behaviour to SessionEditor
// ─────────────────────────────────────────────
interface AssignModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  row: TreatmentRow | null;
  therapists: Therapist[];
  setTherapists: React.Dispatch<React.SetStateAction<Therapist[]>>;
  masterTreatments: MasterTreatment[];
}

function AssignTherapistModal({
  open,
  onClose,
  onSave,
  row,
  therapists,
  setTherapists,
  masterTreatments,
}: AssignModalProps) {
  const { toast } = useToast();

  const [therapistId, setTherapistId] = useState("");
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [durationMin, setDurationMin] = useState(45);
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);

  // Create-therapist nested modal
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  // Pre-fill when row changes
  useEffect(() => {
    if (!row || !open) return;
    setTherapistId(row.therapistId || "");
    setInTime(row.inTime || "");
    setOutTime(row.outTime || "");
    setRemark(row.remark || "");

    // duration from master list
    const matched = masterTreatments.find((m) =>
      row.treatmentIds?.includes(m._id)
    );
    const raw = matched?.duration || row.totalDuration || "45";
    setDurationMin(parseInt(raw.replace(/\D/g, "") || "45", 10));
  }, [row, open]);

  // Auto-compute outTime when inTime or duration changes
  useEffect(() => {
    if (!inTime || !durationMin) return;
    const parsed = inTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!parsed) return;
    const [, h, m, p] = parsed;
    const date = new Date();
    date.setHours((+h % 12) + (p.toUpperCase() === "PM" ? 12 : 0), +m, 0, 0);
    date.setMinutes(date.getMinutes() + durationMin);
    const oh = date.getHours();
    const om = date.getMinutes();
    const period = oh >= 12 ? "PM" : "AM";
    const h12 = oh % 12 || 12;
    setOutTime(`${h12}:${om.toString().padStart(2, "0")} ${period}`);
  }, [inTime, durationMin]);

  const handleSave = async () => {
    if (!row) return;
    setSaving(true);
    try {
      // 1. update recommendation fields
      await updatePatientTreatmentTable(row.id, {
        recommendation: {
          inTime,
          outTime,
          therapist: therapistId,
          timeSlot: `${inTime} - ${outTime}`,
          remark,
        },
      });

      // 2. find correct treatmentPlanId + treatmentAssignId then assign therapist
      if (therapistId) {
        const patientRes = await getPatientById(row.patientId);
        const patient = patientRes.data;

        let treatmentPlanId = "";
        let treatmentAssignId = "";

        for (const plan of patient.treatmentPlan || []) {
          const assign = (plan.treatmentAssign || []).find((a: any) =>
            row.treatmentIds?.includes(a.treatment?.id)
          );
          if (assign) {
            treatmentPlanId = plan.id;
            treatmentAssignId = assign.id;
            break;
          }
        }

        if (treatmentPlanId && treatmentAssignId) {
          await assignTherapist(therapistId, treatmentPlanId, treatmentAssignId);
        }
      }

      const th = therapists.find((t) => t.id === therapistId);
      toast({
        title: "Therapist assigned successfully",
        description: th ? `Assigned to ${th.name}` : undefined,
      });
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: "Error assigning therapist", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTherapist = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await createTherapist({ name: newName.trim() });
      const created = res.data?.data || res.data;
      setTherapists((prev) => [...prev, created]);
      setTherapistId(created.id);
      setShowCreate(false);
      setNewName("");
      toast({ title: "Therapist created successfully" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error creating therapist", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  if (!open || !row) return null;

  return (
    <>
      {/* Main assign modal */}
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-card rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Assign Therapist</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* Patient + Treatment info (read-only) */}
          <div className="bg-gray-50 dark:bg-muted rounded-lg p-3 text-sm space-y-1">
            <div>
              <span className="text-muted-foreground">Patient: </span>
              <strong>{row.patientName}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Treatment: </span>
              <strong>{row.treatmentName || "—"}</strong>
            </div>
          </div>

          {/* Therapist select + Add */}
          <div>
            <label className="text-sm font-medium block mb-1">Therapist</label>
            <div className="flex gap-2">
              <select
                value={therapistId}
                onChange={(e) => setTherapistId(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                onClick={() => setShowCreate(true)}
                className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm whitespace-nowrap hover:bg-blue-700"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Date row — inTime / outTime */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Check In</label>
              <Input
                placeholder="9:00 AM"
                value={inTime}
                onChange={(e) => setInTime(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Check Out</label>
              <Input
                placeholder="10:00 AM"
                value={outTime}
                onChange={(e) => setOutTime(e.target.value)}
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-medium block mb-1">
              Duration (minutes)
            </label>
            <Input
              type="number"
              min={5}
              step={5}
              value={durationMin}
              onChange={(e) =>
                setDurationMin(Math.max(5, Number(e.target.value)))
              }
            />
          </div>

          {/* Remark */}
          <div>
            <label className="text-sm font-medium block mb-1">Notes</label>
            <Input
              placeholder="Add notes..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              disabled={saving}
              onClick={handleSave}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Nested create-therapist modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-card rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create New Therapist</h3>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setNewName("");
                }}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">
                Therapist Name
              </label>
              <Input
                placeholder="Enter therapist name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTherapist()}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreate(false);
                  setNewName("");
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={!newName.trim() || creating}
                onClick={handleCreateTherapist}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {creating ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// Main Table Component
// ─────────────────────────────────────────────
export default function ReceptionTreatmentTable() {
  const { toast } = useToast();
  const [treatments, setTreatments] = useState<TreatmentRow[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [masterTreatments, setMasterTreatments] = useState<MasterTreatment[]>([]);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<keyof TreatmentRow>("patientName");
  const [sortAsc, setSortAsc] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<TreatmentRow | null>(null);

useEffect(() => { 
  const load = async () => {
    await fetchMasterTreatments();
    await fetchTherapists();
  };

  load();
}, []);

useEffect(() => {
  if (therapists.length > 0) {
    fetchTreatments();
  }
}, [therapists, masterTreatments]);

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
    } catch (err) {
      console.error(err);
      toast({ title: "Error fetching master treatments", variant: "destructive" });
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
        return patient.appointment.flatMap((appt: any) =>
          appt.consultation.map((c: any) => {
            const recommendation = c.treatment?.recommendation || {};
            const ids = Array.isArray(recommendation.title)
              ? recommendation.title
              : [recommendation.title].filter(Boolean);
            const therapistId = recommendation.therapist || "";
            const therapistName =
              therapists.find((th) => th.id === therapistId)?.name || "";
            const inTime = recommendation.inTime || "";
            const outTime = recommendation.outTime || "";
            const matched = masterTreatments.find((m) => ids.includes(m._id));

            return {
              id: c.id,
              patientId: patient.id,
              treatmentPlanId: appt.id,
              treatmentAssignId: c.id,
              patientName,
              treatmentIds: ids,
              treatmentName: getTreatmentDetails(ids) || "Treatment Not Assigned",
              therapistId,
              therapistName,
              inTime,
              outTime,
              timeSlot: recommendation.timeSlot || "",
              remark: recommendation.remark || "",
              totalDuration: matched?.duration || recommendation.duration || "",
            };
          })
        );
      });

      setTreatments(formatted);
    } catch (err) {
      console.error(err);
      toast({ title: "Error fetching treatments", variant: "destructive" });
    }
  };

  const fetchTherapists = async () => {
    try {
      const res = await getAllTherapist();
      setTherapists(res.data || []);
    } catch (err) {
      console.error(err);
      toast({ title: "Error fetching therapists", variant: "destructive" });
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

  const handleSort = (key: keyof TreatmentRow) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filteredData = useMemo(
    () =>
      treatments
        .map((t) => ({ ...t, treatmentName: getTreatmentDetails(t.treatmentIds) }))
        .filter((t) =>
          Object.values(t).some((v) =>
            v?.toString().toLowerCase().includes(filter.toLowerCase())
          )
        )
        .sort((a, b) => {
          const vA = a[sortKey]?.toString().toLowerCase() || "";
          const vB = b[sortKey]?.toString().toLowerCase() || "";
          return sortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
        }),
    [treatments, filter, sortKey, sortAsc, masterTreatments]
  );

  const columns = [
    { key: "patientName", label: "Patient", icon: User },
    { key: "treatmentName", label: "Treatment", icon: Stethoscope },
    { key: "therapistName", label: "Therapist", icon: User },
    { key: "timeSlot", label: "Time Slot", icon: Calendar },
    { key: "inTime", label: "Check In", icon: Clock },
    { key: "outTime", label: "Check Out", icon: Clock },
    { key: "totalDuration", label: "Duration", icon: Clock },
    { key: "remark", label: "Notes", icon: null },
    { key: "actions", label: "Actions", icon: null },
  ];

  return (
    <div className="w-full p-6 bg-gradient-to-br from-background via-background to-secondary/20 min-h-screen">
      <Card className="shadow-xl border-border/50 backdrop-blur-sm bg-card/95">
        {/* Header */}
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

        {/* Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-table-header border-b border-border">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-6 py-4 text-left text-xs font-semibold text-foreground/80 uppercase tracking-wider"
                    >
                      <button
                        onClick={() =>
                          col.key !== "actions" &&
                          handleSort(col.key as keyof TreatmentRow)
                        }
                        disabled={col.key === "actions"}
                        className="flex items-center gap-2 hover:text-primary transition-colors group"
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
                    }`}
                  >
                    {/* Patient */}
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

                    {/* Treatment */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground/80 max-w-xs line-clamp-2">
                        {t.treatmentName || "—"}
                      </p>
                    </td>

                    {/* Therapist */}
                    <td className="px-6 py-4">
                      {t.therapistName ? (
                        <Badge variant="secondary" className="font-normal">
                          {t.therapistName}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </td>

                    {/* Time Slot */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground/80">
                        {t.timeSlot || "—"}
                      </span>
                    </td>

                    {/* Check In */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground/80">
                        {t.inTime || "—"}
                      </span>
                    </td>

                    {/* Check Out */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground/80">
                        {t.outTime || "—"}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-4">
                      {calculateDuration(t.inTime, t.outTime) ? (
                        <Badge variant="outline" className="font-mono text-xs">
                          {calculateDuration(t.inTime, t.outTime)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground/70">
                        {t.remark || "—"}
                      </span>
                    </td>

                    {/* Actions — single Assign button opens modal */}
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveRow(t);
                          setModalOpen(true);
                        }}
                        className="hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                        {t.therapistName ? "Edit" : "Assign"}
                      </Button>
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

      {/* Assign Therapist Modal */}
      <AssignTherapistModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setActiveRow(null);
        }}
        onSave={() => {
          fetchTreatments();
          setModalOpen(false);
          setActiveRow(null);
        }}
        row={activeRow}
        therapists={therapists}
        setTherapists={setTherapists}
        masterTreatments={masterTreatments}
      />
    </div>
  );
}