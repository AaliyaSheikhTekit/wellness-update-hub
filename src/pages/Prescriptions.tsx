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
import { postData, } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";


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
  
  // 🩺 Create Prescription
  const handlePrescribeMedicine = async () => {
    if (!medicineName.trim() || !duration.trim() || !instructions.trim()) {
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

      const payload = {
        appointmentId,
        medicineName,
        duration,
        instructions,
        quantity,
        chiefComplaint,
        investigation,
        avoid,
        note
      };

      console.log("🧾 Prescription payload:", payload);
      const result = await postData("/prescription/create", payload);
      console.log("Prescription API result:", result);

      toast({
        title: "Prescription created successfully!",
        description: "You can now generate a PDF.",
      });

      onPrescriptionCreated?.();


      // Reset fields
      setMedicineName("");
      setDuration("");
      setInstructions("");
      setQuantity(14);
      setChiefComplaint("");
      setInvestigation("");
      setAvoid("");
      setNote("");
    } catch (error: any) {
      console.error("Error creating prescription:", error);
      toast({ title: "Failed to create prescription" });
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Generate PDF for appointment
  // const handleGeneratePDF = async () => {
  //   try {
  //     const appointmentId = patient?.appointment?.[0]?.id;
  //     if (!appointmentId) {
  //       toast({ title: "Missing appointment ID." });
  //       return;
  //     }

  //     setPdfLoading(true);
  //     const blob = await generatetPrescriptionPDF(appointmentId); // 🧠 binary response

  //     // ✅ Create object URL from blob
  //     const url = window.URL.createObjectURL(blob);
  //     setPdfUrl(url);

  //     // Auto-download file
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = `${patient.fullName.replace(/\s+/g, "_")}_prescription.pdf`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);

  //     toast({
  //       title: "PDF Generated!",
  //       description: "Your prescription PDF has been downloaded.",
  //     });
  //   } catch (error: any) {
  //     console.error("Error generating PDF:", error);
  //     toast({ title: "Failed to generate PDF" });
  //   } finally {
  //     setPdfLoading(false);
  //   }
  // };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[80vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Create Prescription</DialogTitle>
        </DialogHeader>

        {/* Scrollable form content */}
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
            <div>
              <label className="text-sm font-medium">Avoid</label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="shrink-0 pt-4 border-t flex flex-row gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Close
          </Button>

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
