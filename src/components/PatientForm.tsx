import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, User, Phone, Mail, MapPin, FileText, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  name: string;
  age: string;
  phone: string;
  email: string;
  address: string;
  medicalHistory: string;
  currentCondition: string;
  allergies: string;
  medications: string;
  emergencyContact: string;
  emergencyPhone: string;
  consentGiven: boolean;
  status: "Active" | "Pending";
  dateAdded: string;

  // Receptionist input
  vitals: {
    bloodPressure: string;
    pulse: string;
    weight: string;
    height: string;
    bmi: string;
    muac: string; // Mid-upper arm circumference
    waist: string;
    hip: string;
    whr: string;
    skinfoldTriceps: string;
    skinfoldBiceps: string;
    skinfoldSubscapular: string;
    skinfoldSuprailiac: string;
    bodyFat: string;
    fastingBloodSugar: string;
    randomBloodSugar: string;
    fever: string;
  };
}


interface PatientFormProps {
  onPatientAdded?: (patient: Patient) => void;
}

const PatientForm = ({ onPatientAdded }: PatientFormProps) => {
 const { toast } = useToast();
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phone: "",
    email: "",
    address: "",
    medicalHistory: "",
    currentCondition: "",
    allergies: "",
    medications: "",
    emergencyContact: "",
    emergencyPhone: "",

    // vitals
    bloodPressure: "",
    pulse: "",
    weight: "",
    height: "",
    bmi: "",
    muac: "",
    waist: "",
    hip: "",
    whr: "",
    skinfoldTriceps: "",
    skinfoldBiceps: "",
    skinfoldSubscapular: "",
    skinfoldSuprailiac: "",
    bodyFat: "",
    fastingBloodSugar: "",
    randomBloodSugar: "",
    fever: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleConsentSubmit = () => {
    if (!consentGiven) {
      toast({
        title: "Consent Required",
        description: "Patient must give consent to proceed.",
        variant: "destructive"
      });
      return;
    }

    const newPatient: Patient = {
      id: Date.now().toString(),
      ...formData,
      vitals: {
        bloodPressure: formData.bloodPressure,
        pulse: formData.pulse,
        weight: formData.weight,
        height: formData.height,
        bmi: formData.bmi,
        muac: formData.muac,
        waist: formData.waist,
        hip: formData.hip,
        whr: formData.whr,
        skinfoldTriceps: formData.skinfoldTriceps,
        skinfoldBiceps: formData.skinfoldBiceps,
        skinfoldSubscapular: formData.skinfoldSubscapular,
        skinfoldSuprailiac: formData.skinfoldSuprailiac,
        bodyFat: formData.bodyFat,
        fastingBloodSugar: formData.fastingBloodSugar,
        randomBloodSugar: formData.randomBloodSugar,
        fever: formData.fever
      },
      consentGiven: true,
      status: "Active",
      dateAdded: new Date().toISOString().split('T')[0]
    };

    // Save to localStorage (mock db)
    const existingPatients = JSON.parse(localStorage.getItem("patients") || "[]");
    localStorage.setItem("patients", JSON.stringify([...existingPatients, newPatient]));

    onPatientAdded?.(newPatient);
    toast({
      title: "Patient Added Successfully",
      description: `${newPatient.name} has been registered successfully.`,
    });

    // Reset
    setFormData({
      name: "",
      age: "",
      phone: "",
      email: "",
      address: "",
      medicalHistory: "",
      currentCondition: "",
      allergies: "",
      medications: "",
      emergencyContact: "",
      emergencyPhone: "",
      bloodPressure: "",
      pulse: "",
      weight: "",
      height: "",
      bmi: "",
      muac: "",
      waist: "",
      hip: "",
      whr: "",
      skinfoldTriceps: "",
      skinfoldBiceps: "",
      skinfoldSubscapular: "",
      skinfoldSuprailiac: "",
      bodyFat: "",
      fastingBloodSugar: "",
      randomBloodSugar: "",
      fever: ""
    });
    setConsentGiven(false);
    setIsConsentOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.phone || !formData.currentCondition) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields (Name, Phone, Current Condition).",
        variant: "destructive"
      });
      return;
    }

    setIsConsentOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="wellness-card-gradient border-0 wellness-shadow">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-foreground flex items-center space-x-2">
            <User className="w-8 h-8 text-wellness-sage" />
            <span>New Patient Registration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                <User className="w-5 h-5 text-wellness-sage" />
                <span>Personal Information</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter patient's full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Enter age"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter complete address"
                  rows={2}
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                <Heart className="w-5 h-5 text-wellness-sage" />
                <span>Medical Information</span>
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentCondition">Current Condition/Chief Complaint *</Label>
                  <Textarea
                    id="currentCondition"
                    name="currentCondition"
                    value={formData.currentCondition}
                    onChange={handleInputChange}
                    placeholder="Describe the main health concern or condition"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalHistory">Medical History</Label>
                  <Textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    placeholder="Previous medical conditions, surgeries, treatments"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      placeholder="Food, drug, or environmental allergies"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="medications">Current Medications</Label>
                    <Textarea
                      id="medications"
                      name="medications"
                      value={formData.medications}
                      onChange={handleInputChange}
                      placeholder="Current medications and supplements"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>
 <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Vitals & Anthropometric Measurements (Receptionist)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input name="bloodPressure" placeholder="Blood Pressure (mmHg)" value={formData.bloodPressure} onChange={handleInputChange}/>
                <Input name="pulse" placeholder="Pulse (bpm)" value={formData.pulse} onChange={handleInputChange}/>
                <Input name="weight" placeholder="Weight (Kg)" value={formData.weight} onChange={handleInputChange}/>
                <Input name="height" placeholder="Height (cm)" value={formData.height} onChange={handleInputChange}/>
                <Input name="bmi" placeholder="BMI (kg/m²)" value={formData.bmi} onChange={handleInputChange}/>
                <Input name="muac" placeholder="Mid-Upper Arm Circumference (cm)" value={formData.muac} onChange={handleInputChange}/>
                <Input name="waist" placeholder="Waist Circumference (cm)" value={formData.waist} onChange={handleInputChange}/>
                <Input name="hip" placeholder="Hip Circumference (cm)" value={formData.hip} onChange={handleInputChange}/>
                <Input name="whr" placeholder="Waist-Hip Ratio" value={formData.whr} onChange={handleInputChange}/>
                <Input name="skinfoldTriceps" placeholder="Skinfold Triceps (mm)" value={formData.skinfoldTriceps} onChange={handleInputChange}/>
                <Input name="skinfoldBiceps" placeholder="Skinfold Biceps (mm)" value={formData.skinfoldBiceps} onChange={handleInputChange}/>
                <Input name="skinfoldSubscapular" placeholder="Skinfold Subscapular (mm)" value={formData.skinfoldSubscapular} onChange={handleInputChange}/>
                <Input name="skinfoldSuprailiac" placeholder="Skinfold Suprailiac (mm)" value={formData.skinfoldSuprailiac} onChange={handleInputChange}/>
                <Input name="bodyFat" placeholder="Body Fat %" value={formData.bodyFat} onChange={handleInputChange}/>
                <Input name="fastingBloodSugar" placeholder="Fasting Blood Sugar (mg/dl)" value={formData.fastingBloodSugar} onChange={handleInputChange}/>
                <Input name="randomBloodSugar" placeholder="Random Blood Sugar (mg/dl)" value={formData.randomBloodSugar} onChange={handleInputChange}/>
                <Input name="fever" placeholder="Fever (°F)" value={formData.fever} onChange={handleInputChange}/>
              </div>
            </div>
            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                <Phone className="w-5 h-5 text-wellness-sage" />
                <span>Emergency Contact</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="Enter emergency contact name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    name="emergencyPhone"
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    placeholder="Enter emergency contact phone"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" variant="wellness" size="lg">
                Register Patient
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Consent Dialog */}
      <Dialog open={isConsentOpen} onOpenChange={setIsConsentOpen}>
        <DialogContent className="max-w-2xl wellness-card-gradient">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-foreground flex items-center space-x-2">
              <FileText className="w-6 h-6 text-wellness-sage" />
              <span>Patient Consent & Agreement</span>
            </DialogTitle>
            <DialogDescription className="text-base">
              Please review and confirm the following consent agreement for {formData.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto py-4">
            <div className="space-y-3 text-sm text-foreground">
              <h4 className="font-semibold text-wellness-sage">Treatment Consent:</h4>
              <p>I consent to the naturopathic treatment and examination as recommended by the practitioner. I understand that naturopathic treatments are designed to support the body's natural healing processes.</p>
              
              <h4 className="font-semibold text-wellness-sage">Information Sharing:</h4>
              <p>I authorize the sharing of my medical information between authorized healthcare providers within this clinic for the purpose of providing comprehensive care.</p>
              
              <h4 className="font-semibold text-wellness-sage">Privacy & Confidentiality:</h4>
              <p>I understand that my personal health information will be kept confidential in accordance with applicable privacy laws and will only be shared with my consent or as required by law.</p>
              
              <h4 className="font-semibold text-wellness-sage">Treatment Risks:</h4>
              <p>I understand that while naturopathic treatments are generally safe, there may be potential risks or side effects, and I will inform my practitioner of any adverse reactions.</p>
              
              <h4 className="font-semibold text-wellness-sage">Lifestyle Recommendations:</h4>
              <p>I understand that treatment may include recommendations for dietary changes, lifestyle modifications, and natural supplements, which I agree to follow as prescribed.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <Checkbox
              id="consent"
              checked={consentGiven}
              onCheckedChange={(checked) => setConsentGiven(checked === true)}
            />
            <Label htmlFor="consent" className="text-sm">
              I have read and understood the above information and give my consent for treatment and information sharing within the clinic.
            </Label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConsentOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="wellness" 
              onClick={handleConsentSubmit}
              disabled={!consentGiven}
            >
              Confirm Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientForm;