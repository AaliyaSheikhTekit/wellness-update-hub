import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function DoctorForm() {
  const [step, setStep] = useState(1);
  const [showPrint, setShowPrint] = useState(false);
  const printRef = useRef(null);
  const [doctorData, setDoctorData] = useState({
    pastMedicalHistory: {
      chronicIllnesses: "",
      surgeries: "",
      allergies: "",
      familyHistory: "",
    },
    medicineChart: Array.from({ length: 5 }, () => ({
      name: "",
      dosage: "",
      frequency: "",
      remarks: "",
    })),
    generalPhysicalExam: {
      pallor: "Absent",
      cyanosis: "Absent",
      icterus: "Absent",
      lymphadinopathy: "Absent",
      oedema: "Absent",
      clubbing: "Absent",
      eye: "NAD",
      ear: "NAD",
      nostrils: "NAD",
      lips: "NAD",
      hair: "NAD",
      head: "NAD",
      throat: "NAD",
      teeth: "NAD",
      mouth: "NAD",
      genitals: "NAD",
    },
    systemicExam: {
      respiratory: "NAD",
      cardiovascular: "NAD",
      gastrointestinal: "NAD",
      nervous: "NAD",
      musculoskeletal: "NAD",
    },
    investigations: "",
    provisionalDiagnosis: "",
    treatmentPlan: "",
    dietChart: "",
    yogaChart: "",
    doctorName: "",
  });

  // Mock patient data - in real app this would come from props/route
  const patientData = {
    name: "John Doe",
    age: "45",
    sex: "Male",
    contactNumber: "+91 9876543210",
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...doctorData.medicineChart];
    updated[index][field] = value;
    setDoctorData({ ...doctorData, medicineChart: updated });
  };

  const handleNext = () => {
    if (step < 7) setStep(step + 1);
  };

  const handleSubmit = () => {
    console.log("Doctor form submitted", doctorData);
    alert("Doctor consultation form submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Card className="bg-gradient-to-br from-amber-100 to-amber-200 shadow-2xl border-8 border-amber-800 rounded-lg overflow-hidden">
          <CardContent className="p-4 md:p-8">
            <div className="bg-white rounded shadow-inner p-4 md:p-8">
              {/* Header */}
              <div className="text-center mb-6 border-b-4 border-amber-600 pb-4">
                <h1 className="text-3xl font-bold text-amber-800 mb-2">
                  Doctor Consultation Form
                </h1>
                <p className="text-gray-600 text-sm">
                  Iksha Naturopathy - Complete Medical Assessment
                </p>
              </div>

              {/* Patient Info Summary */}
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200">
                <h3 className="font-bold text-amber-800 mb-2">
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Name:</span>
                    <p className="text-gray-900">{patientData.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Age:</span>
                    <p className="text-gray-900">{patientData.age}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Sex:</span>
                    <p className="text-gray-900">{patientData.sex}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      Contact:
                    </span>
                    <p className="text-gray-900">{patientData.contactNumber}</p>
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="relative mb-12">
                <div
                  className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full"
                  style={{ left: "20px", right: "20px" }}
                ></div>

                <div
                  className="absolute top-5 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
                  style={{
                    left: "20px",
                    width: `calc(${((step - 1) / 6) * 100}% - ${
                      step === 1 ? 20 : 0
                    }px)`,
                  }}
                ></div>

                <div className="relative flex justify-between">
                  {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                    <div key={s} className="flex flex-col items-center">
                      <button
                        onClick={() => setStep(s)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 transform hover:scale-110 ${
                          step >= s
                            ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/50"
                            : "bg-white border-2 border-gray-300 text-gray-400 hover:border-amber-400"
                        } ${
                          step === s ? "ring-4 ring-amber-200 scale-110" : ""
                        }`}
                      >
                        {step > s ? (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          s
                        )}
                      </button>

                      <span
                        className={`mt-3 text-xs font-medium transition-colors duration-300 text-center ${
                          step >= s ? "text-amber-600" : "text-gray-400"
                        }`}
                      >
                        {s === 1 && "History"}
                        {s === 2 && "Medicine"}
                        {s === 3 && "Physical"}
                        {s === 4 && "Systemic"}
                        {s === 5 && "Reports"}
                        {s === 6 && "Treatment"}
                        {s === 7 && "Complete"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1: Past Medical History */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Past Medical History
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Chronic Illnesses (Diabetes / BP / CAD / Asthma /
                        Others)
                      </label>
                      <Textarea
                        placeholder="Enter chronic illnesses..."
                        value={doctorData.pastMedicalHistory.chronicIllnesses}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            pastMedicalHistory: {
                              ...doctorData.pastMedicalHistory,
                              chronicIllnesses: e.target.value,
                            },
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Surgeries / Injuries
                      </label>
                      <Textarea
                        placeholder="Enter surgeries or injuries..."
                        value={doctorData.pastMedicalHistory.surgeries}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            pastMedicalHistory: {
                              ...doctorData.pastMedicalHistory,
                              surgeries: e.target.value,
                            },
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Allergies (if any)
                      </label>
                      <Textarea
                        placeholder="Enter allergies..."
                        value={doctorData.pastMedicalHistory.allergies}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            pastMedicalHistory: {
                              ...doctorData.pastMedicalHistory,
                              allergies: e.target.value,
                            },
                          })
                        }
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Family History (if any)
                      </label>
                      <Textarea
                        placeholder="Enter family medical history..."
                        value={doctorData.pastMedicalHistory.familyHistory}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            pastMedicalHistory: {
                              ...doctorData.pastMedicalHistory,
                              familyHistory: e.target.value,
                            },
                          })
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Medicine Chart */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Medicine History Chart
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-amber-100">
                          <th className="border border-amber-300 p-2 text-left">
                            Sr. No.
                          </th>
                          <th className="border border-amber-300 p-2 text-left">
                            Medicine Name
                          </th>
                          <th className="border border-amber-300 p-2 text-left">
                            Dosage (mg/ml)
                          </th>
                          <th className="border border-amber-300 p-2 text-left">
                            Frequency
                          </th>
                          <th className="border border-amber-300 p-2 text-left">
                            Remarks
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {doctorData.medicineChart.map((med, index) => (
                          <tr key={index}>
                            <td className="border border-amber-200 p-2 font-semibold">
                              {index + 1}
                            </td>
                            <td className="border border-amber-200 p-1">
                              <Input
                                placeholder="Medicine name"
                                value={med.name}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="border border-amber-200 p-1">
                              <Input
                                placeholder="Dosage"
                                value={med.dosage}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "dosage",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="border border-amber-200 p-1">
                              <Input
                                placeholder="Frequency"
                                value={med.frequency}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "frequency",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="border border-amber-200 p-1">
                              <Input
                                placeholder="Remarks"
                                value={med.remarks}
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "remarks",
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Step 3: General Physical Examination */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    General Physical Examination
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(doctorData.generalPhysicalExam).map(
                      ([key, value]) => (
                        <div key={key}>
                          <label className="font-semibold text-gray-700 capitalize block mb-1">
                            {key.replace(/([A-Z])/g, " $1").trim()}:
                          </label>
                          <Input
                            placeholder={`Absent/Present/Other`}
                            value={value}
                            onChange={(e) =>
                              setDoctorData({
                                ...doctorData,
                                generalPhysicalExam: {
                                  ...doctorData.generalPhysicalExam,
                                  [key]: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Systemic Examination */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Systemic Examination
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Respiratory System
                      </label>
                      <Input
                        placeholder="NAD / Enter findings..."
                        value={doctorData.systemicExam.respiratory}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            systemicExam: {
                              ...doctorData.systemicExam,
                              respiratory: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Cardio Vascular System
                      </label>
                      <Input
                        placeholder="NAD / Enter findings..."
                        value={doctorData.systemicExam.cardiovascular}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            systemicExam: {
                              ...doctorData.systemicExam,
                              cardiovascular: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Gastro Intestinal System
                      </label>
                      <Input
                        placeholder="NAD / Enter findings..."
                        value={doctorData.systemicExam.gastrointestinal}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            systemicExam: {
                              ...doctorData.systemicExam,
                              gastrointestinal: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Nervous System
                      </label>
                      <Input
                        placeholder="NAD / Enter findings..."
                        value={doctorData.systemicExam.nervous}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            systemicExam: {
                              ...doctorData.systemicExam,
                              nervous: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Musculoskeletal System
                      </label>
                      <Input
                        placeholder="NAD / Enter findings..."
                        value={doctorData.systemicExam.musculoskeletal}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            systemicExam: {
                              ...doctorData.systemicExam,
                              musculoskeletal: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Investigations & Diagnosis */}
              {step === 5 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Investigations & Diagnosis
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Investigations / Reports (if any)
                      </label>
                      <Textarea
                        placeholder="Enter investigation details and reports..."
                        value={doctorData.investigations}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            investigations: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Provisional Diagnosis
                      </label>
                      <Textarea
                        placeholder="Enter provisional diagnosis..."
                        value={doctorData.provisionalDiagnosis}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            provisionalDiagnosis: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Treatment Plan */}
              {step === 6 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Treatment Plan
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Treatment Plan
                      </label>
                      <Textarea
                        placeholder="Enter detailed treatment plan..."
                        value={doctorData.treatmentPlan}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            treatmentPlan: e.target.value,
                          })
                        }
                        rows={5}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Diet Chart
                      </label>
                      <Textarea
                        placeholder="Enter diet recommendations..."
                        value={doctorData.dietChart}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            dietChart: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">
                        Yoga Chart
                      </label>
                      <Textarea
                        placeholder="Enter yoga recommendations..."
                        value={doctorData.yogaChart}
                        onChange={(e) =>
                          setDoctorData({
                            ...doctorData,
                            yogaChart: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}
              {/* Step 7: Doctor's Signature */}
              {step === 7 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-amber-700 border-b-2 border-amber-200 pb-2">
                    Final Review & Signature
                  </h3>
                  <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                    <p className="text-green-800 font-semibold mb-2">
                      ✓ All sections completed!
                    </p>
                    <p className="text-gray-700">
                      Please review all information and provide your signature
                      below.
                    </p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-2">
                      Doctor's Name
                    </label>
                    <Input
                      placeholder="Enter doctor's name"
                      value={doctorData.doctorName}
                      onChange={(e) =>
                        setDoctorData({
                          ...doctorData,
                          doctorName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-2">
                      Doctor's Signature
                    </label>
                    <div className="border-2 border-amber-300 rounded-lg p-4 bg-white min-h-[150px] flex items-center justify-center">
                      <p className="text-gray-400 italic">
                        Signature pad would go here
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t-2 border-amber-200">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="border-amber-600 text-amber-700 hover:bg-amber-50"
                  >
                    ← Back
                  </Button>
                )}
                <div className="ml-auto flex gap-3">
                  {step < 7 && (
                    <Button
                      onClick={handleNext}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      Next →
                    </Button>
                  )}
                  {step === 7 && (
                    <Button
                      onClick={handleSubmit}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      ✓ Submit Consultation
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
