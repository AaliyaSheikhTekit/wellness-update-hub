import React, { forwardRef } from "react";

interface PrescriptionData {
  patientName: string;
  age?: string;
  sex?: string;
  date: string;
  medicine: string;
  duration: string;
  instructions: string;
}

interface Props {
  data: PrescriptionData;
  logo: string; // hospital template image
}

const PrescriptionPrint = forwardRef<HTMLDivElement, Props>(({ data, logo }, ref) => {
  return (
    <div
      ref={ref}
      className="relative w-[794px] h-[1123px] mx-auto bg-white text-gray-800"
      style={{
        backgroundImage: `url(${logo})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
      }}
    >
      {/* Overlay content */}
      <div className="absolute top-[160px] left-[80px] right-[80px] text-[16px] leading-relaxed">
        <div className="flex justify-between mb-4">
          <div>
            <p>
              <strong>Name:</strong> {data.patientName || "__________"}
            </p>
          </div>
          <div className="flex gap-6">
            <p>
              <strong>Age:</strong> {data.age || "____"}
            </p>
            <p>
              <strong>Sex:</strong> {data.sex || "____"}
            </p>
            <p>
              <strong>Date:</strong> {data.date}
            </p>
          </div>
        </div>

        <h2 className="text-4xl font-serif mb-6">Rx</h2>

        <div className="space-y-4 pl-6">
          <p>
            <strong>Medicine:</strong> {data.medicine}
          </p>
          <p>
            <strong>Duration:</strong> {data.duration}
          </p>
          <p>
            <strong>Instructions:</strong> {data.instructions}
          </p>
        </div>
      </div>
    </div>
  );
});

PrescriptionPrint.displayName = "PrescriptionPrint";
export default PrescriptionPrint;
