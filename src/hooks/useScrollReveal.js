// src/hooks/useScrollReveal.js
import { useEffect, useRef, useState } from "react";

const useScrollReveal = ({
  threshold = 0.18,
  rootMargin = "0px 0px -80px 0px",
} = {}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
     ([entry]) => {
  if (!entry.isIntersecting) return;

  setIsVisible(true);
  observer.unobserve(entry.target);
},
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [elementRef, isVisible];
};

export default useScrollReveal;