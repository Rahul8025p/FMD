import { useEffect, useMemo, useState } from "react";

const DEFAULT_FMD_IMAGES = [
  "/fmd_images/img.jpeg",
  "/fmd_images/img1.jpeg",
  "/fmd_images/img2.jpeg",
  "/fmd_images/img3.jpeg",
  "/fmd_images/img4.jpeg",
  "/fmd_images/img5.jpeg",
  "/fmd_images/img6.jpeg",
  "/fmd_images/img7.jpeg",
  "/fmd_images/img8.jpeg",
  "/fmd_images/img9.jpeg",
  "/fmd_images/img10.jpeg"
];

export default function FloatingImageGallery({ images = DEFAULT_FMD_IMAGES, variant = "panel" }) {
  const safeImages = images.length ? images : DEFAULT_FMD_IMAGES;
  const slides = useMemo(() => [...safeImages, safeImages[0]], [safeImages]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const isHeroVariant = variant === "hero";

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mql?.matches || isPaused || safeImages.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setTransitionEnabled(true);
      setActiveIndex((prev) => prev + 1);
    }, 3200);

    return () => window.clearInterval(intervalId);
  }, [isPaused, safeImages.length]);

  const handleTransitionEnd = () => {
    if (activeIndex !== safeImages.length) return;

    // Reset to first slide instantly after the cloned slide.
    setTransitionEnabled(false);
    setActiveIndex(0);
  };

  const goNext = () => {
    setTransitionEnabled(true);
    setActiveIndex((prev) => prev + 1);
  };

  const goPrev = () => {
    if (activeIndex === 0) {
      setTransitionEnabled(false);
      setActiveIndex(safeImages.length - 1);
      return;
    }
    setTransitionEnabled(true);
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <div
      className={`floating-gallery-shell ${isHeroVariant ? "is-hero-background" : ""}`}
      aria-label="Livestock image carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="floating-gallery-viewport">
        <div
          className={`floating-gallery-track ${transitionEnabled ? "is-animated" : ""}`}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((src, idx) => (
            <article
              // eslint-disable-next-line react/no-array-index-key
              key={`floating-img-${idx}`}
              className="floating-gallery-card"
            >
              <div className="floating-gallery-image-overlay" />
              <img
                src={src}
                alt={`Livestock slide ${idx + 1}`}
                loading="lazy"
                decoding="async"
                className="floating-gallery-image"
              />
            </article>
          ))}
        </div>
      </div>
      <div className="floating-gallery-dots" aria-hidden="true">
        {safeImages.map((_, idx) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={`gallery-dot-${idx}`}
            className={`floating-gallery-dot ${idx === activeIndex % safeImages.length ? "is-active" : ""}`}
          />
        ))}
      </div>
      {isHeroVariant ? (
        <>
          <button type="button" className="floating-gallery-arrow left" onClick={goPrev} aria-label="Previous slide">
            ‹
          </button>
          <button type="button" className="floating-gallery-arrow right" onClick={goNext} aria-label="Next slide">
            ›
          </button>
        </>
      ) : null}
    </div>
  );
}
