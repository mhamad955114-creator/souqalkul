import { useState, useRef, useCallback, useEffect } from "react";
import { X, RotateCcw, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product360ViewerProps {
  images: string[];
  onClose: () => void;
}

const Product360Viewer = ({ images, onClose }: Product360ViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const startXRef = useRef(0);
  const lastIndexRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Filter only image files (no videos)
  const imageFiles = images.filter(
    (img) => !/\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(img)
  );

  const sensitivity = Math.max(2, Math.floor(300 / imageFiles.length));

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      setIsAutoRotating(false);
      startXRef.current = e.clientX;
      lastIndexRef.current = currentIndex;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [currentIndex]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startXRef.current;
      const indexDelta = Math.floor(deltaX / sensitivity);
      let newIndex = lastIndexRef.current - indexDelta;
      // Wrap around
      newIndex = ((newIndex % imageFiles.length) + imageFiles.length) % imageFiles.length;
      setCurrentIndex(newIndex);
    },
    [isDragging, sensitivity, imageFiles.length]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch support
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsAutoRotating(false);
      startXRef.current = e.touches[0].clientX;
      lastIndexRef.current = currentIndex;
    },
    [currentIndex]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const deltaX = e.touches[0].clientX - startXRef.current;
      const indexDelta = Math.floor(deltaX / sensitivity);
      let newIndex = lastIndexRef.current - indexDelta;
      newIndex = ((newIndex % imageFiles.length) + imageFiles.length) % imageFiles.length;
      setCurrentIndex(newIndex);
    },
    [sensitivity, imageFiles.length]
  );

  const toggleAutoRotate = useCallback(() => {
    setIsAutoRotating((prev) => !prev);
  }, []);

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

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
        className="relative w-full max-w-2xl aspect-square cursor-grab active:cursor-grabbing select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {imageFiles.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`360 view ${idx + 1}`}
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-100 pointer-events-none"
            style={{ opacity: idx === currentIndex ? 1 : 0 }}
            draggable={false}
          />
        ))}
      </div>

      {/* Hint */}
      <div className="absolute bottom-8 flex items-center gap-2 text-white/50 text-sm">
        <Hand className="h-4 w-4" />
        <span>اسحب يميناً أو يساراً للتدوير</span>
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
