import { useState, useRef, useCallback, useEffect } from "react";
import { X, RotateCcw, Hand, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product360ViewerProps {
  images: string[];
  onClose: () => void;
}

const Product360Viewer = ({ images, onClose }: Product360ViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const startXRef = useRef(0);
  const lastIndexRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTapRef = useRef(0);
  const pinchStartDistRef = useRef(0);
  const pinchStartZoomRef = useRef(1);
  const panStartRef = useRef({ x: 0, y: 0 });
  const lastPanOffsetRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);

  const imageFiles = images.filter(
    (img) => !/\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(img)
  );

  const sensitivity = Math.max(2, Math.floor(300 / imageFiles.length));
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 4;

  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Double-tap / double-click to toggle zoom
  const handleDoubleAction = useCallback(() => {
    if (zoom > 1) {
      resetZoom();
    } else {
      setZoom(2.5);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [zoom, resetZoom]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Double click detection
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        handleDoubleAction();
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      if (zoom > 1) {
        // Pan mode when zoomed
        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX, y: e.clientY };
        lastPanOffsetRef.current = { ...panOffset };
      } else {
        // Rotate mode
        setIsDragging(true);
        setIsAutoRotating(false);
        startXRef.current = e.clientX;
        lastIndexRef.current = currentIndex;
      }
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [currentIndex, zoom, panOffset, handleDoubleAction]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isPanningRef.current && zoom > 1) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        const maxPan = (zoom - 1) * 150;
        setPanOffset({
          x: Math.max(-maxPan, Math.min(maxPan, lastPanOffsetRef.current.x + dx)),
          y: Math.max(-maxPan, Math.min(maxPan, lastPanOffsetRef.current.y + dy)),
        });
        return;
      }
      if (!isDragging) return;
      const deltaX = e.clientX - startXRef.current;
      const indexDelta = Math.floor(deltaX / sensitivity);
      let newIndex = lastIndexRef.current - indexDelta;
      newIndex = ((newIndex % imageFiles.length) + imageFiles.length) % imageFiles.length;
      setCurrentIndex(newIndex);
    },
    [isDragging, sensitivity, imageFiles.length, zoom]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    isPanningRef.current = false;
  }, []);

  // Touch: pinch zoom + single-finger rotate/pan
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch start
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStartDistRef.current = Math.hypot(dx, dy);
        pinchStartZoomRef.current = zoom;
        setIsAutoRotating(false);
        return;
      }

      // Double tap detection
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        handleDoubleAction();
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      if (zoom > 1) {
        isPanningRef.current = true;
        panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        lastPanOffsetRef.current = { ...panOffset };
      } else {
        setIsAutoRotating(false);
        startXRef.current = e.touches[0].clientX;
        lastIndexRef.current = currentIndex;
      }
    },
    [currentIndex, zoom, panOffset, handleDoubleAction]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 2) {
        // Pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const scale = dist / pinchStartDistRef.current;
        const newZoom = clampZoom(pinchStartZoomRef.current * scale);
        setZoom(newZoom);
        if (newZoom <= 1) setPanOffset({ x: 0, y: 0 });
        return;
      }

      if (isPanningRef.current && zoom > 1) {
        const dx = e.touches[0].clientX - panStartRef.current.x;
        const dy = e.touches[0].clientY - panStartRef.current.y;
        const maxPan = (zoom - 1) * 150;
        setPanOffset({
          x: Math.max(-maxPan, Math.min(maxPan, lastPanOffsetRef.current.x + dx)),
          y: Math.max(-maxPan, Math.min(maxPan, lastPanOffsetRef.current.y + dy)),
        });
        return;
      }

      const deltaX = e.touches[0].clientX - startXRef.current;
      const indexDelta = Math.floor(deltaX / sensitivity);
      let newIndex = lastIndexRef.current - indexDelta;
      newIndex = ((newIndex % imageFiles.length) + imageFiles.length) % imageFiles.length;
      setCurrentIndex(newIndex);
    },
    [sensitivity, imageFiles.length, zoom]
  );

  const handleTouchEnd = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.3 : 0.3;
      const newZoom = clampZoom(zoom + delta);
      setZoom(newZoom);
      if (newZoom <= 1) setPanOffset({ x: 0, y: 0 });
    },
    [zoom]
  );

  const toggleAutoRotate = useCallback(() => {
    resetZoom();
    setIsAutoRotating((prev) => !prev);
  }, [resetZoom]);

  useEffect(() => {
    if (isAutoRotating) {
      autoRotateRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % imageFiles.length);
      }, 150);
    } else if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
      autoRotateRef.current = null;
    }
    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    };
  }, [isAutoRotating, imageFiles.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setZoom((z) => clampZoom(z + 0.5));
      if (e.key === "-") {
        setZoom((z) => {
          const nz = clampZoom(z - 0.5);
          if (nz <= 1) setPanOffset({ x: 0, y: 0 });
          return nz;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (imageFiles.length < 2) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAutoRotate}
            className="text-white hover:bg-white/20"
          >
            <RotateCcw className={`h-5 w-5 ${isAutoRotating ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((z) => clampZoom(z + 0.5))}
            className="text-white hover:bg-white/20"
            disabled={zoom >= MAX_ZOOM}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const nz = clampZoom(zoom - 0.5);
              setZoom(nz);
              if (nz <= 1) setPanOffset({ x: 0, y: 0 });
            }}
            className="text-white hover:bg-white/20"
            disabled={zoom <= MIN_ZOOM}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          {zoom > 1 && (
            <span className="text-white/70 text-xs bg-white/10 px-2 py-1 rounded">
              {Math.round(zoom * 100)}%
            </span>
          )}
          <span className="text-white/70 text-sm">
            {currentIndex + 1} / {imageFiles.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Viewer */}
      <div
        ref={containerRef}
        className="relative w-full max-w-2xl aspect-square select-none overflow-hidden"
        style={{ cursor: zoom > 1 ? "move" : isDragging ? "grabbing" : "grab" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {imageFiles.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`360 view ${idx + 1}`}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{
              opacity: idx === currentIndex ? 1 : 0,
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
              transition: isDragging || isPanningRef.current ? "none" : "transform 0.2s ease-out, opacity 0.1s",
            }}
            draggable={false}
          />
        ))}
      </div>

      {/* Hint */}
      <div className="absolute bottom-8 flex items-center gap-2 text-white/50 text-sm">
        <Hand className="h-4 w-4" />
        <span>{zoom > 1 ? "اسحب للتحريك • انقر مرتين للعودة" : "اسحب للتدوير • انقر مرتين للتكبير • عجلة الماوس للزوم"}</span>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-100"
          style={{ width: `${((currentIndex + 1) / imageFiles.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default Product360Viewer;
