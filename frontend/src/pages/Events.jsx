import { useState } from "react";
import { useFetch } from "../lib/hooks";
import { PageTitle, EmptyState, Loader } from "../components/common";
import Lightbox from "../components/Lightbox";
import { MapPin, Clock, CalendarDays } from "lucide-react";

const STATUS_ORDER = ["Upcoming", "Ongoing", "Completed", "Archived"];

export default function Events() {
  const { data: events, loading } = useFetch("/collection/events", []);
  const [lb, setLb] = useState(null); // {photos, index}

  const list = events || [];

  return (
    <div className="max-w-5xl mx-auto px-4 pb-8" data-testid="events-page">
      <PageTitle>Events</PageTitle>
      {loading ? (
        <Loader />
      ) : !list.length ? (
        <EmptyState message="No events to display at this time." testId="events-empty" />
      ) : (
        <div className="space-y-8">
          {list.map((e) => {
            const photos = [
              ...(e.cover ? [{ url: e.cover, caption: e.title }] : []),
              ...((e.photos || []).map((p) => ({ url: p.url || p, caption: p.caption }))),
            ];
            return (
              <article
                key={e.id}
                className="rounded-xl overflow-hidden fade-up"
                style={{ background: "var(--ivory)", border: "1px solid var(--antique-gold)", boxShadow: "0 6px 22px rgba(80,0,0,0.08)" }}
                data-testid={`event-${e.id}`}
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="font-ui text-xs px-3 py-1 rounded-full" style={{ background: "var(--cream)", color: "var(--royal-maroon)", border: "1px solid var(--antique-gold)" }}>
                      {e.status || "Upcoming"}
                    </span>
                    {e.category ? (
                      <span className="font-ui text-xs px-3 py-1 rounded-full" style={{ background: "var(--beige)", color: "var(--text-muted)" }}>{e.category}</span>
                    ) : null}
                  </div>
                  <h3 className="font-heading font-bold text-2xl" style={{ color: "var(--deep-maroon)" }}>{e.title}</h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 font-ui text-sm" style={{ color: "var(--text-muted)" }}>
                    {e.event_date ? <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} /> {e.event_date}</span> : null}
                    {e.start_time ? <span className="inline-flex items-center gap-1.5"><Clock size={15} /> {e.start_time}{e.end_time ? ` – ${e.end_time}` : ""}</span> : null}
                    {e.location ? <span className="inline-flex items-center gap-1.5"><MapPin size={15} /> {e.location}</span> : null}
                  </div>
                  {e.description ? (
                    <p className="mt-4 font-body whitespace-pre-line" style={{ color: "var(--text-primary)", fontSize: "1.08rem", lineHeight: 1.8 }}>{e.description}</p>
                  ) : null}

                  {photos.length ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-5">
                      {photos.map((p, i) => (
                        <button
                          key={i}
                          className="aspect-square overflow-hidden rounded-md"
                          style={{ border: "1px solid var(--antique-gold)" }}
                          onClick={() => setLb({ photos, index: i })}
                          data-testid={`event-photo-${e.id}-${i}`}
                        >
                          <img src={p.url} alt={p.caption || e.title} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {e.video_url ? (
                    <a href={e.video_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 font-heading font-semibold underline" style={{ color: "var(--royal-maroon)" }}>
                      Watch video
                    </a>
                  ) : null}
                </div>
              </article>
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
