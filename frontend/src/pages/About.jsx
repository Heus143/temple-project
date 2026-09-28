import { useFetch } from "../lib/hooks";
import { PageTitle, EmptyState, Loader } from "../components/common";

export default function About() {
  const { data, loading } = useFetch("/content/about_content", []);
  const a = data || {};
  const hasContent = a.description || a.history || a.important_info || (a.images && a.images.length);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-8" data-testid="about-page">
      <PageTitle>{a.title || "About the Temple"}</PageTitle>
      {loading ? (
        <Loader />
      ) : !hasContent ? (
        <EmptyState message="Temple information will be updated by the temple administration." testId="about-empty" />
      ) : (
        <div className="space-y-8">
          {a.images && a.images.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {a.images.map((img, i) => (
                <img
                  key={i}
                  src={img.url || img}
                  alt={img.caption || a.title || "Temple"}
                  loading="lazy"
                  className="w-full rounded-xl"
                  style={{ border: "2px solid var(--antique-gold)", background: "var(--ivory)" }}
                />
              ))}
            </div>
          ) : null}
          {a.description ? (
            <Section title="Overview" body={a.description} />
          ) : null}
          {a.history ? <Section title="History" body={a.history} /> : null}
          {a.important_info ? <Section title="Important Information" body={a.important_info} /> : null}
        </div>
      )}
    </div>
  );
}

function Section({ title, body }) {
  return (
    <div
      className="rounded-xl p-6 md:p-8"
      style={{ background: "var(--ivory)", border: "1px solid var(--antique-gold)" }}
    >
      <h3 className="font-heading font-semibold text-xl mb-3" style={{ color: "var(--deep-maroon)" }}>
        {title}
      </h3>
      <p className="font-body whitespace-pre-line" style={{ color: "var(--text-primary)", fontSize: "1.12rem", lineHeight: 1.85 }}>
        {body}
      </p>
    </div>
  );
}
