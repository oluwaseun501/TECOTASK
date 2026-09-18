// src/components/TrustBar.jsx
import useScrollReveal from "../hooks/useScrollReveal";
import "../styles/TrustBar.css";

const trustItems = [
  {
    icon: "✓",
    title: "Every proof reviewed",
    text: "Human moderators check every submission before approval.",
  },
  {
    icon: "₦",
    title: "Naira, straight to bank",
    text: "Earn rewards in naira and withdraw with confidence.",
  },
  {
    icon: "↗",
    title: "Funds held securely",
    text: "Advertiser funds are released only on approved work.",
  },
];

const TrustBar = () => {
  const [sectionRef, isVisible] = useScrollReveal({
    threshold: 0.2,
  });

  return (
    <section
      ref={sectionRef}
      className={`trust-strip ${isVisible ? "is-visible" : ""}`}
    >
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-7 sm:grid-cols-3 lg:px-8">
        {trustItems.map((item, index) => (
          <div
            key={item.title}
            className="trust-item flex gap-3"
            style={{ "--delay": `${index * 150}ms` }}
          >
            <span className="trust-icon">{item.icon}</span>

            <div>
              <h3 className="text-xs font-semibold text-[#0F172A]">
                {item.title}
              </h3>

              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustBar;