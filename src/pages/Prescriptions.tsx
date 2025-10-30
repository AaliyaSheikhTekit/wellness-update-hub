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
import { useState } from "react";
import { postData ,generatePDF} from "@/lib/api";
import { toast } from "@/components/ui/use-toast";


export default function PrescriptionDialog({ open, onClose, patient, onPrescriptionCreated }: any) {
  const [medicineName, setMedicineName] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");
  const [quantity, setQuantity] = useState(14);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [investigation, setInvestigation] = useState("");
  const [avoid, setAvoid] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handlePrescribeMedicine = async () => {
    if (!medicineName.trim()) return alert("Please enter medicine name");
    if (!duration.trim()) return alert("Please specify duration");
    if (!instructions.trim()) return alert("Please enter instructions");

    try {
      setLoading(true);

      const payload = {
        appointmentId:
          patient?.appointment?.length > 0
            ? patient.appointment[0].id
            : undefined,
        medicineName,
        duration,
        instructions,
        quantity,
        chiefComplaint,
        investigation,
        avoid,
      };

      console.log("🧾 Prescription payload:", payload);
      const result = await postData("/prescription/create", payload);
      console.log("Prescription API result:", result);

      toast({
        title: "Prescription Sent",
        description: "Prescription details sent to patient's WhatsApp",
      });
  onPrescriptionCreated?.();
      // reset input fields
      setMedicineName("");
      setDuration("");
      setInstructions("");
      setQuantity(14);
      setChiefComplaint("");
      setInvestigation("");
      setAvoid("");
    } catch (error: any) {
      console.error("Error creating prescription:", error);
      alert(error?.message || "Failed to send prescription");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Generate PDF Button Handler
  const handleGeneratePDF = async () => {
    try {
      if (!patient?.id) {
        alert("Missing patient ID");
        return;
      }
      setPdfLoading(true);
      const pdfRes = await generatePDF(patient.id);
      console.log("PDF result:", pdfRes);

      if (pdfRes?.url) {
        setPdfUrl(pdfRes.url);
        toast({
          title: "PDF Generated",
          description: "Click below to download.",
        });
      } else {
        toast({
          title: "PDF Generated",
          description: "PDF generated successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      alert(error?.message || "Failed to generate PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[80vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Create Prescription</DialogTitle>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Medicine Name</label>
              <Input
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder="e.g. Paracetamol 500mg"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Duration</label>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 7 days"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Instructions</label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Take 1 tablet twice a day after food"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
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
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="shrink-0 pt-4 border-t flex flex-row gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>

          

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
