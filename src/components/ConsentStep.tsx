import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

const SignatureStep = ({ onSaveSignature }) => {
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const [trimmedDataURL, setTrimmedDataURL] = useState<string | null>(null);

  const handleClear = () => {
    sigCanvasRef.current?.clear();
    setTrimmedDataURL(null);
  };

  const handleSave = () => {
    if (sigCanvasRef.current?.isEmpty()) {
      alert("Please provide a signature before proceeding.");
      return;
    }
    const dataURL = sigCanvasRef.current.getTrimmedCanvas().toDataURL("image/png");
    setTrimmedDataURL(dataURL);
    onSaveSignature(dataURL);
  };

  return (
    <div className="space-y-2">
      <div className="border rounded p-2">
        <SignatureCanvas
          ref={sigCanvasRef}
          penColor="black"
          canvasProps={{ width: 500, height: 200, className: "border rounded" }}
        />
      </div>
      <div className="flex gap-2 mt-2">
        <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={handleClear}>
          Clear
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={handleSave}
        >
          Save Signature
        </button>
      </div>
      {trimmedDataURL && (
        <div>
          <h4 className="text-sm font-medium mt-2">Saved Signature Preview:</h4>
          <img src={trimmedDataURL} alt="Signature Preview" className="border rounded" />
        </div>
      )}
    </div>
  );
};

export default SignatureStep;
