import { Link } from "react-router-dom";
import { useFetch } from "../lib/hooks";

const OmMark = () => (
  <div
    className="flex items-center justify-center rounded-full border-2 shrink-0"
    style={{
      width: 52,
      height: 52,
      borderColor: "var(--antique-gold)",
      background: "linear-gradient(145deg, #6B0518, #500000)",
      color: "var(--light-gold)",
    }}
    aria-hidden="true"
  >
    <span className="font-telugu" style={{ fontSize: 26, lineHeight: 1 }}>
      ॐ
    </span>
  </div>
);

export default function Header() {
  const { data } = useFetch("/content/website_settings", []);
  const nameEn = (data && data.temple_name_en) || "SRI ANNAPURNAMMA TEMPLE";
  const nameTe = (data && data.temple_name_te) || "శ్రీ అన్నపూర్ణమ్మ అమ్మ వారి దేవర మందిరము";

  return (
    <header
      className="w-full"
      style={{ background: "var(--ivory)", borderBottom: "1px solid var(--antique-gold)" }}
      data-testid="site-header"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-center gap-3 sm:gap-4 text-center">
        <OmMark />
        <div className="min-w-0">
          <h1
            className="font-telugu leading-tight truncate"
            style={{ color: "var(--deep-maroon)", fontSize: "clamp(0.95rem, 2.6vw, 1.5rem)", fontWeight: 700 }}
          >
            {nameTe}
          </h1>
          <p
            className="font-heading tracking-[0.18em]"
            style={{ color: "var(--antique-gold-dark)", fontSize: "clamp(0.6rem, 1.6vw, 0.85rem)", fontWeight: 600 }}
          >
            {nameEn}
          </p>
        </div>
      </div>
    </header>
  );
}
