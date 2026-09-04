"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll reveal wrapper.
 *
 * Fires once per element — the observer disconnects after the first
 * intersection so sections don't re-animate when you scroll back up,
 * which reads as noise rather than polish on a storefront.
 *
 * `delay` staggers siblings; pass an increasing value per item in a grid.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Older browsers (and anything without IO) get the content unanimated
    // rather than stuck at opacity 0.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      // -60px bottom margin means it triggers just before the element is
      // fully on screen, so the motion is already settling as you arrive.
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`sw-reveal ${shown ? "sw-reveal-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
