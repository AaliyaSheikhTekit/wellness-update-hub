import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getTreatmentAll, getAllYoga } from "@/lib/api";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChevronDown } from "lucide-react";

type TreatmentRow = {
  id?: string;
  date: string;
  timeSlot: string;
  asanas: string[]; // ✅ Yoga IDs
  treatments: string[]; // ✅ Treatment IDs
  duration: string;
};

type ApiTreatmentPlanItem = {
  id?: string;
  timeSlot: string;
  treatments: string[];
  asanas?: string[];
  date: string;
  duration: string;
};

function toInputDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function toISODate(ymd?: string) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1, 0, 0, 0));
  return dt.toISOString();
}

export default function TreatmentPlanTable({
  value,
  onChange,
  includeYoga = true,
}: {
  value: ApiTreatmentPlanItem[];
  onChange: (items: ApiTreatmentPlanItem[]) => void;
  includeYoga?: boolean;
}) {
  const [showYoga, setShowYoga] = useState(includeYoga);
  const [rows, setRows] = useState<TreatmentRow[]>([
    { date: "", timeSlot: "", asanas: [], treatments: [], duration: "" },
  ]);
  const [treatmentOptions, setTreatmentOptions] = useState<any[]>([]);
  const [yogaCategories, setYogaCategories] = useState<any[]>([]);
  const isHydratingRef = useRef(false);
  const fetchedRef = useRef(false);

  // 🧘 Fetch Yoga
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

  // 💆 Fetch Treatments
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    (async () => {
      try {
        const data = await getTreatmentAll();
        setTreatmentOptions(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        console.error("Error fetching treatments:", err);
      }
    })();
  }, []);

  // 🔁 Hydrate from parent value
  useEffect(() => {
    if (!Array.isArray(value)) return;
    isHydratingRef.current = true;

    if (value.length === 0) {
      setRows([
        { date: "", timeSlot: "", asanas: [], treatments: [], duration: "" },
      ]);
    } else {
      const mapped: TreatmentRow[] = value.map((it) => ({
        id: it.id,
        date: toInputDate(it.date),
        timeSlot: it.timeSlot || "",
        asanas: Array.isArray(it.asanas) ? it.asanas : [],
        treatments: Array.isArray(it.treatments) ? it.treatments : [],
        duration: it.duration || "",
      }));
      setRows(mapped);
    }

    setTimeout(() => {
      isHydratingRef.current = false;
    }, 0);
  }, [value]);

  // 🔼 Send updated rows to parent
  const updateParent = (newRows: TreatmentRow[]) => {
    if (isHydratingRef.current) return;
    const apiItems: ApiTreatmentPlanItem[] = newRows
      .filter(
        (r) =>
          r.timeSlot || r.asanas.length || r.treatments.length || r.date || r.duration
      )
      .map((r) => ({
        ...(r.id ? { id: r.id } : {}),
        timeSlot: r.timeSlot,
        treatments: r.treatments,
        asanas: r.asanas?.length ? r.asanas : undefined,
        date: r.date ? toISODate(r.date) : "",
        duration: r.duration,
      }));

    console.log("🧾 Sending payload:", apiItems);
    onChange(apiItems);
  };

  const handleAddRow = () => {
    const newRows = [
      ...rows,
      { date: "", timeSlot: "", asanas: [], treatments: [], duration: "" },
    ];
    setRows(newRows);
    updateParent(newRows);
  };

  const handleRemoveRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
    updateParent(newRows);
  };

  const handleChange = (index: number, field: keyof TreatmentRow, value: any) => {
    const newRows = [...rows];
    (newRows[index] as any)[field] = value;
    setRows(newRows);
    updateParent(newRows);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={showYoga}
            onCheckedChange={(checked) => setShowYoga(checked === true)}
          />
          <span className="text-sm text-gray-600">Include Yoga Column</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-3 py-2 text-left">Date</th>
              <th className="border px-3 py-2 text-left">Time Slot</th>
              {showYoga && <th className="border px-3 py-2 text-left">Yoga</th>}
              <th className="border px-3 py-2 text-left">Treatment</th>
              <th className="border px-3 py-2 text-left">Duration</th>
              <th className="border px-3 py-2"></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id ?? i}>
                {/* 📅 Date */}
                <td className="border px-2">
                  <Input
                    type="date"
                    value={row.date}
                    onChange={(e) => handleChange(i, "date", e.target.value)}
                  />
                </td>

                {/* ⏰ Time Slot */}
                <td className="border px-2">
                  <Input
                    placeholder="Time slot"
                    value={row.timeSlot}
                    onChange={(e) => handleChange(i, "timeSlot", e.target.value)}
                  />
                </td>

                {/* 🧘 Yoga Selection */}
                {showYoga && (
                  <td className="border px-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="truncate">
                            {row.asanas.length > 0
                              ? `${row.asanas.length} yoga${row.asanas.length > 1 ? "s" : ""} selected`
                              : "Select Yoga Asanas"}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-96 p-0" align="start">
                        <div className="max-h-96 overflow-y-auto">
                          {yogaCategories.map((cat: any) => (
                            <div key={cat.id}>
                              <div className="font-semibold px-3 py-2 bg-gray-100 border-b">
                                {cat.name}
                              </div>
                              {cat.subCategories.map((sub: any) =>
                                sub.items.map((item: any) => {
                                  const yogaId = item.id;
                                  const checked = row.asanas.includes(yogaId);
                                  return (
                                    <div
                                      key={item.id}
                                      className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                                        checked ? "bg-blue-50" : ""
                                      }`}
                                      onClick={() => {
                                        const next = checked
                                          ? row.asanas.filter((a) => a !== yogaId)
                                          : [...row.asanas, yogaId];
                                        handleChange(i, "asanas", next);
                                      }}
                                    >
                                      <div className="flex items-start gap-2">
                                        <Checkbox checked={checked} />
                                        <span>{item.name}</span>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Show selected Yoga tags */}
                    {row.asanas.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {row.asanas.map((asanaId) => {
                          const yogaItem = yogaCategories
                            .flatMap((cat: any) =>
                              cat.subCategories.flatMap((sub: any) => sub.items || [])
                            )
                            .find((item: any) => item.id === asanaId);

                          return (
                            <div
                              key={asanaId}
                              className="flex items-center justify-between gap-2 border rounded-md px-2 py-1.5 bg-gray-50 text-xs"
                            >
                              <span>{yogaItem ? yogaItem.name : asanaId}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChange(i, "asanas", row.asanas.filter((a) => a !== asanaId));
                                }}
                                className="text-gray-400 hover:text-red-500"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>
                )}

                {/* 💆 Treatments */}
                <td className="border px-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <span className="truncate">
                          {row.treatments.length > 0
                            ? `${row.treatments.length} treatment${row.treatments.length > 1 ? "s" : ""} selected`
                            : "Select treatments"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-96 p-0" align="start">
                      <div className="max-h-96 overflow-y-auto">
                        {treatmentOptions.map((opt) => {
                          const checked = row.treatments.includes(opt.id);
                          return (
                            <div
                              key={opt.id}
                              className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                                checked ? "bg-blue-50" : ""
                              }`}
                              onClick={() => {
                                const next = checked
                                  ? row.treatments.filter((t) => t !== opt.id)
                                  : [...row.treatments, opt.id];
                                handleChange(i, "treatments", next);
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <Checkbox checked={checked} />
                                <div>
                                  <div className="font-semibold text-sm">{opt.title}</div>
                                  {opt.subTitle && (
                                    <div className="text-xs text-gray-600">{opt.subTitle}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Show selected Treatments */}
                  {row.treatments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {row.treatments.map((treatmentId) => {
                        const t = treatmentOptions.find((opt) => opt.id === treatmentId);
                        return (
                          <div
                            key={treatmentId}
                            className="flex items-center justify-between gap-2 border rounded-md px-2 py-1.5 bg-gray-50 text-xs"
                          >
                            <span>{t ? t.title : treatmentId}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChange(
                                  i,
                                  "treatments",
                                  row.treatments.filter((tid) => tid !== treatmentId)
                                );
                              }}
                              className="text-gray-400 hover:text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </td>

                {/* ⏳ Duration */}
                <td className="border px-2">
                  <Input
                    placeholder="Duration"
                    value={row.duration}
                    onChange={(e) => handleChange(i, "duration", e.target.value)}
                  />
                </td>

                {/* ❌ Remove Row */}
                <td className="border px-2">
                  <Button variant="destructive" size="sm" onClick={() => handleRemoveRow(i)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleAddRow}>Add Row</Button>
      </div>
    </div>
  );
}
