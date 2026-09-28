import { useState } from "react";
import { useFetch } from "../lib/hooks";
import { PageTitle, EmptyState, Loader } from "../components/common";
import Lightbox from "../components/Lightbox";

export default function PreviousYears() {
  const { data, loading } = useFetch("/collection/previous_years", []);
  const [lb, setLb] = useState(null);
  const list = data || [];

  return (
    <div className="max-w-5xl mx-auto px-4 pb-8" data-testid="previous-years-page">
      <PageTitle>Previous Years</PageTitle>
      {loading ? (
        <Loader />
      ) : !list.length ? (
        <EmptyState message="Previous year archives will be updated by the temple administration." testId="previous-years-empty" />
      ) : (
        <div className="space-y-10">
          {list.map((y) => {
            const photos = [
              ...(y.cover ? [{ url: y.cover, caption: y.title || String(y.year) }] : []),
              ...((y.photos || []).map((p) => ({ url: p.url || p, caption: p.caption }))),
            ];
            return (
              <section key={y.id} className="fade-up" data-testid={`year-${y.year}`}>
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="font-heading font-bold" style={{ color: "var(--royal-maroon)", fontSize: "2.2rem" }}>{y.year}</span>
                  {y.title ? <h3 className="font-heading text-xl" style={{ color: "var(--deep-maroon)" }}>{y.title}</h3> : null}
                  {y.date ? <span className="font-ui text-sm" style={{ color: "var(--text-muted)" }}>{y.date}</span> : null}
                </div>
                <div className="rounded-xl p-6 md:p-8" style={{ background: "var(--ivory)", border: "1px solid var(--antique-gold)" }}>
                  {y.description ? (
                    <p className="font-body whitespace-pre-line mb-5" style={{ color: "var(--text-primary)", fontSize: "1.08rem", lineHeight: 1.8 }}>{y.description}</p>
                  ) : null}
                  {photos.length ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {photos.map((p, i) => (
                        <button
                          key={i}
                          className="aspect-square overflow-hidden rounded-md"
                          style={{ border: "1px solid var(--antique-gold)" }}
                          onClick={() => setLb({ photos, index: i })}
                          data-testid={`year-photo-${y.year}-${i}`}
                        >
                          <img src={p.url} alt={p.caption || String(y.year)} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="font-body" style={{ color: "var(--text-muted)" }}>No photos added for this year yet.</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {lb && (
        <Lightbox
          images={lb.photos}
          index={lb.index}
          onClose={() => setLb(null)}
          onNav={(d) => setLb((s) => ({ ...s, index: (s.index + d + s.photos.length) % s.photos.length }))}
        />
      )}
    </div>
  );
}
