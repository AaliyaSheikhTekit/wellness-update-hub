import React, { useEffect, useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { getPatientById } from "@/lib/api";

interface Patient {
  id: string;
  fullName: string;
  age: number;
  sex: string;
  fatherHusbandName: string;
  contactNumber: string;
  maritalStatus: string;
  dateOfBirth: string;
  bloodType: string;
  occupation: string;
  reference: string;
  formDate: string | null;
  address: string;
  primaryHealthConcern: string;
  chronicIllnesses: string;
  surgeriesOrInjuries: string;
  familyHistory: string | null;
  allergies: string;
  bloodPressure: string;
  pulse: number | null;
  weightKg: number | null;
  heightCm: number | null;
  bmi: number | null;
  temperatureF: number | null;
  painScale: string;
  diet: string;
  appetite: string | null;
  taste: string | null;
  bowel: string;
  bowelFrequency: string;
  sleep: string | null;
  sleepWakeUpTime: string;
  sleepTime: string;
  addictions: string[];
  physicalActivity: string[];
  waterIntakeLiters: number | null;
  stress: string | null;
  mentalState: string | null;
  physical: any;
  appointment: any[];
  treatmentPlan: any[];
}

export default function CaseSheetView({ open, onOpenChange, patient }) {

console.log("CaseSheetDialog patient:", patient);
  useEffect(() => {
    if (!patient?.id) return;
    const fetchPatient = async () => {
      try {
        const res = await getPatientById(patient?.id);
        console.log("Fetched patient response:", res);
        // const p = Array.isArray(res?.data) ? res.data[0] : res?.data || res;
        // setPatient(p || null);
      } catch (e: any) {
        console.error("Error fetching patient:", e);
      }
    };

    fetchPatient();
  }, [patient?.id]);
  // Get the latest appointment with consultation data
  const latestAppointment = patient.appointment?.[0];
  const latestConsultation = latestAppointment?.consultation?.find((c: any) => c.systemic && c.investigationsOrDiagnosis);

  // Format physical examination data
  const formatPhysicalExam = () => {
    if (!patient.physical) return "NAD";
    
    const items = [];
    if (patient.physical.pallor?.present) items.push("Pallor: Present");
    if (patient.physical.icterus?.present) items.push("Icterus: Present");
    if (patient.physical.cyanosis?.present) items.push("Cyanosis: Present");
    if (patient.physical.clubbing?.present) items.push("Clubbing: Present");
    if (patient.physical.oedema?.present) items.push("Oedema: Present");
    if (patient.physical.lymphadinopathy?.present) items.push("Lymphadinopathy: Present");
    
    return items.length > 0 ? items.join(", ") : "NAD";
  };

  // Format systemic examination
  const formatSystemicExam = () => {
    if (!latestConsultation?.systemic) return "NAD";
    
    const systemic = latestConsultation.systemic;
    const items = [];
    
    if (systemic.respiratorySystem?.ad) items.push(`Respiratory: ${systemic.respiratorySystem.adDescription || "Normal"}`);
    if (systemic.cardioVascularSystem?.ad) items.push(`CVS: ${systemic.cardioVascularSystem.adDescription || "Normal"}`);
    if (systemic.gastroIntestinalSystem?.ad) items.push(`GIT: ${systemic.gastroIntestinalSystem.adDescription || "Normal"}`);
    if (systemic.nrvousSystem?.ad) items.push(`Nervous: ${systemic.nrvousSystem.adDescription || "Normal"}`);
    if (systemic.musculoskeletalSystem?.ad) items.push(`Musculoskeletal: ${systemic.musculoskeletalSystem.adDescription || "Normal"}`);
    
    return items.length > 0 ? items.join("; ") : "NAD";
  };

  return (
    <>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto bg-white text-black p-0">
      
            <DialogTitle>Patient Case Sheet - {patient.fullName}</DialogTitle>
     
          <div className="p-8 space-y-6">
            {/* HEADER */}
         {/* HEADER */}
<div className="border-b-2 border-[#7b5e57] pb-4 mb-6">
  <div className="flex flex-col items-center text-center">
    <img
      src="https://www.ikshanaturopathy.com/assets/iksha_logo-DegYGxOY.png"
      alt="Iksha"
      className="w-[100px] h-auto mb-2"
    />

    <h2 className="text-[20px] font-semibold text-[#7b5e57]">
      Ikshā Naturopathy
    </h2>

    <p className="text-[12px] text-[#5a4945] max-w-[85%] leading-[1.4] mt-1">
      Empire Market Place, in front of bypass, next to Empire Estate,
      opp. Sahara city Homes, Indore, Deoguradia, Madhya Pradesh - 452016
    </p>

    <p className="text-[12px] text-[#5a4945]">
      Phone: +91 7879168791 | +91 9343922950
    </p>
  </div>
</div>

            {/* 1. PATIENT INFORMATION */}
            <div className="border-2 border-black">
              <div className="bg-gray-100 border-b-2 border-black px-4 py-2">
                <h2 className="font-bold text-lg">1. Patient Information</h2>
              </div>
              <div className="p-4 text-sm space-y-2">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  <p><strong>Name:</strong> {patient.fullName}</p>
                  <p><strong>Age / Sex:</strong> {patient.age} / {patient.sex}</p>
                  <p><strong>Father/Husband Name:</strong> {patient.fatherHusbandName}</p>
                  <p><strong>Marital Status:</strong> {patient.maritalStatus}</p>
                  <p><strong>Contact Number:</strong> {patient.contactNumber}</p>
                  <p><strong>Occupation:</strong> {patient.occupation}</p>
                  <p><strong>Date of Visit:</strong> {latestAppointment?.date ? new Date(latestAppointment.date).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Date of Birth:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                  <p><strong>Reference:</strong> {patient.reference}</p>
                  <p><strong>Blood Type:</strong> {patient.bloodType}</p>
                </div>
                <p><strong>Address:</strong> {patient.address}</p>
              </div>
            </div>

            {/* 2. PRIMARY HEALTH CONCERN */}
            <div className="border-2 border-black">
              <div className="bg-gray-100 border-b-2 border-black px-4 py-2">
                <h2 className="font-bold text-lg">2. Primary Health Concern</h2>
              </div>
              <div className="p-4 text-sm">
                <p className="whitespace-pre-wrap">{patient.primaryHealthConcern || "Not specified"}</p>
              </div>
            </div>

            {/* 3. PERSONAL & LIFESTYLE HISTORY */}
            <div className="border-2 border-black">
              <div className="bg-gray-100 border-b-2 border-black px-4 py-2">
                <h2 className="font-bold text-lg">3. Personal & Lifestyle History</h2>
              </div>
              <div className="p-4 text-sm">
                <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                  <p><strong>Diet Type:</strong> {patient.diet || "Not specified"}</p>
                  <p><strong>Appetite:</strong> {patient.appetite || "Not specified"}</p>
                  <p><strong>Taste:</strong> {patient.taste || "Normal"}</p>
                  <p><strong>Bowel:</strong> {patient.bowel || "Regular"}</p>
                  <p><strong>Frequency:</strong> {patient.bowelFrequency || "Daily"}</p>
                  <p><strong>Sleep:</strong> {patient.sleep || "Sound"}</p>
                  <p><strong>Wake Up Time:</strong> {patient.sleepWakeUpTime || "N/A"}</p>
                  <p><strong>Sleep Time:</strong> {patient.sleepTime || "N/A"}</p>
                  <p><strong>Water Intake:</strong> {patient.waterIntakeLiters ? `${patient.waterIntakeLiters}L` : "N/A"}</p>
                  <p><strong>Stress Level:</strong> {patient.stress || "Moderate"}</p>
                  <p><strong>Mental State:</strong> {patient.mentalState || "Calm"}</p>
                  <p><strong>Addictions:</strong> {patient.addictions?.length > 0 ? patient.addictions.join(", ") : "None"}</p>
                  <p className="col-span-2"><strong>Physical Activity:</strong> {patient.physicalActivity?.length > 0 ? patient.physicalActivity.join(", ") : "None"}</p>
                </div>
              </div>
            </div>

            {/* 4. VITALS AND ANTHROPOMETRIC MEASUREMENTS */}
            <div className="border-2 border-black">
              <div className="bg-gray-100 border-b-2 border-black px-4 py-2">
                <h2 className="font-bold text-lg">4. Vitals and Anthropometric Measurements</h2>
              </div>
              <div className="p-4">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-black p-2 text-left">Parameter</th>
                      <th className="border border-black p-2">Pre</th>
                      <th className="border border-black p-2">Post</th>
                      <th className="border border-black p-2">Unit</th>
                      <th className="border border-black p-2">Normal Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2">Blood Pressure</td>
                      <td className="border border-black p-2 text-center">{patient.bloodPressure || "-"}</td>
                      <td className="border border-black p-2 text-center">-</td>
                      <td className="border border-black p-2 text-center">mm/hg</td>
                      <td className="border border-black p-2 text-center">90-120/60-80 mm/hg</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">Pulse</td>
                      <td className="border border-black p-2 text-center">{patient.pulse || "-"}</td>
                      <td className="border border-black p-2 text-center">-</td>
                      <td className="border border-black p-2 text-center">Beat/min</td>
                      <td className="border border-black p-2 text-center">60-100beat/min</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">Weight</td>
                      <td className="border border-black p-2 text-center">{patient.weightKg || "-"}</td>
                      <td className="border border-black p-2 text-center">-</td>
                      <td className="border border-black p-2 text-center">Kg</td>
                      <td className="border border-black p-2 text-center">Varies by height</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">Height</td>
                      <td className="border border-black p-2 text-center">{patient.heightCm || "-"}</td>
                      <td className="border border-black p-2 text-center">-</td>
                      <td className="border border-black p-2 text-center">Cm</td>
                      <td className="border border-black p-2 text-center">-</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">BMI (Body Mass Index)</td>
                      <td className="border border-black p-2 text-center">{patient.bmi || "-"}</td>
                      <td className="border border-black p-2 text-center">-</td>
                      <td className="border border-black p-2 text-center">kg/m²</td>
                      <td className="border border-black p-2 text-center">18.5 - 24.9</td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">Pain Scale</td>
                      <td className="border border-black p-2 text-center">{patient.painScale || "-"}</td>
                      <td className="border border-black p-2 text-center">-</td>
                      <td className="border border-black p-2 text-center">0-10</td>
                      <td className="border border-black p-2 text-center">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. PAST MEDICAL HISTORY */}
            <div className="border-2 border-black">
              <div className="bg-gray-100 border-b-2 border-black px-4 py-2">
                <h2 className="font-bold text-lg">5. Past Medical History</h2>
              </div>
              <div className="p-4 text-sm space-y-2">
                <p><strong>Chronic Illnesses (Diabetes / BP / CAD / Asthma / Others):</strong></p>
                <p className="pl-4">{patient.chronicIllnesses || "None"}</p>
                {latestConsultation?.knowCase && (
                  <p className="pl-4 text-xs">
                    Known cases: {Object.entries(latestConsultation.knowCase)
                      .filter(([key, value]) => value === true && key !== 'otherDescription')
                      .map(([key]) => key.toUpperCase())
                      .join(", ") || "None"}
                  </p>
                )}
                
                <p><strong>Surgeries / Injuries:</strong></p>
                <p className="pl-4">{patient.surgeriesOrInjuries || latestConsultation?.surgeriesOrInjuries || "None"}</p>
                
                <p><strong>Allergies (if any):</strong></p>
                <p className="pl-4">{patient.allergies || latestConsultation?.allergies || "None"}</p>
                
                <p><strong>Family history (If any):</strong></p>
                <p className="pl-4">{patient.familyHistory || latestConsultation?.familyHistory || "None"}</p>
              </div>
            </div>

            {/* 6. MEDICINE HISTORY CHART */}
            {latestAppointment?.prescriptions && latestAppointment.prescriptions.length > 0 && (
              <div className="border-2 border-black">
                <div className="bg-gray-100 border-b-2 border-black px-4 py-2">
                  <h2 className="font-bold text-lg">6. Medicine History Chart</h2>
                </div>
                <div className="p-4">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-black p-2">Sr. No.</th>
                        <th className="border border-black p-2">Medicine Name</th>
                        <th className="border border-black p-2">Dosage (mg/ml)</th>
                        <th className="border border-black p-2">Frequency</th>
                        <th className="border border-black p-2">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestAppointment.prescriptions.map((med: any, idx: number) => (
                        <tr key={idx}>
                          <td className="border border-black p-2 text-center">{idx + 1}</td>
                          <td className="border border-black p-2">{med.name || "-"}</td>
                          <td className="border border-black p-2 text-center">{med.dosage || "-"}</td>
                          <td className="border border-black p-2 text-center">{med.frequency || "-"}</td>
                          <td className="border border-black p-2">{med.remarks || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 7. GENERAL PHYSICAL EXAMINATION */}
            <div className="border-2 border-black">
              <div className="bg-gray-100 border-b-2 border-black px-4 py-2">
                <h2 className="font-bold text-lg">7. General Physical Examination</h2>
              </div>
              <div className="p-4 text-sm space-y-1">
                <p><strong>Pallor:</strong> {patient.physical?.pallor?.present ? "Present" : patient.physical?.pallor?.absent ? "Absent" : "Not assessed"}</p>
                <p><strong>Icterus:</strong> {patient.physical?.icterus?.present ? "Present" : patient.physical?.icterus?.absent ? "Absent" : "Not assessed"}</p>
                <p><strong>Cyanosis:</strong> {patient.physical?.cyanosis?.present ? "Present" : patient.physical?.cyanosis?.absent ? "Absent" : "Not assessed"}</p>
                <p><strong>Clubbing:</strong> {patient.physical?.clubbing?.present ? "Present" : patient.physical?.clubbing?.absent ? "Absent" : "Not assessed"}</p>
                <p><strong>Oedema:</strong> {patient.physical?.oedema?.present ? "Present" : patient.physical?.oedema?.absent ? "Absent" : "Not assessed"}</p>
                <p><strong>Lymphadinopathy:</strong> {patient.physical?.lymphadinopathy?.present ? "Present" : patient.physical?.lymphadinopathy?.other ? patient.physical.lymphadinopathy.otherDescription : "Absent"}</p>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <p><strong>Eye:</strong> {patient.physical?.eye?.ad ? patient.physical.eye.adDescription : "NAD"}</p>
                  <p><strong>Ear:</strong> {patient.physical?.ear?.ad ? patient.physical.ear.adDescription : "NAD"}</p>
                  <p><strong>Nostrils:</strong> {patient.physical?.nostrils?.ad ? patient.physical.nostrils.adDescription : "NAD"}</p>
                  <p><strong>Lips:</strong> {patient.physical?.lips?.ad ? patient.physical.lips.adDescription : "NAD"}</p>
                  <p><strong>Teeth/Gums:</strong> {patient.physical?.teeth?.ad ? patient.physical.teeth.adDescription : "NAD"}</p>
                  <p><strong>Mouth/Face:</strong> {patient.physical?.mouth?.ad ? patient.physical.mouth.adDescription : "NAD"}</p>
                  <p><strong>Hair/Head:</strong> {patient.physical?.hair?.ad && patient.physical?.head?.ad ? "Normal" : "NAD"}</p>
                  <p><strong>Throat/Neck:</strong> {patient.physical?.throat?.ad ? patient.physical.throat.adDescription : "NAD"}</p>
                  <p><strong>Genitals:</strong> {patient.physical?.genitals?.ad ? patient.physical.genitals.adDescription : "NAD"}</p>
                </div>
              </div>
            </div>

            {/* 8. SYSTEMIC EXAMINATION */}
            {latestConsultation?.systemic && (
              <div className="border-2 border-black">
                <div className="bg-gray-100 border-b-2 border-black px-4 py-2">
                  <h2 className="font-bold text-lg">8. Systemic Examination</h2>
                </div>
                <div className="p-4 text-sm space-y-1">
                  <p><strong>Respiratory System:</strong> {latestConsultation.systemic.respiratorySystem?.ad ? latestConsultation.systemic.respiratorySystem.adDescription : "NAD"}</p>
                  <p><strong>Cardio Vascular System:</strong> {latestConsultation.systemic.cardioVascularSystem?.ad ? latestConsultation.systemic.cardioVascularSystem.adDescription : "NAD"}</p>
                  <p><strong>Gastro Intestinal System:</strong> {latestConsultation.systemic.gastroIntestinalSystem?.ad ? latestConsultation.systemic.gastroIntestinalSystem.adDescription : "NAD"}</p>
                  <p><strong>Nervous System:</strong> {latestConsultation.systemic.nrvousSystem?.ad ? latestConsultation.systemic.nrvousSystem.adDescription : "NAD"}</p>
                  <p><strong>Musculoskeletal System:</strong> {latestConsultation.systemic.musculoskeletalSystem?.ad ? latestConsultation.systemic.musculoskeletalSystem.adDescription : "NAD"}</p>
                </div>
              </div>
            )}

            {/* 9. INVESTIGATIONS / REPORTS */}
            {latestConsultation?.investigationsOrDiagnosis && (
              <div className="border-2 border-black">
                <div className="bg-gray-100 border-b-2 border-black px-4 py-2">
                  <h2 className="font-bold text-lg">9. Investigations / Reports (if any)</h2>
                </div>
                <div className="p-4 text-sm">
                  <p>{latestConsultation.investigationsOrDiagnosis.investigations || "None"}</p>
                </div>
              </div>
            )}

            {/* 10. PROVISIONAL DIAGNOSIS */}
            {latestConsultation?.investigationsOrDiagnosis?.provisionalDiagnosis && (
              <div className="border-2 border-black">
                <div className="bg-gray-100 border-b-2 border-black px-4 py-2">
                  <h2 className="font-bold text-lg">10. Provisional Diagnosis</h2>
                </div>
                <div className="p-4 text-sm">
                  <p>{latestConsultation.investigationsOrDiagnosis.provisionalDiagnosis}</p>
                </div>
              </div>
            )}

            {/* 11. TREATMENT PLAN */}
            {patient.treatmentPlan && patient.treatmentPlan.length > 0 && (
              <div className="border-2 border-black">
                <div className="bg-gray-100 border-b-2 border-black px-4 py-2">
                  <h2 className="font-bold text-lg">11. Treatment Plan</h2>
                </div>
                <div className="p-4 text-sm space-y-3">
                  {patient.treatmentPlan.slice(0, 3).map((plan: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-[#8B6F47] pl-3">
                      <p className="font-semibold">Session {idx + 1} - {plan.date} ({plan.timeSlot})</p>
                      {plan.treatmentAssign?.map((ta: any, taIdx: number) => (
                        <p key={taIdx} className="text-xs mt-1">• {ta.treatment?.title}: {ta.treatment?.subTitle}</p>
                      ))}
                      {plan.asanas && plan.asanas.length > 0 && (
                        <p className="text-xs mt-1">Yoga: {plan.asanas.map((a: any) => a.name).join(", ")}</p>
                      )}
                    </div>
                  ))}
                  {latestConsultation?.treatment && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="font-semibold">Recommendations:</p>
                      <p className="text-xs mt-1">Duration: {latestConsultation.treatment.recommendation?.duration}</p>
                      <p className="text-xs">Therapist: {latestConsultation.treatment.recommendation?.therapist}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 12. INFORMED CONSENT FORM */}
            <div className="border-2 border-black">
              <div className="bg-gray-100 border-b-2 border-black px-4 py-2">
                <h2 className="font-bold text-lg">12. Informed Consent Form</h2>
              </div>
              <div className="p-4 text-xs leading-relaxed">
                <p className="mb-3"><strong>Treatment Details:</strong></p>
                <p className="mb-2">The procedure may include Naturopathy treatments such as dietary changes, fasting therapy, hydrotherapy, mud therapy, yoga, pranayama, massage, colon hydrotherapy, acupuncture, physiotherapy, chromotherapy, magneto therapy, reflexology, and cupping therapy. It may also involve Panchakarma procedures such as Shirodhara, Nasya (Nasal Therapy), External Basti, Akshitarpan, Raktamokshana (bloodletting, if needed), Abhyanga (oil massage), and Swedana (steam therapy). These therapies will be prescribed specifically based on your condition and requirements.</p>
                
                <p className="mb-2"><strong>Expected Benefits:</strong> These therapies aim to detoxify and cleanse the body, rejuvenate the body and mind, improve digestion and metabolism, increase energy and vitality, relieve stress, enhance mental clarity, reduce pain and stiffness, strengthen the immune system, and promote overall well-being.</p>
                
                <p className="mb-2"><strong>Risks and Limitations:</strong> I understand that possible risks include mild nausea, dizziness, fatigue, headache, skin irritation, temporary digestive changes, and emotional fluctuations. Unforeseen complications may occur, which can include serious conditions. The management reserves the right to transfer me to an appropriate medical facility if required and will not be held liable for any adverse reactions.</p>
                
                <p className="mb-3">I also understand that results may vary depending on adherence to protocol and advice given by the doctor and no guarantee of success is provided.</p>
                
                <p className="mb-2"><strong>Conditions & Policies:</strong> I have been informed that there will be no refund for the treatment under any circumstances. The management reserves the right to discontinue the treatment at any time if necessary. I agree to follow all instructions given by the doctor and their team to ensure the success of the treatment.</p>
                
                <p className="mb-3"><strong>Medical Information:</strong> I have shared my complete medical history, including allergies, medications, and any pre-existing conditions. I confirm that I do not have pregnancy, severe heart disease, active infections, or unstable psychiatric issues. I will inform the practitioner immediately if any such condition exists or develops. I affirm that I have read the basic rules and answered all the questions in absolute honesty. I hereby declare that the above information is complete and an accurate record of my current and past health condition to the best of my knowledge, as on the undersigned date. I am aware of the nature of treatments, therapies, facilities, activities and services and that they are undertaken at my own risk and complete responsibility.</p>
                
                <p className="mb-4"><strong>Final Declaration:</strong> I have been given sufficient time to ask questions, consider alternative options, and make an informed decision. I understand that I can withdraw my consent at any time. I am giving this consent voluntarily, without any pressure or influence, after understanding all details of the proposed treatments in a language which I understand, to undergo Panchakarma and Naturopathy treatments as a holistic wellness approach.</p>
                
                <div className="grid grid-cols-2 gap-8 mt-6 pt-4 border-t-2 border-black">
                  <div className="space-y-2">
                    <p><strong>Patient Signature:</strong> {latestConsultation?.patientSignature ? "✓ Signed" : "___________________"}</p>
                    <p><strong>Patient Name:</strong> {patient.fullName}</p>
                    <p><strong>Date & Time:</strong> {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Doctor's Signature:</strong> {latestConsultation?.signature ? "✓ Signed" : "___________________"}</p>
                    <p><strong>Doctor's Name:</strong> {latestConsultation?.doctorName || "___________________"}</p>
                    <p><strong>Date & Time:</strong> {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="text-center text-xs text-gray-600 pt-4 border-t">
              <p>📞 +91 7879168791 | +91 9343922950</p>
              <p>📍 Ikshā Naturopathy, Empire Market Place, in front of bypass,</p>
              <p>next to Empire Estate, opp. Sahara city homes, Indore, Deogaradia, Madhya Pradesh - 452016</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
