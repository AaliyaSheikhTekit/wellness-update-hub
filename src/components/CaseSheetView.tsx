import React, { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function CaseSheetView({ patient }: { patient: any }) {
    console.log("Patient Data:", patient);
  const [open, setOpen] = useState(false);

  const handleViewCaseSheet = () => setOpen(true);

  return (
    <>
      <DropdownMenuItem onClick={handleViewCaseSheet}>
        🩺 View Case Sheet
      </DropdownMenuItem>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[900px] h-[90vh] overflow-y-auto bg-white text-black p-8">
          {/* HEADER */}
          <div className="text-center border-b-2 border-black pb-2 mb-4">
            <h1 className="text-2xl font-bold uppercase">Ikshā Naturopathy</h1>
            <p className="text-sm italic">Patient Case Sheet</p>
          </div>

          {/* PATIENT INFO */}
          <div className="border border-black p-4 mb-4 text-sm leading-relaxed">
            <div className="grid grid-cols-2 gap-2">
              <p><strong>Patient ID:</strong> {patient.id}</p>
              <p><strong>Date:</strong> {patient.date}</p>
              <p><strong>Name:</strong> {patient.name}</p>
              <p><strong>Age/Sex:</strong> {patient.age} / {patient.sex}</p>
              <p><strong>Father/Husband:</strong> {patient.relative}</p>
              <p><strong>Marital Status:</strong> {patient.marital}</p>
              <p><strong>Address:</strong> {patient.address}</p>
              <p><strong>Contact:</strong> {patient.contact}</p>
              <p><strong>Occupation:</strong> {patient.occupation}</p>
              <p><strong>Blood Group:</strong> {patient.bloodType}</p>
            </div>
          </div>

          {/* PRIMARY CONCERN */}
          <div className="border border-black p-4 mb-4 text-sm">
            <strong>Primary Health Concern:</strong>
            <p className="mt-1">{patient.primaryConcern}</p>
          </div>

          {/* LIFESTYLE HISTORY */}
          <div className="border border-black p-4 mb-4 text-sm">
            <h2 className="font-semibold mb-2 uppercase text-center">Lifestyle & Personal History</h2>
            <div className="grid grid-cols-3 gap-x-4 gap-y-1">
              <p>Diet Type: {patient.lifestyle?.diet}</p>
              <p>Appetite: {patient.lifestyle?.appetite}</p>
              <p>Taste: {patient.lifestyle?.taste}</p>
              <p>Bowel: {patient.lifestyle?.bowel}</p>
              <p>Sleep: {patient.lifestyle?.sleep}</p>
              <p>Addictions: {patient.lifestyle?.addictions}</p>
              <p>Physical Activity: {patient.lifestyle?.activity}</p>
              <p>Water Intake: {patient.lifestyle?.water}</p>
              <p>Stress: {patient.lifestyle?.stress}</p>
              <p>Mental State: {patient.lifestyle?.mental}</p>
              <p>Wake Up: {patient.lifestyle?.wake}</p>
              <p>Sleep Time: {patient.lifestyle?.sleepTime}</p>
            </div>
          </div>

          {/* VITALS */}
          <div className="border border-black p-4 mb-4 text-sm">
            <h2 className="font-semibold mb-2 uppercase text-center">Vitals & Measurements</h2>
            <table className="w-full border-collapse border border-black text-center">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-1">Parameter</th>
                  <th className="border border-black p-1">Pre</th>
                  <th className="border border-black p-1">Post</th>
                  <th className="border border-black p-1">Unit</th>
                </tr>
              </thead>
              <tbody>
                {patient.vitals?.map((v: any, i: number) => (
                  <tr key={i}>
                    <td className="border border-black p-1">{v.parameter}</td>
                    <td className="border border-black p-1">{v.pre}</td>
                    <td className="border border-black p-1">{v.post}</td>
                    <td className="border border-black p-1">{v.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MEDICAL HISTORY */}
          <div className="border border-black p-4 mb-4 text-sm">
            <h2 className="font-semibold mb-2 uppercase text-center">Medical History</h2>
            <p><strong>Chronic Illness:</strong> {patient.medical?.chronic}</p>
            <p><strong>Surgeries:</strong> {patient.medical?.surgeries}</p>
            <p><strong>Allergies:</strong> {patient.medical?.allergies}</p>
            <p><strong>Family History:</strong> {patient.medical?.family}</p>
          </div>

          {/* MEDICINES */}
          <div className="border border-black p-4 mb-4 text-sm">
            <h2 className="font-semibold mb-2 uppercase text-center">Medicine History</h2>
            <table className="w-full border-collapse border border-black text-center">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-1">No</th>
                  <th className="border border-black p-1">Name</th>
                  <th className="border border-black p-1">Dosage</th>
                  <th className="border border-black p-1">Frequency</th>
                  <th className="border border-black p-1">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {patient.medicines?.map((m: any, i: number) => (
                  <tr key={i}>
                    <td className="border border-black p-1">{i + 1}</td>
                    <td className="border border-black p-1">{m.name}</td>
                    <td className="border border-black p-1">{m.dosage}</td>
                    <td className="border border-black p-1">{m.freq}</td>
                    <td className="border border-black p-1">{m.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EXAMINATION */}
          <div className="border border-black p-4 mb-4 text-sm">
            <h2 className="font-semibold mb-2 uppercase text-center">Physical & Systemic Examination</h2>
            <p>{patient.examination}</p>
          </div>

          {/* TREATMENT PLAN */}
          <div className="border border-black p-4 mb-4 text-sm">
            <h2 className="font-semibold mb-2 uppercase text-center">Diagnosis & Treatment Plan</h2>
            <p><strong>Investigation:</strong> {patient.investigation}</p>
            <p><strong>Diagnosis:</strong> {patient.diagnosis}</p>
            <p><strong>Treatment:</strong> {patient.treatmentPlan}</p>
          </div>

          {/* CONSENT FORM */}
          <div className="border border-black p-4 text-sm">
            <h2 className="font-semibold mb-2 uppercase text-center">Informed Consent</h2>
            <p className="leading-relaxed">
              I, {patient.name}, understand and consent to Naturopathy treatments including Panchakarma,
              hydrotherapy, massage, yoga, and diet therapy as a part of holistic wellness care.
            </p>
            <div className="grid grid-cols-2 mt-4">
              <p>Patient Signature: _____________________</p>
              <p>Doctor Signature: _____________________</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
