import { useState, useMemo } from "react";
import { useFetch } from "../lib/hooks";
import { PageTitle, EmptyState, Loader } from "../components/common";
import Lightbox from "../components/Lightbox";

export default function Gallery() {
  const { data: items, loading } = useFetch("/collection/gallery", []);
  const { data: categories } = useFetch("/collection/gallery_categories", []);
  const [active, setActive] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const cats = useMemo(() => ["All", ...((categories || []).map((c) => c.name).filter(Boolean))], [categories]);
  const filtered = useMemo(
    () => (items || []).filter((i) => active === "All" || i.category === active),
    [items, active]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 pb-8" data-testid="gallery-page">
      <PageTitle>Gallery</PageTitle>

      {cats.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              data-testid={`gallery-cat-${c.toLowerCase()}`}
              className="font-ui text-sm px-4 py-2 rounded-full transition-all border-2"
              style={{
                background: active === c ? "var(--deep-maroon)" : "var(--ivory)",
                color: active === c ? "var(--ivory)" : "var(--deep-maroon)",
                borderColor: active === c ? "var(--light-gold)" : "var(--antique-gold)",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <Loader />
      ) : !filtered.length ? (
        <EmptyState message="Gallery content will be updated by the temple administration." testId="gallery-empty" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((g, idx) => (
            <button
              key={g.id}
              onClick={() => setLightboxIndex(idx)}
              className="group aspect-square overflow-hidden rounded-lg fade-up"
              style={{ border: "1px solid var(--antique-gold)", background: "var(--ivory)" }}
              data-testid={`gallery-item-${idx}`}
            >
              <img
                src={g.image}
                alt={g.caption || "Temple gallery"}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={filtered}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNav={(d) => setLightboxIndex((p) => (p + d + filtered.length) % filtered.length)}
        />
      )}
    </div>
  );
}
