import { Link } from "react-router-dom";
import { useFetch } from "../lib/hooks";
import { SectionHeading, Loader } from "../components/common";
import { CalendarDays, Megaphone, Images, ArrowRight } from "lucide-react";

function Panel({ children, className = "" }) {
  return (
    <div
      className={"rounded-xl p-6 md:p-8 " + className}
      style={{ background: "var(--ivory)", border: "1px solid var(--antique-gold)", boxShadow: "0 6px 22px rgba(80,0,0,0.08)" }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { data: home } = useFetch("/content/home_content", []);
  const { data: temple } = useFetch("/content/temple_info", []);
  const { data: events, loading: evLoading } = useFetch("/collection/events", []);
  const { data: gallery } = useFetch("/collection/gallery", []);
  const { data: announcements } = useFetch("/collection/announcements", []);

  const h = home || {};
  const t = temple || {};
  const upcoming = (events || []).filter((e) => (e.status || "Upcoming") !== "Archived").slice(0, 3);
  const featuredGallery = (gallery || []).slice(0, 6);
  const activeAnnouncements = (announcements || []).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-6" data-testid="home-page">
      {/* Welcome */}
      <section className="mb-12 fade-up">
        <Panel>
          <div className="text-center">
            <SectionHeading>{h.welcome_title || "Welcome"}</SectionHeading>
          </div>
          {h.welcome_text || h.intro_text ? (
            <div className="mt-6 space-y-4 text-center max-w-3xl mx-auto font-body" style={{ color: "var(--text-primary)", fontSize: "1.15rem", lineHeight: 1.8 }}>
              {h.welcome_text ? <p>{h.welcome_text}</p> : null}
              {h.intro_text ? <p>{h.intro_text}</p> : null}
            </div>
          ) : (
            <p className="mt-6 text-center font-body text-lg" style={{ color: "var(--text-muted)" }}>
              Welcome content will be updated by the temple administration.
            </p>
          )}
        </Panel>
      </section>

      {/* Featured temple info */}
      {(t.title || t.description || t.info) && (
        <section className="mb-12">
          <Panel>
            <SectionHeading>{t.title || "About the Temple"}</SectionHeading>
            <div className="mt-5 font-body whitespace-pre-line" style={{ color: "var(--text-primary)", fontSize: "1.1rem", lineHeight: 1.8 }}>
              {t.description || t.info}
            </div>
            <Link to="/about" className="inline-flex items-center gap-2 mt-5 font-heading font-semibold" style={{ color: "var(--royal-maroon)" }} data-testid="home-about-link">
              Read more <ArrowRight size={16} />
            </Link>
          </Panel>
        </section>
      )}

      {/* Announcements */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <Megaphone style={{ color: "var(--antique-gold-dark)" }} />
          <SectionHeading>Announcements</SectionHeading>
        </div>
        {activeAnnouncements.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {activeAnnouncements.map((a) => (
              <Panel key={a.id} className="fade-up">
                {a.image ? (
                  <img src={a.image} alt={a.title} loading="lazy" className="w-full h-40 object-cover rounded-lg mb-3" style={{ border: "1px solid var(--antique-gold)" }} />
                ) : null}
                <h3 className="font-heading font-semibold text-lg" style={{ color: "var(--deep-maroon)" }}>{a.title}</h3>
                {a.message ? <p className="mt-2 font-body" style={{ color: "var(--text-muted)" }}>{a.message}</p> : null}
              </Panel>
            ))}
          </div>
        ) : (
          <Panel><p className="text-center font-body" style={{ color: "var(--text-muted)" }}>No announcements at this time.</p></Panel>
        )}
      </section>

      {/* Upcoming events */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <CalendarDays style={{ color: "var(--antique-gold-dark)" }} />
          <SectionHeading>Events</SectionHeading>
        </div>
        {evLoading ? (
          <Loader />
        ) : upcoming.length ? (
          <div className="grid gap-5 md:grid-cols-3">
            {upcoming.map((e) => (
              <Link to="/events" key={e.id} className="block">
                <Panel className="fade-up h-full hover:-translate-y-1 transition-transform">
                  {e.cover ? (
                    <img src={e.cover} alt={e.title} loading="lazy" className="w-full h-44 object-cover rounded-lg mb-4" style={{ border: "1px solid var(--antique-gold)" }} />
                  ) : null}
                  <span className="font-ui text-xs px-2 py-1 rounded-full" style={{ background: "var(--cream)", color: "var(--royal-maroon)", border: "1px solid var(--antique-gold)" }}>
                    {e.status || "Upcoming"}
                  </span>
                  <h3 className="font-heading font-semibold text-lg mt-3" style={{ color: "var(--deep-maroon)" }}>{e.title}</h3>
                  {e.event_date ? <p className="mt-1 font-ui text-sm" style={{ color: "var(--text-muted)" }}>{e.event_date}{e.start_time ? ` · ${e.start_time}` : ""}</p> : null}
                </Panel>
              </Link>
            ))}
          </div>
        ) : (
          <Panel><p className="text-center font-body" style={{ color: "var(--text-muted)" }}>No upcoming events at this time.</p></Panel>
        )}
      </section>

      {/* Featured gallery */}
      <section className="mb-4">
        <div className="flex items-center gap-3 mb-5">
          <Images style={{ color: "var(--antique-gold-dark)" }} />
          <SectionHeading>Gallery</SectionHeading>
        </div>
        {featuredGallery.length ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {featuredGallery.map((g) => (
                <div key={g.id} className="aspect-square overflow-hidden rounded-lg" style={{ border: "1px solid var(--antique-gold)", background: "var(--ivory)" }}>
                  <img src={g.image} alt={g.caption || "Temple gallery"} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to="/gallery" className="inline-flex items-center gap-2 font-heading font-semibold px-6 py-3 rounded-full" style={{ background: "var(--deep-maroon)", color: "var(--ivory)" }} data-testid="home-gallery-link">
                View full gallery <ArrowRight size={16} />
              </Link>
            </div>
          </>
        ) : (
          <Panel><p className="text-center font-body" style={{ color: "var(--text-muted)" }}>Gallery content will be updated by the temple administration.</p></Panel>
        )}
      </section>
    </div>
  );
}
