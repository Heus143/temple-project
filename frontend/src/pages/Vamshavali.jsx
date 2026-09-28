import { useFetch } from "../lib/hooks";
import { PageTitle, EmptyState, Loader } from "../components/common";
import { User } from "lucide-react";

export default function Vamshavali() {
  const { data, loading } = useFetch("/collection/vamshavali", []);
  const list = data || [];

  return (
    <div className="max-w-4xl mx-auto px-4 pb-8" data-testid="vamshavali-page">
      <PageTitle>Avvaru Vamshavali</PageTitle>
      {loading ? (
        <Loader />
      ) : !list.length ? (
        <EmptyState message="Vamshavali details will be updated by the temple administration." testId="vamshavali-empty" />
      ) : (
        <div className="space-y-3">
          {list.map((v) => (
            <div
              key={v.id}
              className="rounded-xl p-5 md:p-6 flex items-start gap-4 fade-up"
              style={{ background: "var(--ivory)", border: "1px solid var(--antique-gold)" }}
              data-testid={`vamshavali-${v.id}`}
            >
              <div
                className="shrink-0 rounded-full flex items-center justify-center"
                style={{ width: 46, height: 46, background: "var(--deep-maroon)", color: "var(--light-gold)" }}
              >
                <User size={22} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg" style={{ color: "var(--deep-maroon)" }}>{v.name}</h3>
                {v.role ? <p className="font-ui text-sm" style={{ color: "var(--antique-gold-dark)" }}>{v.role}</p> : null}
                {v.description ? (
                  <p className="font-body mt-1 whitespace-pre-line" style={{ color: "var(--text-muted)" }}>{v.description}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
