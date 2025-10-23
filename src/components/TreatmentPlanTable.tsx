import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getTreatmentAll } from "@/lib/api";
import IkshaLogo from "../assets/iksha_logo.png"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChevronDown } from "lucide-react";
export default function TreatmentPlanTable() {
  const [showYoga, setShowYoga] = useState(true);
  const [rows, setRows] = useState([
    { date: "", timeSlot: "", yoga: "", treatments: [] as string[] },
  ]);
  const [treatmentOptions, setTreatmentOptions] = useState<any[]>([]);

  const handleAddRow = () =>
    setRows([...rows, { date: "", timeSlot: "", yoga: "", treatments: [] }]);

  const handleRemoveRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: any) => {
    const updated = [...rows];
    (updated[index] as any)[field] = value;
    setRows(updated);
  };
const fetchData = async () => {
  try {
    const data = await getTreatmentAll();
   setTreatmentOptions(data.data || []);
  } catch (err) {
    console.error("Error fetching treatments:", err);
  }
};
useEffect(() => {
  fetchData();
}, []);
const printTableWithHeaderFooter = (tableId: string) => {
  const table = document.getElementById(tableId);
  if (!table) return;

  const newWindow = window.open("", "_blank", "width=1000,height=800");
  newWindow!.document.write(`
    <html>
      <head>
        <title>Print</title>
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
        <table  id="treatment-table" className="min-w-full border text-sm">
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
              <tr key={i}>
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
                      placeholder="Yoga type"
                      value={row.yoga}
                      onChange={(e) => handleChange(i, "yoga", e.target.value)}
                    />
                  </td>
                )}
          <td className="border px-2">
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-full justify-between">
        <span className="truncate">
          {row.treatments.length > 0
            ? `${row.treatments.length} treatment${row.treatments.length > 1 ? 's' : ''} selected`
            : 'Select treatments'}
        </span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-96 p-0" align="start">
      <div className="max-h-96 overflow-y-auto">
        {treatmentOptions.map((opt) => (
          <div
            key={opt.id}
            className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
              row.treatments.includes(opt.id) ? 'bg-blue-50' : ''
            }`}
            onClick={() => {
              const treatments = row.treatments.includes(opt.id)
                ? row.treatments.filter((t) => t !== opt.id)
                : [...row.treatments, opt.id];
              handleChange(i, "treatments", treatments);
            }}
          >
            <div className="flex items-start gap-2">
              <Checkbox
                checked={row.treatments.includes(opt.id)}
                onCheckedChange={() => {}}
                className="mt-1"
              />
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
                  {/* <span className="font-semibold text-sm text-blue-600">₹{opt.price}</span> */}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PopoverContent>
  </Popover>

  {/* Selected treatments display */}
  {row.treatments.length > 0 && (
    <div className="mt-2 space-y-1">
      {row.treatments.map((treatmentId) => {
        const t = treatmentOptions.find((opt) => opt.id === treatmentId);
        if (!t) return null;
        return (
          <div key={t.id} className="flex items-center justify-between gap-2 border rounded-md px-2 py-1.5 bg-gray-50 text-xs">
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{t.title}</div>
              {t.subTitle && <div className="text-gray-500 truncate">{t.subTitle}</div>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-semibold text-blue-600">₹{t.price}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleChange(i, "treatments", row.treatments.filter((tid) => tid !== t.id));
                }}
                className="text-gray-400 hover:text-red-500"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  )}
</td>

                <td className="border px-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveRow(i)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
<Button onClick={() => printTableWithHeaderFooter("treatment-table")} className="mt-2">
  Print Treatment Table
</Button>
      <Button onClick={handleAddRow}>Add Row</Button>
    </div>
  );
}
