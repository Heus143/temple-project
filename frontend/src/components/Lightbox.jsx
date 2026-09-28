import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Lightbox({ images, index, onClose, onNav }) {
  const current = images[index];

  const handleKey = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    },
    [onClose, onNav]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(45,10,14,0.92)" }}
      onClick={onClose}
      data-testid="lightbox"
    >
      <button
        className="absolute top-4 right-4 p-2 rounded-full"
        style={{ background: "var(--deep-maroon)", color: "var(--ivory)" }}
        onClick={onClose}
        aria-label="Close"
        data-testid="lightbox-close"
      >
        <X size={22} />
      </button>
      {images.length > 1 && (
        <>
          <button
            className="absolute left-3 md:left-6 p-2 rounded-full"
            style={{ background: "var(--deep-maroon)", color: "var(--ivory)" }}
            onClick={(e) => {
              e.stopPropagation();
              onNav(-1);
            }}
            aria-label="Previous"
            data-testid="lightbox-prev"
          >
            <ChevronLeft size={26} />
          </button>
          <button
            className="absolute right-3 md:right-6 p-2 rounded-full"
            style={{ background: "var(--deep-maroon)", color: "var(--ivory)" }}
            onClick={(e) => {
              e.stopPropagation();
              onNav(1);
            }}
            aria-label="Next"
            data-testid="lightbox-next"
          >
            <ChevronRight size={26} />
          </button>
        </>
      )}
      <figure className="max-w-5xl max-h-[88vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={current.url || current.image || current.photo}
          alt={current.caption || "Gallery image"}
          className="max-h-[80vh] w-auto rounded-lg"
          style={{ border: "2px solid var(--antique-gold)", background: "var(--ivory)" }}
        />
        {current.caption ? (
          <figcaption className="mt-3 text-center font-body" style={{ color: "var(--light-gold)" }}>
            {current.caption}
          </figcaption>
        ) : null}
      </figure>
    </div>
  );
}
