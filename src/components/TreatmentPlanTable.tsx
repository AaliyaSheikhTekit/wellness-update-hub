import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getTreatmentAll } from "@/lib/api";
import IkshaLogo from "../assets/iksha_logo.png";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChevronDown } from "lucide-react";

type TreatmentRow = {
  id?: string;                // optional existing id from API
  date: string;               // yyyy-MM-dd (for <input type="date" />)
  timeSlot: string;
  yoga: string;               // local field; mapped to yogaPlan on save
  treatments: string[];       // IDs
};

type ApiTreatmentPlanItem = {
  id?: string;
  timeSlot: string;
  treatments: string[];
  yogaPlan?: string;
  date: string;               // ISO 8601 string
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
  // Use local midnight to avoid TZ shift, then to ISO
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
    { date: "", timeSlot: "", yoga: "", treatments: [] },
  ]);
  const [treatmentOptions, setTreatmentOptions] = useState<any[]>([]);

  // load treatment options once
  useEffect(() => {
    (async () => {
      try {
        const data = await getTreatmentAll();
        setTreatmentOptions(data.data || []);
      } catch (err) {
        console.error("Error fetching treatments:", err);
      }
    })();
  }, []);

  // hydrate rows from parent value
  useEffect(() => {
    if (!Array.isArray(value)) return;
    if (value.length === 0) {
      setRows([{ date: "", timeSlot: "", yoga: "", treatments: [] }]);
      return;
    }
    const mapped: TreatmentRow[] = value.map((it) => ({
      id: it.id,
      date: toInputDate(it.date),
      timeSlot: it.timeSlot || "",
      yoga: it.yogaPlan || "",
      treatments: Array.isArray(it.treatments) ? it.treatments : [],
    }));
    setRows(mapped);
  }, [value]);

  // push API-ready data to parent whenever rows change
  useEffect(() => {
    const apiItems: ApiTreatmentPlanItem[] = rows
      .filter((r) => r.timeSlot || r.yoga || r.treatments.length || r.date)
      .map((r) => ({
        ...(r.id ? { id: r.id } : {}),
        timeSlot: r.timeSlot,
        treatments: r.treatments,
        yogaPlan: r.yoga || undefined,
        date: r.date ? toISODate(r.date) : "",
      }));
    onChange(apiItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const handleAddRow = () =>
    setRows((prev) => [...prev, { date: "", timeSlot: "", yoga: "", treatments: [] }]);

  const handleRemoveRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const handleChange = (index: number, field: keyof TreatmentRow, value: any) =>
    setRows((prev) => {
      const copy = [...prev];
      (copy[index] as any)[field] = value;
      return copy;
    });

  const printTableWithHeaderFooter = (tableId: string) => {
    const table = document.getElementById(tableId);
    if (!table) return;
    const newWindow = window.open("", "_blank", "width=1000,height=800");
    newWindow!.document.write(`
      <html>
        <head>
          <title>Treatment Plan</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            .header, .footer { width: 100%; text-align: center; margin: 10px 0; }
            .footer { font-size: 10px; color: #555; }
            img { max-height: 80px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display:flex; justify-content:space-between; align-items:flex-center; border-bottom:4px solid #F59E0B; padding-bottom:10px;">
              <div>
                <img src="${IkshaLogo}" alt="Iksha Logo" style="height: 80px;" />
              </div>
            </div>
          </div>

          ${table.outerHTML}

          <div class="footer">
            <p>Integrated Natural Healing system for a comprehensive</p>
            <p>📞 +91 9343922950 | 📧 admin@ikshanaturopathy.com | 🌐 www.ikshanaturopathy.com</p>
            <p>© ${new Date().getFullYear()} Iksha Naturopathy. All rights reserved.</p>
          </div>
        </body>
      </html>
    `);
    newWindow!.document.close();
    newWindow!.print();
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
        <table id="treatment-table" className="min-w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-3 py-2 text-left">Date</th>
              <th className="border px-3 py-2 text-left">Time Slot</th>
              {showYoga && <th className="border px-3 py-2 text-left">Yoga</th>}
              <th className="border px-3 py-2 text-left">Treatment</th>
              <th className="border px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id ?? i}>
                <td className="border px-2">
                  <Input
                    type="date"
                    value={row.date}
                    onChange={(e) => handleChange(i, "date", e.target.value)}
                  />
                </td>
                <td className="border px-2">
                  <Input
                    placeholder="Time slot"
                    value={row.timeSlot}
                    onChange={(e) => handleChange(i, "timeSlot", e.target.value)}
                  />
                </td>
                {showYoga && (
                  <td className="border px-2">
                    <Input
                      placeholder="Yoga plan"
                      value={row.yoga}
                      onChange={(e) => handleChange(i, "yoga", e.target.value)}
                    />
                  </td>
                )}
                <td className="border px-2">
                  {/* Selector */}
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
                              className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${checked ? "bg-blue-50" : ""}`}
                              onClick={() => {
                                const next = checked
                                  ? row.treatments.filter((t) => t !== opt.id)
                                  : [...row.treatments, opt.id];
                                handleChange(i, "treatments", next);
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <Checkbox checked={checked} onCheckedChange={() => {}} className="mt-1" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-sm">{opt.title}</span>
                                    <span className="text-xs text-gray-500">{opt.duration}</span>
                                  </div>
                                  {opt.subTitle && (
                                    <div className="text-xs text-gray-600 mb-1">{opt.subTitle}</div>
                                  )}
                                  {opt.treatment && (
                                    <div className="text-xs text-gray-500 mb-1">{opt.treatment}</div>
                                  )}
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">{opt.days}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Chips */}
                  {row.treatments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {row.treatments.map((treatmentId) => {
                        const t = treatmentOptions.find((opt) => opt.id === treatmentId);
                        if (!t) return null;
                        return (
                          <div
                            key={t.id}
                            className="flex items-center justify-between gap-2 border rounded-md px-2 py-1.5 bg-gray-50 text-xs"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{t.title}</div>
                              {t.subTitle && <div className="text-gray-500 truncate">{t.subTitle}</div>}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChange(
                                  i,
                                  "treatments",
                                  row.treatments.filter((tid) => tid !== t.id)
                                );
                              }}
                              className="text-gray-400 hover:text-red-500"
                              aria-label="Remove treatment"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </td>

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
        <Button onClick={() => printTableWithHeaderFooter("treatment-table")} variant="outline">
          Print Treatment Table
        </Button>
        <Button onClick={handleAddRow}>Add Row</Button>
      </div>
    </div>
  );
}
