import { useEffect, useRef, useState } from "react";

const AnimatedStat = ({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2200,
  delay = 350,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    let hasStarted = false;
    let timeoutId;
    let animationFrameId;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasStarted) return;

        hasStarted = true;

        timeoutId = window.setTimeout(() => {
          const startTime = performance.now();

          const updateValue = (currentTime) => {
            const progress = Math.min(
              (currentTime - startTime) / duration,
              1,
            );

            const easedProgress = 1 - Math.pow(1 - progress, 3);

            setDisplayValue(value * easedProgress);

            if (progress < 1) {
              animationFrameId = requestAnimationFrame(updateValue);
            }
          };

          animationFrameId = requestAnimationFrame(updateValue);
        }, delay);

        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration, delay]);

  const formattedValue = displayValue.toLocaleString("en-NG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={elementRef}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
};

export default AnimatedStat;