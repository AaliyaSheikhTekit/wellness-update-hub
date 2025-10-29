import { useState } from "react";
import { Plus, X, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface Medicine {
  id: string;
  name: string;
  quantity: string;
  duration: string;
  instructions: string;
}

interface AddPrescriptionFormProps {
  patient: any;
  onSave: (prescriptionData: any) => void;
  onCancel: () => void;
}

const AddPrescriptionForm = ({ patient, onSave, onCancel }: AddPrescriptionFormProps) => {
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: "1", name: "", quantity: "", duration: "", instructions: "" }
  ]);
  const [consultationType, setConsultationType] = useState("Follow-up");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      { id: Date.now().toString(), name: "", quantity: "", duration: "", instructions: "" }
    ]);
  };

  const removeMedicine = (id: string) => {
    if (medicines.length === 1) {
      toast({
        title: "Cannot remove",
        description: "At least one medicine is required",
        variant: "destructive"
      });
      return;
    }
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(medicines.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleSave = () => {
    // Validate
    const hasEmptyFields = medicines.some(m => 
      !m.name.trim() || !m.quantity.trim() || !m.duration.trim() || !m.instructions.trim()
    );

    if (hasEmptyFields) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all medicine fields",
        variant: "destructive"
      });
      return;
    }

    const prescriptionData = {
      date,
      consultationType,
      paymentMethod,
      note,
      medicines: medicines.map(m => ({
        medicine: { name: m.name },
        quantity: m.quantity,
        duration: m.duration,
        instructions: m.instructions
      }))
    };

    onSave(prescriptionData);
    
    toast({
      title: "Success",
      description: "Prescription saved successfully",
    });
  };

  return (
    <Card className="shadow-natural">
      <CardHeader className="border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-foreground">Add New Prescription</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Patient: {patient.fullName} (ID: {patient.id})
            </p>
          </div>
          <Button onClick={onCancel} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Appointment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg border border-border">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">Appointment Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consultationType" className="text-sm font-medium">Consultation Type</Label>
            <Select value={consultationType} onValueChange={setConsultationType}>
              <SelectTrigger id="consultationType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Initial Consultation">Initial Consultation</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Routine Checkup">Routine Checkup</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod" className="text-sm font-medium">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="paymentMethod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium">Note (Optional)</Label>
            <Input
              id="note"
              placeholder="Any additional notes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        {/* Medicines Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Medicines</h3>
            <Button onClick={addMedicine} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Medicine
            </Button>
          </div>

          <div className="space-y-4">
            {medicines.map((medicine, index) => (
              <div key={medicine.id} className="p-4 border border-prescription-border rounded-lg bg-prescription-bg space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-foreground">Medicine #{index + 1}</span>
                  <Button
                    onClick={() => removeMedicine(medicine.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Medicine Name *</Label>
                    <Input
                      placeholder="e.g., Vitamin D3 Supplements"
                      value={medicine.name}
                      onChange={(e) => updateMedicine(medicine.id, "name", e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Quantity *</Label>
                    <Input
                      placeholder="e.g., 1 bottle (60 tablets)"
                      value={medicine.quantity}
                      onChange={(e) => updateMedicine(medicine.id, "quantity", e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Duration *</Label>
                    <Input
                      placeholder="e.g., 30 days"
                      value={medicine.duration}
                      onChange={(e) => updateMedicine(medicine.id, "duration", e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-xs">Instructions *</Label>
                    <Textarea
                      placeholder="e.g., Take 1 tablet daily after breakfast with water"
                      value={medicine.instructions}
                      onChange={(e) => updateMedicine(medicine.id, "instructions", e.target.value)}
                      className="w-full resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary-dark">
            <Save className="h-4 w-4 mr-2" />
            Save Prescription
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddPrescriptionForm;
