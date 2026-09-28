import { useFetch } from "../lib/hooks";

export default function MantraTicker() {
  const { data } = useFetch("/content/website_settings", []);
  const mantra = (data && data.mantra) || "ఓం శ్రీ అన్నపూర్ణా దేవి";
  const items = Array.from({ length: 8 });
  const Group = () => (
    <div className="ticker-group" aria-hidden="true">
      {items.map((_, i) => (
        <span className="ticker-item font-telugu" key={i}>
          {mantra}
        </span>
      ))}
    </div>
  );
  return (
    <div className="mantra-ticker" data-testid="mantra-ticker" role="marquee" aria-label={mantra}>
      <div className="ticker-track">
        <Group />
        <Group />
      </div>
    </div>
  );
}
