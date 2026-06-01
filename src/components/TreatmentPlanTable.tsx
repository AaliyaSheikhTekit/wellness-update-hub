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
  asanas: string[];
  treatments: string[];
  duration: string;
   isDurationEdited?: boolean;
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

  // ✅ FIX: Don't call updateParent when adding empty rows
  const handleAddRow = () => {
    const newRows = [
      ...rows,
      { date: "", timeSlot: "", asanas: [], treatments: [], duration: "" },
    ];
    setRows(newRows);
    // Don't update parent yet - wait until user fills something
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

      {/* Responsive wrapper */}
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                    Date
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                    Time Slot
                  </th>
                  {showYoga && (
                    <th className="px-2 sm:px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                      Yoga
                    </th>
                  )}
                  <th className="px-2 sm:px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                    Treatment
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                    Duration
                  </th>
                  <th className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((row, i) => (
                  <tr key={row.id ?? i} className="hover:bg-gray-50">
                    {/* 📅 Date */}
                    <td className="px-2 py-2 sm:py-3 whitespace-nowrap">
                      <Input
                        type="date"
                        value={row.date}
                        onChange={(e) => handleChange(i, "date", e.target.value)}
                        className="w-full min-w-[140px] text-xs sm:text-sm"
                      />
                    </td>

                    {/* ⏰ Time Slot */}
                    <td className="px-2 py-2 sm:py-3">
                      <Input
                        placeholder="Time slot"
                        value={row.timeSlot}
                        onChange={(e) => handleChange(i, "timeSlot", e.target.value)}
                        className="w-full min-w-[120px] text-xs sm:text-sm"
                      />
                    </td>

                    {/* 🧘 Yoga Selection */}
                    {showYoga && (
                      <td className="px-2 py-2 sm:py-3">
                        <div className="min-w-[200px]">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-between text-xs sm:text-sm h-9 sm:h-10">
                                <span className="truncate">
                                  {row.asanas.length > 0
                                    ? `${row.asanas.length} yoga${row.asanas.length > 1 ? "s" : ""}`
                                    : "Select Yoga"}
                                </span>
                                <ChevronDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent
  className="w-80 sm:w-96 p-0"
  align="start"
  onWheel={(e) => e.stopPropagation()}
>
  <div
    className="max-h-96 overflow-y-auto overscroll-contain"
    onWheel={(e) => e.stopPropagation()}
  >
                                {yogaCategories.map((cat: any) => (
                                  <div key={cat.id}>
                                    <div className="font-semibold px-3 py-2 bg-gray-100 border-b text-xs sm:text-sm">
                                      {cat.name}
                                    </div>
                                    {cat.subCategories.map((sub: any) =>
                                      sub.items.map((item: any) => {
                                        const yogaId = item.id;
                                        const checked = row.asanas.includes(yogaId);
                                        return (
                                          <div
                                            key={item.id}
                                            className={`p-2 sm:p-3 border-b hover:bg-gray-50 cursor-pointer ${
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
                                              <Checkbox checked={checked} className="mt-0.5" />
                                              <span className="text-xs sm:text-sm">{item.name}</span>
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
                            <div
  className="
    mt-2
    max-h-[120px]
    overflow-y-auto
    space-y-1
    rounded-lg
    border
    border-gray-200
    bg-gray-50
    p-2
    custom-scrollbar
  "
>
                             {/* Compact Selected Yoga */}
{row.asanas.length > 0 && (
  <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-hide">

    {row.asanas.slice(0, 2).map((asanaId) => {
      const yogaItem = yogaCategories
        .flatMap((cat: any) =>
          cat.subCategories.flatMap(
            (sub: any) => sub.items || []
          )
        )
        .find((item: any) => item.id === asanaId);

      return (
        <div
          key={asanaId}
          className="
            flex
            items-center
            gap-2
            bg-blue-50
            text-blue-700
            border
            border-blue-200
            rounded-full
            px-3
            py-1
            text-xs
            whitespace-nowrap
            shrink-0
          "
        >
          <span className="truncate max-w-[120px]">
            {yogaItem?.name}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();

              handleChange(
                i,
                "asanas",
                row.asanas.filter((a) => a !== asanaId)
              );
            }}
            className="hover:text-red-500 transition-colors"
          >
            ×
          </button>
        </div>
      );
    })}

    {row.asanas.length > 2 && (
      <div
        className="
          bg-gray-100
          text-gray-600
          rounded-full
          px-3
          py-1
          text-xs
          whitespace-nowrap
          shrink-0
        "
      >
        +{row.asanas.length - 2} more
      </div>
    )}

  </div>
)}
                            </div>
                          )}
                        </div>
                      </td>
                    )}

                    {/* 💆 Treatments */}
                    <td className="px-2 py-2 sm:py-3">
                      <div className="min-w-[200px]">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between text-xs sm:text-sm h-9 sm:h-10">
                              <span className="truncate">
                                {row.treatments.length > 0
                                  ? `${row.treatments.length} treatment${row.treatments.length > 1 ? "s" : ""}`
                                  : "Select treatments"}
                              </span>
                              <ChevronDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                            </Button>
                          </PopoverTrigger>

                        <PopoverContent
  className="w-80 sm:w-96 p-0"
  align="start"
  onWheel={(e) => e.stopPropagation()}
>
  <div
    className="max-h-96 overflow-y-auto overscroll-contain"
    onWheel={(e) => e.stopPropagation()}
  >
                              {treatmentOptions.map((opt) => {
                                const checked = row.treatments.includes(opt.id);
                                return (
                                  <div
                                    key={opt.id}
                                    className={`p-2 sm:p-3 border-b hover:bg-gray-50 cursor-pointer ${
                                      checked ? "bg-blue-50" : ""
                                    }`}
                                    onClick={() => {
  const next = checked
    ? row.treatments.filter((t) => t !== opt.id)
    : [...row.treatments, opt.id];

  const totalDuration = next.reduce((sum, treatmentId) => {
    const treatment = treatmentOptions.find(
      (t) => t.id === treatmentId
    );

    if (!treatment?.duration) return sum;

    const matches = treatment.duration.match(/\d+/g);

    if (!matches?.length) return sum;

    // Handle:
    // "25 mins" => 25
    // "20-25 mins" => 25
    // "30-45 mins" => 45
    const duration =
      matches.length > 1
        ? parseInt(matches[matches.length - 1], 10)
        : parseInt(matches[0], 10);

    return sum + duration;
  }, 0);

  const newRows = [...rows];

  newRows[i] = {
    ...newRows[i],
    treatments: next,
    duration: totalDuration > 0 ? `${totalDuration} mins` : "",
  };

  setRows(newRows);
  updateParent(newRows);
}}
                                  >
                                    <div className="flex items-start gap-2">
                                      <Checkbox checked={checked} className="mt-0.5" />
                                      <div>
                                        <div className="font-semibold text-xs sm:text-sm">{opt.title}</div>
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
                          <div
  className="
    mt-2
    max-h-[120px]
    overflow-y-auto
    space-y-1
    rounded-lg
    border
    border-gray-200
    bg-gray-50
    p-2
    custom-scrollbar
  "
>
                          {/* Compact Selected Treatments */}
{row.treatments.length > 0 && (
  <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-hide">

    {row.treatments.slice(0, 2).map((treatmentId) => {
      const t = treatmentOptions.find(
        (opt) => opt.id === treatmentId
      );

      return (
        <div
          key={treatmentId}
          className="
            flex
            items-center
            gap-2
            bg-green-50
            text-green-700
            border
            border-green-200
            rounded-full
            px-3
            py-1
            text-xs
            whitespace-nowrap
            shrink-0
          "
        >
          <span className="truncate max-w-[120px]">
            {t?.title}
          </span>

          <button
            type="button"
            onClick={(e) => {
  e.stopPropagation();

  const nextTreatments = row.treatments.filter(
    (tid) => tid !== treatmentId
  );

  const totalDuration = nextTreatments.reduce((sum, id) => {
    const treatment = treatmentOptions.find(
      (t) => t.id === id
    );

    if (!treatment?.duration) return sum;

    const matches = treatment.duration.match(/\d+/g);

    if (!matches?.length) return sum;

    const duration =
      matches.length > 1
        ? parseInt(matches[matches.length - 1], 10)
        : parseInt(matches[0], 10);

    return sum + duration;
  }, 0);

  const newRows = [...rows];

  newRows[i] = {
    ...newRows[i],
    treatments: nextTreatments,
    duration: totalDuration > 0 ? `${totalDuration} mins` : "",
  };

  setRows(newRows);
  updateParent(newRows);
}}
            className="
              hover:text-red-500
              transition-colors
            "
          >
            ×
          </button>
        </div>
      );
    })}

    {/* Remaining Count */}
    {row.treatments.length > 2 && (
      <div
        className="
          bg-gray-100
          text-gray-600
          rounded-full
          px-3
          py-1
          text-xs
          whitespace-nowrap
          shrink-0
        "
      >
        +{row.treatments.length - 2} more
      </div>
    )}

  </div>
)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* ⏳ Duration */}
                    <td className="px-2 py-2 sm:py-3">
                     <Input
  value={row.duration}
  onChange={(e) => {
    const newRows = [...rows];

    newRows[i] = {
      ...newRows[i],
      duration: e.target.value,
      isDurationEdited: true,
    };

    setRows(newRows);
    updateParent(newRows);
  }}
/>
                    </td>

                    {/* ❌ Remove Row */}
                    <td className="px-2 py-2 sm:py-3">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleRemoveRow(i)}
                        className="text-xs sm:text-sm h-8 sm:h-9 whitespace-nowrap"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleAddRow} className="text-xs sm:text-sm">
          Add Row
        </Button>
      </div>
    </div>
  );
}