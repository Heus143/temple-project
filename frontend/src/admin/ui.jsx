import { X } from "lucide-react";

const gold = "var(--antique-gold)";

export function ALabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block font-ui text-sm font-medium mb-1" style={{ color: "var(--warm-brown)" }}>
      {children}
    </label>
  );
}

export function AInput({ style, ...props }) {
  return (
    <input
      className="w-full px-3 py-2 rounded-md font-body outline-none"
      style={{ background: "#fff", border: `1px solid ${gold}`, color: "var(--text-primary)", ...style }}
      {...props}
    />
  );
}

export function ATextarea({ style, ...props }) {
  return (
    <textarea
      className="w-full px-3 py-2 rounded-md font-body outline-none"
      style={{ background: "#fff", border: `1px solid ${gold}`, color: "var(--text-primary)", ...style }}
      {...props}
    />
  );
}

export function ASelect({ style, children, ...props }) {
  return (
    <select
      className="w-full px-3 py-2 rounded-md font-body outline-none"
      style={{ background: "#fff", border: `1px solid ${gold}`, color: "var(--text-primary)", ...style }}
      {...props}
    >
      {children}
    </select>
  );
}

export function AButton({ variant = "primary", className = "", style, ...props }) {
  const variants = {
    primary: { background: "var(--deep-maroon)", color: "var(--ivory)", border: "1px solid var(--deep-maroon)" },
    outline: { background: "transparent", color: "var(--deep-maroon)", border: `1px solid ${gold}` },
    danger: { background: "#7a1414", color: "#fff", border: "1px solid #7a1414" },
    ghost: { background: "transparent", color: "var(--warm-brown)", border: "1px solid transparent" },
  };
  return (
    <button
      className={"font-heading font-semibold px-4 py-2 rounded-md transition-all disabled:opacity-60 " + className}
      style={{ ...variants[variant], ...style }}
      {...props}
    />
  );
}

export function AToggle({ checked, onChange, testId }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      data-testid={testId}
      className="relative inline-flex items-center rounded-full transition-colors"
      style={{ width: 46, height: 26, background: checked ? "var(--deep-maroon)" : "#cbb994" }}
      role="switch"
      aria-checked={checked}
    >
      <span
        className="inline-block rounded-full bg-white transition-transform"
        style={{ width: 20, height: 20, transform: checked ? "translateX(23px)" : "translateX(3px)" }}
      />
    </button>
  );
}

export function Badge({ children, tone = "gold" }) {
  const tones = {
    gold: { background: "var(--cream)", color: "var(--royal-maroon)", border: `1px solid ${gold}` },
    green: { background: "#e6f4ea", color: "#1e7d34", border: "1px solid #9dcfab" },
    gray: { background: "#eee7d6", color: "var(--text-muted)", border: "1px solid #d6c8a5" },
  };
  return (
    <span className="font-ui text-xs px-2 py-0.5 rounded-full" style={tones[tone]}>
      {children}
    </span>
  );
}

export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 overflow-y-auto" style={{ background: "rgba(45,10,14,0.55)" }} onClick={onClose}>
      <div
        className="rounded-xl w-full my-8"
        style={{ maxWidth: wide ? 780 : 560, background: "var(--ivory)", border: `2px solid ${gold}`, boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${gold}` }}>
          <h3 className="font-heading font-bold text-lg" style={{ color: "var(--deep-maroon)" }}>{title}</h3>
          <button onClick={onClose} aria-label="Close" style={{ color: "var(--warm-brown)" }} data-testid="modal-close"><X size={20} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" style={{ background: "rgba(45,10,14,0.6)" }} onClick={onCancel}>
      <div className="rounded-xl w-full max-w-md p-6" style={{ background: "var(--ivory)", border: `2px solid ${gold}` }} onClick={(e) => e.stopPropagation()}>
        <h3 className="font-heading font-bold text-lg mb-2" style={{ color: "var(--deep-maroon)" }}>{title || "Are you sure?"}</h3>
        <p className="font-body mb-5" style={{ color: "var(--text-muted)" }}>{message}</p>
        <div className="flex justify-end gap-3">
          <AButton variant="outline" onClick={onCancel} data-testid="confirm-cancel">Cancel</AButton>
          <AButton variant="danger" onClick={onConfirm} data-testid="confirm-delete">Delete</AButton>
        </div>
      </div>
    </div>
  );
}
