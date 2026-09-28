export function SectionHeading({ children, className = "", ...props }) {
  return (
    <h2
      className={"font-heading font-bold inline-block pb-2 " + className}
      style={{
        color: "var(--deep-maroon)",
        fontSize: "clamp(1.4rem, 3vw, 2rem)",
        borderBottom: "2px solid var(--antique-gold)",
      }}
      {...props}
    >
      {children}
    </h2>
  );
}

export function PageTitle({ children }) {
  return (
    <div className="text-center mb-8 fade-up">
      <SectionHeading>{children}</SectionHeading>
    </div>
  );
}

export function EmptyState({ message, testId }) {
  return (
    <div
      className="text-center py-16 px-6 rounded-xl border-2 border-dashed font-body"
      style={{ borderColor: "var(--antique-gold)", background: "var(--ivory)", color: "var(--text-muted)" }}
      data-testid={testId || "empty-state"}
    >
      <p className="text-lg">{message}</p>
    </div>
  );
}

export function Loader({ testId }) {
  return (
    <div className="flex justify-center py-16" data-testid={testId || "loader"}>
      <div
        className="animate-spin rounded-full h-10 w-10 border-4"
        style={{ borderColor: "var(--antique-gold)", borderTopColor: "transparent" }}
      />
    </div>
  );
}
