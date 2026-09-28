import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../lib/nav";

export default function BoxNav() {
  return (
    <nav className="max-w-5xl mx-auto my-8 px-4" aria-label="Main navigation" data-testid="box-nav">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}-card`}
            className={({ isActive }) =>
              "nav-card font-heading text-center font-semibold rounded-xl px-3 py-4 md:py-5 flex items-center justify-center min-h-[64px] md:min-h-[72px] border-2 shadow-md " +
              (isActive ? "is-active" : "")
            }
            style={({ isActive }) => ({
              background: isActive ? "var(--deep-maroon)" : "var(--ivory)",
              color: isActive ? "var(--ivory)" : "var(--deep-maroon)",
              borderColor: isActive ? "var(--light-gold)" : "var(--antique-gold)",
              boxShadow: isActive ? "0 6px 18px rgba(80,0,0,0.28)" : undefined,
              fontSize: "clamp(0.82rem, 1.6vw, 1.05rem)",
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains("is-active")) {
                e.currentTarget.style.background = "var(--royal-maroon)";
                e.currentTarget.style.color = "var(--ivory)";
                e.currentTarget.style.borderColor = "var(--light-gold)";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains("is-active")) {
                e.currentTarget.style.background = "var(--ivory)";
                e.currentTarget.style.color = "var(--deep-maroon)";
                e.currentTarget.style.borderColor = "var(--antique-gold)";
              }
            }}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
