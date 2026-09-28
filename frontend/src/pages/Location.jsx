import { useFetch } from "../lib/hooks";
import { PageTitle, Loader } from "../components/common";
import { MapPin, Navigation, ExternalLink } from "lucide-react";

export default function Location() {
  const { data, loading } = useFetch("/content/location_info", []);
  const l = data || {};
  const address = l.address || "Avvaru Vari Street, Chirala, Bapatla District, Andhra Pradesh – 523155";
  const mapsSearch = l.maps_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const embed =
    l.embed_link || `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-8" data-testid="location-page">
      <PageTitle>Location</PageTitle>
      {loading ? (
        <Loader />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl p-6 md:p-8" style={{ background: "var(--ivory)", border: "1px solid var(--antique-gold)" }}>
            <div className="flex items-start gap-3">
              <MapPin className="shrink-0 mt-1" style={{ color: "var(--royal-maroon)" }} />
              <div>
                <h3 className="font-heading font-semibold text-lg" style={{ color: "var(--deep-maroon)" }}>Temple Address</h3>
                <p className="font-body mt-2 whitespace-pre-line" style={{ color: "var(--text-primary)", fontSize: "1.1rem", lineHeight: 1.7 }}>{address}</p>
              </div>
            </div>
            {l.directions ? (
              <p className="font-body mt-4 whitespace-pre-line" style={{ color: "var(--text-muted)" }}>{l.directions}</p>
            ) : null}
            <div className="flex flex-wrap gap-3 mt-6">
              <a href={mapsSearch} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-heading font-semibold px-5 py-3 rounded-full" style={{ background: "var(--deep-maroon)", color: "var(--ivory)" }} data-testid="location-maps-link">
                <ExternalLink size={16} /> Open in Google Maps
              </a>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-heading font-semibold px-5 py-3 rounded-full border-2" style={{ borderColor: "var(--antique-gold)", color: "var(--deep-maroon)" }} data-testid="location-directions-link">
                <Navigation size={16} /> Get Directions
              </a>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: "2px solid var(--antique-gold)", minHeight: 320 }}>
            <iframe title="Temple location map" src={embed} className="w-full h-full" style={{ minHeight: 320, border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      )}
    </div>
  );
}
