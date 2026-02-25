import { useState, useRef, useCallback, useEffect } from "react";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageZoomViewerProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const ImageZoomViewer = ({ images, initialIndex, onClose }: ImageZoomViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef(0);
  const pinchStartDistRef = useRef(0);
  const pinchStartZoomRef = useRef(1);

  const resetView = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") { resetView(); setCurrentIndex((i) => (i + 1) % images.length); }
      if (e.key === "ArrowRight") { resetView(); setCurrentIndex((i) => (i - 1 + images.length) % images.length); }
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.5, 5));
      if (e.key === "-") setZoom((z) => Math.max(z - 0.5, 1));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleClose, images.length, resetView]);

  // Double tap to zoom
  const handleDoubleTap = useCallback((clientX: number, clientY: number) => {
    if (zoom > 1) {
      resetView();
    } else {
      setZoom(2.5);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [zoom, resetView]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Double tap detection
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleDoubleTap(e.clientX, e.clientY);
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    if (zoom > 1) {
      setIsDragging(true);
      startRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { ...panOffset };
    }
  }, [zoom, panOffset, handleDoubleTap]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || zoom <= 1) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const maxPan = (zoom - 1) * 200;
    setPanOffset({
      x: Math.max(-maxPan, Math.min(maxPan, panStartRef.current.x + dx)),
      y: Math.max(-maxPan, Math.min(maxPan, panStartRef.current.y + dy)),
    });
  }, [isDragging, zoom]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Pinch zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      pinchStartZoomRef.current = zoom;
    }
  }, [zoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / pinchStartDistRef.current;
      const newZoom = Math.max(1, Math.min(5, pinchStartZoomRef.current * scale));
      setZoom(newZoom);
      if (newZoom <= 1) setPanOffset({ x: 0, y: 0 });
    }
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.3 : 0.3;
    setZoom((z) => {
      const newZ = Math.max(1, Math.min(5, z + delta));
      if (newZ <= 1) setPanOffset({ x: 0, y: 0 });
      return newZ;
    });
  }, []);

  const goNext = () => { resetView(); setCurrentIndex((i) => (i + 1) % images.length); };
  const goPrev = () => { resetView(); setCurrentIndex((i) => (i - 1 + images.length) % images.length); };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom((z) => Math.min(z + 0.5, 5))} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <ZoomIn className="h-5 w-5" />
          </button>
          <button onClick={() => { const nz = Math.max(zoom - 0.5, 1); setZoom(nz); if (nz <= 1) setPanOffset({ x: 0, y: 0 }); }} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="text-sm text-white/70 min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
        </div>
        <span className="text-sm text-white/70">{currentIndex + 1} / {images.length}</span>
        <button onClick={handleClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Image */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onWheel={handleWheel}
        style={{ cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in", touchAction: "none" }}
      >
        <img
          src={images[currentIndex]}
          alt=""
          className="max-w-full max-h-full object-contain pointer-events-none"
          style={{
            transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
          draggable={false}
        />
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button onClick={goPrev} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white">
            <ChevronRight className="h-6 w-6" />
          </button>
          <button onClick={goNext} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white">
            <ChevronLeft className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  );
};

export default ImageZoomViewer;
