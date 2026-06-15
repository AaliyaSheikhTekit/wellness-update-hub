import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { createPatientConsult, generatetPrescriptionPDF, getAllYoga, postData, } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, X, Clock, ChevronsUpDown } from "lucide-react";
import { getTherapyList } from "@/lib/api";
import { getPatientById } from "@/lib/api";
import { updatePatientConsult} from "@/components/DoctoreForm"
import { Checkbox } from "@/components/ui/checkbox";


export default function PrescriptionDialog({
  open,
  onClose,
  patient,
  onPrescriptionCreated,
}: any) {
  const [medicineName, setMedicineName] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");
  const [quantity, setQuantity] = useState(14);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [investigation, setInvestigation] = useState("");
  const [avoid, setAvoid] = useState("");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [therapyList, setTherapyList] = useState<any[]>([]);
const [selectedTherapies, setSelectedTherapies] = useState<any[]>([]);
const [opentherapies, setOpenTherapies] = useState(false);
const [search, setSearch] = useState("");
const [selectedAsanas, setSelectedAsanas] = useState<string[]>([]);
const [selectedPranayama, setSelectedPranayama] = useState<string[]>([]);
const [yogaCategories, setYogaCategories] = useState<any[]>([]);

const [dietTitle, setDietTitle] = useState("");
const [doctorData, setDoctorData] = useState({
  treatment: {
    recommendation: {
      title: [],
      duration: "",
    },

    yogaChart: {
      title: "",
      duration: "",
    },

    dietChart: {
      title: "",
      restrictions: "",
    },
  },
});

const [openCategory, setOpenCategory] =
  useState<string | null>(null);
const [prescriptionId, setPrescriptionId] =
  useState<string>("");
const [openSubcategory, setOpenSubcategory] =
  useState<string | null>(null);
useEffect(() => {
  const loadTherapies = async () => {
    try {
      const res = await getTherapyList();
      setTherapyList(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  loadTherapies();
}, []);
useEffect(() => {
  const fetchYoga = async () => {
    const res = await getAllYoga();
    setYogaCategories(res.data || []);
  };

  fetchYoga();
}, []);
const filteredTherapies = therapyList.filter((t: any) => {
  const text = search.toLowerCase();

  return (
    (t.treatment || "").toLowerCase().includes(text) ||
    (t.shortForm || "").toLowerCase().includes(text)
  );
});

const toggleTherapy = (therapy: any) => {
  setSelectedTherapies((prev) => {
    const exists = prev.some((t) => t.id === therapy.id);

    if (exists) {
      return prev.filter((t) => t.id !== therapy.id);
    }

    return [...prev, therapy];
  });
};

const totalSelectedDuration = selectedTherapies.reduce(
  (sum, t) => sum + (parseInt(t.duration || "0") || 0),
  0
);
const handlePrescribeMedicine = async () => {
  if ( !instructions.trim()) {
    toast({ title: "Please fill all required fields." });
    return;
  }

  try {
    setLoading(true);

    const appointmentId = patient?.appointment?.[0]?.id;

    if (!appointmentId) {
      toast({ title: "Missing appointment ID." });
      return;
    }
const latestAppointment =
  patient?.appointment?.length > 0
    ? patient.appointment.reduce(
        (latest: any, current: any) =>
          new Date(current.date) >
          new Date(latest.date)
            ? current
            : latest
      )
    : null;

let consultationId =
  latestAppointment?.consultation?.length > 0
    ? latestAppointment.consultation[
        latestAppointment.consultation.length - 1
      ]?.id
    : null;

if (!consultationId) {
  const consultationRes = await createPatientConsult({
    patientId: patient?.id,
    appointmentId: latestAppointment?.id,
    cheifCompaints: chiefComplaint || "",
  });

  consultationId =
    consultationRes?.data?.id ||
    consultationRes?.id;

  console.log(
    "Created Consultation:",
    consultationId
  );
}

const recommendation = {
  title: selectedTherapies.map(
    (t: any) => t.id
  ),
  duration: totalSelectedDuration
    ? `${totalSelectedDuration} min`
    : "",
};

const yogaNames = yogaCategories
  .flatMap((cat: any) =>
    cat.subCategories.flatMap((sub: any) =>
      sub.items
        .filter((item: any) =>
          selectedAsanas.includes(item.id)
        )
        .map((item: any) => item.name)
    )
  );

const payload = {
  patientId: patient?.id,
  appointmentId: latestAppointment?.id,

  treatment: {
    recommendation: {
      title:
        selectedTherapies.map(
          (item: any) => item.id
        ) || [],

      duration:
        doctorData.treatment
          ?.recommendation?.duration || "",
    },

    dietChart: {
      title:
        doctorData.treatment
          ?.dietChart?.title || "",

      restrictions:
        doctorData.treatment
          ?.dietChart?.restrictions || "",
    },

    yogaChart: {
      title:
        doctorData.treatment
          ?.yogaChart?.title || "",

      duration:
        doctorData.treatment
          ?.yogaChart?.duration || "",
    },
  },

  treatmentPlan: [],
};

console.log(
  "Treatment Payload",
  JSON.stringify(payload, null, 2)
);

await updatePatientConsult(
  consultationId,
  payload
);

    // -------------------------
    // CREATE PRESCRIPTION
    // -------------------------

    const prescriptionPayload = {
      appointmentId,
      medicineName,
      duration,
      instructions,
      quantity,
      chiefComplaint,
      investigation,
      avoid,
      note,
    };

const prescriptionRes = await postData(
  "/prescription/create",
  prescriptionPayload
);

const createdPrescriptionId =
  prescriptionRes?.data?.id ||
  prescriptionRes?.id;

if (!createdPrescriptionId) {
  throw new Error(
    "Prescription created but ID not returned"
  );
}

setPrescriptionId(createdPrescriptionId);

toast({
  title: "Prescription created successfully!",
});
   

    onPrescriptionCreated?.();

    // Reset
    setMedicineName("");
    setDuration("");
    setInstructions("");
    setQuantity(14);
    setChiefComplaint("");
    setInvestigation("");
    setAvoid("");
    setNote("");
    setSelectedTherapies([]);

  } catch (error: any) {
    console.error(error);

    toast({
      title: "Failed to create prescription",
      description: error?.message,
    });
  } finally {
    setLoading(false);
  }
};

const handleGeneratePDF = async () => {
  try {
    if (!prescriptionId) {
      toast({
        title:
          "Please create prescription first",
        variant: "destructive",
      });
      return;
    }

    const blob =
      await generatetPrescriptionPDF(
        prescriptionId
      );

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download = `Prescription_${prescriptionId}.pdf`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);

    toast({
      title:
        "PDF downloaded successfully",
    });
  } catch (err: any) {
    console.error(err);

    toast({
      title: "Failed to download PDF",
      description: err?.message,
      variant: "destructive",
    });
  }
};
const filtered = therapyList.filter((t: any) => {
  const query = search.toLowerCase();

  return (
    t.treatment?.toLowerCase().includes(query) ||
    t.shortForm?.toLowerCase().includes(query)
  );
});
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl w-full max-h-[80vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Create Prescription</DialogTitle>
        </DialogHeader>

        {/* Scrollable form content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 px-1">
          <div className="space-y-3">

            <div>
              <label className="text-sm font-medium">Instructions</label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Take 1 tablet twice a day after food"
              />
            </div>



            <div>
              <label className="text-sm font-medium">Chief Complaint</label>
              <Input
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="e.g. Headache, fever..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">Investigation</label>
              <Input
                value={investigation}
                onChange={(e) => setInvestigation(e.target.value)}
                placeholder="e.g. Blood test, X-ray..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">Avoid</label>
              <Input
                value={avoid}
                onChange={(e) => setAvoid(e.target.value)}
                placeholder="e.g. Spicy food, caffeine..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Note</label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note..."
              />
            </div>
          <div className="space-y-4">
                    {/* 🔹 Yoga / Lifestyle Recommendations */}
                    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-800 text-lg">
                        🧘 Yoga / Lifestyle Recommendations
                      </h3>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Title
                      </label>
                      {/* Yoga Chart Title */}
                      <Input
                        placeholder="e.g. Morning Yoga Routine, Relaxation Plan..."
                        value={doctorData.treatment?.yogaChart?.title || ""}
                         onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            treatment: {
                              ...doctorData.treatment,
                              yogaChart: {
  title: e.target.value,
  duration:
    doctorData.treatment?.yogaChart?.duration || "",
},
                            },
                          })
                        }
                        
                      />

                      {/* Yoga Category List */}
                      <div className="mt-6 border-t border-blue-200 pt-4">
                        <h4 className="text-sm font-semibold text-blue-700 mb-3">
                          Select Recommended Yoga Asanas
                        </h4>

                        {yogaCategories.length === 0 ? (
                          <p className="text-gray-500 text-sm italic">
                            Loading yoga list...
                          </p>
                        ) : (
                          <div className="border border-gray-200 rounded-lg overflow-hidden divide-y">
                            {yogaCategories.map((cat) => {
                              const isOpen = openCategory === cat.id;
                              const allAsanaIds = cat.subCategories.flatMap(
                                (sub) => sub.items.map((item) => item.id)
                              );

                              const allSelected = allAsanaIds.every((id) =>
                                selectedAsanas.includes(id)
                              );

                              const handleToggleSelectAll = () => {
                                setSelectedAsanas((prev) =>
                                  allSelected
                                    ? prev.filter(
                                        (id) => !allAsanaIds.includes(id)
                                      )
                                    : [...new Set([...prev, ...allAsanaIds])]
                                );
                              };

                              const handleTogglePranayama = () => {
                                setSelectedPranayama((prev) =>
                                  prev.includes(cat.id)
                                    ? prev.filter((id) => id !== cat.id)
                                    : [...prev, cat.id]
                                );
                              };

                              return (
                                <div key={cat.id}>
                                  {/* Category Header */}
                                  <div
                                    className="bg-blue-50 px-3 py-2 text-sm font-semibold text-gray-700 flex justify-between items-center cursor-pointer hover:bg-blue-100 transition"
                                    onClick={() =>
                                      setOpenCategory(isOpen ? null : cat.id)
                                    }
                                  >
                                    <span>{cat.name}</span>
                                    <svg
                                      className={`w-4 h-4 transition-transform ${
                                        isOpen ? "rotate-180" : ""
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </div>

                                  {/* Subcategories inside Category */}
                                  {isOpen && (
                                    <div className="bg-white border-t border-gray-100">
                                      {/* Extra Options (Select All / Pranayama) */}
                                      <div className="flex items-center gap-6 px-4 py-3 bg-gray-50 border-b border-gray-100">
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                          <input
                                            type="checkbox"
                                            className="h-4 w-4 accent-green-600"
                                            checked={allSelected}
                                            onChange={handleToggleSelectAll}
                                          />
                                          Select All Asanas
                                        </label>

                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                          <input
                                            type="checkbox"
                                            className="h-4 w-4 accent-blue-600"
                                            checked={selectedPranayama?.includes(
                                              cat.id
                                            )}
                                            onChange={handleTogglePranayama}
                                          />
                                          Include Pranayama
                                        </label>
                                      </div>

                                      {/* Subcategory + Items */}
                                      {cat.subCategories.map((sub) => (
                                        <div
                                          key={sub.id}
                                          className="border-t border-gray-100"
                                        >
                                          {/* Subcategory Header */}
                                          <div
                                            className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition"
                                            onClick={() =>
                                              setOpenSubcategory(
                                                openSubcategory === sub.id
                                                  ? null
                                                  : sub.id
                                              )
                                            }
                                          >
                                            <span>{sub.name}</span>
                                            <svg
                                              className={`w-3.5 h-3.5 transition-transform ${
                                                openSubcategory === sub.id
                                                  ? "rotate-180"
                                                  : ""
                                              }`}
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                              />
                                            </svg>
                                          </div>

                                          {/* Items */}
                                          {openSubcategory === sub.id && (
                                            <div className="pl-5 divide-y divide-gray-100">
                                              {sub.items.map((item) => {
                                                const yogaId = item.id;
                                                const checked =
                                                  selectedAsanas.includes(
                                                    yogaId
                                                  );
                                                return (
                                                  <div
                                                    key={item.id}
                                                    className={`p-3 text-sm flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition ${
                                                      checked
                                                        ? "bg-green-50"
                                                        : ""
                                                    }`}
                                                    onClick={() =>
                                                      setSelectedAsanas(
                                                        (prev) =>
                                                          checked
                                                            ? prev.filter(
                                                                (a) =>
                                                                  a !== yogaId
                                                              )
                                                            : [...prev, yogaId]
                                                      )
                                                    }
                                                  >
                                                    <Checkbox
                                                      className="h-4 w-4 accent-green-600"
                                                      checked={checked}
                                                    />
                                                    <span>{item.name}</span>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-6 border-t pt-6 mt-6">
                      <h2 className="text-xl font-bold text-amber-700 flex items-center gap-2">
                        🩺 Treatment Details
                      </h2>

                      {/* 🔹 Treatment Plan */}
                      <div className="space-y-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <label className="font-semibold text-gray-700 block mb-2">
                          Select Therapies
                        </label>
                        <Popover
                          open={opentherapies}
                          onOpenChange={setOpenTherapies}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                            >
                              {selectedTherapies.length > 0
                                ? selectedTherapies
                                    .map((t: any) => t.treatment)
                                    .join(", ")
                                : "Select therapies"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-2">
                            <Input
                              placeholder="Search therapy..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className="mb-2"
                            />
                            <div className="max-h-48 overflow-y-auto space-y-1">
                              {filtered.map((therapy: any) => {
                                const selected = selectedTherapies.some(
                                  (t: any) => t.id === therapy.id
                                );
                                return (
                                  <div
                                    key={therapy.id}
                                    onClick={() => toggleTherapy(therapy)}
                                    className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer hover:bg-amber-100 ${
                                      selected ? "bg-amber-200" : ""
                                    }`}
                                  >
                                    {therapy.treatment}
                                    {selected && (
                                      <Check className="h-4 w-4 text-amber-600" />
                                    )}
                                  </div>
                                );
                              })}
                              {filtered.length === 0 && (
                                <div className="text-sm text-gray-500 px-2 py-2">
                                  No results
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                        {/* 🔹 Duration Inputs for selected therapies */}
                        <div className="mt-4 space-y-3">
                          <h4 className="font-semibold text-gray-800">
                            Therapy Durations
                          </h4>
                          <Input
                            placeholder="Duration (e.g. 60 min)"
                            value={
                              selectedTherapies.length > 0
                                ? `${selectedTherapies.reduce(
                                    (sum: number, t: any) =>
                                      sum + (parseInt(t.duration) || 0),
                                    0
                                  )} min`
                                : doctorData.treatment?.recommendation?.duration || ""
                            }
                            onChange={(e) =>
                              setDoctorData({
                                ...doctorData,
                                treatment: {
                                  ...doctorData.treatment,
                                  recommendation: {
                                    ...doctorData.treatment?.recommendation,
                                    duration: e.target.value,
                                  },
                                },
                              })
                            }
                            readOnly={selectedTherapies.length > 0}
                          />
                        </div>
                      </div>

                      {/* 🔹 Diet Chart */}
                      <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-800 text-lg">
                          Diet Chart
                        </h3>

                        <Input
                          placeholder="e.g. High-protein vegetarian diet"
                          value={doctorData.treatment?.dietChart?.title || ""}
                         onChange={(e) =>
  setDoctorData((prev) => ({
    ...prev,
    treatment: {
      ...prev.treatment,
      dietChart: {
        title: e.target.value,
        restrictions:
          prev.treatment.dietChart?.restrictions || "",
      },
    },
  }))
}
                        />
                        <Input
  placeholder="Restrictions"
  value={
    doctorData.treatment?.dietChart
      ?.restrictions || ""
  }
  onChange={(e) =>
  setDoctorData((prev) => ({
    ...prev,
    treatment: {
      ...prev.treatment,
      dietChart: {
        title:
          prev.treatment.dietChart?.title || "",
        restrictions: e.target.value,
      },
    },
  }))
}
/>
                      </div>
                    
                    </div>

                  </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="shrink-0 pt-4 border-t flex flex-row gap-2 justify-end">
        <div className="flex gap-2">
  {prescriptionId && (
    <Button
      variant="secondary"
      onClick={handleGeneratePDF}
    >
      Download PDF
    </Button>
  )}

  <Button
    variant="outline"
    onClick={onClose}
    disabled={loading}
  >
    Close
  </Button>
</div>

          {/* ✅ Show Generate PDF only after prescription is created */}
          {/* {prescriptionCreated && (
            <Button
              onClick={handleGeneratePDF}
              disabled={pdfLoading}
              variant="secondary"
            >
              {pdfLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate PDF
                </>
              )}
            </Button>
          )} */}

          <Button
            onClick={handlePrescribeMedicine}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? "Sending..." : "Send Prescription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
