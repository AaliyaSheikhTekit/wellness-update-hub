import React, { useEffect, useRef, useState } from "react";

type Props = {
  onSaveSignature: (dataUrl: string) => void;
  className?: string;
  height?: number;   // CSS pixels
  strokeWidth?: number;
};

const SignatureStep: React.FC<Props> = ({
  onSaveSignature,
  className = "",
  height = 180,
  strokeWidth = 2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const prevRef = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  // Setup canvas for HiDPI
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const cssWidth = canvas.parentElement?.clientWidth || 500;

    // set CSS size
    canvas.style.width = cssWidth + "px";
    canvas.style.height = height + "px";

    // set internal buffer size
    canvas.width = Math.floor(cssWidth * ratio);
    canvas.height = Math.floor(height * ratio);

    const ctx = canvas.getContext("2d")!;
    ctxRef.current = ctx;

    // scale so 1 unit = 1 CSS pixel
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = "#111827"; // neutral-900
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cssWidth, height);

    // draw a faint baseline guide
    ctx.save();
    ctx.strokeStyle = "#e5e7eb"; // gray-200
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 24);
    ctx.lineTo(cssWidth, height - 24);
    ctx.stroke();
    ctx.restore();
  }, [height, strokeWidth]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    let clientX = 0, clientY = 0;

    if ("touches" in e && e.touches.length) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawingRef.current = true;
    prevRef.current = getPos(e);
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = ctxRef.current!;
    const pos = getPos(e);
    const prev = prevRef.current || pos;

    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    prevRef.current = pos;
    if (!hasInk) setHasInk(true);
  };

  const end = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawingRef.current = false;
    prevRef.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current!;
    const ctx = ctxRef.current!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // re-init background/guide after clear
    const cssWidth = canvas.parentElement?.clientWidth || 500;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cssWidth, height);
    ctx.save();
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 24);
    ctx.lineTo(cssWidth, height - 24);
    ctx.stroke();
    ctx.restore();

    setHasInk(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current!;
    // Export crisp PNG (use the *internal* buffer, not CSS size)
    const dataUrl = canvas.toDataURL("image/png");
    onSaveSignature(dataUrl);
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className="border rounded-md bg-white overflow-hidden touch-none select-none"
        style={{ width: "100%" }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
          className="block w-full"
        />
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1.5 text-sm rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60"
          disabled={!hasInk}
        >
          Save Signature
        </button>
        {!hasInk && (
          <span className="text-xs text-gray-500">Sign above, then Save</span>
        )}
      </div>
    </div>
  );
};

export default SignatureStep;
