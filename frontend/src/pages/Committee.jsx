import { useFetch } from "../lib/hooks";
import { PageTitle, EmptyState, Loader } from "../components/common";

export default function Committee() {
  const { data, loading } = useFetch("/collection/committee_members", []);
  const list = data || [];

  return (
    <div className="max-w-6xl mx-auto px-4 pb-8" data-testid="committee-page">
      <PageTitle>Committee</PageTitle>
      <p className="text-center font-body -mt-4 mb-8" style={{ color: "var(--text-muted)" }}>
        శ్రీ అన్నపూర్ణమ్మ అమ్మ వారి దేవర మందిర అభివృద్ధి కమిటీ
      </p>
      {loading ? (
        <Loader />
      ) : !list.length ? (
        <EmptyState message="Committee details will be updated by the temple administration." testId="committee-empty" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {list.map((m) => (
            <div
              key={m.id}
              className="rounded-xl overflow-hidden fade-up flex flex-col"
              style={{ background: "var(--ivory)", border: "2px solid var(--antique-gold)", boxShadow: "0 6px 18px rgba(80,0,0,0.1)" }}
              data-testid={`committee-member-${m.id}`}
            >
              <div className="w-full" style={{ background: "var(--cream)" }}>
                <img
                  src={m.photo}
                  alt={m.name || "Committee member"}
                  loading="lazy"
                  className="w-full h-auto object-contain block"
                />
              </div>
              <div className="p-3 text-center flex-1 flex flex-col justify-center">
                <h3 className="font-heading font-semibold" style={{ color: "var(--deep-maroon)", fontSize: "1rem" }}>
                  {m.name || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Name to be added</span>}
                </h3>
                {m.position ? (
                  <p className="font-ui text-sm mt-0.5" style={{ color: "var(--antique-gold-dark)" }}>{m.position}</p>
                ) : null}
                {m.description ? (
                  <p className="font-body text-sm mt-1" style={{ color: "var(--text-muted)" }}>{m.description}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
