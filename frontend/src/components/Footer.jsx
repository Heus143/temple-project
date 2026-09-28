import { Link } from "react-router-dom";
import { useFetch } from "../lib/hooks";
import { NAV_ITEMS } from "../lib/nav";

export default function Footer() {
  const { data: s } = useFetch("/content/website_settings", []);
  const { data: c } = useFetch("/content/contact_info", []);
  const year = new Date().getFullYear();
  const settings = s || {};
  const contact = c || {};

  return (
    <footer
      className="mt-16"
      style={{ background: "var(--warm-brown)", color: "var(--beige)" }}
      data-testid="site-footer"
    >
      <div className="gold-divider" />
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="font-telugu text-lg mb-1" style={{ color: "var(--light-gold)" }}>
            {settings.temple_name_te || "శ్రీ అన్నపూర్ణమ్మ అమ్మ వారి దేవర మందిరము"}
          </h3>
          <p className="font-heading tracking-widest text-sm mb-3" style={{ color: "var(--antique-gold)" }}>
            {settings.temple_name_en || "SRI ANNAPURNAMMA TEMPLE"}
          </p>
          <p className="text-sm leading-relaxed opacity-90 font-ui" style={{ maxWidth: 360 }}>
            {settings.address || "Avvaru Vari Street, Chirala, Bapatla District, Andhra Pradesh – 523155"}
          </p>
          {settings.footer_text ? (
            <p className="text-sm mt-3 opacity-80 font-ui">{settings.footer_text}</p>
          ) : null}
        </div>

        <div>
          <h4 className="font-heading text-sm tracking-widest mb-3" style={{ color: "var(--light-gold)" }}>
            NAVIGATION
          </h4>
          <ul className="space-y-1.5 text-sm font-ui">
            {NAV_ITEMS.map((n) => (
              <li key={n.to}>
                <Link className="opacity-85 hover:opacity-100 transition-opacity" to={n.to}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-sm tracking-widest mb-3" style={{ color: "var(--light-gold)" }}>
            CONTACT
          </h4>
          <ul className="space-y-1.5 text-sm font-ui opacity-90">
            {contact.phone ? <li>Phone: {contact.phone}</li> : null}
            {contact.email ? <li>Email: {contact.email}</li> : null}
            {contact.timings ? <li className="whitespace-pre-line">Timings: {contact.timings}</li> : null}
            {!contact.phone && !contact.email && !contact.timings ? (
              <li className="opacity-70">
                <Link to="/contact" className="underline">
                  See contact page
                </Link>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div
        className="text-center py-4 text-xs font-ui"
        style={{ borderTop: "1px solid rgba(197,160,89,0.25)", color: "var(--antique-gold)" }}
      >
        © {year} {settings.temple_name_en || "Sri Annapurnamma Temple"}. All rights reserved. ·{" "}
        <Link to="/admin/login" className="underline opacity-80 hover:opacity-100" data-testid="footer-admin-link">
          Admin
        </Link>
      </div>
    </footer>
  );
}
