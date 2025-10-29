import { Printer } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PrescriptionViewProps {
  patient: any;
  appointment: any;
}

const PrescriptionView = ({ patient, appointment }: PrescriptionViewProps) => {
  const printPrescription = () => {
    const printContent = document.getElementById("prescription-content");
    if (!printContent) return;

    const newWindow = window.open("", "_blank", "width=800,height=1000");
    if (!newWindow) return;

    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${patient.fullName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Georgia', 'Times New Roman', serif;
              padding: 40px;
              background: #f5f5f5;
            }
            
            .prescription-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border: 3px solid #0ea5e9;
              border-radius: 8px;
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
              color: white;
              padding: 30px 40px;
              border-bottom: 4px solid #0284c7;
            }
            
            .clinic-name {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 8px;
              letter-spacing: 1px;
            }
            
            .clinic-tagline {
              font-size: 14px;
              opacity: 0.95;
              margin-bottom: 15px;
            }
            
            .contact-info {
              font-size: 12px;
              display: flex;
              gap: 20px;
              flex-wrap: wrap;
            }
            
            .prescription-body {
              padding: 40px;
            }
            
            .rx-symbol {
              font-size: 48px;
              font-weight: bold;
              color: #0ea5e9;
              margin-bottom: 20px;
              font-family: 'Times New Roman', serif;
            }
            
            .patient-info {
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .info-row {
              display: flex;
              gap: 40px;
              margin-bottom: 8px;
              font-size: 14px;
            }
            
            .info-label {
              font-weight: 600;
              color: #374151;
              min-width: 100px;
            }
            
            .info-value {
              color: #1f2937;
            }
            
            .date-section {
              text-align: right;
              font-size: 13px;
              color: #6b7280;
              margin-top: 10px;
            }
            
            .medicines-section {
              margin-top: 30px;
            }
            
            .medicine-item {
              margin-bottom: 25px;
              padding: 20px;
              background: #f9fafb;
              border-left: 4px solid #10b981;
              border-radius: 4px;
            }
            
            .medicine-name {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
            }
            
            .medicine-detail {
              font-size: 14px;
              color: #4b5563;
              margin: 6px 0;
              line-height: 1.6;
            }
            
            .medicine-detail strong {
              color: #374151;
              font-weight: 600;
            }
            
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
            }
            
            .doctor-signature {
              text-align: right;
            }
            
            .signature-line {
              border-top: 2px solid #374151;
              width: 200px;
              margin-left: auto;
              margin-bottom: 8px;
            }
            
            .doctor-name {
              font-size: 16px;
              font-weight: 600;
              color: #1f2937;
            }
            
            .doctor-title {
              font-size: 13px;
              color: #6b7280;
            }
            
            .clinic-footer {
              background: #f9fafb;
              padding: 20px 40px;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
              border-top: 2px solid #e5e7eb;
            }
            
            @media print {
              body {
                padding: 0;
                background: white;
              }
              
              .prescription-container {
                border: 2px solid #0ea5e9;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    newWindow.document.close();
    setTimeout(() => {
      newWindow.print();
    }, 250);
  };

  return (
    <Card className="shadow-natural">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Prescription</h2>
            <p className="text-sm text-muted-foreground">ID: {appointment.id}</p>
          </div>
          <Button onClick={printPrescription} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div id="prescription-content">
          <div className="prescription-container">
            {/* Header */}
            <div className="header">
              <div className="clinic-name">Iksha Naturopathy</div>
              <div className="clinic-tagline">Integrated Natural Healing System for Comprehensive Wellness</div>
              <div className="contact-info">
                <span>📞 +91 9343922950</span>
                <span>📧 admin@ikshanaturopathy.com</span>
                <span>📍 Bhopal, Madhya Pradesh</span>
              </div>
            </div>

            {/* Prescription Body */}
            <div className="prescription-body">
              <div className="rx-symbol">℞</div>

              {/* Patient Information */}
              <div className="patient-info">
                <div className="info-row">
                  <span className="info-label">Patient Name:</span>
                  <span className="info-value">{patient.fullName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Age / Gender:</span>
                  <span className="info-value">{patient.age} years / {patient.sex}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Patient ID:</span>
                  <span className="info-value">{patient.id}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Blood Type:</span>
                  <span className="info-value">{patient.bloodType}</span>
                </div>
                <div className="date-section">
                  Date: {new Date(appointment.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                  })}
                </div>
              </div>

              {/* Medicines */}
              <div className="medicines-section">
                {appointment.prescriptions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No prescriptions available</p>
                ) : (
                  appointment.prescriptions.map((presc: any, index: number) => (
                    <div key={presc.id} className="medicine-item">
                      <div className="medicine-name">
                        {index + 1}. {presc.medicine.name}
                      </div>
                      <div className="medicine-detail">
                        <strong>Quantity:</strong> {presc.quantity}
                      </div>
                      <div className="medicine-detail">
                        <strong>Duration:</strong> {presc.duration}
                      </div>
                      <div className="medicine-detail">
                        <strong>Instructions:</strong> {presc.instructions}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Notes */}
              {appointment.note && (
                <div className="medicine-detail" style={{ marginTop: "20px", padding: "15px", background: "#fef3c7", borderLeft: "4px solid #f59e0b" }}>
                  <strong>Note:</strong> {appointment.note}
                </div>
              )}

              {/* Footer / Signature */}
              <div className="footer">
                <div className="doctor-signature">
                  <div className="signature-line"></div>
                  <div className="doctor-name">Dr. [Doctor Name]</div>
                  <div className="doctor-title">Naturopathy Physician</div>
                  <div className="doctor-title">Reg. No: [Registration Number]</div>
                </div>
              </div>
            </div>

            {/* Clinic Footer */}
            <div className="clinic-footer">
              <p>This prescription is valid for 30 days from the date of issue.</p>
              <p style={{ marginTop: "5px" }}>© {new Date().getFullYear()} Iksha Naturopathy. All rights reserved.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrescriptionView;
